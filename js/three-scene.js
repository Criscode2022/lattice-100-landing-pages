/**
 * Subtle Three.js accents — small decorative scenes, never full-bleed heroes.
 */
import * as THREE from "three";

const prefersReduced =
  typeof matchMedia === "function" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

function parseColor(hex, fallback) {
  try {
    return new THREE.Color(hex || fallback);
  } catch {
    return new THREE.Color(fallback);
  }
}

function disposeObject(obj) {
  if (!obj) return;
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
  });
}

/**
 * @param {HTMLCanvasElement|HTMLElement} target
 * @param {{ mode?: string, accent?: string, accent2?: string, bg?: string, interactive?: boolean, subtle?: boolean }} opts
 */
export function createScene(target, opts) {
  const options = opts || {};
  const mode = options.mode || "orbs";
  const subtle = options.subtle !== false; // default subtle
  const accent = parseColor(options.accent, "#5eead4");
  const accent2 = parseColor(options.accent2, "#0d9488");

  let canvas = target;
  if (target && target.tagName !== "CANVAS") {
    canvas = document.createElement("canvas");
    canvas.className = options.className || "lp-canvas";
    target.appendChild(canvas);
  }
  if (!canvas) return { destroy() {} };

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 0, subtle ? 5.2 : 6);

  const root = new THREE.Group();
  scene.add(root);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 0.55);
  key.position.set(2, 3, 4);
  scene.add(key);

  const matAccent = new THREE.MeshStandardMaterial({
    color: accent,
    metalness: 0.45,
    roughness: 0.4,
    transparent: true,
    opacity: subtle ? 0.55 : 0.85,
  });
  const matSoft = new THREE.MeshStandardMaterial({
    color: accent2,
    metalness: 0.25,
    roughness: 0.6,
    transparent: true,
    opacity: subtle ? 0.4 : 0.7,
  });
  const matWire = new THREE.MeshBasicMaterial({
    color: accent,
    wireframe: true,
    transparent: true,
    opacity: subtle ? 0.18 : 0.3,
  });

  const meshes = [];
  function addMesh(geo, mat, pos, scale) {
    const m = new THREE.Mesh(geo, mat);
    if (pos) m.position.set(pos[0], pos[1], pos[2]);
    if (scale != null) m.scale.setScalar(scale);
    root.add(m);
    meshes.push(m);
    return m;
  }

  // Simpler geometry sets when subtle
  if (mode === "particles") {
    const count = subtle ? 80 : 280;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pts = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: accent,
        size: subtle ? 0.028 : 0.035,
        transparent: true,
        opacity: subtle ? 0.45 : 0.8,
        sizeAttenuation: true,
      })
    );
    root.add(pts);
    meshes.push(pts);
    addMesh(new THREE.IcosahedronGeometry(0.55, 0), matSoft, [0, 0, 0], 1);
  } else if (mode === "waves" || mode === "rings") {
    for (let i = 0; i < (subtle ? 2 : 4); i++) {
      const r = addMesh(
        new THREE.TorusGeometry(0.85 + i * 0.28, 0.02, 10, 64),
        i % 2 ? matSoft : matWire,
        [0, 0, 0],
        1
      );
      r.rotation.x = 0.7 + i * 0.12;
      r.userData.spin = 0.08 + i * 0.03;
    }
    addMesh(new THREE.SphereGeometry(0.22, 24, 24), matAccent, [0, 0, 0], 1);
  } else if (mode === "geometry" || mode === "lattice") {
    addMesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), matAccent, [-0.55, 0.1, 0], 1);
    addMesh(new THREE.OctahedronGeometry(0.4, 0), matSoft, [0.65, -0.15, 0.2], 1);
    addMesh(new THREE.TetrahedronGeometry(0.32, 0), matWire, [0.1, 0.7, -0.2], 1);
  } else {
    // orbs default — quiet
    addMesh(new THREE.IcosahedronGeometry(0.75, 1), matAccent, [-0.35, 0.1, 0], 1);
    addMesh(new THREE.SphereGeometry(0.32, 24, 24), matSoft, [0.7, -0.25, 0.3], 1);
    addMesh(new THREE.TorusGeometry(1.15, 0.015, 10, 64), matWire, [0, 0, -0.4], 1);
  }

  let raf = 0;
  let destroyed = false;
  const clock = new THREE.Clock();
  const pointer = { x: 0, y: 0 };

  function resize() {
    const parent = canvas.parentElement || canvas;
    const rect = parent.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width || 200));
    const h = Math.max(1, Math.floor(rect.height || 200));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function onPointer(e) {
    if (!options.interactive) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function tick() {
    if (destroyed) return;
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    if (!prefersReduced) {
      const speed = subtle ? 0.06 : 0.12;
      root.rotation.y = t * speed + pointer.x * 0.12;
      root.rotation.x = Math.sin(t * 0.15) * 0.05 + pointer.y * 0.08;
      meshes.forEach((m) => {
        if (m.isPoints) m.rotation.y = t * 0.03;
        if (m.userData?.spin) m.rotation.z = t * m.userData.spin;
        if (m.isMesh && (mode === "geometry" || mode === "lattice")) {
          m.rotation.y = t * 0.1;
        }
      });
    }
    renderer.render(scene, camera);
  }

  resize();
  window.addEventListener("resize", resize);
  if (options.interactive) {
    window.addEventListener("pointermove", onPointer, { passive: true });
  }

  if (prefersReduced) renderer.render(scene, camera);
  else tick();

  return {
    resize,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      disposeObject(root);
      matAccent.dispose();
      matSoft.dispose();
      matWire.dispose();
      renderer.dispose();
    },
  };
}
