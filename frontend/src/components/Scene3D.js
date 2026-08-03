import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, RoundedBox, Edges, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function HoloPhone() {
  const g = useRef();
  useFrame((state) => {
    if (g.current) g.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.4;
  });
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
      <group ref={g} scale={1.15}>
        {/* body */}
        <RoundedBox args={[1.5, 3, 0.18]} radius={0.14} smoothness={6}>
          <meshStandardMaterial color="#070a12" metalness={0.9} roughness={0.25} />
          <Edges scale={1.001} threshold={15} color="#00e5ff" />
        </RoundedBox>
        {/* screen glow */}
        <mesh position={[0, 0, 0.10]}>
          <planeGeometry args={[1.28, 2.74]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.14} />
        </mesh>
        <mesh position={[0, 0, 0.101]}>
          <planeGeometry args={[1.28, 2.74]} />
          <meshBasicMaterial color="#ff2bd6" transparent opacity={0.05} />
        </mesh>
        <Html transform position={[0, 0, 0.12]} distanceFactor={2.6} className="pointer-events-none">
          <div style={{ width: 150, textAlign: "center" }}>
            <div style={{ fontFamily: "Orbitron", color: "#eafcff", fontSize: 13, letterSpacing: 2, textShadow: "0 0 10px #00e5ff" }}>D&amp;CP</div>
            <div style={{ fontFamily: "Share Tech Mono", color: "#7ff2ff", fontSize: 8, marginTop: 4 }}>DIAGNOSTIC ONLINE</div>
            <div style={{ height: 1, background: "#00e5ff", margin: "8px 0", boxShadow: "0 0 8px #00e5ff" }} />
            <div style={{ fontFamily: "Share Tech Mono", color: "#ff8be9", fontSize: 8 }}>SIGNAL // 98%</div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

function Ring({ radius, speed, color }) {
  const r = useRef();
  useFrame((s) => { if (r.current) r.current.rotation.z = s.clock.elapsedTime * speed; });
  return (
    <mesh ref={r} rotation={[Math.PI / 2.2, 0, 0]}>
      <torusGeometry args={[radius, 0.012, 16, 100]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Particles() {
  const points = useMemo(() => {
    const arr = new Float32Array(1200 * 3);
    for (let i = 0; i < arr.length; i++) arr[i] = (Math.random() - 0.5) * 22;
    return arr;
  }, []);
  const ref = useRef();
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.03; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={1200} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#00e5ff" transparent opacity={0.6} />
    </points>
  );
}

export default function Scene3D() {
  const wrapRef = useRef(null);
  const [active, setActive] = useState(true);
  const dpr = useMemo(() => (typeof window !== "undefined" && window.innerWidth < 768 ? [1, 1.2] : [1, 1.8]), []);

  useEffect(() => {
    if (!wrapRef.current || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.05 });
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="w-full h-full">
    <Canvas camera={{ position: [0, 0.4, 6], fov: 45 }} dpr={dpr} frameloop={active ? "always" : "never"} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <color attach="background" args={["#05060a"]} />
      <fog attach="fog" args={["#05060a", 8, 16]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 5, 4]} intensity={80} color="#00e5ff" />
      <pointLight position={[-5, -2, -3]} intensity={60} color="#ff2bd6" />
      <Stars radius={60} depth={30} count={2000} factor={3} fade speed={1} />
      <Particles />
      <group position={[0, 0.2, 0]}>
        <HoloPhone />
        <Ring radius={2.2} speed={0.25} color="#00e5ff" />
        <Ring radius={2.7} speed={-0.18} color="#ff2bd6" />
      </group>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6}
        minPolarAngle={Math.PI / 2.6} maxPolarAngle={Math.PI / 1.9} />
    </Canvas>
    </div>
  );
}
