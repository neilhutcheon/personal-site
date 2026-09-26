import * as THREE from "three";
import { HOLDS, type Hold, type HoldKind } from "@/lib/climbing";
import { addInkShell, faceted, inkMaterial, themeColor, toonMaterial } from "./materials";

const KIND_CSS: Record<HoldKind, string> = {
  jug: "var(--climb)",
  crimp: "var(--brass)",
  sloper: "var(--primary)",
  pinch: "var(--disc)",
};

export type HoldView = {
  root: THREE.Group;
  hit: THREE.Mesh;
  ring: THREE.Mesh;
  fade: THREE.Material[];
};

function outlined(geo: THREE.BufferGeometry, css: string, inflate: number): THREE.Mesh {
  const mesh = new THREE.Mesh(geo, toonMaterial(css));
  addInkShell(mesh, inkMaterial(), inflate);
  mesh.raycast = () => {};
  return mesh;
}

function spin(id: string): number {
  let h = 0;
  for (const char of id) h = (h * 33 + char.charCodeAt(0)) % 360;
  return ((h % 28) - 14) * (Math.PI / 180);
}

function labelSprite(text: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 72;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas text is unavailable");
  ctx.fillStyle = "#f6f1e6";
  ctx.fillRect(0, 0, 256, 72);
  ctx.strokeStyle = "#241f1a";
  ctx.lineWidth = 10;
  ctx.strokeRect(6, 6, 244, 60);
  ctx.fillStyle = "#241f1a";
  ctx.font = "700 40px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 38);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
  sprite.scale.set(0.58, 0.16, 1);
  sprite.raycast = () => {};
  return sprite;
}

function holdBody(hold: Hold, material: THREE.Material, ink: THREE.Material): THREE.Object3D {
  if (hold.kind === "pinch") {
    const group = new THREE.Group();
    const geo = faceted(new THREE.SphereGeometry(hold.r * 1.05, 8, 6));
    for (const side of [-1, 1]) {
      const lobe = new THREE.Mesh(geo, material);
      lobe.position.x = side * hold.r * 0.48;
      lobe.raycast = () => {};
      addInkShell(lobe, ink, 0.16);
      group.add(lobe);
    }
    return group;
  }

  const geo =
    hold.kind === "crimp"
      ? new THREE.BoxGeometry(hold.r * 3.3, hold.r * 0.85, hold.r * 1.5)
      : faceted(
          new THREE.SphereGeometry(hold.r * 1.35, 8, 6).scale(
            hold.kind === "sloper" ? 1.35 : 1.12,
            hold.kind === "sloper" ? 0.58 : 0.92,
            hold.kind === "sloper" ? 0.95 : 0.78,
          ),
        );
  const mesh = new THREE.Mesh(geo, material);
  mesh.raycast = () => {};
  addInkShell(mesh, ink, 0.14);
  return mesh;
}

/** How far the colored plastic sticks out from the bolt, toward the camera. */
function frontReach(hold: Hold): number {
  const ink = hold.kind === "pinch" ? 1.16 : 1.14;
  if (hold.kind === "crimp") return hold.r * 0.75 * ink;
  if (hold.kind === "pinch") return hold.r * 1.05 * ink;
  if (hold.kind === "sloper") return hold.r * 1.35 * 0.95 * ink;
  return hold.r * 1.35 * 0.78 * ink;
}

function buildHold(hold: Hold): HoldView {
  const root = new THREE.Group();
  root.position.set(hold.x, hold.y, hold.z);
  root.rotation.z = spin(hold.id);

  const colorMat = toonMaterial(KIND_CSS[hold.kind]);
  const ink = inkMaterial();
  const fade: THREE.Material[] = [colorMat, ink];

  root.add(holdBody(hold, colorMat, ink));

  const boltMat = new THREE.MeshBasicMaterial({ color: themeColor("var(--foreground)") });
  fade.push(boltMat);
  const bolt = new THREE.Mesh(new THREE.CylinderGeometry(hold.r * 0.16, hold.r * 0.16, hold.r * 0.4, 6), boltMat);
  bolt.rotation.x = Math.PI / 2;
  bolt.position.z = -hold.r * 0.75;
  bolt.raycast = () => {};
  root.add(bolt);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(Math.max(0.16, hold.r * 1.65), 0.02, 6, 22), ink);
  // The bolt is on the rock face, so a ring at the origin slices through the wall.
  ring.position.z = frontReach(hold) + 0.06;
  ring.raycast = () => {};
  ring.visible = false;
  root.add(ring);

  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(Math.max(0.24, hold.r * 2.15), 8, 6),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
  );
  hit.userData.holdId = hold.id;
  root.add(hit);

  if (hold.start || hold.top) {
    const sprite = labelSprite(hold.start ? "START" : "TOP");
    sprite.position.set(0, hold.r + 0.34, frontReach(hold) + 0.2);
    root.add(sprite);
  }

  return { root, hit, ring, fade };
}

