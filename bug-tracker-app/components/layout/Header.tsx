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

const publicNavLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/#features" },
  { name: "Docs", href: "https://docs.bugtracker.com", external: true },
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
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-all">
      <nav className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href={isDashboard ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-bold text-primary-700 text-xl"
        >
          <Bug className="w-7 h-7 text-primary-600" />
          <span
            className={
              isDashboard
                ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                : ""
            }
          >
            {isDashboard ? "Dashboard" : "BugTracker"}
          </span>
        </Link>

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
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400"
                        : "text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                <button
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isActive("/dashboard/settings")
                      ? "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400"
                      : "text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Settings className="w-5 h-5" />
                </button>
              </Link>

              {/* User Menu */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span className="sr-only">Open user menu</span>
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
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
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 dark:ring-slate-700 focus:outline-none border border-slate-200 dark:border-slate-700">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/dashboard/profile"
                          className={`${
                            active ? "bg-slate-50 dark:bg-slate-700" : ""
                          } block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors duration-200`}
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
                            active ? "bg-slate-50 dark:bg-slate-700" : ""
                          } block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors duration-200`}
                        >
                          Settings
                        </Link>
                      )}
                    </Menu.Item>
                    <hr className="my-1 border-slate-200 dark:border-slate-700" />
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            // TODO: Add logout logic here
                          }}
                          className={`${
                            active ? "bg-slate-50 dark:bg-slate-700" : ""
                          } block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-red-600 transition-colors duration-200`}
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
            <Link
              href="/dashboard"
              className="ml-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 transition-all"
            >
              Dashboard
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-slate-800 transition"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 pb-4 pt-2 animate-fade-in-down">
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
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400"
                        : "text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
                <hr className="my-2 border-slate-200 dark:border-slate-700" />
                <Link
                  href="/dashboard/profile"
                  className="text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors font-medium px-3 py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors font-medium px-3 py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    // TODO: Add logout logic here
                    setMenuOpen(false);
                  }}
                  className="text-left text-slate-700 dark:text-slate-200 hover:text-red-600 transition-colors font-medium px-3 py-2"
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
                      className="text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors font-medium px-3 py-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-slate-700 dark:text-slate-200 hover:text-primary-600 transition-colors font-medium px-3 py-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )
                )}
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 transition-all mt-2"
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
