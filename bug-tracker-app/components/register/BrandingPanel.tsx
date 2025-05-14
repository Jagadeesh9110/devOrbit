import React, { useEffect, useState } from "react";
import { Bug } from "lucide-react";

const testimonials = [
  {
    text: '"Since adopting BugTracker, our team\'s productivity has increased by 40%. The interface is intuitive and the features are exactly what we needed."',
    author: "— Michael Chen, Lead Developer at DevFlow",
  },
  {
    text: '"The onboarding process was seamless and our team adapted quickly."',
    author: "— Emily Carter, Scrum Master at AgileWorks",
  },
  {
    text: '"BugTracker\'s analytics helped us identify bottlenecks and improve our workflow."',
    author: "— Omar Farouk, Engineering Manager at CodeBase",
  },
  {
    text: '"Excellent support and constant updates. Highly reliable!"',
    author: "— Lisa Müller, QA Manager at SoftVision",
  },
];

const SLIDE_INTERVAL = 5000;

const BrandingPanel: React.FC = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-600 to-accent-500 text-white flex-col items-center justify-center p-12">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Bug size={56} strokeWidth={1.5} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Join BugTracker</h1>
        <p className="text-lg mb-8 text-primary-100">
          Start tracking and managing bugs efficiently with our powerful
          platform designed for modern development teams.
        </p>
        <div className="space-y-8">
          <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl min-h-[120px] flex flex-col justify-center transition-all duration-500">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className={`transition-opacity duration-500 ease-in-out ${
                  idx === active
                    ? "opacity-100"
                    : "opacity-0 absolute pointer-events-none"
                }`}
                aria-hidden={idx !== active}
              >
                <p className="text-primary-100 mb-2 font-medium">{t.text}</p>
                <p className="text-sm text-primary-200 font-medium">
                  {t.author}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                className={`h-2 w-2 rounded-full transition-all duration-300 focus:outline-none ${
                  idx === active ? "bg-white scale-110 shadow" : "bg-white/40"
                }`}
                aria-label={`Show testimonial ${idx + 1}`}
                onClick={() => setActive(idx)}
                tabIndex={0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingPanel;
