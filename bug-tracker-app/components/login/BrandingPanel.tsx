import React from "react";
import { Bug } from "lucide-react";
const BrandingPanel: React.FC = () => {
  return (
    <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-600 to-purple-800 text-white flex-col items-center justify-center p-12">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Bug size={56} strokeWidth={1.5} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4">BugTracker</h1>
        <p className="text-lg mb-8 text-purple-100">
          Track, manage, and squash bugs efficiently with our powerful bug
          tracking platform.
        </p>
        <div className="space-y-8">
          <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl">
            <p className="text-purple-100 mb-2 font-medium">
              "BugTracker has transformed how our team handles issues. We've
              increased our resolution speed by 35%!"
            </p>
            <p className="text-sm text-purple-200 font-medium">
              — Sarah Johnson, CTO at TechSolutions
            </p>
          </div>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4].map((dot) => (
              <div
                key={dot}
                className={`h-2 w-2 rounded-full ${
                  dot === 1 ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingPanel;
