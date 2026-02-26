import { test, expect } from "@playwright/test";

const MOCK_PICK = {
  _id: "65ba1234567890abcdef1234",
  alias: "Test_Node_Alpha",
  description: "High-fidelity registry entry",
  user: { fullName: "Admin User" },
  place: { name: "Central Hub" },
};

test.describe("Admin Registry: Protocol 2026-02-25", () => {
  test.beforeEach(async ({ page }) => {
    // 1. MOCK THE AUTH API RESPONSE
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: { role: "ADMIN", fullName: "Admin User" },
          token: "mock_protocol_token_2026",
        }),
      });
    });

    // 2. MOCK THE ADMIN PICKS API RESPONSE
    await page.route("**/api/admin/picks", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, picks: [MOCK_PICK] }),
      });
    });

    // 3. START AT LOGIN
    await page.goto("/login");

    // 4. EXECUTE LOGIN
    await page.getByTestId("login-email-input").fill("probs@gmail.com");
    await page.getByTestId("login-password-input").fill("password");

    await Promise.all([
      page.waitForURL("**/dashboard", { waitUntil: "networkidle" }),
      page.getByTestId("login-submit-button").click(),
    ]);

    // 5. ROUTE TO ADMIN REGISTRY
    await page.goto("/admin/picks", { waitUntil: "networkidle" });

    // 6. WAIT FOR LOADER & SYNC
    const loader = page.getByTestId("registry-loader");
    await loader.waitFor({ state: "hidden", timeout: 10000 });

    await expect(page.getByTestId("registry-table")).toBeVisible();
  });

  // --- VIEWPORT & INITIALIZATION ---
  test("01. Should render the Pick_Registry title", async ({ page }) => {
    await expect(page.getByTestId("page-header-title")).toContainText(
      /Pick_Registry/i,
    );
  });

  test("02. Should display the Protocol_2026-02-25 version badge", async ({
    page,
  }) => {
    await expect(page.getByTestId("protocol-version-tag")).toHaveText(
      "Protocol_2026-02-25",
    );
  });

  test("03. Should render the registry table container", async ({ page }) => {
    await expect(page.getByTestId("registry-table")).toBeVisible();
  });

  test("04. Should display the correct count in node count display", async ({
    page,
  }) => {
    await expect(page.getByTestId("node-count-display")).toHaveText("Nodes: 1");
  });

  test("05. Should verify existence of a specific registry row", async ({
    page,
  }) => {
    await expect(
      page.getByTestId(`registry-row-${MOCK_PICK._id}`),
    ).toBeVisible();
  });

  // --- SEARCH & DATA FILTERING ---
  test("06. Should allow typing in the search bar", async ({ page }) => {
    const input = page.getByTestId("registry-search-input");
    await input.fill("Alpha");
    await expect(input).toHaveValue("Alpha");
  });

  test("07. Should show empty state for non-matching searches", async ({
    page,
  }) => {
    const input = page.getByTestId("registry-search-input");
    await input.fill("xyz_unknown");
    await expect(page.getByTestId("empty-registry-state")).toBeVisible();
    await expect(page.getByTestId("node-count-display")).toHaveText("Nodes: 0");
  });

  test("08. Should display the truncated ID suffix correctly", async ({
    page,
  }) => {
    const truncatedId = MOCK_PICK._id.slice(-12);
    await expect(page.getByTestId("pick-id-suffix")).toContainText(truncatedId);
  });

  test("09. Should filter by Author name via Identity logic", async ({
    page,
  }) => {
    await page.getByTestId("registry-search-input").fill("Admin User");
    await expect(page.getByTestId("pick-author-name")).toHaveText("Admin User");
  });

  test("10. Should clear search and restore node visibility", async ({
    page,
  }) => {
    const input = page.getByTestId("registry-search-input");
    await input.fill("none");
    await input.clear();
    await expect(
      page.getByTestId(`registry-row-${MOCK_PICK._id}`),
    ).toBeVisible();
  });

  // --- ACTIONS & PROTOCOLS (UPDATED FOR CUSTOM MODAL) ---
  test("11. Should verify external link node configuration", async ({
    page,
  }) => {
    const link = page.getByTestId("external-link-node");
    await expect(link).toHaveAttribute(
      "href",
      `/dashboard/picks/${MOCK_PICK._id}`,
    );
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test('12. Should trigger "Execute_Delete?" modal on protocol button click', async ({
    page,
  }) => {
    // Click the trash icon
    await page.getByTestId("delete-protocol-button").click();

    // Instead of dialog, check for the custom modal container
    const modal = page.getByTestId("delete-confirmation-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Execute_Delete/i);
  });

  test("13. Should remove row from UI on successful delete", async ({
    page,
  }) => {
    // Overwrite route for the specific DELETE action
    await page.route(`**/api/picks/${MOCK_PICK._id}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    // 1. Open Modal
    await page.getByTestId("delete-protocol-button").click();

    // 2. Click the Confirm button inside the modal
    await page.getByTestId("confirm-delete-button").click();

    // 3. Verify the row is purged/deleted from UI
    await expect(
      page.getByTestId(`registry-row-${MOCK_PICK._id}`),
    ).not.toBeVisible();
    await expect(page.getByTestId("node-count-display")).toHaveText("Nodes: 0");
  });

  test("14. Should show pending spinner during delete action", async ({
    page,
  }) => {
    // Create a delayed response to ensure the spinner is visible
    await page.route(`**/api/picks/${MOCK_PICK._id}`, async (route) => {
      await new Promise((f) => setTimeout(f, 1000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true }),
      });
    });

    await page.getByTestId("delete-protocol-button").click();
    await page.getByTestId("confirm-delete-button").click();

    // Look for the spinner inside the confirm button
    const spinner = page
      .getByTestId("confirm-delete-button")
      .locator("svg.animate-spin");
    await expect(spinner).toBeVisible();
  });

  test("15. Should disable modal actions while isPending is active", async ({
    page,
  }) => {
    await page.route(`**/api/picks/${MOCK_PICK._id}`, async (route) => {
      await new Promise((f) => setTimeout(f, 500));
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true }),
      });
    });

    await page.getByTestId("delete-protocol-button").click();
    await page.getByTestId("confirm-delete-button").click();

    // Verify confirm button becomes disabled
    await expect(page.getByTestId("confirm-delete-button")).toBeDisabled();
    // Verify cancel button becomes disabled
    await expect(page.getByText("Cancel", { exact: true })).toBeDisabled();
  });

  // --- INTERFACE STABILITY ---
  test("16. Should display the Pick Alias in registry", async ({ page }) => {
    await expect(page.getByTestId("pick-alias-text")).toHaveText(
      MOCK_PICK.alias,
    );
  });

  test("17. Should display the Registry Location correctly", async ({
    page,
  }) => {
    await expect(page.getByTestId("pick-location-name")).toHaveText(
      MOCK_PICK.place.name,
    );
  });

  test("18. Should maintain registry container bounds", async ({ page }) => {
    const container = page.getByTestId("admin-picks-container");
    const box = await container.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(1600);
  });

  test("19. Should verify table header labels", async ({ page }) => {
    const table = page.getByTestId("registry-table");
    await expect(
      table.locator("th").filter({ hasText: "Registry_Location" }),
    ).toBeVisible();
  });


  test("20. Should abort delete protocol and preserve node on cancel", async ({
    page,
  }) => {
    // 1. Open the Delete Confirmation Modal
    await page.getByTestId("delete-protocol-button").click();
    
    const modal = page.getByTestId("delete-confirmation-modal");
    await expect(modal).toBeVisible();

    // 2. Click the Cancel button
    // Assuming you have data-testid="cancel-delete-button" or selecting by text
    const cancelButton = page.getByRole("button", { name: /Cancel/i });
    await cancelButton.click();

    // 3. Verify the modal is closed
    await expect(modal).not.toBeVisible();

    // 4. PROTOCOL_CHECK: Verify the row still exists in the registry
    const registryRow = page.getByTestId(`registry-row-${MOCK_PICK._id}`);
    await expect(registryRow).toBeVisible();
    
    // 5. Verify node count remains unchanged
    await expect(page.getByTestId("node-count-display")).toHaveText("Nodes: 1");
  });
});
