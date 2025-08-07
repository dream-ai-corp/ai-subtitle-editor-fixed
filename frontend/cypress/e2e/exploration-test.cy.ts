describe("Exploration Mode Test", () => {
  it("should access subtitle upload page with exploration mode", () => {
    // Enable exploration mode to bypass authentication
    cy.window().then((win) => {
      win.localStorage.setItem('exploration_mode', 'true');
      win.localStorage.setItem('bypass_auth_check', 'true');
      win.__EXPLORATION_MODE__ = true;
    });
    
    cy.visit("/subtitle-upload");
    
    // Wait for the page to load
    cy.wait(3000);
    
    // Log the current URL
    cy.url().then((url) => {
      cy.log("Current URL: " + url);
    });
    
    // Log all elements with data-testid
    cy.get('[data-testid]').then(($elements) => {
      cy.log("Found " + $elements.length + " elements with data-testid:");
      $elements.each((index, element) => {
        const testId = element.getAttribute('data-testid');
        cy.log(`Element ${index}: data-testid="${testId}"`);
      });
    });
    
    // Log all h1 elements
    cy.get("h1").then(($h1s) => {
      cy.log("Found " + $h1s.length + " h1 elements:");
      $h1s.each((index, element) => {
        const text = element.textContent;
        cy.log(`H1 ${index}: text="${text}"`);
      });
    });
    
    // Log all text content
    cy.get("body").then(($body) => {
      cy.log("Body text content: " + $body.text().substring(0, 500));
    });
    
    // Check if we're on the right page
    cy.get("body").should("contain", "subtitle");
  });
}); 