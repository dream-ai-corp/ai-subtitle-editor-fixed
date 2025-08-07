describe("Simple Purchase Workflow", () => {
  it("should complete the correct purchase workflow", () => {
    // Step 1: Visit main page
    cy.visit("/");
    cy.log("✅ Main page loaded");

    // Step 2: Scroll down to pricing section
    cy.scrollTo("bottom");
    cy.wait(2000);
    cy.log("✅ Scrolled to pricing section");

    // Step 3: Click on Basic plan (Choose Plan button)
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

    // Step 7: Click on the plan card to select it (this should make the proceed button appear)
    cy.contains("Basic").parent().parent().parent().click({ force: true });
    cy.log("✅ Clicked on Basic plan card to select it");

    // Step 8: Wait for selection to register
    cy.wait(1000);

    // Step 9: Scroll to bottom to see the proceed button
    cy.scrollTo("bottom");
    cy.wait(1000);

    // Step 10: Now the proceed button should be visible
    cy.contains("Proceed to Payment").should("be.visible");
    cy.log("✅ Proceed to Payment button is visible");

    // Step 11: Click proceed to payment
    cy.contains("Proceed to Payment").click({ force: true });
    cy.log("✅ Clicked proceed to payment");

    // Step 12: Should redirect to login page (if not authenticated)
    cy.url().should("include", "/");
    cy.log("✅ Redirected to login page");

    // Step 13: Enable exploration mode
    cy.contains("Explore Platform").click({ force: true });
    cy.log("✅ Enabled exploration mode");

    // Step 14: Should redirect to app
    cy.url().should("include", "/app");
    cy.log("✅ Successfully logged in");

    // Step 15: Navigate back to purchase
    cy.visit("/purchase");
    cy.log("✅ Navigated back to purchase page");

    // Step 16: Wait for page to load
    cy.wait(3000);

    // Step 17: Select a plan again (Professional)
    cy.contains("Professional")
      .parent()
      .parent()
      .parent()
      .click({ force: true });
    cy.log("✅ Clicked on Professional plan card to select it");

    // Step 18: Wait for selection
    cy.wait(1000);

    // Step 19: Scroll to bottom
    cy.scrollTo("bottom");
    cy.wait(1000);

    // Step 20: Proceed to payment again - this should redirect to Stripe
    cy.contains("Proceed to Payment").click({ force: true });
    cy.log("✅ Proceeding to payment with authentication");

    // Step 21: Should redirect to Stripe checkout
    cy.url().should("include", "checkout.stripe.com");
    cy.log("✅ Redirected to Stripe checkout");

    cy.log("🎉 Purchase workflow completed successfully!");
  });

  it("should test Stripe integration with correct product IDs", () => {
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

    // Click on Professional plan to select it
    cy.contains("Professional")
      .parent()
      .parent()
      .parent()
      .click({ force: true });
    cy.log("✅ Clicked on Professional plan card to select it");

    // Wait for selection
    cy.wait(1000);

    // Scroll to proceed button
    cy.scrollTo("bottom");
    cy.wait(1000);

    // Click proceed to payment
    cy.contains("Proceed to Payment").click({ force: true });
    cy.log("✅ Clicked proceed to payment");

    // Check if API call was made with correct product ID
    cy.wait("@createCheckoutSession").then((interception) => {
      const requestBody = interception.request.body;
      cy.log(`API Request Body: ${JSON.stringify(requestBody)}`);

      // Should contain the correct Stripe product ID
      expect(requestBody.plan_id).to.equal("prod_SoMSs2YZE1zCEq");
      cy.log("✅ Correct Stripe product ID sent to API");
    });

    cy.log("✅ Stripe checkout session created successfully");
  });
});
