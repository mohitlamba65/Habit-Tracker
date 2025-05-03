import { motion } from "framer-motion";

export default function FancyLoader() {
  return (
    <div className="w-full h-screen relative flex flex-col justify-center items-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#8E36EA] via-[#4057EB] to-[#0f0f1c] animate-backgroundMove" />

      {/* Overlay Glass Blur */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[3px] z-10" />

      {/* Loader Content */}
      <div className="z-20 flex flex-col items-center justify-center gap-10">
        {/* Glowing Orb or Pulse Dot */}
        <motion.div
          className="w-20 h-20 rounded-full bg-[#ffffff1a] border-4 border-[#FFFFFF40] shadow-[0_0_25px_#8E36EA] backdrop-blur-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
        />

        {/* Loading Dots Animation */}
        <motion.div
          className="flex gap-2 text-white text-lg font-medium"
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.2,
                repeat: Infinity,
              },
            },
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-3 h-3 bg-white rounded-full"
              variants={{
                initial: { y: 0, opacity: 0.3 },
                animate: {
                  y: [0, -10, 0],
                  opacity: [0.3, 1, 0.3],
                },
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ))}
        </motion.div>

        {/* Progress Bar */}
        <div className="relative w-48 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="absolute h-full bg-white rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
          />
        </div>

        {/* Optional Text */}
        <motion.div
          className="text-white font-semibold text-xl tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        >
          Initializing AI Modules...
        </motion.div>
      </div>
    </div>
  );
}
