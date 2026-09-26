import * as THREE from "three";
import { bodyStance, FOREARM, LEG_REACH, UPPER_ARM, type BodyStance } from "@/lib/climber-pose";
import { solveTwoBone, type Vec3 } from "@/lib/limb-ik";
import { addInkShell, inkMaterial, toonMaterial } from "./materials";

const UP = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);
const _dir = new THREE.Vector3();

const SKIN = "oklch(0.82 0.07 55)";
const SHIRT = "var(--primary)";
const SHORTS = "var(--climb)";
const HAIR = "var(--foreground)";
const BAG = "var(--disc)";
const THIGH = LEG_REACH * 0.54;
const SHIN = LEG_REACH * 0.46;

function v3(v: Vec3, out = new THREE.Vector3()): THREE.Vector3 {
  return out.set(v.x, v.y, v.z);
}

function part(geo: THREE.BufferGeometry, css: string, inflate: number, ink: THREE.Material): THREE.Mesh {
  const mesh = new THREE.Mesh(geo, toonMaterial(css));
  addInkShell(mesh, ink, inflate);
  mesh.raycast = () => {};
  return mesh;
}

function alignBone(mesh: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3, thick: number, depth: number) {
  _dir.subVectors(to, from);
  const length = Math.max(_dir.length(), 0.001);
  _dir.multiplyScalar(1 / length);
  mesh.position.copy(from).addScaledVector(_dir, length / 2);
  mesh.scale.set(thick, length, depth);
  if (_dir.y > 0.999) mesh.quaternion.identity();
  else if (_dir.y < -0.999) mesh.quaternion.setFromAxisAngle(X_AXIS, Math.PI);
  else mesh.quaternion.setFromUnitVectors(UP, _dir);
}

function armPole(shoulder: Vec3, side: -1 | 1): Vec3 {
  return { x: shoulder.x + side * 0.55, y: shoulder.y - 0.15, z: shoulder.z + 0.5 };
}

function kneePole(hip: Vec3, side: -1 | 1): Vec3 {
  return { x: hip.x + side * 0.18, y: hip.y - 0.3, z: hip.z + 0.6 };
}

/**
 * Blocky mascot. Body faces the wall; the head turns toward the camera so the face reads
 * while you orbit. Limbs are solved with two-bone IK onto the grip and foot targets.
 */
export class Climber {
  readonly group = new THREE.Group();
  private readonly torso: THREE.Mesh;
  private readonly shorts: THREE.Mesh;
  private readonly head: THREE.Mesh;
  private readonly leftUpper: THREE.Mesh;
  private readonly leftFore: THREE.Mesh;
  private readonly rightUpper: THREE.Mesh;
  private readonly rightFore: THREE.Mesh;
  private readonly leftThigh: THREE.Mesh;
  private readonly leftShin: THREE.Mesh;
  private readonly rightThigh: THREE.Mesh;
  private readonly rightShin: THREE.Mesh;
  private readonly leftHand: THREE.Mesh;
  private readonly rightHand: THREE.Mesh;
  private readonly leftShoe: THREE.Mesh;
  private readonly rightShoe: THREE.Mesh;
  private readonly leftElbow: THREE.Mesh;
  private readonly rightElbow: THREE.Mesh;
  private readonly leftKnee: THREE.Mesh;
  private readonly rightKnee: THREE.Mesh;
  private readonly hipV = new THREE.Vector3();
  private readonly shoulderMid = new THREE.Vector3();
  private readonly leftShoulderV = new THREE.Vector3();
  private readonly rightShoulderV = new THREE.Vector3();
  private readonly jointV = new THREE.Vector3();
  private readonly endV = new THREE.Vector3();
  private readonly look = new THREE.Vector3();

