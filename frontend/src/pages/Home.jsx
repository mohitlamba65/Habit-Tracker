import  { useRef, useEffect, useCallback } from "react";
import { Canvas} from "@react-three/fiber";
import {
  OrbitControls,
  Float,
  Ring,
  Sparkles,
} from "@react-three/drei";
import { Particles } from "@tsparticles/react";
import { loadStarsPreset } from "@tsparticles/preset-stars";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../CSS/Home.css";

gsap.registerPlugin(ScrollTrigger);

const Planet = ({ position, color, size, glow = false }) => (
  <Float speed={1} rotationIntensity={1.2} floatIntensity={2.4}>
    <mesh position={position}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={glow ? color : "#000"}
        emissiveIntensity={glow ? 1.5 : 0.2}
      />
    </mesh>
  </Float>
);

const Satellite = ({ position, color, size }) => (
  <Float speed={2} rotationIntensity={1.2} floatIntensity={2.2}>
    <mesh position={position}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} />
    </mesh>
  </Float>
);

// Shooting Star Canvas
const ShootingStars = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const stars = [];

    for (let i = 0; i < 20; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        len: Math.random() * 80 + 10,
        speed: Math.random() * 3 + 2,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        ctx.beginPath();
        const grad = ctx.createLinearGradient(
          star.x,
          star.y,
          star.x + star.len,
          star.y + star.len
        );
        grad.addColorStop(0, `rgba(255,255,255,${star.opacity})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x + star.len, star.y + star.len);
        ctx.stroke();
        star.x += star.speed;
        star.y += star.speed;
        if (star.x > width || star.y > height) {
          star.x = Math.random() * width;
          star.y = -10;
        }
      });
      requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-[5] pointer-events-none"
    />
  );
};

const Home = () => {
  const navigate = useNavigate();
  const galaxyRef = useRef();

  const particlesInit = useCallback(async (engine) => {
    await loadStarsPreset(engine);
  }, []);

  useEffect(() => {
    if (galaxyRef.current) {
      gsap.to(galaxyRef.current.rotation, {
        y: Math.PI * 2,
        scrollTrigger: {
          trigger: galaxyRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0e0c22] to-[#0b0d20]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Shooting Star Canvas */}
        <ShootingStars />

        {/* Starry BG */}
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{ preset: "stars" }}
          className="absolute inset-0 z-[1]"
        />

        {/* 3D Scene */}
        <Canvas className="absolute inset-0 z-10">
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} />
          <Sparkles count={60} speed={0.5} scale={8} size={1.5} />

          <group ref={galaxyRef}>
            {/* Main Cinematic Planet */}
            <Planet position={[0, 0, 0]} color="#8638EA" size={2} glow />
            <Ring
              args={[2.5, 2.6, 64]}
              position={[0, 0.1, 0]}
              rotation={[1.5, 0, 0]}
            >
              <meshBasicMaterial
                color="#8638EA"
                side={2}
                transparent
                opacity={0.3}
              />
            </Ring>

            {/* Satellite */}
            <Satellite position={[4, 1, -2]} color="#305EEB" size={0.4} />

            {/* Other planets */}
            <Planet position={[-6, 3, -3]} color="#7F3BEA" size={1} />
            <Planet position={[5, -4, 2]} color="#FFFFFF" size={0.8} />
            <Planet position={[-3, -2, 4]} color="#60a5fa" size={0.9} />
          </group>

          <OrbitControls enableZoom={false} />
        </Canvas>

        {/* Text + CTA */}
        <AnimatePresence>
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center text-white px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-[#8638EA] via-[#305EEB] to-[#7F3BEA] text-transparent bg-clip-text drop-shadow-2xl"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              Welcome to Habit Tracker
            </motion.h1>
            <motion.p
              className="mt-6 text-xl max-w-3xl text-gray-300"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
            >
              Track your habits, achieve your goals, and level up your daily
              routine with our gamified platform.
            </motion.p>
            <motion.button
              className="mt-10 px-10 py-3 rounded-full bg-gradient-to-r from-[#8638EA] via-[#305EEB] to-[#7F3BEA] text-white font-semibold shadow-lg hover:scale-105 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/signup")}
            >
              Get Started →
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default Home;
