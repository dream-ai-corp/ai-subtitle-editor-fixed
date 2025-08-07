import { smartLogin } from "../support/auth";

describe("Simple Subscription Test", () => {
  it("should load subscription page", () => {
    // Use proper login process
    smartLogin();

    // Wait for login to complete
    cy.url().should("include", "/app");

    // Visit subscription page
    cy.visit("/app/subscription");

    // Wait for page to load
    cy.wait(3000);

    // Log the URL
    cy.url().then((url) => {
      cy.log("Current URL: " + url);
    });

    // Log all text content
    cy.get("body").then(($body) => {
      cy.log("Body text: " + $body.text().substring(0, 500));
    });

    // Check if page has any content
    cy.get("body").should("not.be.empty");
  });
});