  constructor() {
    const ink = inkMaterial();
    const limb = () => new THREE.BoxGeometry(1, 1, 1);
    this.torso = part(limb(), SHIRT, 0.08, ink);
    this.shorts = part(new THREE.BoxGeometry(0.38, 0.18, 0.22), SHORTS, 0.08, ink);
    this.head = part(new THREE.BoxGeometry(0.32, 0.3, 0.28), SKIN, 0.07, ink);
    this.leftUpper = part(limb(), SKIN, 0.14, ink);
    this.leftFore = part(limb(), SKIN, 0.16, ink);
    this.rightUpper = part(limb(), SKIN, 0.14, ink);
    this.rightFore = part(limb(), SKIN, 0.16, ink);
    this.leftThigh = part(limb(), SHORTS, 0.12, ink);
    this.leftShin = part(limb(), SKIN, 0.14, ink);
    this.rightThigh = part(limb(), SHORTS, 0.12, ink);
    this.rightShin = part(limb(), SKIN, 0.14, ink);
    this.leftHand = part(new THREE.BoxGeometry(0.11, 0.09, 0.08), SKIN, 0.12, ink);
    this.rightHand = part(new THREE.BoxGeometry(0.11, 0.09, 0.08), SKIN, 0.12, ink);
    // Length along the wall, thin sole, shallow toward the camera so the shoe
    // can stay axis-aligned without stabbing into the hold.
    this.leftShoe = part(new THREE.BoxGeometry(0.18, 0.07, 0.1), HAIR, 0.1, ink);
    this.rightShoe = part(new THREE.BoxGeometry(0.18, 0.07, 0.1), HAIR, 0.1, ink);

    const jointGeo = new THREE.SphereGeometry(0.07, 8, 6);
    this.leftElbow = part(jointGeo, SKIN, 0.12, ink);
    this.rightElbow = part(jointGeo, SKIN, 0.12, ink);
    this.leftKnee = part(jointGeo, SKIN, 0.12, ink);
    this.rightKnee = part(jointGeo, SKIN, 0.12, ink);

    const hair = part(new THREE.BoxGeometry(0.34, 0.12, 0.3), HAIR, 0.06, ink);
    hair.position.set(0, 0.18, 0.01);
    this.head.add(hair);
    const eyeGeo = new THREE.BoxGeometry(0.07, 0.08, 0.04);
    const eyeMat = toonMaterial(HAIR);
    for (const x of [-0.07, 0.07]) {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(x, 0.03, -0.15);
      eye.raycast = () => {};
      this.head.add(eye);
    }
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.03), eyeMat);
    mouth.position.set(0, -0.07, -0.15);
    mouth.raycast = () => {};
    this.head.add(mouth);

    const bag = part(new THREE.SphereGeometry(0.07, 8, 6), BAG, 0.1, ink);
    bag.position.set(0.2, -0.02, 0.08);
    this.shorts.add(bag);

    this.group.add(
      this.torso,
      this.shorts,
      this.head,
      this.leftUpper,
      this.leftFore,
      this.rightUpper,
      this.rightFore,
      this.leftThigh,
      this.leftShin,
      this.rightThigh,
      this.rightShin,
      this.leftHand,
      this.rightHand,
      this.leftShoe,
      this.rightShoe,
      this.leftElbow,
      this.rightElbow,
      this.leftKnee,
      this.rightKnee,
    );
    this.group.traverse((obj) => {
      obj.raycast = () => {};
    });
  }

  pose(leftHand: Vec3, rightHand: Vec3, leftFoot: Vec3, rightFoot: Vec3, view: THREE.Vector3): BodyStance {
    const stance = bodyStance(leftHand, rightHand);
    v3(stance.hip, this.hipV);
    v3(stance.leftShoulder, this.leftShoulderV);
    v3(stance.rightShoulder, this.rightShoulderV);
    this.shoulderMid.copy(this.leftShoulderV).lerp(this.rightShoulderV, 0.5);

    const torsoStart = this.hipV.clone().lerp(this.shoulderMid, 0.18);
    alignBone(this.torso, torsoStart, this.shoulderMid, 0.42, 0.22);
    this.shorts.position.copy(this.hipV);
    this.shorts.quaternion.copy(this.torso.quaternion);

    this.reach(this.leftUpper, this.leftFore, this.leftHand, this.leftElbow, stance.leftShoulder, leftHand, armPole(stance.leftShoulder, -1), UPPER_ARM, FOREARM);
    this.reach(this.rightUpper, this.rightFore, this.rightHand, this.rightElbow, stance.rightShoulder, rightHand, armPole(stance.rightShoulder, 1), UPPER_ARM, FOREARM);
    this.reach(this.leftThigh, this.leftShin, this.leftShoe, this.leftKnee, stance.hip, leftFoot, kneePole(stance.hip, -1), THIGH, SHIN);
    this.reach(this.rightThigh, this.rightShin, this.rightShoe, this.rightKnee, stance.hip, rightFoot, kneePole(stance.hip, 1), THIGH, SHIN);

    this.head.position.copy(this.shoulderMid);
    this.head.position.y += 0.24;
    this.look.copy(view);
    this.look.y = this.head.position.y;
    this.head.up.copy(UP);
    this.head.lookAt(this.look);
    return stance;
  }

  private reach(
    upper: THREE.Mesh,
    lower: THREE.Mesh,
    endMesh: THREE.Mesh,
    jointMesh: THREE.Mesh,
    root: Vec3,
    target: Vec3,
    pole: Vec3,
    boneA: number,
    boneB: number,
  ) {
    const solved = solveTwoBone(root, target, boneA, boneB, pole);
    const rootV = v3(root);
    v3(solved.joint, this.jointV);
    v3(solved.end, this.endV);
    alignBone(upper, rootV, this.jointV, 0.11, 0.11);
    alignBone(lower, this.jointV, this.endV, 0.09, 0.09);
    jointMesh.position.copy(this.jointV);
    // Hands and shoes stay axis-aligned. Their targets already sit outside the
    // plastic, and copying the limb twist would swing the long axis into the wall.
    endMesh.position.copy(this.endV);
    endMesh.quaternion.identity();
  }
}
