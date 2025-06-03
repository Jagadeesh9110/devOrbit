"use client";

import {
  Bug,
  Code,
  GitMerge,
  Shield,
  BarChart2,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react"; // Added useEffect for potential parallax

export default function Home() {
  const features = [
    {
      icon: <Bug className="w-7 h-7 text-primary-600" />,
      title: "Issue Tracking",
      description:
        "Track bugs, features, and tasks with detailed descriptions, priorities, and status updates.",
    },
    {
      icon: <Code className="w-7 h-7 text-accent-500" />,
      title: "Real-time Collaboration",
      description:
        "Work together with your team in real-time on bug resolution.",
    },
    {
      icon: <GitMerge className="w-7 h-7 text-primary-600" />,
      title: "Seamless Integration",
      description:
        "Connect with GitHub, GitLab, and other version control systems.",
    },
    {
      icon: <Shield className="w-7 h-7 text-success-500" />,
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security with role-based access control and data protection.",
    },
    {
      icon: <BarChart2 className="w-7 h-7 text-primary-700" />,
      title: "Analytics & Reports",
      description:
        "Get insights into your project health with comprehensive analytics and customizable reports.",
    },
    {
      icon: <Clock className="w-7 h-7 text-accent-500" />,
      title: "Time Tracking",
      description:
        "Monitor time spent on issues and track project progress with detailed timelines.",
    },
    {
      icon: <CheckCircle className="w-7 h-7 text-primary-700" />,
      title: "Workflow Management",
      description:
        "Customize workflows to match your team's process with Kanban boards and automation.",
    },
  ];

  const stats = [
    { label: "Bugs Tracked", value: 12450 },
    { label: "Teams", value: 320 },
    { label: "Resolved Issues", value: 11800 },
    { label: "Active Users", value: 2100 },
  ];

  const AnimatedCounter = ({ value }: { value: number }) => {
    const [count, setCount] = useState(0);
    // Changed useState to useEffect for clarity and to avoid potential React warnings
    useEffect(() => {
      let start = 0;
      const end = value;
      if (start === end) return;
      let incrementTime = 20; // ms
      // Ensure step is at least 1 to prevent infinite loops for small values
      let step = Math.max(1, Math.ceil(end / (1000 / incrementTime))); // Aim for ~1 second animation
      const timer = setInterval(() => {
        start += step;
        if (start > end) start = end;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);
      return () => clearInterval(timer);
    }, [value]); // Added value to dependency array
    return <span aria-live="polite">{count.toLocaleString()}</span>; // Added aria-live for accessibility
  };

  // State for parallax effect (optional, can be expanded)
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-accent-500 to-white dark:from-primary-700 dark:via-accent-600 dark:to-slate-700 transition-colors duration-500 overflow-x-hidden">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "backOut" }}
              className="bg-white/90 dark:bg-slate-800/90 rounded-full p-4 shadow-lg backdrop-blur-sm"
            >
              <Bug
                size={52}
                className="text-primary-600 dark:text-primary-500"
              />
            </motion.div>
          </div>
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-slate-800 dark:text-white drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
          >
            Streamline Your Bug Tracking
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 text-slate-600 dark:text-slate-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
          >
            The most efficient way to track, manage, and resolve bugs in your
            development workflow.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
          >
            <Link href="/auth/login" passHref>
              <Button
                variant="primary"
                size="lg"
                className="shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Get Started
              </Button>
            </Link>
            <Link href="/auth/register" passHref>
              <Button
                variant="accent"
                size="lg"
                className="shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Try for Free
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 md:py-12">
        <motion.div
          className="container mx-auto px-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 bg-white/90 dark:bg-slate-800/90 rounded-xl shadow-lg backdrop-blur-md p-6 md:p-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center py-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-200"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            >
              <span className="text-2xl md:text-3xl font-bold text-primary-700 dark:text-accent-500">
                <AnimatedCounter value={stat.value} />
              </span>
              <span className="text-slate-600 dark:text-slate-300 text-sm mt-1 text-center">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-center mb-12 md:mb-16 text-slate-800 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Powerful Features
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-7 text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-primary-500 dark:hover:border-accent-500 focus-within:ring-2 focus-within:ring-primary-500 dark:focus-within:ring-accent-400 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 outline-none"
                whileHover={{ y: -8, scale: 1.03 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                tabIndex={0}
              >
                <div className="flex justify-center mb-4 text-primary-600 dark:text-accent-400">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 dark:from-primary-700 dark:via-accent-600 dark:to-primary-800 transition-all duration-500">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-4">
            Ready to streamline your bug tracking?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 dark:text-slate-200 max-w-2xl mx-auto mb-8">
            Join thousands of teams already using BugTracker Pro to ship better
            software faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" passHref>
              <Button
                variant="accent"
                size="lg"
                className="text-lg px-8 py-3 sm:py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-700 dark:focus:ring-offset-primary-800"
              >
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact" passHref>
              <Button
                variant="primary"
                size="lg"
                className="text-lg px-8 py-3 sm:py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Testimonials Carousel (optional, placeholder) */}
      {/*
      <section className="py-12 bg-gradient-to-r from-primary-600 to-accent-500">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center text-white mb-8">What Our Users Say</h3>
          <TestimonialsCarousel />
        </div>
      </section>
      */}
    </div>
  );
}
