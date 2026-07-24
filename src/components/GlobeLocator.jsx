import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Globe2, MapPin, Radar, Satellite, X } from "lucide-react";
import indiaBordersData from "../data/indiaBorders.json";

const TARGET = { name: "Vellore", region: "Tamil Nadu, India", lat: 12.9165, lon: 79.1325 };

// Major Indian cities for the glowing night lights effect
const MAJOR_CITIES = [
  [19.0760, 72.8777], [28.7041, 77.1025], [12.9716, 77.5946], [17.3850, 78.4867],
  [13.0827, 80.2707], [22.5726, 88.3639], [18.5204, 73.8567], [23.0225, 72.5714],
  [21.1702, 72.8311], [26.9124, 75.7873], [26.8467, 80.9462], [26.4499, 80.3319],
  [21.1458, 79.0882], [22.7196, 75.8577], [23.2599, 77.4126], [17.6868, 83.2185],
  [25.5941, 85.1376], [22.3072, 73.1812], [28.6692, 77.4538], [30.9010, 75.8573],
  [27.1767, 78.0081], [19.9975, 73.7898], [28.4089, 77.3178], [28.9845, 77.7064],
  [22.3039, 70.8022], [25.3176, 82.9739], [34.0837, 74.7973], [19.8762, 75.3433],
  [23.7957, 86.4304], [31.6340, 74.8723], [19.0330, 73.0297], [25.4358, 81.8463],
  [22.5958, 88.3110], [23.3441, 85.3096], [26.2124, 78.1772], [23.1815, 79.9864],
  [11.0168, 76.9558], [16.5062, 80.6480], [26.2389, 73.0243], [9.9252, 78.1198],
  [21.2514, 81.6296], [25.1814, 75.8323], [26.1445, 91.7362], [30.7333, 76.7794]
];

// Earth's real axial tilt, so the globe reads as an actual planet rather than a spinning ball.
const AXIAL_TILT = (23.4 * Math.PI) / 180;

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

// Real-Time Subsolar Point Tracking
function getSubsolarPoint() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  
  // Declination (latitude)
  const declination = 23.44 * Math.sin((2 * Math.PI / 365.24) * (dayOfYear - 81));
  
  // Right Ascension / Longitude
  // 12:00 UTC = Sun at ~0 degrees longitude. 1 hour = 15 degrees.
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  // Account for Equation of Time loosely, but for a visual globe, UTC offset is highly accurate.
  const lon = -15 * (utcHours - 12); 
  
  return { lat: declination, lon };
}

// Hand-drawn fallback "Blue Marble" texture, used only if the remote NASA/three.js
// textures fail to load (offline, blocked network, etc). Keeps the globe looking
// like an actual planet — ocean, continents, ice caps — instead of a flat sphere.
function buildFallbackEarthTexture() {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  const ocean = ctx.createLinearGradient(0, 0, 0, h);
  ocean.addColorStop(0, "#0a3d67");
  ocean.addColorStop(0.5, "#124b7a");
  ocean.addColorStop(1, "#0a3d67");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, w, h);

  const landColors = ["#2f6b3a", "#3c7a42", "#5a8f4a", "#7a9a4f"];
  const rng = (seed) => {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  };
  const rand = rng(42);

  const blob = (cx, cy, rx, ry, points) => {
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const a = (i / points) * Math.PI * 2;
      const jitter = 0.75 + rand() * 0.5;
      const x = cx + Math.cos(a) * rx * jitter;
      const y = cy + Math.sin(a) * ry * jitter;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  };

  // Rough continent-like landmasses scattered across the map.
  const continents = [
    [150, 150, 90, 60], [180, 300, 60, 110], [430, 120, 130, 70],
    [470, 260, 70, 100], [560, 340, 50, 40], [700, 150, 150, 80],
    [760, 300, 60, 70], [880, 200, 90, 60], [900, 340, 70, 50],
    [60, 380, 50, 35], [330, 380, 60, 30],
  ];
  continents.forEach(([cx, cy, rx, ry], i) => {
    ctx.fillStyle = landColors[i % landColors.length];
    blob(cx, cy, rx, ry, 14);
  });

  // Polar ice caps.
  ctx.fillStyle = "#eef4fa";
  ctx.fillRect(0, 0, w, 18);
  ctx.fillRect(0, h - 18, w, 18);

  // Soft cloud-like noise for texture.
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 300; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 6 + rand() * 18;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

