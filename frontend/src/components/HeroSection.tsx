import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Leaf, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Hero Background with Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20" />
      </div>

      {/* AI-Powered Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgb(34 197 94 / 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgb(34 197 94 / 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-600 rounded-full"
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-green-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />
        <motion.div 
          className="absolute top-1/2 -left-40 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: 1,
          }}
        />
        <motion.div 
          className="absolute -bottom-40 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: 2,
          }}
        />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        >
          <Leaf className="h-12 w-12 text-green-600/20" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 left-1/4"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: 1,
          }}
        >
          <TrendingUp className="h-16 w-16 text-emerald-600/20" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 right-1/3"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: 2,
          }}
        >
          <Shield className="h-14 w-14 text-teal-600/20" />
        </motion.div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        <motion.div 
          className="absolute top-20 right-20 w-32 h-32 border-2 border-green-600/30"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transform: 'rotate(45deg)' }}
        />
        <motion.div 
          className="absolute bottom-40 left-20 w-24 h-24 border-2 border-emerald-600/30"
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transform: 'rotate(12deg)' }}
        />
        <motion.div 
          className="absolute top-1/3 left-1/3 w-16 h-16 border-2 border-teal-600/30"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transform: 'rotate(-12deg)' }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/10 border border-green-600/20 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-green-600 animate-pulse" />
            <span className="text-sm font-medium text-green-600">AI-Powered Agriculture</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
          >
            Transform Your Farm with{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Smart AI
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Harness the power of machine learning to get intelligent crop recommendations,
            instant disease detection, personalized fertilizer guidance, and accurate yield predictions. 
            Maximize your yield, minimize your costs.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Link to="/login">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-green-600 text-green-600 hover:bg-green-50">
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 pt-12"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="backdrop-blur-sm bg-white/50 px-6 py-4 rounded-2xl border border-gray-200/50 cursor-pointer"
            >
              <div className="text-3xl md:text-4xl font-bold text-green-600">10k+</div>
              <div className="text-sm text-gray-600">Active Farmers</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="backdrop-blur-sm bg-white/50 px-6 py-4 rounded-2xl border border-gray-200/50 cursor-pointer"
            >
              <div className="text-3xl md:text-4xl font-bold text-green-600">95%</div>
              <div className="text-sm text-gray-600">Accuracy Rate</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="backdrop-blur-sm bg-white/50 px-6 py-4 rounded-2xl border border-gray-200/50 cursor-pointer"
            >
              <div className="text-3xl md:text-4xl font-bold text-green-600">30%</div>
              <div className="text-sm text-gray-600">Yield Increase</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
