describe("Route Test", () => {
  it("should test different routes", () => {
    // Test root route
    cy.visit("/");
    cy.wait(2000);
    cy.get("body").should("be.visible");
    cy.log("Root route works");

    // Test app route
    cy.visit("/app");
    cy.wait(2000);
    cy.get("body").should("be.visible");
    cy.log("App route works");

    // Test subtitle upload route
    cy.visit("/subtitle-upload");
    cy.wait(2000);
    cy.get("body").should("be.visible");
    cy.log("Subtitle upload route loaded");

    // Log the current URL to see if we're where we expect to be
    cy.url().then((url) => {
      cy.log("Current URL: " + url);
    });

    // Log the page content
    cy.get("body").then(($body) => {
      cy.log("Page content: " + $body.text().substring(0, 500));
    });
  });
});
