import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a short random invite code */
export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/** Debounce a function call */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Format a timestamp to a relative time string */
export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/** Format a timestamp to a readable date string */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Simple in-memory token bucket rate limiter */
export class RateLimiter {
  private tokens: Map<string, { count: number; resetAt: number }> = new Map();

  constructor(
    private maxRequests: number = 60,
    private windowMs: number = 60000
  ) {}

  /** Check if a key is rate limited. Returns true if allowed. */
  check(key: string): boolean {
    const now = Date.now();
    const entry = this.tokens.get(key);

    if (!entry || now > entry.resetAt) {
      this.tokens.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (entry.count < this.maxRequests) {
      entry.count++;
      return true;
    }

    return false;
  }
}

/** Global rate limiter instance for API routes */
export const apiRateLimiter = new RateLimiter(30, 60000);
