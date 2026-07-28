/**
 * Lightweight Three.js atmosphere scenes for dashboard + landing pages.
 * Expects global THREE from the UMD build.
 */
(function (global) {
  "use strict";

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
   * @param {{ mode?: string, accent?: string, accent2?: string, bg?: string, interactive?: boolean }} opts
   */
  function createScene(target, opts) {
    if (typeof THREE === "undefined") {
      console.warn("THREE not loaded");
      return { destroy() {} };
    }

    const options = opts || {};
    const mode = options.mode || "orbs";
    const accent = parseColor(options.accent, "#5eead4");
    const accent2 = parseColor(options.accent2, "#0d9488");
    const bg = parseColor(options.bg, "#090a0c");

    let canvas = target;
    if (target && target.tagName !== "CANVAS") {
      canvas = document.createElement("canvas");
      canvas.className = "lp-canvas";
      target.prepend(canvas);
    }
    if (!canvas) return { destroy() {} };

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const root = new THREE.Group();
    scene.add(root);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(3, 4, 5);
    scene.add(key);

    const meshes = [];
    const matAccent = new THREE.MeshStandardMaterial({
      color: accent,
      metalness: 0.35,
      roughness: 0.35,
      transparent: true,
      opacity: 0.92,
    });
    const matSoft = new THREE.MeshStandardMaterial({
      color: accent2,
      metalness: 0.2,
      roughness: 0.55,
      transparent: true,
      opacity: 0.75,
    });
    const matWire = new THREE.MeshBasicMaterial({
      color: accent,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    function addMesh(geo, mat, pos, scale) {
      const m = new THREE.Mesh(geo, mat);
      if (pos) m.position.set(pos[0], pos[1], pos[2]);
      if (scale != null) m.scale.setScalar(scale);
      root.add(m);
      meshes.push(m);
      return m;
    }

    if (mode === "orbs") {
      addMesh(new THREE.IcosahedronGeometry(1.1, 1), matAccent, [-1.2, 0.3, 0], 1);
      addMesh(new THREE.SphereGeometry(0.55, 32, 32), matSoft, [1.4, -0.4, 0.5], 1);
      addMesh(new THREE.SphereGeometry(0.28, 24, 24), matAccent, [0.4, 1.2, -0.6], 1);
      addMesh(new THREE.TorusGeometry(1.6, 0.02, 12, 80), matWire, [0, 0, -0.5], 1);
    } else if (mode === "particles") {
      const count = 420;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 8;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const pts = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          color: accent,
          size: 0.035,
          transparent: true,
          opacity: 0.85,
          sizeAttenuation: true,
        })
      );
      root.add(pts);
      meshes.push(pts);
      addMesh(new THREE.OctahedronGeometry(0.7, 0), matSoft, [0, 0, 0], 1);
    } else if (mode === "waves") {
      for (let i = 0; i < 5; i++) {
        const torus = addMesh(
          new THREE.TorusGeometry(0.9 + i * 0.35, 0.025, 10, 100),
          i % 2 ? matWire : matAccent.clone(),
          [0, 0, -i * 0.15],
          1
        );
        torus.rotation.x = Math.PI / 2.4;
        torus.userData.phase = i * 0.4;
      }
    } else if (mode === "geometry") {
      addMesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), matAccent, [-1.1, 0.2, 0], 1);
      addMesh(new THREE.DodecahedronGeometry(0.75, 0), matSoft, [1.2, -0.1, 0.3], 1);
      addMesh(new THREE.ConeGeometry(0.45, 1.1, 5), matWire, [0.1, 1.0, -0.4], 1);
      addMesh(new THREE.TetrahedronGeometry(0.5, 0), matAccent, [0.8, 1.1, 0.6], 1);
    } else if (mode === "rings") {
      for (let i = 0; i < 4; i++) {
        const r = addMesh(
          new THREE.TorusGeometry(1.1 + i * 0.25, 0.04, 12, 80),
          i % 2 ? matSoft : matAccent,
          [0, 0, 0],
          1
        );
        r.rotation.x = 0.6 + i * 0.15;
        r.rotation.y = i * 0.4;
        r.userData.spin = 0.15 + i * 0.05;
      }
      addMesh(new THREE.SphereGeometry(0.35, 32, 32), matAccent, [0, 0, 0], 1);
    } else if (mode === "lattice") {
      const group = new THREE.Group();
      const size = 3;
      const step = 0.55;
      for (let x = -size; x <= size; x++) {
        for (let y = -size; y <= size; y++) {
          if ((x + y) % 2 !== 0) continue;
          const s = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.12, 0.12),
            Math.random() > 0.5 ? matAccent : matSoft
          );
          s.position.set(x * step * 0.55, y * step * 0.4, (Math.random() - 0.5) * 0.8);
          group.add(s);
          meshes.push(s);
        }
      }
      root.add(group);
      meshes.push(group);
    } else {
      addMesh(new THREE.IcosahedronGeometry(1.2, 1), matAccent, [0, 0, 0], 1);
    }

    // subtle floor glow plane
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(3.2, 48),
      new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.06,
      })
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -1.6;
    root.add(glow);

    let w = 0;
    let h = 0;
    let raf = 0;
    let destroyed = false;
    const clock = new THREE.Clock();
    const pointer = { x: 0, y: 0 };

    function resize() {
      const parent = canvas.parentElement || canvas;
      const rect = parent.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width || window.innerWidth));
      h = Math.max(1, Math.floor(rect.height || window.innerHeight));
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
        root.rotation.y = t * 0.12 + pointer.x * 0.25;
        root.rotation.x = Math.sin(t * 0.2) * 0.08 + pointer.y * 0.15;

        meshes.forEach((m, i) => {
          if (m.isPoints) {
            m.rotation.y = t * 0.05;
            return;
          }
          if (m.userData && m.userData.spin) {
            m.rotation.z = t * m.userData.spin;
          }
          if (m.userData && m.userData.phase != null) {
            m.scale.setScalar(1 + Math.sin(t * 0.8 + m.userData.phase) * 0.04);
          }
          if (mode === "geometry" && m.isMesh) {
            m.rotation.x = t * (0.1 + i * 0.03);
            m.rotation.y = t * (0.15 + i * 0.02);
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

    if (prefersReduced) {
      renderer.render(scene, camera);
    } else {
      tick();
    }

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

  global.LatticeThree = { createScene };
})(window);
