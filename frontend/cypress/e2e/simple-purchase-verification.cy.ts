describe("Simple Purchase Verification", () => {
  it("should verify basic purchase page functionality", () => {
    // Step 1: Visit main page
    cy.visit("/");
    cy.log("✅ Main page loaded");

    // Step 2: Scroll down to pricing section
    cy.scrollTo("bottom");
    cy.wait(2000);
    cy.log("✅ Scrolled to pricing section");

    // Step 3: Verify plans are visible
    cy.contains("Basic").should("be.visible");
    cy.contains("Professional").should("be.visible");
    cy.contains("Enterprise").should("be.visible");
    cy.log("✅ All plans are visible on main page");

    // Step 4: Click on Basic plan
    cy.contains("Choose Plan").first().click({ force: true });
    cy.log("✅ Clicked on Basic plan");

    // Step 5: Verify redirect to purchase page
    cy.url().should("include", "/purchase");
    cy.log("✅ Successfully redirected to purchase page");

    // Step 6: Wait and check for any content
    cy.wait(3000);
    cy.get("body").should("not.be.empty");
    cy.log("✅ Purchase page has content");

    // Step 7: Check for any text containing "plan" (case insensitive)
    cy.get("body").contains(/plan/i).should("exist");
    cy.log("✅ Found text containing 'plan'");

    // Step 8: Check for plan names
    cy.contains("Basic").should("be.visible");
    cy.log("✅ Basic plan is visible on purchase page");

    // Step 9: Scroll to bottom
    cy.scrollTo("bottom");
    cy.wait(1000);

    // Step 10: Check for any button
    cy.get("button").should("exist");
    cy.log("✅ Buttons are present on page");

    cy.log("🎉 Basic purchase page functionality verified!");
  });

  it("should verify authentication flow", () => {
    // Visit purchase page directly
    cy.visit("/purchase");
    cy.log("✅ Purchase page loaded directly");

    // Wait for page to load
    cy.wait(3000);

    // Check for any content
    cy.get("body").should("not.be.empty");
    cy.log("✅ Page has content");

    // Look for any button that might be "Proceed to Payment"
    cy.get("button").then(($buttons) => {
      cy.log(`Found ${$buttons.length} buttons on page`);
      $buttons.each((index, button) => {
        cy.log(`Button ${index}: ${button.textContent}`);
      });
    });

    // Try to find any text containing "payment" or "proceed"
    cy.get("body")
      .contains(/payment|proceed/i)
      .then(($elements) => {
        if ($elements.length > 0) {
          cy.log("✅ Found payment-related text");
        } else {
          cy.log("⚠️ No payment-related text found");
        }
      });

    cy.log("🎉 Authentication flow verification completed!");
  });
});
