import { smartLogin } from "../support/auth";

describe("Stripe Integration", () => {
  beforeEach(() => {
    // Visit purchase page directly (no login required)
    cy.visit("/purchase");

    // Wait for page to load and ensure it's ready
    cy.wait(5000);

    // Wait for the page title to be visible with longer timeout
    cy.contains("Choose Your Subscription Plan", { timeout: 20000 }).should(
      "be.visible"
    );
  });

  it("should display subscription plans correctly", () => {
    // Check if plans are displayed (already checked in beforeEach)
    cy.contains("Choose Your Subscription Plan").should("be.visible");

    // Check for all three plans
    cy.contains("Basic").should("be.visible");
    cy.contains("Professional").should("be.visible");
    cy.contains("Enterprise").should("be.visible");

    // Check plan prices
    cy.contains("$9.99").should("be.visible");
    cy.contains("$29.99").should("be.visible");
    cy.contains("$99.99").should("be.visible");
  });

  it("should allow plan selection", () => {
    // Select Basic plan
    cy.contains("Basic").parent().parent().click();

    // Check if plan is selected
    cy.contains("Selected Plan: Basic").should("be.visible");
    cy.contains("Total: $9.99/month").should("be.visible");

    // Select Professional plan
    cy.contains("Professional").parent().parent().click();

    // Check if plan is selected
    cy.contains("Selected Plan: Professional").should("be.visible");
    cy.contains("Total: $29.99/month").should("be.visible");
  });

  it("should show proceed to payment button when plan is selected", () => {
    // Select a plan
    cy.contains("Professional").parent().parent().click();

    // Check if proceed button is visible
    cy.contains("Proceed to Payment").should("be.visible");
  });

  it("should not show proceed button without plan selection", () => {
    cy.visit("/purchase");

    // Check that proceed button is not visible initially
    cy.contains("Proceed to Payment").should("not.exist");
  });

  it("should handle payment initiation", () => {
    // Mock the API call to create checkout session
    cy.intercept("POST", "/api/subscriptions/create-checkout-session/", {
      statusCode: 200,
      body: {
        session_id: "cs_test_123",
        url: "https://checkout.stripe.com/pay/cs_test_123"
      }
    }).as("createCheckoutSession");

    // Select a plan
    cy.contains("Professional").parent().parent().click();

    // Click proceed to payment
    cy.contains("Proceed to Payment").click();

    // Check if API call was made
    cy.wait("@createCheckoutSession");

    // Check if we're redirected to Stripe checkout
    cy.url().should("include", "checkout.stripe.com");
  });

  it("should handle payment API errors gracefully", () => {
    // Mock API error
    cy.intercept("POST", "/api/subscriptions/create-checkout-session/", {
      statusCode: 500,
      body: { error: "Internal server error" }
    }).as("createCheckoutSessionError");

    // Select a plan
    cy.contains("Professional").parent().parent().click();

    // Click proceed to payment
    cy.contains("Proceed to Payment").click();

    // Check if error notification is shown
    cy.contains("Failed to initiate payment").should("be.visible");
  });

  it("should validate plan selection before payment", () => {
    cy.visit("/purchase");

    // Try to proceed without selecting a plan
    cy.contains("Proceed to Payment").should("not.exist");
  });
});
