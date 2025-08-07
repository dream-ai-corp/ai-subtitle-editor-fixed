describe("Debug Purchase Page Content", () => {
  it("should debug what's actually on the purchase page", () => {
    // Visit purchase page
    cy.visit("/purchase");
    cy.log("✅ Purchase page loaded");

    // Wait for page to load
    cy.wait(5000);

    // Log the current URL
    cy.url().then((url) => {
      cy.log(`Current URL: ${url}`);
    });

    // Log the page title
    cy.title().then((title) => {
      cy.log(`Page title: ${title}`);
    });

    // Check what elements are actually on the page
    cy.get("body").then(($body) => {
      cy.log(`Body HTML: ${$body.html()}`);
    });

    // Check for any div elements
    cy.get("div").then(($divs) => {
      cy.log(`Found ${$divs.length} div elements`);
      $divs.each((index, div) => {
        if (index < 10) {
          // Only log first 10
          cy.log(`Div ${index}: class="${div.className}"`);
        }
      });
    });

    // Check for any elements with "plan" in the class name
    cy.get("[class*='plan']").then(($planElements) => {
      cy.log(
        `Found ${$planElements.length} elements with 'plan' in class name`
      );
      $planElements.each((index, element) => {
        cy.log(`Plan element ${index}: class="${element.className}"`);
      });
    });

    // Check for any elements with "card" in the class name
    cy.get("[class*='card']").then(($cardElements) => {
      cy.log(
        `Found ${$cardElements.length} elements with 'card' in class name`
      );
      $cardElements.each((index, element) => {
        cy.log(`Card element ${index}: class="${element.className}"`);
      });
    });

    // Take a screenshot
    cy.screenshot("purchase-page-content-debug");
  });
});
