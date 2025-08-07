import { smartLogin } from "../support/auth";

describe("User Menu Debug", () => {
  it("should debug the user menu content", () => {
    smartLogin();

    // Wait for page to load
    cy.wait(2000);

    // Check if user menu exists
    cy.get('[data-cy="user-menu"]').should("be.visible");

    // Click user menu
    cy.get('[data-cy="user-menu"]').click();

    // Wait for menu to open
    cy.wait(1000);

    // Log all text content in the menu
    cy.get("body").then(($body) => {
      cy.log(
        "Body text after clicking user menu: " + $body.text().substring(0, 1000)
      );
    });

    // Try to find any menu items
    cy.get("button, a, .q-item").then(($items) => {
      cy.log("Found " + $items.length + " potential menu items:");
      $items.each((index, element) => {
        const text = element.textContent;
        const className = element.className;
        cy.log(`Item ${index}: text="${text}", class="${className}"`);
      });
    });

    // Check for exploration mode text
    cy.get("body").should("contain", "Exit Exploration Mode");
  });
});
