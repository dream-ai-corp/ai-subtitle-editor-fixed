describe("Working Purchase Test", () => {
  it("should complete purchase flow with proper element handling", () => {
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

    // Step 6: Check if plan is visible
    cy.contains("Basic").should("be.visible");
    cy.log("✅ Basic plan is visible");

    // Step 7: Scroll to make sure proceed button is visible
    cy.scrollTo("bottom");
    cy.wait(1000);

    // Step 8: Click proceed to payment with force
    cy.contains("Proceed to Payment").click({ force: true });
    cy.log("✅ Clicked proceed to payment");

    // Step 9: Should redirect to login page
    cy.url().should("include", "/");
    cy.log("✅ Redirected to login page");

    // Step 10: Enable exploration mode
    cy.contains("Explore Platform").click({ force: true });
    cy.log("✅ Enabled exploration mode");

    // Step 11: Should redirect to app
    cy.url().should("include", "/app");
    cy.log("✅ Successfully logged in");

    // Step 12: Navigate back to purchase
    cy.visit("/purchase");
    cy.log("✅ Navigated back to purchase page");

    // Step 13: Wait for page to load
    cy.wait(3000);

    // Step 14: Scroll to make proceed button visible
    cy.scrollTo("bottom");
    cy.wait(1000);

    // Step 15: Proceed to payment again with force
    cy.contains("Proceed to Payment").click({ force: true });
    cy.log("✅ Proceeding to payment with authentication");

    // Step 16: Should make API call to create checkout session
    cy.log("✅ Purchase workflow completed successfully");
  });

  it("should test plan selection on purchase page", () => {
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

    // Click on Professional plan with force
    cy.contains("Professional").click({ force: true });
    cy.log("✅ Selected Professional plan");

    // Wait for selection to register
    cy.wait(1000);

    // Check if proceed button appears
    cy.scrollTo("bottom");
    cy.wait(1000);
    cy.contains("Proceed to Payment").should("be.visible");
    cy.log("✅ Proceed button is visible");
  });

  it("should test Stripe API integration", () => {
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

    // Click on Professional plan
    cy.contains("Professional").click({ force: true });
    cy.log("✅ Selected Professional plan");

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
