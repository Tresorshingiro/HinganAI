import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-agriculture.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 bg-gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Agriculture</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Transform Your Farm with{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Smart AI
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Harness the power of machine learning to get intelligent crop recommendations,
              instant disease detection, and personalized fertilizer guidance. Maximize your
              yield, minimize your costs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="hero-outline" size="xl">
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Active Farmers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary">30%</div>
                <div className="text-sm text-muted-foreground">Yield Increase</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:h-[600px] animate-fade-in-delay">
            <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20"></div>
            <img
              src={heroImage}
              alt="Modern smart farming with AI technology"
              className="relative rounded-3xl shadow-strong object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
