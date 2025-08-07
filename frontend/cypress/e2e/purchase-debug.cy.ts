describe("Purchase Page Debug", () => {
  it("should debug the purchase page content", () => {
    // Visit purchase page
    cy.visit("/purchase");
    cy.log("Visiting purchase page");

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

    // Check for specific elements
    cy.get("h1").then(($h1s) => {
      cy.log("Found " + $h1s.length + " h1 elements");
      $h1s.each((index, element) => {
        cy.log("H1 " + index + ": " + element.textContent);
      });
    });

    // Check for buttons
    cy.get("button").then(($buttons) => {
      cy.log("Found " + $buttons.length + " buttons");
      $buttons.each((index, element) => {
        cy.log("Button " + index + ": " + element.textContent);
      });
    });
  });
});
