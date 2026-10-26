import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { ActiveCar } from '../vehicles/car';
import type { Player } from '../characters/player';

type AssetName =
  | 'sedan' | 'sedan-sports' | 'hatchback-sports' | 'suv' | 'police' | 'taxi'
  | 'driver' | 'barrier' | 'cone' | 'stop-sign' | 'streetlight' | 'dumpster'
  | 'shop' | 'office' | 'tree';

const files: Record<AssetName, string> = {
  sedan: 'cars/sedan.glb',
  'sedan-sports': 'cars/sedan-sports.glb',
  'hatchback-sports': 'cars/hatchback-sports.glb',
  suv: 'cars/suv.glb',
  police: 'cars/police.glb',
  taxi: 'cars/taxi.glb',
  driver: 'people/driver.glb',
  barrier: 'props/barrier.glb',
  cone: 'props/cone.glb',
  'stop-sign': 'props/stop-sign.glb',
  streetlight: 'props/streetlight.glb',
  dumpster: 'props/dumpster.glb',
  shop: 'city/shop.glb',
  office: 'city/office.glb',
  tree: 'city/tree.glb',
};

type Models = Partial<Record<AssetName, THREE.Group>>;

function prepareShadows(root: THREE.Object3D, shadows: boolean): void {
  root.traverse(obj => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = shadows;
      obj.receiveShadow = true;
      obj.frustumCulled = true;
    }
  });
}

function heightFitted(prefab: THREE.Group, height: number, shadows = false): THREE.Group {
  const obj = prefab.clone(true);
  const bounds = new THREE.Box3().setFromObject(obj);
  const size = bounds.getSize(new THREE.Vector3());
  const scale = height / Math.max(size.y, 0.01);
  obj.scale.setScalar(scale);
  obj.position.set(
    -(bounds.min.x + bounds.max.x) * 0.5 * scale,
    -bounds.min.y * scale,
    -(bounds.min.z + bounds.max.z) * 0.5 * scale,
  );
  prepareShadows(obj, shadows);
  return obj;
}

