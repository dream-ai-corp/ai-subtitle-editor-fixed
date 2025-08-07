describe("Product Details Fixed Test", () => {
  it("should select plan from product details page", () => {
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

    // Click on the "Get Started" button for Professional plan (featured plan)
    cy.contains("Professional")
      .parent()
      .parent()
      .parent()
      .within(() => {
        cy.contains("Get Started").click();
      });
    cy.log("✅ Clicked on Professional plan button");

    // Wait for redirect
    cy.wait(2000);

    // Check if we're on the purchase page
    cy.url().should("include", "/purchase");
    cy.log("✅ Successfully redirected to purchase page");
  });

  it("should select Basic plan from product details", () => {
    // Visit product details page
    cy.visit("/product-details");
    cy.log("✅ Product details page loaded");

    // Wait for page to load
    cy.wait(3000);

    // Click on the "Choose Plan" button for Basic plan
    cy.contains("Basic")
      .parent()
      .parent()
      .parent()
      .within(() => {
        cy.contains("Choose Plan").click();
      });
    cy.log("✅ Clicked on Basic plan button");

    // Wait for redirect
    cy.wait(2000);

    // Check if we're on the purchase page
    cy.url().should("include", "/purchase");
    cy.log("✅ Successfully redirected to purchase page");
  });
});
