import { describe, it, expect } from "vitest";
import { cn, generateInviteCode, formatRelativeTime, formatDate, RateLimiter, debounce } from "@/lib/utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("should handle undefined", () => {
    expect(cn("base", undefined, null)).toBe("base");
  });
});

describe("generateInviteCode", () => {
  it("should generate a 6-char uppercase code", () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });

  it("should generate unique codes", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateInviteCode()));
    expect(codes.size).toBeGreaterThan(90);
  });
});

describe("formatRelativeTime", () => {
  it('should return "just now" for recent timestamps', () => {
    expect(formatRelativeTime(Date.now() - 5000)).toBe("just now");
  });

  it('should return "Xm ago" for minutes', () => {
    expect(formatRelativeTime(Date.now() - 120000)).toBe("2m ago");
  });

  it('should return "Xh ago" for hours', () => {
    expect(formatRelativeTime(Date.now() - 7200000)).toBe("2h ago");
  });
});

describe("formatDate", () => {
  it("should format a timestamp to a readable date", () => {
    const date = new Date("2026-01-15").getTime();
    const formatted = formatDate(date);
    expect(formatted).toContain("Jan");
    expect(formatted).toContain("15");
  });
});

describe("RateLimiter", () => {
  it("should allow requests under the limit", () => {
    const limiter = new RateLimiter(3, 60000);
    expect(limiter.check("user1")).toBe(true);
    expect(limiter.check("user1")).toBe(true);
    expect(limiter.check("user1")).toBe(true);
  });

  it("should block requests over the limit", () => {
    const limiter = new RateLimiter(2, 60000);
    limiter.check("user2");
    limiter.check("user2");
    expect(limiter.check("user2")).toBe(false);
  });

  it("should track different keys independently", () => {
    const limiter = new RateLimiter(1, 60000);
    expect(limiter.check("a")).toBe(true);
    expect(limiter.check("b")).toBe(true);
    expect(limiter.check("a")).toBe(false);
  });
});

describe("debounce", () => {
  it("should debounce function calls", async () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 50);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    await new Promise(r => setTimeout(r, 100));
    expect(count).toBe(1);
  });
});
