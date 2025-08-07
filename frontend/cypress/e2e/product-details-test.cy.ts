describe("Product Details Test", () => {
  it("should load product details page and select plan", () => {
    // Visit product details page
    cy.visit("/product-details");
    cy.log("✅ Product details page loaded");

    // Wait for page to load
    cy.wait(3000);

    // Check if plans are visible
    cy.contains("Basic").should("be.visible");
    cy.contains("Professional").should("be.visible");
    cy.contains("Enterprise").should("be.visible");
    cy.log("✅ All plans are visible");

    // Click on Professional plan
    cy.contains("Professional").click();
    cy.log("✅ Clicked on Professional plan");

    // Wait a moment for the redirect
    cy.wait(2000);

    // Check if we're on the purchase page
    cy.url().should("include", "/purchase");
    cy.log("✅ Successfully redirected to purchase page");
  });
});
