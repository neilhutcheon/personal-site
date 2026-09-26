import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { holdById, targetsForPath, type ClimberTargets } from "@/lib/climbing";
import type { Vec3 } from "@/lib/limb-ik";
import { Climber } from "./climber";
import { buildGym, type HoldView } from "./gym";
import { disposeToonGradient, themeColor } from "./materials";

export type ClimbSync = {
  path: string[];
  reachable: string[];
  sent: boolean;
  reducedMotion: boolean;
};

type Stance = ClimberTargets;

function easeOutBack(t: number): number {
  if (t >= 1) return 1;
  const c1 = 1.12;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

function lerpVec(out: Vec3, from: Vec3, to: Vec3, t: number): Vec3 {
  out.x = from.x + (to.x - from.x) * t;
  out.y = from.y + (to.y - from.y) * t;
  out.z = from.z + (to.z - from.z) * t;
  return out;
}

function copyStance(out: Stance, src: Stance) {
  out.leftHand = { ...src.leftHand };
  out.rightHand = { ...src.rightHand };
  out.leftFoot = { ...src.leftFoot };
  out.rightFoot = { ...src.rightFoot };
}

function lerpStance(out: Stance, from: Stance, to: Stance, t: number) {
  lerpVec(out.leftHand, from.leftHand, to.leftHand, t);
  lerpVec(out.rightHand, from.rightHand, to.rightHand, t);
  lerpVec(out.leftFoot, from.leftFoot, to.leftFoot, t);
  lerpVec(out.rightFoot, from.rightFoot, to.rightFoot, t);
}

const EMPTY: Stance = {
  leftHand: { x: 0, y: 1, z: 1 },
  rightHand: { x: 0, y: 1, z: 1 },
  leftFoot: { x: -0.1, y: 0.2, z: 1 },
  rightFoot: { x: 0.1, y: 0.2, z: 1 },
};

/**
 * The gym, the climber, and the orbit camera. React owns the route; this class only shows it
 * and reports which hold was clicked. Three.js stays behind this module so the page can load it
 * after hydration.
 */
export class ClimbingWorld {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly climber = new Climber();
  private readonly holds: Map<string, HoldView>;
  private readonly hitMeshes: THREE.Mesh[];
  private readonly raycaster = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  private readonly clock = new THREE.Clock();
  private readonly abort = new AbortController();
  private readonly camFrom = new THREE.Vector3(3.5, 3.35, 5.3);
  private readonly camTo = new THREE.Vector3(1.7, 3.55, 7.15);
  private readonly targetFrom = new THREE.Vector3(0, 2.25, 0.35);
  private readonly targetTo = new THREE.Vector3(0, 2.55, 0.3);
  private readonly shadow: THREE.Mesh;
  private rope: THREE.Mesh | null = null;
  private readonly chalkGeo = new THREE.SphereGeometry(0.045, 6, 5);
  private readonly chalkMat: THREE.MeshBasicMaterial;
  private puffs: { mesh: THREE.Mesh; v: THREE.Vector3; life: number }[] = [];
  private frame = 0;
  private resizeObserver: ResizeObserver;
  private pointerDown: { x: number; y: number } | null = null;
  private hover: string | null = null;
  private reachable = new Set<string>();
  private path: string[] = [];
  private pathKey = "";
  private sent = false;
  private chalked = false;
  private reduced = false;
  private hasPose = false;
  private intro = 0;
  private blend = 1;
  private shown: Stance = structuredClone(EMPTY);
  private from: Stance = structuredClone(EMPTY);
  private to: Stance = structuredClone(EMPTY);
  private hipY = 1.2;
  private disposed = false;

  constructor(
    private readonly host: HTMLElement,
    private readonly onGrab: (id: string) => void,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.setClearColor(themeColor("var(--background)"));
    const canvas = this.renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.touchAction = "none";
    canvas.style.cursor = "grab";
    canvas.setAttribute("role", "img");
    canvas.setAttribute(
      "aria-label",
      "Cartoon climbing gym. Drag to look around the boulder. Click a glowing hold, or use the hold buttons, to climb.",
    );
    this.host.appendChild(canvas);

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    this.camera.position.copy(this.camFrom);

    this.scene.add(new THREE.HemisphereLight(0xfff6ea, 0xcbb89a, 0.42));
    const key = new THREE.DirectionalLight(0xffffff, 0.72);
    key.position.set(3.2, 6.5, 5);
    this.scene.add(key);

    const gym = buildGym();
    this.scene.add(gym.group);
    this.holds = gym.holds;
    this.hitMeshes = [...gym.holds.values()].map((view) => view.hit);
    this.scene.add(this.climber.group);

    this.shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.28, 20),
      new THREE.MeshBasicMaterial({ color: themeColor("var(--foreground)"), transparent: true, opacity: 0.16, depthWrite: false }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.19;
    this.shadow.raycast = () => {};
    this.scene.add(this.shadow);

    this.chalkMat = new THREE.MeshBasicMaterial({ color: themeColor("oklch(0.98 0.005 95)") });

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.7;
    this.controls.zoomToCursor = false;
    this.controls.minDistance = 4.4;
    this.controls.maxDistance = 10;
    this.controls.minPolarAngle = 0.55;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.08;
    this.controls.minAzimuthAngle = -0.9;
    this.controls.maxAzimuthAngle = 0.95;
    this.controls.target.copy(this.targetFrom);
    this.controls.addEventListener("start", this.cancelIntro);

    this.listen();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.resize();
    this.frame = requestAnimationFrame(this.tick);
  }

  sync(state: ClimbSync) {
    if (this.disposed) return;
    this.reduced = state.reducedMotion;
    if (this.reduced) this.intro = 1;
    this.reachable = new Set(state.reachable);
    this.sent = state.sent;
    const key = state.path.join(">");
    if (key !== this.pathKey) {
      this.pathKey = key;
      this.path = state.path;
      this.moveTo(state.path);
      this.updateRope();
    }
    if (state.sent && !this.chalked && !this.reduced) {
      this.burst();
      this.chalked = true;
    }
    if (!state.sent && this.chalked) {
      this.clearChalk();
      this.chalked = false;
    }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.abort.abort();
    this.resizeObserver.disconnect();
    this.controls.removeEventListener("start", this.cancelIntro);
    this.controls.dispose();
    this.clearChalk();
    const geos = new Set<THREE.BufferGeometry>();
    const mats = new Set<THREE.Material>();
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) geos.add(mesh.geometry);
      const material = mesh.material;
      if (Array.isArray(material)) material.forEach((item) => mats.add(item));
      else if (material) mats.add(material);
    });
    geos.forEach((geo) => geo.dispose());
    mats.forEach((material) => {
      const mapped = material as THREE.MeshBasicMaterial;
      mapped.map?.dispose();
      material.dispose();
    });
    this.chalkGeo.dispose();
    this.chalkMat.dispose();
    disposeToonGradient();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }

  private cancelIntro = () => {
    this.intro = 1;
  };

  private moveTo(path: string[]) {
    const next = targetsForPath(path);
    if (!this.hasPose || this.reduced) {
      copyStance(this.shown, next);
      this.blend = 1;
    } else {
      copyStance(this.from, this.shown);
      copyStance(this.to, next);
      this.blend = 0;
    }
    this.hasPose = true;
  }

  private updateRope() {
    if (this.path.length < 2) {
      if (this.rope) this.rope.visible = false;
      return;
    }
    const points = this.path.map((id) => {
      const hold = holdById(id);
      return new THREE.Vector3(hold.x, hold.y, hold.z + 0.06);
    });
    const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.2);
    const geom = new THREE.TubeGeometry(curve, points.length * 8, 0.028, 5, false);
    if (!this.rope) {
      this.rope = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ color: themeColor("var(--foreground)") }));
      this.rope.raycast = () => {};
      this.scene.add(this.rope);
    } else {
      this.rope.geometry.dispose();
      this.rope.geometry = geom;
      this.rope.visible = true;
    }
  }

  private burst() {
    const top = holdById("t");
    for (let i = 0; i < 16; i++) {
      const mesh = new THREE.Mesh(this.chalkGeo, this.chalkMat);
      mesh.position.set(top.x, top.y, top.z);
      mesh.raycast = () => {};
      const v = new THREE.Vector3((Math.random() - 0.5) * 1.6, Math.random() * 1.4 + 0.4, (Math.random() - 0.5) * 1.6);
      this.puffs.push({ mesh, v, life: 0.85 + Math.random() * 0.35 });
      this.scene.add(mesh);
    }
  }

  private clearChalk() {
    for (const puff of this.puffs) this.scene.remove(puff.mesh);
    this.puffs = [];
  }

  private listen() {
    const el = this.renderer.domElement;
    const signal = this.abort.signal;
    el.addEventListener(
      "pointerdown",
      (event) => {
        this.pointerDown = { x: event.clientX, y: event.clientY };
      },
      { signal },
    );
    el.addEventListener(
      "pointerup",
      (event) => {
        if (!this.pointerDown) return;
        const dx = event.clientX - this.pointerDown.x;
        const dy = event.clientY - this.pointerDown.y;
        this.pointerDown = null;
        if (dx * dx + dy * dy > 25) return;
        const id = this.pick(event);
        if (id && this.reachable.has(id)) this.onGrab(id);
      },
      { signal },
    );
    el.addEventListener(
      "pointermove",
      (event) => {
        const id = this.pick(event);
        this.hover = id && this.reachable.has(id) ? id : null;
        el.style.cursor = this.hover ? "pointer" : "grab";
      },
      { signal },
    );
    el.addEventListener(
      "pointerleave",
      () => {
        this.hover = null;
        el.style.cursor = "grab";
      },
      { signal },
    );
  }

  private pick(event: PointerEvent): string | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    this.ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const hit = this.raycaster.intersectObjects(this.hitMeshes, false)[0];
    const id = hit?.object.userData.holdId;
    return typeof id === "string" ? id : null;
  }

  private resize() {
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    if (width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private tick = () => {
    if (this.disposed) return;
    this.frame = requestAnimationFrame(this.tick);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.elapsedTime;

    if (!this.reduced && this.intro < 1) {
      this.intro = Math.min(1, this.intro + dt / 1.35);
      const eased = 1 - (1 - this.intro) ** 3;
      this.camera.position.lerpVectors(this.camFrom, this.camTo, eased);
      this.controls.target.lerpVectors(this.targetFrom, this.targetTo, eased);
    }

    if (this.blend < 1) {
      this.blend = this.reduced ? 1 : Math.min(1, this.blend + dt / 0.72);
      lerpStance(this.shown, this.from, this.to, easeOutBack(this.blend));
    }

    const stance = this.climber.pose(
      this.shown.leftHand,
      this.shown.rightHand,
      this.shown.leftFoot,
      this.shown.rightFoot,
      this.camera.position,
    );
    this.hipY = stance.hip.y;
    if (!this.reduced && this.hasPose) {
      this.climber.group.position.y = Math.sin(time * 2.2) * 0.012;
    }

    if (this.intro >= 1 && this.blend < 1) {
      const desired = THREE.MathUtils.clamp(this.hipY + 0.15, 1.5, 3.85);
      this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, desired, 2.4, dt);
    }

    const current = this.path[this.path.length - 1];
    for (const [id, view] of this.holds) {
      const hot = this.reachable.has(id);
      const used = this.path.includes(id);
      const dim = !hot && !used && !this.sent;
      for (const material of view.fade) {
        material.opacity = dim ? 0.45 : 1;
        material.transparent = dim;
        material.depthWrite = !dim;
      }
      view.ring.visible = hot || id === current;
      const pulse = !this.reduced && hot ? 1 + Math.sin(time * 3.4 + view.root.position.y) * 0.05 : 1;
      const hover = this.hover === id ? 1.1 : 1;
      view.root.scale.setScalar(pulse * hover);
    }

    const shadowMat = this.shadow.material as THREE.MeshBasicMaterial;
    shadowMat.opacity = THREE.MathUtils.clamp(1.15 - this.hipY / 1.6, 0, 0.2);
    this.shadow.position.x = stance.hip.x;
    this.shadow.position.z = stance.hip.z;

    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const puff = this.puffs[i];
      puff.life -= dt;
      puff.v.y -= dt * 2.4;
      puff.mesh.position.addScaledVector(puff.v, dt);
      const scale = Math.max(puff.life, 0);
      puff.mesh.scale.setScalar(scale);
      if (puff.life <= 0) {
        this.scene.remove(puff.mesh);
        this.puffs.splice(i, 1);
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