export default function GlobeLocator({ onClose }) {
  const mountRef = useRef(null);
  const apiRef = useRef({});
  const [phase, setPhase] = useState("idle");
  const [ready, setReady] = useState(false);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const s = new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: false,
      });
      setClock(s);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const state = {
      width: mount.clientWidth,
      height: mount.clientHeight,
      accumRotY: 0.35,
      idleSpin: true,
      spinStart: 0,
      spinDuration: 4200,
      spinFrom: 0,
      spinTo: 0,
      camFrom: 9.2,
      camTo: 5.35,
      arriveStart: 0,
      mouse: { x: 0, y: 0 },
    };

    const RADIUS = 2;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, state.width / state.height, 0.1, 1000);
    camera.position.set(0, 0.35, state.camFrom);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(state.width, state.height);
    mount.appendChild(renderer.domElement);

    const starGeo = new THREE.BufferGeometry();
    const STAR_COUNT = 2600;
    const starPos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 60 + Math.random() * 140;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(p) * Math.cos(t);
      starPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      starPos[i * 3 + 2] = r * Math.cos(p);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xbcd4ff,
      size: 0.34,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.75,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Dynamic Real-Time Sun (Subsolar Point)
    const sun = new THREE.DirectionalLight(0xfff3df, 2.5);
    const ambient = new THREE.AmbientLight(0x1a2639, 0.4); // Darker ambient to emphasize terminator line
    scene.add(ambient);
    
    // Add rim light for cinematic edge
    const rim = new THREE.DirectionalLight(0x6ea8ff, 0.8);
    rim.position.set(-6, -2, -4);
    scene.add(rim);

    // Tilt group holds the constant 23.4° axial tilt; globeGroup handles spin/rotation.
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = AXIAL_TILT;
    scene.add(tiltGroup);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.y = state.accumRotY;
    tiltGroup.add(globeGroup);

    // Sun orbits exactly with the globe surface so it stays over the real-time Lat/Lon
    globeGroup.add(sun);

    // Initial sun position update
    const updateSunPosition = () => {
      const subsolar = getSubsolarPoint();
      const sunVec = latLonToVector3(subsolar.lat, subsolar.lon, 10);
      sun.position.copy(sunVec);
    };
    updateSunPosition();
    // Update sun once every 60 seconds
    const sunInterval = setInterval(updateSunPosition, 60000);

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    const loadTex = (url) =>
      new Promise((resolve) => {
        loader.load(
          url,
          (tex) => resolve(tex),
          undefined,
          () => resolve(null)
        );
      });

    // Reliable jsDelivr-mirrored copies of the standard three.js earth textures
    // (same NASA-derived Blue Marble assets), pinned to r128 to match the
    // three.js version available in this environment.
    const TEX_BASE =
      "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/";

    let cloudMesh, gridMesh, beamMesh, indiaGroup;
    const pulseRings = [];

    Promise.all([
      loadTex(TEX_BASE + "earth_atmos_2048.jpg"),
      loadTex(TEX_BASE + "earth_normal_2048.jpg"),
      loadTex(TEX_BASE + "earth_specular_2048.jpg"),
      loadTex(TEX_BASE + "earth_clouds_1024.png"),
    ]).then(([dayMap, normalMap, specMap, cloudMap]) => {
      const earthGeo = new THREE.SphereGeometry(RADIUS, 96, 96);

      // If the real satellite imagery couldn't load, fall back to a drawn
      // Blue Marble-style texture so the sphere still reads as an actual globe.
      const resolvedDayMap = dayMap || buildFallbackEarthTexture();

      const earthMat = new THREE.MeshPhongMaterial({
        map: resolvedDayMap,
        normalMap: normalMap || null,
        normalScale: new THREE.Vector2(0.65, 0.65),
        specularMap: specMap || null,
        specular: new THREE.Color(0x3a5a8a),
        shininess: 14,
      });
      const earthMesh = new THREE.Mesh(earthGeo, earthMat);
      globeGroup.add(earthMesh);

      if (cloudMap) {
        const cloudGeo = new THREE.SphereGeometry(RADIUS * 1.012, 96, 96);
        const cloudMat = new THREE.MeshPhongMaterial({
          map: cloudMap,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
        });
        cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
        globeGroup.add(cloudMesh);
      }

      const glowGeo = new THREE.SphereGeometry(RADIUS * 1.06, 64, 64);
      const glowMat = new THREE.ShaderMaterial({
        uniforms: { glowColor: { value: new THREE.Color(0x5fb8ff) } },
        vertexShader:
          "varying float vIntensity;" +
          "void main() {" +
          "vec3 vNormal = normalize(normalMatrix * normal);" +
          "vec3 vNormel = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));" +
          "vIntensity = pow(0.62 - dot(vNormal, vNormel), 2.4);" +
          "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);" +
          "}",
        fragmentShader:
          "varying float vIntensity;" +
          "uniform vec3 glowColor;" +
          "void main() {" +
          "gl_FragColor = vec4(glowColor, 1.0) * vIntensity;" +
          "}",
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      globeGroup.add(glowMesh);

      const gridGeo = new THREE.SphereGeometry(RADIUS * 1.004, 36, 24);
      const gridMat = new THREE.MeshBasicMaterial({
        color: 0x7fd6ff,
        wireframe: true,
        transparent: true,
        opacity: 0.05,
      });
      gridMesh = new THREE.Mesh(gridGeo, gridMat);
      globeGroup.add(gridMesh);

      // Construct high-detail India borders and city lights
      indiaGroup = new THREE.Group();
      
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });

      indiaBordersData.forEach(path => {
        const pts = path.map(pt => latLonToVector3(pt[0], pt[1], RADIUS * 1.002));
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(geo, lineMat);
        indiaGroup.add(line);
      });

      // City lights
      const cityGeo = new THREE.BufferGeometry();
      const cityPos = new Float32Array(MAJOR_CITIES.length * 3);
      MAJOR_CITIES.forEach((city, i) => {
        const v = latLonToVector3(city[0], city[1], RADIUS * 1.003);
        cityPos[i*3] = v.x;
        cityPos[i*3+1] = v.y;
        cityPos[i*3+2] = v.z;
      });
      cityGeo.setAttribute("position", new THREE.BufferAttribute(cityPos, 3));
      
      const cityMat = new THREE.PointsMaterial({
        color: 0xffe680,
        size: 0.03,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const cityPoints = new THREE.Points(cityGeo, cityMat);
      indiaGroup.add(cityPoints);

      globeGroup.add(indiaGroup);

      const markerLocalPos = latLonToVector3(TARGET.lat, TARGET.lon, RADIUS);

      const dotGeo = new THREE.SphereGeometry(0.028, 20, 20);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffb703 });
      const markerDot = new THREE.Mesh(dotGeo, dotMat);
      markerDot.position.copy(markerLocalPos.clone().multiplyScalar(1.012));
      globeGroup.add(markerDot);

      const haloGeo = new THREE.SphereGeometry(0.05, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xffb703,
        transparent: true,
        opacity: 0.35,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(markerDot.position);
      globeGroup.add(halo);

      for (let i = 0; i < 3; i++) {
        const ringGeo = new THREE.RingGeometry(0.05, 0.062, 48);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xffb703,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(markerLocalPos.clone().multiplyScalar(1.015));
        ring.lookAt(0, 0, 0);
        ring.userData.phase = i / 3;
        globeGroup.add(ring);
        pulseRings.push(ring);
      }

      const beamGeo = new THREE.CylinderGeometry(0.006, 0.006, 1, 10, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xffe0a3,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      beamMesh = new THREE.Mesh(beamGeo, beamMat);
      const normal = markerLocalPos.clone().normalize();
      beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      beamMesh.position.copy(markerLocalPos.clone().multiplyScalar(1.013));
      beamMesh.scale.set(1, 0.0001, 1);
      globeGroup.add(beamMesh);

      const x0 = markerLocalPos.x;
      const z0 = markerLocalPos.z;
      const targetBase = Math.atan2(-x0, z0);
      apiRef.current.targetBase = targetBase;

      setReady(true);
    });

    const phaseRef = { current: "idle" };
    apiRef.current.setPhaseRef = (p) => (phaseRef.current = p);

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);

      if (state.idleSpin && phaseRef.current === "idle") {
        globeGroup.rotation.y += 0.0016;
      }
      if (cloudMesh) cloudMesh.rotation.y += 0.00035;
      if (gridMesh) gridMesh.rotation.y -= 0.00018;
      stars.rotation.y += 0.00004;

      if (indiaGroup) {
        const hourIST = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false, hour: 'numeric' });
        const hr = parseInt(hourIST, 10);
        const isNight = hr >= 19 || hr <= 5;
        const targetLineOp = isNight ? 0.6 : 0.0;
        const targetCityOp = isNight ? 0.9 : 0.0;
        
        indiaGroup.children.forEach(child => {
          if (child.isLine) {
            child.material.opacity += (targetLineOp - child.material.opacity) * 0.03;
          } else if (child.isPoints) {
            // Add a subtle twinkle to cities when fully visible
            const twinkle = child.material.opacity > 0.5 ? (0.7 + 0.3 * Math.sin(performance.now() * 0.005)) : 1;
            child.material.opacity += ((targetCityOp * twinkle) - child.material.opacity) * 0.03;
          }
        });
      }

      if (phaseRef.current === "spinning") {
        const now = performance.now();
        const p = Math.min(1, (now - state.spinStart) / state.spinDuration);
        const rot = easeOutBack(p);
        globeGroup.rotation.y = state.spinFrom + (state.spinTo - state.spinFrom) * rot;
        const camP = easeOutCubic(Math.min(1, p / 0.85));
        camera.position.z = state.camFrom + (state.camTo - state.camFrom) * camP;
        camera.position.y = 0.35 * (1 - camP) + 0.06 * camP;
        if (p >= 1) {
          globeGroup.rotation.y =
            ((state.spinTo % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          state.accumRotY = globeGroup.rotation.y;
          state.arriveStart = performance.now();
          setPhase("arrived");
        }
      }

      if (phaseRef.current !== "spinning") {
        const targetY = state.mouse.x * 0.28;
        camera.position.x += (targetY - camera.position.x) * 0.04;
        camera.position.y += (0.35 - state.mouse.y * 0.5 - camera.position.y) * 0.04;
      }
      camera.lookAt(0, 0, 0);

      if (phaseRef.current === "arrived") {
        const since = (performance.now() - state.arriveStart) / 1000;
        pulseRings.forEach((ring) => {
          const local = (since * 0.6 + ring.userData.phase) % 1;
          const scale = 1 + local * 7;
          ring.scale.set(scale, scale, scale);
          ring.material.opacity = Math.max(0, 0.55 * (1 - local));
        });
        if (beamMesh) {
          const bp = Math.min(1, since / 1.1);
          beamMesh.scale.y = 0.0001 + easeOutCubic(bp) * 0.85;
          beamMesh.material.opacity = 0.55 * (1 - Math.min(1, since / 2.4));
        }
      }

      renderer.render(scene, camera);
    };

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    const onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      state.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      state.mouse.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };
    mount.addEventListener("mousemove", onMouseMove);

    apiRef.current.locate = () => {
      state.idleSpin = false;
      const currentMod = globeGroup.rotation.y % (Math.PI * 2);
      let delta = (apiRef.current.targetBase || 0) - currentMod;
      while (delta < 0) delta += Math.PI * 2;
      const extraSpins = 5;
      const totalDelta = delta + extraSpins * Math.PI * 2;
      state.spinFrom = globeGroup.rotation.y;
      state.spinTo = globeGroup.rotation.y + totalDelta;
      state.camFrom = camera.position.z;
      state.camTo = 5.35;
      state.spinStart = performance.now();
      state.spinDuration = 4200;
    };

    animate();

    return () => {
      clearInterval(sunInterval);
      cancelAnimationFrame(raf);
      ro.disconnect();
      mount.removeEventListener("mousemove", onMouseMove);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (apiRef.current.setPhaseRef) apiRef.current.setPhaseRef(phase);
  }, [phase]);

  const handleClick = useCallback(() => {
    if (!ready || phase === "spinning") return;
    setPhase("spinning");
    if (apiRef.current.locate) apiRef.current.locate();
  }, [ready, phase]);

  return (
    <div className="gl-root" onClick={(e) => e.stopPropagation()}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

        .gl-root {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 560px;
          background: radial-gradient(ellipse at 50% 30%, #0d1730 0%, #060a17 55%, #030509 100%);
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          color: #e7edf7;
          border-radius: 20px;
        }
        .gl-canvas { position: absolute; inset: 0; }
        .gl-vignette {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(2,4,10,0.55) 100%);
        }
        .gl-topbar {
          position: absolute; top: 0; left: 0; right: 0;
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 28px 32px; pointer-events: none; z-index: 5;
        }
        .gl-close-btn {
          position: absolute; top: 28px; right: 32px; pointer-events: auto;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
          border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
          color: #fff; cursor: pointer; transition: all 0.2s;
        }
        .gl-close-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.05); }
        .gl-eyebrow {
          font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
          color: #6ea8ff; font-weight: 600; margin-bottom: 6px;
        }
        .gl-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(22px, 3.4vw, 34px);
          font-weight: 600; letter-spacing: -0.01em; color: #f4f7fc;
        }
        .gl-clock { text-align: right; font-family: 'Space Grotesk', sans-serif; pointer-events: none; padding-right: 60px; }
        .gl-clock .time {
          font-size: 20px; font-weight: 600; color: #ffd27a;
          letter-spacing: 0.04em; font-variant-numeric: tabular-nums;
        }
        .gl-clock .zone {
          font-size: 10px; letter-spacing: 0.18em; color: #7f8db3;
          text-transform: uppercase; margin-top: 3px;
        }
        .gl-controls {
          position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 6;
        }
        .gl-btn {
          position: relative; width: 78px; height: 78px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.14);
          background: linear-gradient(180deg, rgba(24,34,58,0.85), rgba(10,15,28,0.9));
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .gl-btn:hover:not(.gl-btn--disabled) {
          transform: translateY(-2px); border-color: rgba(255,183,3,0.55);
          box-shadow: 0 0 0 6px rgba(255,183,3,0.08), 0 10px 28px rgba(0,0,0,0.45);
        }
        .gl-btn:active:not(.gl-btn--disabled) { transform: translateY(0px) scale(0.97); }
        .gl-btn--disabled { opacity: 0.55; cursor: default; }
        .gl-btn-ring {
          position: absolute; inset: -8px; border-radius: 50%;
          border: 1px solid rgba(111,168,255,0.35);
          animation: gl-pulse-ring 2.4s ease-out infinite;
        }
        @keyframes gl-pulse-ring {
          0% { transform: scale(0.92); opacity: 0.7; }
          100% { transform: scale(1.32); opacity: 0; }
        }
        .gl-spin-icon { animation: gl-spin 0.9s linear infinite; }
        @keyframes gl-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .gl-btn-label {
          font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase;
          color: #a9b6d6; font-weight: 600;
        }
        .gl-card {
          position: absolute; bottom: 40px; right: 32px; width: 280px;
          padding: 20px 20px 18px; border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.12);
          background: linear-gradient(160deg, rgba(20,29,52,0.82), rgba(9,13,25,0.88));
          backdrop-filter: blur(14px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.45);
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.55s ease, transform 0.55s ease; z-index: 6;
        }
        .gl-card--visible { opacity: 1; transform: translateY(0); }
        .gl-card-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .gl-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
          color: #7CFFB2; font-weight: 700;
        }
        .gl-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #7CFFB2;
          box-shadow: 0 0 8px #7CFFB2; animation: gl-blink 1.6s ease-in-out infinite;
        }
        @keyframes gl-blink { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
        .gl-place {
          font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 600;
          color: #fff; margin: 6px 0 2px;
        }
        .gl-region { font-size: 13px; color: #97a5c7; margin-bottom: 14px; }
        .gl-meta {
          display: flex; justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 12px; font-size: 11px; color: #7f8db3;
        }
        .gl-meta b { color: #d8e0f2; font-weight: 600; }
        .gl-loading {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 10px; z-index: 8; background: #030509;
          transition: opacity 0.5s ease;
        }
        .gl-loading.gl-hide { opacity: 0; pointer-events: none; }
        .gl-loading-text {
          font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #6ea8ff;
        }
        .gl-loading-bar {
          width: 160px; height: 2px; border-radius: 2px; background: rgba(255,255,255,0.08);
          overflow: hidden;
        }
        .gl-loading-bar span {
          display: block; height: 100%; width: 40%;
          background: linear-gradient(90deg, transparent, #6ea8ff, transparent);
          animation: gl-load-sweep 1.2s ease-in-out infinite;
        }
        @keyframes gl-load-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        @media (max-width: 640px) {
          .gl-card { right: 16px; left: 16px; width: auto; bottom: 128px; }
          .gl-topbar { padding: 20px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gl-btn-ring, .gl-dot, .gl-spin-icon { animation: none !important; }
        }
      `}</style>

      <div ref={mountRef} className="gl-canvas" />
      <div className="gl-vignette" />

      <div className={`gl-loading ${ready ? "gl-hide" : ""}`}>
        <Satellite size={26} color="#6ea8ff" />
        <div className="gl-loading-text">Calibrating satellite feed…</div>
        <div className="gl-loading-bar"><span /></div>
      </div>

      <div className="gl-topbar">
        <div>
          <div className="gl-eyebrow">Satellite Uplink</div>
          <div className="gl-title">
            {phase === "arrived" ? "Signal Locked" : "Locate Live Position"}
          </div>
        </div>
        <div className="gl-clock">
          <div className="time">{clock || "--:--:--"}</div>
          <div className="zone">IST · India</div>
        </div>
        {onClose && (
          <button className="gl-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="gl-controls">
        <button
          className={`gl-btn ${!ready || phase === "spinning" ? "gl-btn--disabled" : ""}`}
          onClick={handleClick}
          aria-label="Locate my position on the globe"
        >
          {phase === "idle" && ready && <span className="gl-btn-ring" />}
          {phase === "spinning" ? (
            <Radar size={26} color="#ffb703" className="gl-spin-icon" />
          ) : phase === "arrived" ? (
            <Radar size={26} color="#7CFFB2" />
          ) : (
            <Globe2 size={26} color="#e7edf7" />
          )}
        </button>
        <div className="gl-btn-label">
          {phase === "idle" && "Tap to Locate"}
          {phase === "spinning" && "Triangulating…"}
          {phase === "arrived" && "Locate Again"}
        </div>
      </div>

      <div className={`gl-card ${phase === "arrived" ? "gl-card--visible" : ""}`}>
        <div className="gl-card-row">
          <span className="gl-badge"><span className="gl-dot" />Live</span>
        </div>
        <div className="gl-card-row">
          <MapPin size={16} color="#ffb703" />
          <div className="gl-place">{TARGET.name}</div>
        </div>
        <div className="gl-region">{TARGET.region}</div>
        <div className="gl-meta">
          <span>Lat <b>{TARGET.lat.toFixed(4)}°N</b></span>
          <span>Lon <b>{TARGET.lon.toFixed(4)}°E</b></span>
        </div>
      </div>
    </div>
  );
}
