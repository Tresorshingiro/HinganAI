import { Card } from "@/components/ui/card";
import { Leaf, Sprout, FlaskConical } from "lucide-react";
import cropIcon from "@/assets/crop-recommendation-icon.jpg";
import leafIcon from "@/assets/leaf-detection-icon.jpg";
import fertilizerIcon from "@/assets/fertilizer-icon.jpg";

const features = [
  {
    icon: cropIcon,
    iconComponent: Sprout,
    title: "Smart Crop Recommendations",
    description:
      "Get AI-powered suggestions on the best crops to plant based on your soil type, climate, and local conditions. Maximize profitability with data-driven decisions.",
    color: "secondary",
  },
  {
    icon: leafIcon,
    iconComponent: Leaf,
    title: "Instant Disease Detection",
    description:
      "Simply upload a photo of your plant leaves and our ML model will instantly identify diseases and pests. Get immediate treatment recommendations to save your crops.",
    color: "primary",
  },
  {
    icon: fertilizerIcon,
    iconComponent: FlaskConical,
    title: "Fertilizer Optimization",
    description:
      "Receive personalized fertilizer recommendations based on soil composition and crop requirements. Reduce costs and environmental impact while boosting yields.",
    color: "accent",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Powerful AI Features for{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Modern Farmers
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our machine learning models are trained on millions of data points to give you the
            most accurate and actionable insights for your farm.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-8 hover:shadow-strong transition-all duration-300 hover:-translate-y-2 border-2 group"
            >
              <div className="mb-6 relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-medium group-hover:shadow-strong transition-shadow">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
