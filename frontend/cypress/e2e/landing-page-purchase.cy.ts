describe("Landing Page Purchase Flow", () => {
  it("should display landing page with purchase options", () => {
    cy.visit("/landing");

    // Check if landing page loads
    cy.contains("AI Subtitle Editor").should("be.visible");

    // Check for call-to-action buttons
    cy.contains("Get Started").should("be.visible");
    cy.contains("View Pricing").should("be.visible");
  });

  it("should navigate to subscription page from landing", () => {
    cy.visit("/landing");

    // Click on pricing or get started button
    cy.contains("View Pricing").click();

    // Should redirect to subscription page
    cy.url().should("include", "/subscription");
    cy.contains("Choose Your Subscription Plan").should("be.visible");
  });

  it("should allow purchase flow from landing page", () => {
    // Mock authentication for purchase flow
    cy.window().then((win) => {
      win.localStorage.setItem("exploration_mode", "true");
      win.localStorage.setItem("bypass_auth_check", "true");
      win.__EXPLORATION_MODE__ = true;
    });

    cy.visit("/landing");

    // Click get started
    cy.contains("Get Started").click();

    // Should navigate to subscription page
    cy.url().should("include", "/subscription");

    // Select a plan
    cy.contains("Basic").parent().parent().click();

    // Check if proceed button appears
    cy.contains("Proceed to Payment").should("be.visible");
  });

  it("should display pricing information on landing page", () => {
    cy.visit("/landing");

    // Check for pricing information
    cy.contains("$9.99").should("be.visible");
    cy.contains("$29.99").should("be.visible");
    cy.contains("$99.99").should("be.visible");
  });

  it("should show feature highlights on landing page", () => {
    cy.visit("/landing");

    // Check for key features
    cy.contains("AI-Powered").should("be.visible");
    cy.contains("Subtitle Generation").should("be.visible");
    cy.contains("Video Upload").should("be.visible");
  });
});
