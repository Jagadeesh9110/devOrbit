import React from "react";
import { Bug } from "lucide-react";

const BrandingPanel: React.FC = () => {
  return (
    <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-600 to-purple-800 text-white flex-col items-center justify-center p-12">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Bug size={56} strokeWidth={1.5} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Join BugTracker</h1>
        <p className="text-lg mb-8 text-purple-100">
          Start tracking and managing bugs efficiently with our powerful
          platform designed for modern development teams.
        </p>
        <div className="space-y-8">
          <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl">
            <p className="text-purple-100 mb-2 font-medium">
              "Since adopting BugTracker, our team's productivity has increased
              by 40%. The interface is intuitive and the features are exactly
              what we needed."
            </p>
            <p className="text-sm text-purple-200 font-medium">
              — Michael Chen, Lead Developer at DevFlow
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
