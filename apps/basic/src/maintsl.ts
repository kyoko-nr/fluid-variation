import {
  advect as advectVelFrag,
  divergence as divergenceFrag,
  pressureJacobi as pressureJacobiFrag,
  subtractGradient as subtractGradientFrag,
} from "@fluid/tsl";
import * as THREE from "three";
import { WebGPURenderer, NodeMaterial } from "three/webgpu";
import { createAddForceFrag } from "./tsl/createAddForceFrag";
import { renderVelocity } from "./tsl/render";
import { createVertex } from "./tsl/createVertex";
import { setupGui, simulationConfig } from "./gui";
import { PointerManager } from "./PointerManager";
import type { NodeWithUniformMaterial } from "./types/material";
import { DebugVisualizerTsl } from "./debugTsl";

// マウス・タッチイベントを管理するオブジェクト
const pointerManager = new PointerManager();

// Three.jsのレンダリングに必要な一式
let renderer: WebGPURenderer;
let scene: THREE.Scene;
let camera: THREE.OrthographicCamera;
let quad: THREE.Mesh;

// シミュレーションのサイズ定義。画面リサイズに応じて変更する。よく使用するので変数化しておく
let dataWidth = Math.round(
  window.innerWidth * window.devicePixelRatio * simulationConfig.pixelRatio,
);
let dataHeight = Math.round(
  window.innerHeight * window.devicePixelRatio * simulationConfig.pixelRatio,
);
const texelSize = new THREE.Vector2();

// シミューレーション結果を格納するテクスチャー
let dataTexture: THREE.WebGLRenderTarget;
let dataRenderTarget: THREE.WebGLRenderTarget;

// シミュレーション及び描画に使用するTSLシェーダーを設定したマテリアル
let addForceShader: NodeWithUniformMaterial;
let advectVelShader: NodeWithUniformMaterial;
let divergenceShader: NodeWithUniformMaterial;
let pressureShader: NodeWithUniformMaterial;
let subtractGradientShader: NodeWithUniformMaterial;
let renderShader: NodeWithUniformMaterial;

let debugVisualizer: DebugVisualizerTsl;

await init();

/**
 * 初期化
 */