function installCarAsset(car: ActiveCar, prefab: THREE.Group): void {
  const model = prefab.clone(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const scale = Math.min(
    (car.preset.chassis.x * 2 * 0.96) / Math.max(0.01, size.x),
    (car.preset.chassis.z * 2 * 0.96) / Math.max(0.01, size.z),
  );
  model.scale.setScalar(scale);
  // Kenney vehicles face +Z; the game's physics and chase camera use -Z.
  model.rotation.y = Math.PI;
  model.position.set(
    -(bounds.min.x + bounds.max.x) * 0.5 * scale,
    -bounds.min.y * scale - (car.preset.chassis.y * 0.6 + 0.36 + 0.32),
    -(bounds.min.z + bounds.max.z) * 0.5 * scale,
  );
  prepareShadows(model, true);
  const wheelIndexes: Record<string, number> = {
    'wheel-front-left': 0,
    'wheel-front-right': 1,
    'wheel-back-left': 2,
    'wheel-back-right': 3,
  };
  const wheels: Array<{ node: THREE.Object3D; index: number }> = [];
  model.traverse(obj => {
    if (Object.prototype.hasOwnProperty.call(wheelIndexes, obj.name))
      wheels.push({ node: obj, index: wheelIndexes[obj.name] });
  });
  car.mesh.clear();
  car.mesh.add(model);
  car.visualWheels = wheels;
}

function installDriverAsset(player: Player, prefab: THREE.Group): void {
  player.mesh.clear();
  player.mesh.add(heightFitted(prefab, 1.8, true));
}

function addAt(scene: THREE.Scene, prefab: THREE.Group | undefined,
  x: number, z: number, height: number, rotation = 0, shadows = false): void {
  if (!prefab) return;
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  group.add(heightFitted(prefab, height, shadows));
  scene.add(group);
}

function replaceTrackBlocks(scene: THREE.Scene, models: Models): number {
  const targets: THREE.Mesh[] = [];
  scene.traverse(obj => {
    if (obj instanceof THREE.Mesh && typeof obj.userData.wellmanAsset === 'string')
      targets.push(obj);
  });
  let replaced = 0;
  for (const mesh of targets) {
    const key = mesh.userData.wellmanAsset as AssetName;
    const prefab = models[key];
    if (!prefab) continue;
    if (key === 'barrier') {
      const geom = mesh.geometry;
      if (!(geom instanceof THREE.BoxGeometry)) continue;
      const count = Math.max(1, Math.round(geom.parameters.depth / 1.9));
      const spacing = geom.parameters.depth / count;
      for (let i = 0; i < count; i++) {
        const segment = heightFitted(prefab, 1.05, false);
        // Align the horizontal barrier along the length of the road.
        segment.rotation.y = Math.PI / 2;
        segment.position.add(new THREE.Vector3(
          mesh.position.x,
          mesh.position.y - 0.6,
          mesh.position.z + (i - (count - 1) / 2) * spacing,
        ));
        scene.add(segment);
      }
    } else {
      const height = key === 'cone' ? 1.05 : 1.5;
      const prop = heightFitted(prefab, height, true);
      prop.position.add(new THREE.Vector3(mesh.position.x,
        mesh.position.y - (key === 'cone' ? 0.7 : 1), mesh.position.z));
      scene.add(prop);
    }
    mesh.visible = false; // Preserve the existing Rapier collider.
    replaced++;
  }
  return replaced;
}

function decorateCity(scene: THREE.Scene, models: Models): void {
  const buildings: Array<[AssetName, number, number, number, number]> = [
    ['shop', -34, -33, 9, 0], ['office', 33, -28, 13, Math.PI],
    ['office', -33, -7, 15, 0], ['shop', 35, 7, 9, Math.PI],
    ['shop', -36, 24, 8, 0], ['office', 36, 35, 14, Math.PI],
    ['office', -34, 53, 12, 0], ['shop', 35, 66, 10, Math.PI],
    ['shop', -35, 84, 8, 0], ['office', 37, 89, 17, Math.PI],
  ];
  for (const [asset, x, z, height, rot] of buildings)
    addAt(scene, models[asset], x, z, height, rot);
  for (let z = -37; z <= 84; z += 19) {
    addAt(scene, models.streetlight, -19, z, 6.5, 0);
    addAt(scene, models.streetlight, 19, z + 8, 6.5, Math.PI);
  }
  for (let z = -34; z <= 92; z += 22) {
    addAt(scene, models.tree, -25, z + 8, 5.5, 0);
    addAt(scene, models.tree, 26, z - 4, 6.2, 0);
  }
  addAt(scene, models['stop-sign'], -16, -27, 2.5, Math.PI / 2, true);
  addAt(scene, models['stop-sign'], 16, 38, 2.5, -Math.PI / 2, true);
  addAt(scene, models.dumpster, -20, 8, 1.7, 0, true);
}

export async function installRealAssets(
  scene: THREE.Scene,
  cars: ActiveCar[],
  player: Player,
  notify: (percent: number, message: string) => void,
): Promise<void> {
  const loader = new GLTFLoader();
  const models: Models = {};
  const entries = Object.entries(files) as Array<[AssetName, string]>;
  let complete = 0;
  await Promise.all(entries.map(async ([name, file]) => {
    try {
      // BASE_URL works both on localhost and at /wellman/ on GitHub Pages.
      const url = import.meta.env.BASE_URL + 'models/' + file;
      const gltf = await loader.loadAsync(url);
      models[name] = gltf.scene;
    } catch (error) {
      console.warn('Wellman: asset indisponível, usando substituto:', name, error);
    } finally {
      complete++;
      notify(Math.round(complete / entries.length * 100), 'Preparando modelos 3D');
    }
  }));
  const selected: AssetName[] = [
    'sedan', 'sedan-sports', 'hatchback-sports', 'police', 'taxi', 'suv', 'police',
  ];
  cars.forEach((car, i) => {
    const model = models[selected[i] ?? 'sedan'];
    if (model) installCarAsset(car, model);
  });
  if (models.driver) installDriverAsset(player, models.driver);
  const replaced = replaceTrackBlocks(scene, models);
  decorateCity(scene, models);
  console.info('Wellman: assets CC0 Kenney instalados, objetos substituídos:', replaced);
}
