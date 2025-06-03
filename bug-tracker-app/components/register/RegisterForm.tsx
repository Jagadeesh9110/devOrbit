import React, { useState, useEffect } from "react"; // Added useEffect
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Separator } from "@/components/ui/Separator";
import { Checkbox } from "@/components/ui/Checkbox";
import { Mail, Lock, User, ArrowRight, Github } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { GoogleCredentialResponse } from "../../types/google";

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // Added useSearchParams
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Developer",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    terms: "", // Added terms to errors state
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // useEffect to clear submitError when terms are agreed to, if it was the cause
  useEffect(() => {
    if (
      agreeToTerms &&
      submitError === "You must agree to the terms and privacy policy"
    ) {
      setSubmitError("");
    }
  }, [agreeToTerms, submitError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (submitError) setSubmitError("");
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
      isValid = false;
    }

    if (!agreeToTerms) {
      setSubmitError("You must agree to the terms and privacy policy");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          // termsAccepted: agreeToTerms, // Removed as it's not sent to backend, handled by agreeToTerms state
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/auth/login?registered=true");
      } else {
        setSubmitError(data.message || "Registration failed");
      }
    } catch (error) {
      setSubmitError("An error occurred during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignup = async (provider: string) => {
    if (!agreeToTerms) {
      // Changed from formData.termsAccepted to agreeToTerms
      setErrors((prevErrors) => ({
        ...prevErrors,
        terms: "You must accept the terms and conditions to sign up.",
      }));
      // Also set submitError to provide a more visible error message
      setSubmitError(
        "You must agree to the terms and privacy policy before signing up with a social account."
      );
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");

    const from = searchParams.get("from") || "/dashboard";
    const callbackUrl = `${
      window.location.origin
    }/auth/callback?provider=${provider}&from=${encodeURIComponent(from)}`;

    if (provider === "google") {
      router.push(
        `/api/auth/google?callbackUrl=${encodeURIComponent(callbackUrl)}&role=${
          formData.role
        }`
      );
    } else if (provider === "github") {
      router.push(
        `/api/auth/github?callbackUrl=${encodeURIComponent(callbackUrl)}&role=${
          formData.role
        }`
      );
    } else {
      console.warn(`No handler for provider: ${provider}`);
      setSubmitError(`Signup with ${provider} is not supported yet.`);
      setIsSubmitting(false);
    }
    // No finally block needed to set isSubmitting to false here, as the page will redirect.
  };

  return (
    <Card className="max-w-lg mx-auto p-6 shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign up</CardTitle>
        <CardDescription className="text-center">
          Create your account to start tracking bugs effectively
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => handleSocialSignup("google")}
            disabled={isSubmitting}
          >
            <Mail className="h-4 w-4 mr-2" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialSignup("github")}
            disabled={isSubmitting}
          >
            <Github className="h-4 w-4 mr-2" />
            GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              icon={<User size={16} />}
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              icon={<Mail size={16} />}
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Developer">Developer</SelectItem>
                <SelectItem value="Tester">Tester</SelectItem>
                <SelectItem value="Project Manager">Project Manager</SelectItem>
                <SelectItem value="Team Manager">Team Manager</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600 mt-1">{errors.role}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              icon={<Lock size={16} />}
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              icon={<Lock size={16} />}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(Boolean(checked))}
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the{" "}
              <Link href="#" className="underline text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline text-primary">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
