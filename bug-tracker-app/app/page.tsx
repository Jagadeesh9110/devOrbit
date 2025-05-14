"use client";

import { Bug, Code, GitMerge, Shield, BarChart2 } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const features = [
    {
      icon: <Code className="w-7 h-7 text-primary-600" />,
      title: "Real-time Collaboration",
      description:
        "Work together with your team in real-time on bug resolution.",
    },
    {
      icon: <GitMerge className="w-7 h-7 text-accent-500" />,
      title: "Seamless Integration",
      description:
        "Connect with GitHub, GitLab, and other version control systems.",
    },
    {
      icon: <Shield className="w-7 h-7 text-success-500" />,
      title: "Secure Platform",
      description: "Enterprise-grade security to protect your sensitive data.",
    },
    {
      icon: <BarChart2 className="w-7 h-7 text-primary-700" />,
      title: "Insightful Analytics",
      description: "Get insights into your team's performance and bug trends.",
    },
  ];

  // Example stats (could be fetched from API)
  const stats = [
    { label: "Bugs Tracked", value: 12450 },
    { label: "Teams", value: 320 },
    { label: "Resolved Issues", value: 11800 },
    { label: "Active Users", value: 2100 },
  ];

  // Animated counter for stats
  const AnimatedCounter = ({ value }: { value: number }) => {
    const [count, setCount] = useState(0);
    useState(() => {
      let start = 0;
      const end = value;
      if (start === end) return;
      let incrementTime = 20;
      let step = Math.ceil(end / 50);
      const timer = setInterval(() => {
        start += step;
        if (start > end) start = end;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);
      return () => clearInterval(timer);
    });
    return <span>{count.toLocaleString()}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-accent-500 to-white dark:from-primary-700 dark:via-accent-600 dark:to-slate-700 transition-colors duration-500">
      {/* Hero Section */}
      <section className="py-20">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white/80 rounded-full p-4 shadow-lg"
            >
              <Bug size={52} className="text-primary-600" />
            </motion.div>
          </div>
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-800 dark:text-white drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Streamline Your Bug Tracking
          </motion.h1>
          <motion.p
            className="text-xl max-w-2xl mx-auto mb-8 text-slate-600 dark:text-slate-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            The most efficient way to track, manage, and resolve bugs in your
            development workflow.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <Link href="/auth/login">
              <Button
                variant="primary"
                size="lg"
                className="shadow-xl hover:shadow-2xl"
              >
                Get Started
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                variant="accent"
                size="lg"
                className="shadow-xl hover:shadow-2xl"
              >
                Try for Free
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="py-6">
        <motion.div
          className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/80 dark:bg-slate-800 rounded-xl shadow-lg backdrop-blur-md"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center py-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              <span className="text-2xl md:text-3xl font-bold text-primary-700 dark:text-accent-500">
                <AnimatedCounter value={stat.value} />
              </span>
              <span className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800 dark:text-white">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-slate-900 rounded-xl p-7 text-center shadow-md hover:shadow-xl transition-shadow cursor-pointer border border-transparent hover:border-primary-600 dark:hover:border-accent-500"
                whileHover={{ y: -8, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
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
