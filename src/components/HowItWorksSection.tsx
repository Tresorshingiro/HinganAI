import { Camera, Brain, TrendingUp } from "lucide-react";

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
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How <span className="bg-gradient-primary bg-clip-text text-transparent">HinganAI</span>{" "}
            Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps to transform your farming with artificial intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
              )}

              <div className="relative z-10 text-center group">
                {/* Step number */}
                <div className="absolute -top-4 -left-4 text-7xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="relative mb-6 mx-auto w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-medium group-hover:shadow-strong group-hover:scale-110 transition-all duration-300">
                  <step.icon className="h-12 w-12 text-primary-foreground" />
                </div>

                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
