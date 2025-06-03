"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Bug, Menu, X } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/#features" },
  { name: "Docs", href: "https://docs.bugtracker.com", external: true },
];

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-all">
      <nav className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-primary-700 text-xl"
        >
          <Bug className="w-7 h-7 text-primary-600" />
          <span>BugTracker</span>
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors font-medium"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                href={link.href}
                className="text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors font-medium"
              >
                {link.name}
              </Link>
            )
          )}
          <Link
            href="/auth/login"
            className="ml-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 transition-all"
          >
            Dashboard
          </Link>
        </div>
        <button
          className="md:hidden p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-slate-800 transition"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 pb-4 pt-2 animate-fade-in-down">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )
            )}
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 transition-all"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
