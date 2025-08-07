describe("Simple Stripe Test", () => {
  it("should load purchase page and display plans", () => {
    // Visit purchase page
    cy.visit("/purchase");

    // Wait for page to load
    cy.wait(5000);

    // Check if page has content
    cy.get("body").should("not.be.empty");

    // Check for any text content
    cy.get("body").then(($body) => {
      const text = $body.text();
      cy.log("Page content: " + text.substring(0, 200));

      // Check if any of the expected content is present
      expect(text).to.include("Basic");
      expect(text).to.include("Professional");
      expect(text).to.include("Enterprise");
    });
  });

  it("should allow plan selection", () => {
    // Visit purchase page
    cy.visit("/purchase");

    // Wait for page to load
    cy.wait(5000);

    // Click on Basic plan
    cy.contains("Basic").click();

    // Check if plan is selected
    cy.contains("Selected Plan: Basic").should("be.visible");
  });

  it("should show proceed button when plan is selected", () => {
    // Visit purchase page
    cy.visit("/purchase");

    // Wait for page to load
    cy.wait(5000);

    // Click on Professional plan
    cy.contains("Professional").click();

    // Check if proceed button appears
    cy.contains("Proceed to Payment").should("be.visible");
  });
});
