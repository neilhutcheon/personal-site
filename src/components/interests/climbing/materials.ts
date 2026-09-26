import * as THREE from "three";

const colorCache = new Map<string, THREE.Color>();
const swatch = document.createElement("canvas");
swatch.width = 1;
swatch.height = 1;
const swatchCtx = swatch.getContext("2d", { willReadFrequently: true });

/**
 * Resolve a site color to sRGB. Browsers hand back lab() or oklch(), which three.js
 * cannot parse, so the color is painted and read back as bytes.
 */
export function themeColor(css: string): THREE.Color {
  const cached = colorCache.get(css);
  if (cached) return cached;
  const probe = document.createElement("span");
  probe.style.color = css;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  const color = new THREE.Color();
  if (swatchCtx) {
    swatchCtx.clearRect(0, 0, 1, 1);
    swatchCtx.fillStyle = resolved;
    swatchCtx.fillRect(0, 0, 1, 1);
    const [r, g, b] = swatchCtx.getImageData(0, 0, 1, 1).data;
    color.setHex((r << 16) | (g << 8) | b);
  }
  colorCache.set(css, color);
  return color;
}

let gradient: THREE.DataTexture | null = null;

/** Three flat bands. Combined with ink shells this reads as printed cartoon, not soft 3D. */
export function toonGradient(): THREE.DataTexture {
  if (gradient) return gradient;
  // Reason: the bright step stays under 1 so lit colors don't clip to white.
  const data = new Uint8Array([48, 128, 210]);
  gradient = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;
  gradient.generateMipmaps = false;
  gradient.colorSpace = THREE.NoColorSpace;
  gradient.needsUpdate = true;
  return gradient;
}

export function disposeToonGradient(): void {
  gradient?.dispose();
  gradient = null;
}

export function toonMaterial(css: string): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color: themeColor(css),
    gradientMap: toonGradient(),
  });
}

/** Give each face its own normal so a low-poly rock reads as carved, not smooth. */
export function faceted(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const solid = geo.index ? geo.toNonIndexed() : geo;
  solid.computeVertexNormals();
  return solid;
}

export function inkMaterial(): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: themeColor("var(--foreground)"),
    side: THREE.BackSide,
  });
}

/** Fat silhouette outline. A slightly larger back-face shell, the way a cartoon inks a shape. */
export function addInkShell(mesh: THREE.Mesh, ink: THREE.Material, inflate = 0.06): THREE.Mesh {
  const shell = new THREE.Mesh(mesh.geometry, ink);
  shell.scale.setScalar(1 + inflate);
  shell.raycast = () => {};
  mesh.add(shell);
  return shell;
}
