import { Camera, Brain, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Camera,
    title: "Capture or Input Data",
    description:
      "Take a photo of your crops, upload leaf images, or enter your soil and location details through our simple interface.",
    step: "01",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description:
      "Our advanced machine learning models process your data instantly, analyzing thousands of patterns and variables in seconds.",
    step: "02",
  },
  {
    icon: TrendingUp,
    title: "Get Recommendations",
    description:
      "Receive personalized, actionable insights with step-by-step guidance to improve your farm's productivity and health.",
    step: "03",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">HinganAI</span>{" "}
            Works
          </h2>
          <p className="text-lg text-gray-600">
            Three simple steps to transform your farming with artificial intelligence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative"
            >
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
                  className="hidden md:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-green-600 to-transparent origin-left"
                />
              )}

              <div className="relative z-10 text-center group">
                {/* Step number */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 0.1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="absolute -top-4 -left-4 text-7xl font-bold text-green-600 group-hover:opacity-20 transition-opacity"
                >
                  {step.step}
                </motion.div>

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative mb-6 mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                >
                  <step.icon className="h-12 w-12 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