/** Plywood bay, crash pads, the faceted boulder, and one mesh per hold. */
export function buildGym(): { group: THREE.Group; holds: Map<string, HoldView> } {
  const group = new THREE.Group();
  const ink = themeColor("var(--foreground)");

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.2, 14),
    toonMaterial("oklch(0.94 0.02 88)"),
  );
  floor.position.y = -0.1;
  floor.raycast = () => {};
  group.add(floor);

  const backing = new THREE.Mesh(
    new THREE.BoxGeometry(3.55, 5.08, 0.12),
    new THREE.MeshBasicMaterial({ color: ink }),
  );
  backing.position.set(0, 2.5, -0.18);
  backing.raycast = () => {};
  group.add(backing);

  const panelW = 1.12;
  for (let i = -1; i <= 1; i++) {
    const panel = outlined(new THREE.BoxGeometry(panelW - 0.055, 4.9, 0.2), "oklch(0.78 0.06 75)", 0.018);
    panel.position.set(i * panelW, 2.5, -0.02);
    group.add(panel);
  }

  const bolts = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.028, 0.028, 0.02, 5).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: ink }),
    11 * 14,
  );
  const dummy = new THREE.Object3D();
  let n = 0;
  for (let col = 0; col < 11; col++) {
    for (let row = 0; row < 14; row++) {
      dummy.position.set(-1.55 + col * 0.31, 0.45 + row * 0.32, 0.09);
      dummy.updateMatrix();
      bolts.setMatrixAt(n, dummy.matrix);
      n += 1;
    }
  }
  bolts.raycast = () => {};
  group.add(bolts);

  // The boulder: a faceted volume bolted to the plywood, with aretes for the side holds.
  const rock = outlined(faceted(new THREE.IcosahedronGeometry(1.05, 1)), "oklch(0.7 0.1 52)", 0.028);
  rock.scale.set(1.08, 1.22, 0.58);
  rock.position.set(0.02, 2.18, 0.16);
  rock.rotation.set(0.15, 0.45, 0.1);
  const creases = new THREE.LineSegments(
    new THREE.EdgesGeometry(rock.geometry, 28),
    new THREE.LineBasicMaterial({ color: themeColor("var(--foreground)") }),
  );
  creases.scale.setScalar(1.01);
  creases.raycast = () => {};
  rock.add(creases);
  group.add(rock);

  const leftArete = outlined(new THREE.BoxGeometry(0.72, 2.55, 0.52), "oklch(0.75 0.08 58)", 0.02);
  leftArete.position.set(-0.8, 2.72, 0.1);
  group.add(leftArete);

  const rightArete = outlined(new THREE.BoxGeometry(0.78, 2.35, 0.46), "oklch(0.73 0.09 55)", 0.02);
  rightArete.position.set(0.84, 2.9, 0.06);
  group.add(rightArete);

  const headwall = outlined(new THREE.BoxGeometry(1.7, 1.15, 0.55), "oklch(0.78 0.07 62)", 0.02);
  headwall.position.set(0.05, 4.05, 0.12);
  group.add(headwall);

  const pad = outlined(new THREE.BoxGeometry(2.5, 0.18, 1.55), "var(--primary)", 0.03);
  pad.position.set(0, 0.09, 1.2);
  group.add(pad);

  const stripe = outlined(new THREE.BoxGeometry(2.5, 0.04, 0.28), "var(--climb)", 0.04);
  stripe.position.set(0, 0.2, 1.35);
  group.add(stripe);

  const sidePad = outlined(new THREE.BoxGeometry(0.9, 0.14, 0.9), "var(--disc)", 0.04);
  sidePad.position.set(1.55, 0.07, 1.55);
  sidePad.rotation.y = 0.2;
  group.add(sidePad);

  const bucket = outlined(new THREE.CylinderGeometry(0.13, 0.11, 0.18, 8), "var(--foreground)", 0.08);
  bucket.position.set(-1.45, 0.2, 1.25);
  group.add(bucket);
  const chalk = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), toonMaterial("oklch(0.97 0.01 95)"));
  chalk.position.set(-1.45, 0.3, 1.25);
  chalk.scale.y = 0.55;
  chalk.raycast = () => {};
  group.add(chalk);

  const holds = new Map<string, HoldView>();
  for (const hold of HOLDS) {
    const view = buildHold(hold);
    holds.set(hold.id, view);
    group.add(view.root);
  }

  return { group, holds };
}
