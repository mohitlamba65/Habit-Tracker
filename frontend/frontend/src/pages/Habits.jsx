import React, { useRef } from 'react';
import HabitCard from '../components/HabitCard';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

// Extend THREE with TorusKnotGeometry
extend({ TorusKnotGeometry: THREE.TorusKnotGeometry });

// Rotating and Scaling Torus Knot Component
const AnimatedTorusKnot = () => {
  const knotRef = useRef();

  // Spring-based scaling for smooth pointer interaction
  const [scale, setScale] = useSpring(() => ({
    scale: 1,
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  // Rotate the torus knot and adjust scale based on pointer position
  useFrame((state) => {
    const { pointer } = state;
    if (knotRef.current) {
      knotRef.current.rotation.x += 0.01;
      knotRef.current.rotation.y += 0.01;

      // Adjust scale based on pointer position
      setScale.start({
        scale: 1 + pointer.x * 0.3,
      });
    }
  });

  return (
    <animated.mesh ref={knotRef} scale={scale.scale} position={[0, 0, -10]}>
      <torusKnotGeometry args={[3, 0.5, 100, 16]} />
      <meshStandardMaterial color="#ffffff" wireframe />
    </animated.mesh>
  );
};

const Habits = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-700 py-24">
      
      {/* 3D Canvas Background */}
      {/* Page Content */}
      <motion.h2
        className="text-5xl font-bold text-white mb-10 relative z-10 py-20"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      >
        Your Gamified Habits
      </motion.h2>
      <Canvas className="absolute inset-0 z-0">
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        <OrbitControls enableZoom={false} />
        
        {/* Animated Torus Knot */}
        <AnimatedTorusKnot />
      </Canvas>


      <motion.div
        className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        <HabitCard />
      </motion.div>
    </div>
  );
};

export default Habits;
