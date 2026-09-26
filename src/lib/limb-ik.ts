// Two-bone inverse kinematics for the climber's arms and legs.
// Pure math so the pose can be tested without a WebGL context.

export type Vec3 = { x: number; y: number; z: number };

export type TwoBonePose = {
  joint: Vec3;
  end: Vec3;
  reached: boolean;
};

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function scale(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function len(a: Vec3): number {
  return Math.hypot(a.x, a.y, a.z);
}

function norm(a: Vec3): Vec3 {
  const l = len(a);
  if (l < 1e-8) return { x: 0, y: 1, z: 0 };
  return scale(a, 1 / l);
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function finite(v: Vec3): boolean {
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
}

/**
 * Place an elbow or knee so both bones keep their length and the end lands on
 * `target` when the target is in reach. `pole` is a point the joint bends toward.
 */
export function solveTwoBone(root: Vec3, target: Vec3, boneA: number, boneB: number, pole: Vec3): TwoBonePose {
  if (!(boneA > 0) || !(boneB > 0) || !Number.isFinite(boneA) || !Number.isFinite(boneB)) {
    throw new RangeError("bone lengths must be positive finite numbers");
  }
  if (!finite(root) || !finite(target) || !finite(pole)) {
    throw new RangeError("ik positions must be finite");
  }

  const offset = sub(target, root);
  const dist = len(offset);
  const max = boneA + boneB;
  const min = Math.abs(boneA - boneB);
  const reached = dist <= max + 1e-4 && dist >= min - 1e-4;

  // Reason: a fully folded chain has no direction, so the pole (or +Y) decides which way it bends.
  const dir = dist > 1e-5 ? scale(offset, 1 / dist) : norm(sub(pole, root));
  const end = reached ? { x: target.x, y: target.y, z: target.z } : add(root, scale(dir, dist > max ? max : min));

  const useDist = reached ? Math.max(dist, 1e-4) : dist > max ? max - 1e-4 : min + 1e-4;
  const cosine = Math.max(-1, Math.min(1, (boneA * boneA + useDist * useDist - boneB * boneB) / (2 * boneA * useDist)));
  const along = boneA * cosine;
  const bendAmount = Math.sqrt(Math.max(0, boneA * boneA - along * along));

  let bend = sub(sub(pole, root), scale(dir, dot(sub(pole, root), dir)));
  if (len(bend) < 1e-5) {
    const helper = Math.abs(dir.y) > 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
    bend = cross(dir, helper);
  }
  bend = norm(bend);

  return {
    joint: add(add(root, scale(dir, along)), scale(bend, bendAmount)),
    end,
    reached,
  };
}
