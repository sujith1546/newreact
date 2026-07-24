import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuantumPreloader({ isReady, onComplete }) {
  const mountRef = useRef(null);
  const apiRef = useRef({});
  const [showUi, setShowUi] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030509, 0.04); // Deep space fog

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x030509, 1);
    mount.appendChild(renderer.domElement);

    // --- Particle System Setup ---
    const particleCount = window.innerWidth < 768 ? 3000 : 8000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3); // For shockwave
    const randomOffsets = new Float32Array(particleCount * 3); // For chaotic motion

    const color1 = new THREE.Color(0x0b88ff); // Signature Blue
    const color2 = new THREE.Color(0x7CFFB2); // Cyber Green
    const color3 = new THREE.Color(0xffffff); // Core White

    for (let i = 0; i < particleCount; i++) {
      // Start positions (Chaotic sphere)
      const r = 2 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      randomOffsets[i * 3] = (Math.random() - 0.5) * 2;
      randomOffsets[i * 3 + 1] = (Math.random() - 0.5) * 2;
      randomOffsets[i * 3 + 2] = (Math.random() - 0.5) * 2;

      // Color mix
      const mix = Math.random();
      const mixedColor = mix > 0.8 ? color3 : (mix > 0.4 ? color2 : color1);
      
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom shader for glowing particles
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        collapseProgress: { value: 0 } // 0 = chaotic, 1 = collapsed core
      },
      vertexShader: `
        uniform float time;
        uniform float collapseProgress;
        attribute vec3 color;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          
          // Add some wavy motion based on time
          vec3 currentPos = position;
          currentPos.x += sin(time * 2.0 + position.y) * 0.5 * (1.0 - collapseProgress);
          currentPos.y += cos(time * 1.5 + position.x) * 0.5 * (1.0 - collapseProgress);
          currentPos.z += sin(time * 1.0 + position.z) * 0.5 * (1.0 - collapseProgress);
          
          // Lerp to center during collapse phase
          vec3 finalPos = mix(currentPos, vec3(0.0), collapseProgress);
          
          vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Size attenuation
          gl_PointSize = (12.0 * (1.0 - collapseProgress) + 40.0 * collapseProgress) * (10.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          // Circular particle with soft edge
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float ll = length(xy);
          if (ll > 0.5) discard;
          
          // Create soft glow
          float alpha = (0.5 - ll) * 2.0;
          alpha = pow(alpha, 1.5);
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- Shockwave Sphere ---
    const shockGeo = new THREE.SphereGeometry(1, 32, 32);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const shockSphere = new THREE.Mesh(shockGeo, shockMat);
    scene.add(shockSphere);

    // --- Animation State ---
    let raf;
    let clock = new THREE.Clock();
    
    apiRef.current.phase = 'loading'; // loading -> collapsing -> exploding -> done
    let collapseStartTime = 0;
    const collapseDuration = 1.2; // seconds to collapse
    
    let explodeStartTime = 0;
    const explodeDuration = 1.0; // seconds to explode

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      
      material.uniforms.time.value = time;

      // Rotate entire system slowly
      particles.rotation.y += delta * 0.2;
      particles.rotation.z += delta * 0.1;

      if (apiRef.current.phase === 'collapsing') {
        const elapsed = time - collapseStartTime;
        let p = Math.min(1.0, elapsed / collapseDuration);
        
        // Easing out cubic
        p = 1 - Math.pow(1 - p, 3);
        
        material.uniforms.collapseProgress.value = p;
        
        // Speed up rotation intensely during collapse
        particles.rotation.y += delta * 2.0 * p;
        particles.rotation.z += delta * 1.5 * p;

        if (p >= 1.0) {
          apiRef.current.phase = 'exploding';
          explodeStartTime = clock.getElapsedTime();
        }
      }

      if (apiRef.current.phase === 'exploding') {
        const elapsed = time - explodeStartTime;
        let p = Math.min(1.0, elapsed / explodeDuration);
        
        // Easing out quintic for fast start, slow end
        const ep = 1 - Math.pow(1 - p, 5);

        // Hide particles
        material.uniforms.collapseProgress.value = 1.0;
        particles.visible = false;

        // Expand shockwave
        shockSphere.scale.setScalar(1 + ep * 60);
        shockSphere.material.opacity = (1 - p) * 0.8;
        
        // Fade background out
        const bgAlpha = 1 - p;
        renderer.setClearColor(0x030509, bgAlpha);

        if (p >= 1.0) {
          if (apiRef.current.phase !== 'done') {
            apiRef.current.phase = 'done';
            setIsVisible(false);
            if (onComplete) onComplete();
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    apiRef.current.triggerReady = () => {
      if (apiRef.current.phase !== 'loading') return;
      apiRef.current.phase = 'collapsing';
      collapseStartTime = clock.getElapsedTime();
      setShowUi(false); // Hide text overlay instantly
    };

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      shockGeo.dispose();
      shockMat.dispose();
      renderer.dispose();
    };
  }, [onComplete]);

  // Watch for isReady prop from parent
  useEffect(() => {
    if (isReady && apiRef.current.triggerReady) {
      // Small artificial delay for dramatic effect so it doesn't instantly collapse on fast connections
      setTimeout(() => apiRef.current.triggerReady(), 1000);
    }
  }, [isReady]);

  if (!isVisible) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none', background: 'transparent' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      <AnimatePresence>
        {showUi && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            {/* Minimalist spinning logo/geometric shape for the center */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              style={{
                width: '40px',
                height: '40px',
                border: '2px solid rgba(124, 255, 178, 0.2)',
                borderTopColor: '#7CFFB2',
                borderBottomColor: '#0b88ff',
                borderRadius: '50%',
                boxShadow: '0 0 20px rgba(11, 136, 255, 0.4)'
              }}
            />
            
            <div style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              letterSpacing: '0.3em',
              color: '#6ea8ff',
              textTransform: 'uppercase',
              textShadow: '0 0 10px rgba(110, 168, 255, 0.5)'
            }}>
              Decrypting Assets
            </div>
            
            <div style={{
              width: '120px',
              height: '2px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
              marginTop: '8px'
            }}>
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                style={{
                  width: '50%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, #7CFFB2, transparent)'
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
