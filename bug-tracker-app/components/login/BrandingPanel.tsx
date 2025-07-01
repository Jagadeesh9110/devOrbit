import React, { useEffect, useState } from "react";
import { Bug, BarChart3, Users, Zap, Target, TrendingUp } from "lucide-react";

const mockupSlides = [
  {
    title: "AI-Powered Bug Detection",
    description:
      "Our AI automatically categorizes and prioritizes bugs, saving you hours of manual work.",
    icon: <Zap className="w-8 h-8" />,
    gradient: "from-primary to-primary-600",
    features: ["Smart categorization", "Priority scoring", "Auto-assignment"],
  },
  {
    title: "Team Collaboration Hub",
    description:
      "Work seamlessly with your team through real-time updates and intelligent notifications.",
    icon: <Users className="w-8 h-8" />,
    gradient: "from-secondary to-primary",
    features: ["Real-time updates", "Smart notifications", "Team workspaces"],
  },
  {
    title: "Predictive Analytics",
    description:
      "Get AI-driven insights into bug patterns and project health before issues become critical.",
    icon: <BarChart3 className="w-8 h-8" />,
    gradient: "from-primary to-secondary",
    features: ["Pattern recognition", "Health scoring", "Predictive alerts"],
  },
  {
    title: "Smart Project Management",
    description:
      "Organize projects with intelligent workflows that adapt to your team's needs.",
    icon: <Target className="w-8 h-8" />,
    gradient: "from-accent to-accent-500",
    features: [
      "Adaptive workflows",
      "Auto-scheduling",
      "Resource optimization",
    ],
  },
];

const SLIDE_INTERVAL = 4000;

const BrandingPanel: React.FC<{ isRegister?: boolean }> = ({
  isRegister = false,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % mockupSlides.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent via-secondary to-accent text-white flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border border-secondary rounded-lg rotate-12"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-32 left-16 w-12 h-12 border border-secondary rounded-lg -rotate-12"></div>
        <div className="absolute bottom-16 right-10 w-24 h-24 border border-white/20 rounded-full"></div>
      </div>

      <div className="max-w-lg text-center relative z-10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 bg-gradient-to-r from-secondary to-white/10 rounded-xl flex items-center justify-center">
            <Bug className="w-8 h-8 text-accent" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-secondary to-white bg-clip-text text-transparent">
            DevOrbit
          </span>
        </div>

        <div className="space-y-8">
          <div className="relative h-80 overflow-hidden">
            {mockupSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                  idx === activeSlide
                    ? "opacity-100 translate-x-0"
                    : idx < activeSlide
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
                }`}
              >
                <div className="bg-accent/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-secondary/30">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${slide.gradient} rounded-xl flex items-center justify-center mb-4 text-white`}
                  >
                    {slide.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {slide.title}
                  </h3>
                  <p className="text-white/80 text-sm mb-4 leading-relaxed">
                    {slide.description}
                  </p>
                  <div className="space-y-2">
                    {slide.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-secondary to-white rounded-full"></div>
                        <span className="text-white/70">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-accent/30 backdrop-blur-sm rounded-xl p-4 border border-secondary/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-white/70">AI Insights</span>
                    <TrendingUp className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-t from-secondary to-white rounded-sm flex-1 transition-all duration-1000 delay-200"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-2">
            {mockupSlides.map((_, idx) => (
              <button
                key={idx}
                className={`h-2 w-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-accent ${
                  idx === activeSlide
                    ? "bg-gradient-to-r from-secondary to-white scale-110"
                    : "bg-accent/60 hover:bg-accent/80"
                }`}
                aria-label={`Show slide ${idx + 1}`}
                onClick={() => setActiveSlide(idx)}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-secondary/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">15K+</div>
              <div className="text-xs text-white/70">Bugs Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">420+</div>
              <div className="text-xs text-white/70">Active Teams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-xs text-white/70">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingPanel;
