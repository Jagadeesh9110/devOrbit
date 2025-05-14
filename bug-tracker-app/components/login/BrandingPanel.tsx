import React, { useEffect, useState } from "react";
import { Bug } from "lucide-react";

const testimonials = [
  {
    text: '"BugTracker has transformed how our team handles issues. We\'ve increased our resolution speed by 35%!"',
    author: "— Sarah Johnson, CTO at TechSolutions",
  },
  {
    text: '"The collaboration features are a game changer for our remote team."',
    author: "— Alex Lee, Product Manager at InnovateX",
  },
  {
    text: '"Intuitive UI and powerful integrations. Highly recommended!"',
    author: "— Priya Patel, QA Lead at SoftServe",
  },
  {
    text: '"Secure, fast, and reliable. BugTracker is now essential for us."',
    author: "— Daniel Kim, DevOps at CloudCore",
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
        <h1 className="text-4xl font-bold mb-4">BugTracker</h1>
        <p className="text-lg mb-8 text-primary-100">
          Track, manage, and squash bugs efficiently with our powerful bug
          tracking platform.
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
