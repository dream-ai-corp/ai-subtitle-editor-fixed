describe("Debug Purchase Page", () => {
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

    // Log all text content on the page
    cy.get("body").then(($body) => {
      cy.log(`Body text: ${$body.text()}`);
    });

    // Check for specific elements
    cy.get("h1").then(($h1s) => {
      cy.log(`Found ${$h1s.length} h1 elements`);
      $h1s.each((index, element) => {
        cy.log(`H1 ${index}: ${element.textContent}`);
      });
    });

    cy.get("h2").then(($h2s) => {
      cy.log(`Found ${$h2s.length} h2 elements`);
      $h2s.each((index, element) => {
        cy.log(`H2 ${index}: ${element.textContent}`);
      });
    });

    // Check for any text containing "subscription" or "plan"
    cy.get("body")
      .contains(/subscription|plan/i)
      .then(($elements) => {
        cy.log(`Found elements with subscription/plan: ${$elements.length}`);
      });

    // Take a screenshot
    cy.screenshot("purchase-page-debug");
  });
});