async function init() {
  renderer = new WebGPURenderer();
  await renderer.init();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Three.js用のシーンとカメラを作成
  // カメラは透視投影の必要がないのでOrthographicCamera
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // 貼り付けるための平面メッシュを作成
  // 使用したいシェーダーに対応したマテリアルを差し替えてrenderer.render()を都度呼び出す
  quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  scene.add(quad);

  // シミュレーションデータを書き込むテクスチャーをPing-Pong用に2つ作成。
  const renderTargetOptions = {
    type: THREE.FloatType,
    depthBuffer: false,
    stencilBuffer: false,
  };
  dataTexture = new THREE.WebGLRenderTarget(dataWidth, dataHeight, renderTargetOptions);
  dataRenderTarget = new THREE.WebGLRenderTarget(dataWidth, dataHeight, renderTargetOptions);
  clearRenderTarget(dataTexture);
  clearRenderTarget(dataRenderTarget);

  // シミュレーションで使用するシェーダーを作成
  addForceShader = new NodeMaterial();
  addForceShader.vertexNode = createVertex();
  addForceShader.fragmentNode = createAddForceFrag();
  // addForceShader.uniforms = {
  //   uData: new THREE.Uniform(null),
  //   uTexelSize: new THREE.Uniform(texelSize),
  //   uForceCenter: new THREE.Uniform(new THREE.Vector2()),
  //   uForceDeltaV: new THREE.Uniform(new THREE.Vector2()),
  //   uForceRadius: new THREE.Uniform(simulationConfig.forceRadius),
  // };

  advectVelShader = new NodeMaterial();
  advectVelShader.vertexNode = createVertex();
  advectVelShader.fragmentNode = advectVelFrag();
  // advectVelShader.uniforms = {
  //   uData: new THREE.Uniform(null),
  //   uTexelSize: new THREE.Uniform(texelSize),
  //   uDissipation: new THREE.Uniform(simulationConfig.dissipation),
  //   uDeltaT: new THREE.Uniform(simulationConfig.deltaT),
  // };

  divergenceShader = new NodeMaterial();
  divergenceShader.vertexNode = createVertex();
  divergenceShader.fragmentNode = divergenceFrag();
  // divergenceShader.uniforms = {
  //   uData: new THREE.Uniform(null),
  //   uTexelSize: new THREE.Uniform(texelSize),
  //   uDeltaT: new THREE.Uniform(simulationConfig.deltaT),
  // };

  pressureShader = new NodeMaterial();
  pressureShader.vertexNode = createVertex();
  pressureShader.fragmentNode = pressureJacobiFrag();
  // pressureShader.uniforms = {
  //   uData: new THREE.Uniform(null),
  //   uTexelSize: new THREE.Uniform(texelSize),
  //   uDeltaT: new THREE.Uniform(simulationConfig.deltaT),
  // };

  subtractGradientShader = new NodeMaterial();
  subtractGradientShader.vertexNode = createVertex();
  subtractGradientShader.fragmentNode = subtractGradientFrag();
  // subtractGradientShader.uniforms = {
  //   uData: new THREE.Uniform(null),
  //   uTexelSize: new THREE.Uniform(texelSize),
  //   uDeltaT: new THREE.Uniform(simulationConfig.deltaT),
  // };

  // 描画に使用するシェーダーを作成
  renderShader = new NodeMaterial();
  renderShader.vertexNode = createVertex();
  renderShader.fragmentNode = renderVelocity();
  // renderShader.uniforms = {
  //   uTexture: new THREE.Uniform(null),
  //   uTextureSize: new THREE.Uniform(new THREE.Vector2()),
  //   uTimeStep: new THREE.Uniform(0),
  //   uColorStrength: new THREE.Uniform(simulationConfig.colorStrength),
  //   uBgColor: new THREE.Uniform(simulationConfig.bgColor),
  //   uFluidColor: new THREE.Uniform(simulationConfig.fluidColor),
  // };

  // GUI のセットアップ
  setupGui();

  // デバッグビジュアライザーの初期化（レンダラーを共有）
  debugVisualizer = new DebugVisualizerTsl(renderer);

  // イベントの登録・初期化時点でのサイズ設定処理
  window.addEventListener("resize", onWindowResize);
  pointerManager.init(renderer.domElement);
  onWindowResize();

  // アニメーション開始
  renderer.setAnimationLoop(tick);
}

/**
 * 画面リサイズ時の挙動
 * シミュレーション用のデータテクスチャーを画面サイズに応じてリサイズする
 */
function onWindowResize() {
  // リサイズ時のお約束処理
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // シミュレーション用のデータテクスチャーを画面サイズに応じてリサイズする
  const newWidth = window.innerWidth * window.devicePixelRatio;
  const newHeight = window.innerHeight * window.devicePixelRatio;
  dataWidth = Math.round(newWidth * simulationConfig.pixelRatio);
  dataHeight = Math.round(newHeight * simulationConfig.pixelRatio);
  dataTexture.setSize(dataWidth, dataHeight);
  dataRenderTarget.setSize(dataWidth, dataHeight);

  pointerManager.resizeTarget(simulationConfig.pixelRatio);

  // シェーダーで使用するデータテクスチャーの1ピクセルごとのサイズをシェーダー定数に設定し直す
  texelSize.set(1 / dataWidth, 1 / dataHeight);
  addForceShader.uniforms?.uTexelSize.value.copy(texelSize);
  advectVelShader.uniforms?.uTexelSize.value.copy(texelSize);
  divergenceShader.uniforms?.uTexelSize.value.copy(texelSize);
  pressureShader.uniforms?.uTexelSize.value.copy(texelSize);
  subtractGradientShader.uniforms?.uTexelSize.value.copy(texelSize);
  renderShader.uniforms?.uTextureSize.value.set(1 / newWidth, 1 / newHeight);
}

