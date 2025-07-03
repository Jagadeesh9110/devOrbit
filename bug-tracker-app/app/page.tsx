"use client";

import {
  Bug,
  Code,
  GitMerge,
  Shield,
  BarChart2,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  Brain,
  Rocket,
  Star,
  Play,
  LogIn,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    const fetchStatsAndTestimonials = async () => {
      try {
        const [statsRes, testimonialsRes] = await Promise.all([
          fetch("/api/landing"),
          fetch("/api/landing/testimonials"),
        ]);

        if (statsRes.ok && testimonialsRes.ok) {
          const statsData = await statsRes.json();
          const testimonialData = await testimonialsRes.json();

          const statIcons: Record<string, any> = {
            "Bugs Tracked": CheckCircle,
            Teams: Users,
            "Resolved Issues": CheckCircle,
            "Active Users": Users,
          };

          const formattedStats = [
            {
              label: "Bugs Tracked",
              value: statsData.stats.bugsTracked,
              icon: statIcons["Bugs Tracked"],
            },
            {
              label: "Teams",
              value: statsData.stats.teams,
              icon: statIcons["Teams"],
            },
            {
              label: "Resolved Issues",
              value: statsData.stats.resolvedIssues,
              icon: statIcons["Resolved Issues"],
            },
            {
              label: "Active Users",
              value: statsData.stats.activeUsers,
              icon: statIcons["Active Users"],
            },
          ];

          setStats(formattedStats);
          setTestimonials(testimonialData.testimonials);
        } else {
          console.error("Failed to fetch stats or testimonials");
        }
      } catch (error) {
        console.error("Error loading landing data:", error);
      }
    };

    fetchStatsAndTestimonials();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/auth/register");
    }
  };

  const handleLogin = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  };

  const handleDemo = () => {
    // For demo, we can either show a demo video or redirect to a demo page
    // You can implement this based on your requirements
    console.log("Demo requested");
  };

  const features = [
    {
      icon: <Bug className="w-7 h-7 text-primary" />,
      title: "Issue Tracking",
      description:
        "Track bugs, features, and tasks with detailed descriptions, priorities, and status updates.",
    },
    {
      icon: <Code className="w-7 h-7 text-secondary" />,
      title: "Real-time Collaboration",
      description:
        "Work together with your team in real-time on bug resolution.",
    },
    {
      icon: <GitMerge className="w-7 h-7 text-primary" />,
      title: "Seamless Integration",
      description:
        "Connect with GitHub, GitLab, and other version control systems.",
    },
    {
      icon: <Shield className="w-7 h-7 text-accent" />,
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security with role-based access control and data protection.",
    },
    {
      icon: <BarChart2 className="w-7 h-7 text-primary" />,
      title: "Analytics & Reports",
      description:
        "Get insights into your project health with comprehensive analytics and customizable reports.",
    },
    {
      icon: <Clock className="w-7 h-7 text-secondary" />,
      title: "Time Tracking",
      description:
        "Monitor time spent on issues and track project progress with detailed timelines.",
    },
    {
      icon: <CheckCircle className="w-7 h-7 text-accent" />,
      title: "Workflow Management",
      description:
        "Customize workflows to match your team's process with Kanban boards and automation.",
    },
  ];

  interface WorkflowStep {
    step: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    image: string;
  }

  interface WorkflowStepImageProps {
    step: WorkflowStep;
  }

  const workflowSteps: WorkflowStep[] = [
    {
      step: "01",
      title: "Intelligent Detection",
      description:
        "AI automatically captures, categorizes, and prioritizes bugs from multiple sources.",
      icon: Brain,
      image: "/devOrbit-I.jpeg",
    },
    {
      step: "02",
      title: "Smart Assignment",
      description:
        "Machine learning assigns bugs to the most suitable developer based on expertise and workload.",
      icon: Users,
      image: "/devOrbit-II.jpeg",
    },
    {
      step: "03",
      title: "Collaborative Resolution",
      description:
        "Real-time collaboration with live code sharing and AI-powered solution recommendations.",
      icon: Zap,
      image: "/devOrbit-III.jpeg",
    },
  ];

  const WorkflowStepImage: React.FC<WorkflowStepImageProps> = ({ step }) => {
    const [imageError, setImageError] = useState<boolean>(false);

    return (
      <motion.div
        className="flex-1 relative group"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-sm">
          {!imageError ? (
            <img
              src={step.image}
              alt={step.title}
              className="w-full h-64 object-cover transition-opacity duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-t from-foreground/20 to-transparent flex items-center justify-center">
              <div className="text-center">
                <step.icon className="w-16 h-16 text-primary/50 mb-4 mx-auto" />
                <p className="text-muted-foreground text-sm">
                  Image not available
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const AnimatedCounter = ({ value }: { value: number }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      const end = value;
      if (start === end) return;
      let incrementTime = 20;
      let step = Math.max(1, Math.ceil(end / (1000 / incrementTime)));
      const timer = setInterval(() => {
        start += step;
        if (start > end) start = end;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);
      return () => clearInterval(timer);
    }, [value]);
    return <span aria-live="polite">{count.toLocaleString()}</span>;
  };

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-primary to-secondary rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-secondary to-primary rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-secondary rounded-full opacity-20"
            style={{ left: `${15 + i * 12}%`, top: `${8 + i * 10}%` }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              scale: [0.5, 1, 0.5],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 relative">
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-secondary/10 border border-border rounded-full px-6 py-3 mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">
              AI-Powered Bug Intelligence
            </span>
            <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0 font-medium">
              Beta
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative mb-8"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-3xl opacity-20 scale-150"
              animate={{ scale: [1.5, 1.7, 1.5], opacity: [0.2, 0.3, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="relative w-24 h-24 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Bug className="w-12 h-12 text-primary-foreground" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              devOrbit
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Bug Intelligence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Experience the future of bug tracking with AI-powered insights,
            predictive analytics, and seamless team collaboration that adapts to
            your development workflow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <Button
                size="lg"
                onClick={handleGetStarted}
                disabled={isLoading}
                className="relative bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-foreground border-0 px-8 py-6 text-lg shadow-2xl font-medium disabled:opacity-50"
              >
                {isLoading ? (
                  "Loading..."
                ) : isAuthenticated ? (
                  <>
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Start Free Trial
                    <UserPlus className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="outline"
                onClick={isAuthenticated ? handleGetStarted : handleLogin}
                disabled={isLoading}
                className="border-accent text-foreground hover:bg-accent/10 px-8 py-6 text-lg backdrop-blur-sm disabled:opacity-50"
              >
                {isAuthenticated ? (
                  <>
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Dashboard
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl blur group-hover:blur-lg transition-all duration-300"></div>
                <Card className="relative bg-card/60 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-primary transition-all duration-300 shadow-lg">
                  <CardContent className="p-0 text-center">
                    <stat.icon className="w-6 h-6 text-primary mb-2 mx-auto" />
                    <div className="text-3xl font-bold text-foreground mb-1">
                      <AnimatedCounter value={stat.value} />
                      {stat.value > 1000 ? "K" : "+"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-center mb-12 md:mb-16 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Features
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-card/60 backdrop-blur-sm rounded-xl p-6 sm:p-7 text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-border hover:border-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 outline-none"
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
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="py-20 px-6 relative bg-gradient-to-r from-primary/5 to-secondary/5"
      >
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              How devOrbit
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}
                Works
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience intelligent bug tracking that revolutionizes your
              development workflow.
            </p>
          </motion.div>

          <div className="space-y-32">
            {workflowSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`flex flex-col ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } items-center gap-12`}
              >
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {step.step}
                    </motion.div>
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <WorkflowStepImage step={step} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 px-6 relative bg-gradient-to-r from-primary/5 to-secondary/5"
      >
        <motion.div style={{ y: y2 }} className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              Loved by
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}
                Developers
              </span>
            </h2>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                >
                  <Star className="w-6 h-6 text-primary fill-current" />
                </motion.div>
              ))}
              <span className="text-muted-foreground ml-2 text-lg">
                4.9/5 from 1,400+ teams
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                whileHover={{ y: -8, rotateY: 5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur group-hover:blur-lg transition-all duration-300"></div>
                <Card className="relative bg-card/60 border-border hover:border-primary backdrop-blur-sm transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star
                          key={j}
                          className="w-4 h-4 text-primary fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-foreground mb-6 leading-relaxed text-lg">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                        {testimonial.author
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="text-foreground font-medium text-lg">
                          {testimonial.author}
                        </div>
                        <div className="text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-3xl opacity-15"></div>
            <Card className="relative border-0 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
              <div className="bg-card/40 rounded-3xl p-12 md:p-16 text-center border border-border">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="mb-8"
                >
                  <motion.div
                    animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Rocket className="w-16 h-16 mx-auto text-primary mb-6" />
                  </motion.div>
                </motion.div>
                <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                  Ready to Squash
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {" "}
                    Bugs?
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                  Join thousands of teams revolutionizing their development
                  process with AI-powered bug tracking.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <Button
                      size="lg"
                      onClick={handleGetStarted}
                      disabled={isLoading}
                      className="relative bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-foreground border-0 px-8 py-6 text-lg shadow-2xl font-medium disabled:opacity-50"
                    >
                      {isAuthenticated
                        ? "Go to Dashboard"
                        : "Start Your Free Trial"}
                      <Zap className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleDemo}
                      className="border-accent text-foreground hover:bg-accent/10 px-8 py-6 text-lg backdrop-blur-sm"
                    >
                      Schedule Demo
                      <Play className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </div>
                <p className="text-sm text-muted-foreground mt-6">
                  {isAuthenticated
                    ? "Welcome back! Access your dashboard anytime."
                    : "No credit card required • 14-day free trial • Cancel anytime"}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
