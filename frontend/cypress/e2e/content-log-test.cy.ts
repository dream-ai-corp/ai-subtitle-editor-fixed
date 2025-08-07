describe("Content Log Test", () => {
  it("should log all content on the subtitle upload page", () => {
    cy.visit("/subtitle-upload");
    
    // Wait for the page to load
    cy.wait(5000);
    
    // Log the current URL
    cy.url().then((url) => {
      cy.log("Current URL: " + url);
    });
    
    // Log all h1 elements with their classes
    cy.get("h1").then(($h1s) => {
      cy.log("Found " + $h1s.length + " h1 elements:");
      $h1s.each((index, element) => {
        const className = element.className;
        const text = element.textContent;
        cy.log(`H1 ${index}: class="${className}", text="${text}"`);
      });
    });
    
    // Log all h2 elements
    cy.get("h2").then(($h2s) => {
      cy.log("Found " + $h2s.length + " h2 elements:");
      $h2s.each((index, element) => {
        const className = element.className;
        const text = element.textContent;
        cy.log(`H2 ${index}: class="${className}", text="${text}"`);
      });
    });
    
    // Log all text content
    cy.get("body").then(($body) => {
      cy.log("Full body text content: " + $body.text());
    });
    
    // Check if we're on the right page by looking for any subtitle-related content
    cy.get("body").should("contain", "subtitle");
  });
}); 