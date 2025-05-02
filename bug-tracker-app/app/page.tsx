"use client";

import { Bug, Code, GitMerge, Shield, BarChart2 } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Home() {
  const features = [
    {
      icon: <Code className="w-6 h-6 text-purple-600" />,
      title: "Real-time Collaboration",
      description:
        "Work together with your team in real-time on bug resolution.",
    },
    {
      icon: <GitMerge className="w-6 h-6 text-purple-600" />,
      title: "Seamless Integration",
      description:
        "Connect with GitHub, GitLab, and other version control systems.",
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      title: "Secure Platform",
      description: "Enterprise-grade security to protect your sensitive data.",
    },
    {
      icon: <BarChart2 className="w-6 h-6 text-purple-600" />,
      description: "Get insights into your team's performance and bug trends.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-700 to-purple-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Bug size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Streamline Your Bug Tracking
          </h1>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-purple-100">
            The most efficient way to track, manage, and resolve bugs in your
            development workflow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/login">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white/10"
              >
                Try for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
