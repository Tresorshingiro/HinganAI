import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out HinganAI",
    features: [
      "10 crop recommendations/month",
      "5 disease detections/month",
      "Basic fertilizer advice",
      "Community support",
      "Mobile app access"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For serious farmers who want unlimited access",
    features: [
      "Unlimited crop recommendations",
      "Unlimited disease detections",
      "Advanced fertilizer optimization",
      "Priority support",
      "Weather forecasting",
      "Yield predictions",
      "Export reports"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For agricultural businesses and cooperatives",
    features: [
      "Everything in Pro",
      "Multiple farm management",
      "API access",
      "Custom ML models",
      "Dedicated support",
      "Training & onboarding",
      "White-label options"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Choose the plan that fits your farming needs. All plans include our core AI features.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: plan.popular ? 1.02 : 1.05 }}
            >
              <Card
                className={`p-8 relative h-full ${
                  plan.popular
                    ? "border-2 border-green-600 shadow-xl scale-105"
                    : "border-2"
                }`}
              >
                {plan.popular && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium"
                  >
                    Most Popular
                  </motion.div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period !== "forever" && plan.period !== "contact us" && (
                      <span className="text-gray-600 text-sm">/{plan.period}</span>
                    )}
                    {plan.period === "forever" && (
                      <span className="text-gray-600 text-sm"> {plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + idx * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <Link to="/login" className="block">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-white hover:bg-gray-50 text-gray-900 border-2"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
