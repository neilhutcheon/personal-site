import { expect, test, type Page } from "@playwright/test";
import { noteNameFor } from "../../src/lib/trombone";

test.describe("climbing wall", () => {
  test("hold buttons climb and downclimb", async ({ page }) => {
    await page.goto("/#climbing");
    const moves = page.locator("#climbing dt", { hasText: "Moves" }).locator("+ dd");
    await expect(moves).toHaveText("0");

    const holds = page.locator('[aria-label="Holds within reach"]');
    const first = holds.getByRole("button").first();
    const name = (await first.textContent())!.trim();
    await first.click();

    await expect(moves).toHaveText("1");
    await expect(page.locator("#climbing [aria-live=polite]")).toContainText(name);

    await page.locator("#climbing").getByRole("button", { name: "Downclimb" }).click();
    await expect(moves).toHaveText("0");
  });

  test("reaching the top hold sends the route with a grade", async ({ page }) => {
    await page.goto("/#climbing");
    const holds = page.locator('[aria-label="Holds within reach"]').getByRole("button");
    const status = page.locator("#climbing [aria-live=polite]");
    // Greedy: always take the highest hold offered (the list is sorted lowest first).
    for (let i = 0; i < 20 && !(await status.textContent())?.startsWith("Sent it"); i++) {
      await holds.last().click();
    }
    await expect(status).toHaveText(/^Sent it! \d+ moves, graded V\d+\./);
  });
});

/**
 * Counts WebGL draw calls so tests can tell whether the three.js loop is rendering.
 * Installed before the page's scripts run, so it sees every frame.
 */
async function countDraws(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __draws: number };
    w.__draws = 0;
    for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      for (const method of ["drawElements", "drawArrays"] as const) {
        const original = proto[method] as (...args: unknown[]) => void;
        (proto as unknown as Record<string, unknown>)[method] = function (this: unknown, ...args: unknown[]) {
          w.__draws++;
          return original.apply(this, args);
        };
      }
    }
  });
  return () => page.evaluate(() => (window as unknown as { __draws: number }).__draws);
}

test.describe("climbing wall rendering", () => {
  // Regression: the render loop used to run forever, even scrolled away, and could freeze Chrome.
  test("only renders while the wall is on screen", async ({ page }) => {
    const draws = await countDraws(page);
    await page.goto("/");
    const canvas = page.locator("#climbing canvas");

    await canvas.scrollIntoViewIfNeeded();
    await expect(canvas).toBeVisible();
    await expect.poll(draws, { message: "renders while on screen" }).toBeGreaterThan(0);

    await page.locator("#contact").scrollIntoViewIfNeeded();
    // Give the IntersectionObserver a moment to fire and the in-flight frame to finish.
    await page.waitForTimeout(500);
    const paused = await draws();
    await page.waitForTimeout(1500);
    expect(await draws(), "no draws while scrolled away").toBe(paused);

    await canvas.scrollIntoViewIfNeeded();
    await expect.poll(draws, { message: "resumes when scrolled back" }).toBeGreaterThan(paused);
  });

  test("does not render before it is scrolled into view", async ({ page }) => {
    const draws = await countDraws(page);
    await page.goto("/");
    // The wall mounts on load, far below the fold; wait long enough for three.js to load.
    await page.waitForTimeout(2000);
    expect(await draws()).toBe(0);
  });
});

test.describe("disc golf", () => {
  // Reason: with reduced motion the throw lands instantly, so the test doesn't wait on the flight animation.
  test.use({ reducedMotion: "reduce" });

  test("throwing counts a stroke and reset clears it", async ({ page }) => {
    await page.goto("/#disc-golf");
    const hole = page.locator("#disc-golf");
    const scorecard = hole.getByText(/^Hole \d+ · Par \d+ · Stroke \d+/);
    await expect(scorecard).toContainText("Stroke 0");

    await hole.getByRole("button", { name: "Throw", exact: true }).click();
    // An out-of-bounds throw adds a penalty stroke, so either 1 or 2 is valid.
    await expect(scorecard).toContainText(/Stroke [12]/);
    await expect(hole.locator("[aria-live=polite]")).not.toBeEmpty();

    await hole.getByRole("button", { name: "Reset scorecard" }).click();
    await expect(scorecard).toContainText("Stroke 0");
  });
});

test.describe("trombone", () => {
  test("number keys move the slide and arrows change the partial", async ({ page }) => {
    await page.goto("/#trombone");
    const horn = page.getByLabel(/^Playable trombone/);
    const note = horn.locator("[aria-live=polite]");
    const position = horn.locator("dt", { hasText: "Position" }).locator("+ dd");
    const partials = horn.getByRole("radiogroup", { name: "Partial" });

    await expect(note).toHaveText(noteNameFor(3, 1));
    await expect(partials.getByRole("radio", { checked: true })).toHaveText("3rd partial");

    await horn.focus();
    await page.keyboard.press("7");
    await expect(position).toHaveText("7.0");
    await expect(note).toHaveText(noteNameFor(3, 7));

    await page.keyboard.press("ArrowUp");
    await expect(partials.getByRole("radio", { checked: true })).toHaveText("4th partial");
    await expect(note).toHaveText(noteNameFor(4, 7));
  });
});
