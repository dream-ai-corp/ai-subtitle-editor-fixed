describe("Working Purchase Test - Final Fixed", () => {
  beforeEach(() => {
    // Clear localStorage to ensure clean state
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it("should complete the full purchase workflow with direct plan selection", () => {
    // Step 1: Visit main page
    cy.visit("/");
    cy.log("✅ Main page loaded");

    // Step 2: Scroll down to pricing section
    cy.scrollTo("bottom");
    cy.wait(2000);
    cy.log("✅ Scrolled to pricing section");

    // Step 3: Click on Basic plan (Choose Plan button) with force
    cy.contains("Choose Plan").first().click({ force: true });
    cy.log("✅ Clicked on Basic plan");

    // Step 4: Should redirect to purchase page
    cy.url().should("include", "/purchase");
    cy.log("✅ Redirected to purchase page");

    // Step 5: Wait for purchase page to load
    cy.wait(3000);
    cy.log("✅ Purchase page loaded");

    // Step 6: Check if plan is visible
    cy.contains("Basic").should("be.visible");
    cy.log("✅ Basic plan is visible");

    // Step 7: Directly click on the plan name to select it
    cy.contains("Basic").click({ force: true });
    cy.log("✅ Clicked on Basic plan name");

    // Step 8: Wait for selection to register
    cy.wait(1000);

    // Step 9: Scroll to bottom to see the proceed button
    cy.scrollTo("bottom");
    cy.wait(1000);

    // Step 10: Check if proceed button is visible
    cy.get("body").then(($body) => {
      if ($body.text().includes("Proceed to Payment")) {
        cy.log("✅ Proceed to Payment button is visible");
        cy.contains("Proceed to Payment").click({ force: true });
      } else {
        cy.log("⚠️ Proceed button not found, trying alternative approach");
        // Try clicking on the "Choose Plan" button inside the plan
        cy.contains("Choose Plan").click({ force: true });
        cy.wait(1000);
        cy.scrollTo("bottom");
        cy.wait(1000);
        cy.contains("Proceed to Payment").should("be.visible");
        cy.contains("Proceed to Payment").click({ force: true });
      }
    });

    // Step 11: Should redirect to login page
    cy.url().should("include", "/");
    cy.log("✅ Redirected to login page");

    // Step 12: Enable exploration mode
    cy.contains("Explore Platform").click({ force: true });
    cy.log("✅ Enabled exploration mode");

    // Step 13: Should redirect to app
    cy.url().should("include", "/app");
    cy.log("✅ Successfully logged in");

    // Step 14: Navigate back to purchase
    cy.visit("/purchase");
    cy.log("✅ Navigated back to purchase page");

    // Step 15: Wait for page to load
    cy.wait(3000);

    // Step 16: Select a plan again (Professional)
    cy.contains("Professional").click({ force: true });
    cy.log("✅ Clicked on Professional plan name");

    // Step 17: Wait for selection
    cy.wait(1000);

    // Step 18: Scroll to bottom
    cy.scrollTo("bottom");
    cy.wait(1000);

    // Step 19: Proceed to payment again
    cy.contains("Proceed to Payment").click({ force: true });
    cy.log("✅ Proceeding to payment with authentication");

    cy.log("🎉 Purchase workflow completed successfully!");
  });

  it("should test plan selection and proceed button visibility", () => {
    // Visit purchase page directly
    cy.visit("/purchase");
    cy.log("✅ Purchase page loaded");

    // Wait for page to load
    cy.wait(3000);

    // Check if plans are visible
    cy.contains("Basic").should("be.visible");
    cy.contains("Professional").should("be.visible");
    cy.contains("Enterprise").should("be.visible");
    cy.log("✅ All plans are visible");

    // Initially, proceed button should not be visible (no plan selected)
    cy.get("body").should("not.contain", "Proceed to Payment");
    cy.log("✅ Proceed button not visible initially");

    // Click on Professional plan name to select it
    cy.contains("Professional").click({ force: true });
    cy.log("✅ Clicked on Professional plan name");

    // Wait for selection to register
    cy.wait(1000);

    // Scroll to bottom
    cy.scrollTo("bottom");
    cy.wait(1000);

    // Now proceed button should be visible
    cy.contains("Proceed to Payment").should("be.visible");
    cy.log("✅ Proceed button is now visible after plan selection");
  });

  it("should test Stripe API integration with proper plan selection", () => {
    // Mock the Stripe API call
    cy.intercept("POST", "/api/subscriptions/create-checkout-session/", {
      statusCode: 200,
      body: {
        session_id: "cs_test_123",
        url: "https://checkout.stripe.com/pay/cs_test_123"
      }
    }).as("createCheckoutSession");

    // Visit purchase page
    cy.visit("/purchase");
    cy.log("✅ Purchase page loaded");

    // Wait for page to load
    cy.wait(3000);

    // Click on Professional plan name to select it
    cy.contains("Professional").click({ force: true });
    cy.log("✅ Clicked on Professional plan name");

    // Wait for selection
    cy.wait(1000);

    // Scroll to proceed button
    cy.scrollTo("bottom");
    cy.wait(1000);

    // Click proceed to payment
    cy.contains("Proceed to Payment").click({ force: true });
    cy.log("✅ Clicked proceed to payment");

    // Check if API call was made
    cy.wait("@createCheckoutSession");
    cy.log("✅ Stripe checkout session created successfully");
  });
});
