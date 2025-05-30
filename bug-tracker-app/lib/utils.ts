import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TokenPayload } from "./auth";

/**
 * Combines multiple class names using clsx and tailwind-merge
 * for optimal Tailwind CSS class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility to safely parse JWT token payload (client-side only)
 */
export function parseJwtPayload(token: string): TokenPayload | null {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Checks if token is expired (client-side check)
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Formats date to readable string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  if (typeof date === "string") date = new Date(date);
  return date.toLocaleDateString(undefined, options);
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generates a random string for temporary IDs or codes
 */
export function generateRandomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

/**
 * Safely accesses nested object properties
 */
export function getSafe<T>(
  obj: any,
  path: string,
  defaultValue?: T
): T | undefined {
  return path
    .split(".")
    .reduce(
      (acc, part) =>
        acc && acc[part] !== undefined ? acc[part] : defaultValue,
      obj
    );
}

/**
 * Handles fetch errors consistently
 */
export async function handleFetchResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
}

/**
 * Creates a delay promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Type guard for Error objects
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Handles authentication errors consistently
 */
export function handleAuthError(error: unknown): { message: string } {
  if (isError(error)) {
    console.error("Auth error:", error.message);
    return { message: error.message };
  }
  console.error("Unknown auth error occurred");
  return { message: "Authentication failed" };
}

/**
 * Extracts error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}
