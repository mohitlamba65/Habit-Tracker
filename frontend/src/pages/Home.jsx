import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/three';

// Rotating and Scaling Icosahedron Component
const AnimatedIcosahedron = () => {
  const icosahedronRef = useRef();

  // React Spring for smooth scaling based on mouse movement
  const [scale, setScale] = useSpring(() => ({
    scale: 1,
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  // Rotate and adjust scale with mouse movement
  useFrame(({ mouse }) => {
    if (icosahedronRef.current) {
      icosahedronRef.current.rotation.x += 0.01;
      icosahedronRef.current.rotation.y += 0.01;
      
      // Set scale based on mouse position
      setScale.start({
        scale: 1 + Math.sin(mouse.x * Math.PI) * 0.3,
      });
    }
  });

  return (
    <animated.mesh ref={icosahedronRef} scale={scale.scale}>
      <icosahedronGeometry args={[2.5, 0]} />
      <meshStandardMaterial color="lightblue" wireframe />
    </animated.mesh>
  );
};

const Home = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 text-white">
      
      {/* 3D Canvas Background */}
      <Canvas className="absolute inset-0">
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Stars and Orbit Controls */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        <OrbitControls enableZoom={false} />

        {/* Animated Icosahedron */}
        <AnimatedIcosahedron />
      </Canvas>

      {/* Main Page Content */}
      <motion.h2
        className="text-5xl font-bold mb-4 relative z-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        Welcome to Habit Tracker
      </motion.h2>
      <motion.p
        className="text-lg text-center max-w-xl relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        Track your habits, achieve your goals, and level up your daily routine with our gamified platform!
      </motion.p>
    </div>
  );
};

export default Home;


