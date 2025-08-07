import { smartLogin } from "../support/auth";

describe("Debug Test", () => {
  beforeEach(() => {
    // Login with smart login before each test
    smartLogin();
  });

  it("should debug what's on the subtitle upload page", () => {
    cy.visit("/subtitle-upload");

    // Wait for the page to load
    cy.wait(3000);

    // Log the current URL
    cy.url().then((url) => {
      cy.log("Current URL: " + url);
    });

    // Log all h1 elements
    cy.get("h1").then(($h1s) => {
      cy.log("Found " + $h1s.length + " h1 elements:");
      $h1s.each((index, element) => {
        cy.log("H1 " + index + ": " + element.textContent);
      });
    });

    // Log all text content
    cy.get("body").then(($body) => {
      cy.log("Body text content: " + $body.text().substring(0, 1000));
    });

    // Check if we're on the right page by looking for any subtitle-related content
    cy.get("body").should("contain", "subtitle");
  });
});
