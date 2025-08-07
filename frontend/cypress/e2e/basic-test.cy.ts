describe("Basic Page Test", () => {
  it("should load the root page first", () => {
    cy.visit("/");

    // Wait for the page to load completely
    cy.wait(2000);

    // Check if we can find any content
    cy.get("body").should("be.visible");

    // Log what we find
    cy.get("body").then(($body) => {
      cy.log("Page content: " + $body.text().substring(0, 200));
    });
  });

  it("should load the subtitle upload page", () => {
    // First visit the root page
    cy.visit("/");
    cy.wait(2000);

    // Then navigate to the subtitle upload page
    cy.visit("/subtitle-upload");

    // Wait for the page to load completely
    cy.wait(3000);

    // Check if the page loads
    cy.get("body").should("be.visible");

    // Log what we find
    cy.get("body").then(($body) => {
      cy.log("Page content: " + $body.text().substring(0, 200));
    });

    // Try to find any content that might be there
    cy.get("body").should("not.be.empty");

    // Check if we can find any content - wait longer for Vue to render
    cy.contains("AI Subtitle Generator", { timeout: 10000 }).should(
      "be.visible"
    );

    // Check if the page has some basic structure
    cy.get("h1").should("contain", "AI Subtitle Generator");
  });
});
