"use client";

import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  FolderIcon,
  BugAntIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navigation = [
  { name: "Projects", href: "/dashboard/projects", icon: FolderIcon },
  { name: "Bugs", href: "/dashboard/bugs", icon: BugAntIcon },
  { name: "Team", href: "/dashboard/team", icon: UserGroupIcon },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: ChartBarIcon,
  },
];

export default function DashboardHeader() {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState(3);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BugAntIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
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
          </nav>

          {/* Right Side: Notifications, Settings & User Menu */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-full text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
              <BellIcon className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* Settings */}
            <Link href="/dashboard/settings">
              <button
                className={`p-2 rounded-full transition-all duration-200 ${
                  isActive("/dashboard/settings")
                    ? "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400"
                    : "text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
            </Link>

            {/* User Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="sr-only">Open user menu</span>
                <UserIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
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
          </div>
        </div>
      </div>
    </header>
  );
}