/**
 * 毎フレーム実行する関数
 * シミュレーションの実行と画面へのレンダリングを行う
 */
function tick() {
  // 1. 外力の適用：速度場に外力を加算します（フレームごと1回注入）
  // マウスの移動距離から速度の変化を計算
  const deltaV = pointerManager
    .getDelta()
    .multiply(texelSize)
    .multiplyScalar(simulationConfig.forceCoefficient);
  const addForceUniforms = addForceShader.uniforms;
  if (addForceUniforms) {
    addForceUniforms.uData.value = dataTexture.texture;
    addForceUniforms.uForceCenter.value.copy(pointerManager.pointer.clone().multiply(texelSize));
    addForceUniforms.uForceDeltaV.value.copy(deltaV);
    addForceUniforms.uForceRadius.value = simulationConfig.forceRadius;
  }

  render(addForceShader, dataRenderTarget);
  swapTexture();

  // デバッグビジュアライザーで速度場を表示
  debugVisualizer.render(dataTexture.texture);

  // 2. 移流の計算：セミラグランジュ法による速度の移流
  const advectUniforms = advectVelShader.uniforms;
  if (advectUniforms) {
    advectUniforms.uData.value = dataTexture.texture;
    advectUniforms.uDeltaT.value = simulationConfig.deltaT;
    advectUniforms.uDissipation.value = simulationConfig.dissipation;
  }
  render(advectVelShader, dataRenderTarget);
  swapTexture();

  // 3. 発散の計算
  const divercenceUniforms = divergenceShader.uniforms;
  if (divercenceUniforms) {
    divercenceUniforms.uData.value = dataTexture.texture;
  }
  render(divergenceShader, dataRenderTarget);
  swapTexture();

  // 4. 圧力の計算（ヤコビ反復を複数回）
  const pressureUniforms = pressureShader.uniforms;
  for (let i = 0; i < simulationConfig.solverIteration; i++) {
    if (pressureUniforms) {
      pressureUniforms.uData.value = dataTexture.texture;
    }
    render(pressureShader, dataRenderTarget);
    swapTexture();
  }

  // 5. 圧力勾配の減算
  const subtractUniforms = subtractGradientShader.uniforms;
  if (subtractUniforms) {
    subtractUniforms.uData.value = dataTexture.texture;
    subtractUniforms.uDeltaT.value = simulationConfig.deltaT;
  }
  render(subtractGradientShader, dataRenderTarget);
  swapTexture();

  // 6. 描画：更新された速度場を使って流体の見た目をレンダリングします。
  const renderUniforms = renderShader.uniforms;
  if (renderUniforms) {
    renderUniforms.uTexture.value = dataTexture.texture;
  }
  render(renderShader, null);

  // 次のフレームに備えて後処理
  pointerManager.updatePreviousPointer();
}

/**
 * レンダーターゲットに書かれた内容をリセットする
 */
function clearRenderTarget(renderTarget: THREE.RenderTarget) {
  renderer.setRenderTarget(renderTarget);
  renderer.clearColor();
  renderer.setRenderTarget(null);
}

/**
 * 指定したNodeMaterialで指定したターゲット（テクスチャーかフレームバッファー）にレンダリングする
 */
function render(material: THREE.Material, target: THREE.RenderTarget | null) {
  quad.material = material;
  renderer.setRenderTarget(target);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
}

/**
 * 参照用テクスチャーとレンダーターゲット用テクスチャーを入れ替える
 * Ping-Pong用
 */
function swapTexture() {
  [dataTexture, dataRenderTarget] = [dataRenderTarget, dataTexture];
}
