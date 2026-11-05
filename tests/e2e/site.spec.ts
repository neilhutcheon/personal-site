import { expect, test } from "@playwright/test";
import { profile, projects, siteUrl } from "../../src/content/resume";

test.describe("page", () => {
  test("loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/");
    await expect(page).toHaveTitle(/Neil Hutcheon/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Neil");

    // Scroll the whole page so every lazily revealed section (and the three.js import) runs.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    });
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test("shows availability near the top", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#top").getByText(profile.availability)).toBeVisible();
  });

  test("page text reads cleanly for crawlers and screen readers", async ({ page }) => {
    await page.goto("/");
    const text = (await page.locator("main").textContent()) ?? "";

    // The rotating hero phrase used to duplicate itself with no space between copies.
    expect(text).toContain("I build production web apps, data and media pipelines");
    expect(text).not.toMatch(/web apps\.\s*Production web apps/i);

    // Decorative card numbers ("01") used to leak into the stat labels.
    expect(text).toContain("5+ years shipping production software");
    expect(text).not.toMatch(/\b0\d\s*years shipping/);
    expect(text.match(/years shipping production software/g)).toHaveLength(1);
  });

  test("every in-page link points at an element that exists", async ({ page }) => {
    await page.goto("/");
    const targets = await page.locator('a[href^="#"]').evaluateAll((links) =>
      [...new Set(links.map((link) => link.getAttribute("href")!.slice(1)))].filter(Boolean),
    );
    expect(targets.length).toBeGreaterThan(0);
    for (const id of targets) {
      await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1);
    }
  });

  test("has no horizontal scroll", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("navigation", () => {
  test("nav links scroll to their sections", async ({ page, isMobile }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    // Reason: on phones some links are hidden to fit, so only test the ones that are shown.
    const labels = isMobile ? ["Work", "Experience", "Contact"] : ["About", "Work", "Experience", "Skills", "Interests", "Contact"];
    for (const label of labels) {
      const link = nav.getByRole("link", { name: label, exact: true });
      const id = (await link.getAttribute("href"))!.slice(1);
      await link.click();
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });
});

test.describe("contact and profile links", () => {
  test("resume downloads as a PDF", async ({ page, request }) => {
    await page.goto("/");
    const href = await page.locator("#top").getByRole("link", { name: /resume/i }).getAttribute("href");
    expect(href).toBe(profile.resume);
    const response = await request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
  });

  test("GitHub and LinkedIn open in a new tab", async ({ page }) => {
    await page.goto("/");
    for (const [name, url] of [
      ["GitHub", profile.github],
      ["LinkedIn", profile.linkedin],
    ]) {
      const link = page.locator("#top").getByRole("link", { name: new RegExp(name) });
      await expect(link).toHaveAttribute("href", url);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noreferrer/);
    }
  });

  test("email link and copy button", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/#contact");
    const contact = page.locator("#contact");
    await expect(contact.getByRole("link", { name: profile.email })).toHaveAttribute("href", `mailto:${profile.email}`);

    await contact.getByRole("button", { name: "Copy email" }).click();
    await expect(contact.getByRole("button", { name: "Copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(profile.email);
  });
});

test.describe("projects", () => {
  test("renders a write-up for every project", async ({ page }) => {
    await page.goto("/#projects");
    for (const project of projects) {
      const card = page.locator(`article#${project.id}`);
      await expect(card.getByRole("heading", { name: project.name })).toBeVisible();
      for (const tech of project.stack) {
        await expect(card.getByRole("list", { name: "Stack" }).getByText(tech, { exact: true })).toBeAttached();
      }
    }
  });

  test("FERPA pipeline diagram marks where footage is de-identified", async ({ page }) => {
    await page.goto("/#umich");
    const steps = page.getByRole("list", { name: "Classroom video pipeline steps" }).getByRole("listitem");
    await expect(steps.first()).toContainText("Upload");
    await expect(steps.first()).toContainText("still identifiable");
    await expect(steps.last()).toContainText("de-identified");
  });
});

test.describe("social preview", () => {
  test("Open Graph and Twitter tags use absolute URLs", async ({ page }) => {
    await page.goto("/");
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toMatch(new RegExp(`^${siteUrl}/opengraph-image`));
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", siteUrl);
  });

  test("OG image is a 1200x630 PNG", async ({ request }) => {
    const response = await request.get("/opengraph-image");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
    const png = await response.body();
    // PNG IHDR: width and height are big-endian uint32s at bytes 16 and 20.
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("hero phrase stops rotating", async ({ page }) => {
    await page.goto("/");
    const phrase = page.locator("#top [data-text]");
    const first = await phrase.getAttribute("data-text");
    await page.waitForTimeout(3000);
    await expect(phrase).toHaveAttribute("data-text", first!);
  });
});
