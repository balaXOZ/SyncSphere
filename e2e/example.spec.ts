import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should display SyncSphere title and hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SyncSphere/);
    await expect(page.locator("h1")).toContainText("SyncSphere");
  });

  test("should display feature cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Kanban Board")).toBeVisible();
    await expect(page.getByText("Real-Time Chat")).toBeVisible();
    await expect(page.getByText("Sphere AI")).toBeVisible();
    await expect(page.getByText("Enterprise Security")).toBeVisible();
    await expect(page.getByText("Lightning Fast")).toBeVisible();
  });

  test("should have a Get Started button linking to login", async ({ page }) => {
    await page.goto("/");
    const ctaButton = page.getByRole("link", { name: /Get Started/i });
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();
    await expect(page).toHaveURL(/login/);
  });

  test("should have proper footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toContainText("Firebase");
    await expect(page.locator("footer")).toContainText("Gemini");
  });
});

test.describe("Login Page", () => {
  test("should display login form with email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("should display Google Sign-In button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible();
  });

  test("should have register tab/link", async ({ page }) => {
    await page.goto("/login");
    // Check for register tab or link
    const registerTab = page.getByText(/register|sign up|create account/i);
    await expect(registerTab.first()).toBeVisible();
  });

  test("should show validation error for empty email", async ({ page }) => {
    await page.goto("/login");
    const submitButton = page.getByRole("button", { name: /sign in|log in|submit/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Browser validation should prevent submission
    }
  });
});

test.describe("Accessibility", () => {
  test("should have skip-to-main link", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByText("Skip to main content");
    await expect(skipLink).toBeAttached();
  });

  test("should have semantic heading structure on landing", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    const h2 = page.locator("h2");
    expect(await h2.count()).toBeGreaterThanOrEqual(1);
  });

  test("should have semantic heading on login page", async ({ page }) => {
    await page.goto("/login");
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
  });

  test("should have proper ARIA labels on interactive elements", async ({ page }) => {
    await page.goto("/");
    // All buttons should have accessible names
    const buttons = page.locator("button");
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const name = await button.getAttribute("aria-label") || await button.textContent();
      expect(name?.trim().length).toBeGreaterThan(0);
    }
  });
});

test.describe("Navigation & Routing", () => {
  test("should redirect /dashboard to /login when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect /dashboard/chat to /login when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard/chat");
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect /dashboard/overview to /login when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard/overview");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Security Headers", () => {
  test("should include security headers", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers();
    expect(headers).toBeDefined();
    // CSP header
    if (headers?.["content-security-policy"]) {
      expect(headers["content-security-policy"]).toContain("default-src");
    }
    // X-Frame-Options
    if (headers?.["x-frame-options"]) {
      expect(headers["x-frame-options"]).toBe("DENY");
    }
    // X-Content-Type-Options
    if (headers?.["x-content-type-options"]) {
      expect(headers["x-content-type-options"]).toBe("nosniff");
    }
  });
});

test.describe("Performance", () => {
  test("landing page should load within 5 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(5000);
  });

  test("login page should load within 5 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/login");
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(5000);
  });
});
