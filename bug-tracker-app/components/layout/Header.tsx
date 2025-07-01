"use client";

import React, { useState, Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import {
  Bug,
  Menu as MenuIcon,
  X,
  Folder,
  Users,
  BarChart3,
  Settings,
  Bell,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const publicNavLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/#features" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Testimonials", href: "/#testimonials" },
  { name: "Docs", href: "https://docs.devorbit.com", external: true },
];

const dashboardNavLinks = [
  { name: "Projects", href: "/dashboard/projects", icon: Folder },
  { name: "Bugs", href: "/dashboard/bugs", icon: Bug },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

const Header: React.FC = () => {
  const [notifications, setNotifications] = useState(3);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith("/dashboard");
  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-xl border-b border-border transition-all">
      <nav className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-40"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <div className="relative w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
              <Bug className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            {isDashboard ? "devOrbit Dashboard" : "devOrbit"}
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {isDashboard ? (
            // Dashboard Navigation
            <>
              {dashboardNavLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive(item.href)
                        ? "text-primary bg-primary/10 dark:bg-primary/20"
                        : "text-muted-foreground hover:text-primary hover:bg-accent/10"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </button>
                </Link>
              ))}
            </>
          ) : (
            // Public Navigation
            <>
              {publicNavLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {link.name}
                  </Link>
                )
              )}
            </>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {isDashboard ? (
            // Dashboard Actions
            <>
              {/* Notifications */}
              <NotificationsDropdown />

              {/* Settings */}
              <Link href="/dashboard/settings">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isActive("/dashboard/settings")
                      ? "text-primary bg-primary/10 dark:bg-primary/20"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/10"
                  }`}
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              </Link>

              {/* User Menu */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/20 hover:bg-accent/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <span className="sr-only">Open user menu</span>
                  <User className="w-4 h-4 text-muted-foreground" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-card/80 backdrop-blur-md ring-1 ring-border focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/dashboard/profile"
                          className={`${
                            active ? "bg-accent/20" : ""
                          } block px-4 py-2 text-sm text-foreground hover:text-primary transition-colors duration-200`}
                        >
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/dashboard/settings"
                          className={`${
                            active ? "bg-accent/20" : ""
                          } block px-4 py-2 text-sm text-foreground hover:text-primary transition-colors duration-200`}
                        >
                          Settings
                        </Link>
                      )}
                    </Menu.Item>
                    <hr className="my-1 border-border" />
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            // TODO: Add logout logic here
                          }}
                          className={`${
                            active ? "bg-accent/20" : ""
                          } block w-full text-left px-4 py-2 text-sm text-foreground hover:text-red-600 transition-colors duration-200`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </>
          ) : (
            // Public Actions
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary hover:bg-accent/10"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-foreground shadow-lg font-medium">
                    Get Started Free
                  </Button>
                </motion.div>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent/10 transition"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <MenuIcon className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-card/80 backdrop-blur-md border-t border-border px-4 pb-4 pt-2 animate-fade-in-down">
          <div className="flex flex-col gap-3">
            {isDashboard ? (
              // Dashboard Mobile Menu
              <>
                {dashboardNavLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive(item.href)
                        ? "text-primary bg-primary/10 dark:bg-primary/20"
                        : "text-foreground hover:text-primary hover:bg-accent/10"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
                <hr className="my-2 border-border" />
                <Link
                  href="/dashboard/profile"
                  className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    // TODO: Add logout logic here
                    setMenuOpen(false);
                  }}
                  className="text-left text-foreground hover:text-red-600 transition-colors font-medium px-3 py-2"
                >
                  Sign out
                </button>
              </>
            ) : (
              // Public Mobile Menu
              <>
                {publicNavLinks.map((link) =>
                  link.external ? (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )
                )}
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow hover:from-secondary hover:to-primary transition-all mt-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
