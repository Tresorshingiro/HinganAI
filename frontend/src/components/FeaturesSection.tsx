import { Card } from "@/components/ui/card";
import { Leaf, Sprout, FlaskConical, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    iconComponent: Sprout,
    title: "Smart Crop Recommendations",
    description:
      "Get AI-powered suggestions on the best crops to plant based on your soil type, climate, and local conditions. Maximize profitability with data-driven decisions.",
    color: "text-emerald-600 bg-emerald-100",
  },
  {
    iconComponent: Leaf,
    title: "Instant Disease Detection",
    description:
      "Simply upload a photo of your plant leaves and our ML model will instantly identify diseases and pests. Get immediate treatment recommendations to save your crops.",
    color: "text-green-600 bg-green-100",
  },
  {
    iconComponent: FlaskConical,
    title: "Fertilizer Optimization",
    description:
      "Receive personalized fertilizer recommendations based on soil composition and crop requirements. Reduce costs and environmental impact while boosting yields.",
    color: "text-teal-600 bg-teal-100",
  },
  {
    iconComponent: BarChart3,
    title: "Yield Prediction",
    description:
      "Forecast your crop yields with precision using advanced ML models. Input climate data, crop type, and farming practices to predict harvest outcomes and plan better.",
    color: "text-blue-600 bg-blue-100",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Powerful AI Features for{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Modern Farmers
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Our machine learning models are trained on millions of data points to give you the
            most accurate and actionable insights for your farm.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 group">
                <div className="mb-6 relative">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center`}
                  >
                    <feature.iconComponent className="h-8 w-8" />
                  </motion.div>
                </div>

                <h3 className="text-2xl font-bold mb-4 group-hover:text-green-600 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
