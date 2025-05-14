import React from "react";
import FooterSocial from "./FooterSocial";

const FooterSection: React.FC = () => {
  return (
    <footer className="bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 py-8 mt-auto transition-all">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-primary-700">BugTracker</span>.
            All rights reserved.
          </div>
          <div className="flex gap-6 justify-center text-sm">
            <a
              href="#"
              className="text-slate-500 hover:text-primary-600 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-primary-600 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-primary-600 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
        <FooterSocial />
      </div>
    </footer>
  );
};

export default FooterSection;
