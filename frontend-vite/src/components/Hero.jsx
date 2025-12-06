// Hero component
import { motion } from 'framer-motion'

const Hero = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center text-white mb-12 py-16"
    >
      {/* Floating Icon */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-8xl mb-6 inline-block"
      >
        🔍
      </motion.div>

      {/* Title */}
      <motion.h1 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-6xl font-bold mb-4 drop-shadow-2xl"
      >
        TruthLens AI
      </motion.h1>

      {/* Subtitle */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-2xl mb-2 text-white/90"
      >
        Verify Before You Share
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-lg text-white/80 max-w-2xl mx-auto"
      >
        AI-Powered Fact Checking • Detect Fake News • Fight Misinformation
      </motion.p>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex gap-8 justify-center mt-12"
      >
        {[
          { label: 'Accuracy', value: '99%' },
          { label: 'Speed', value: '<3s' },
          { label: 'AI Models', value: '6' }
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ scale: 1.1 }}
            className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-xl"
          >
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-sm opacity-90">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default Hero