describe("Simple Test", () => {
  it("should load any page", () => {
    cy.visit("/");

    // Just check if the page loads
    cy.get("body").should("exist");

    // Log the URL
    cy.url().then((url) => {
      cy.log("Current URL: " + url);
    });

    // Log the page title
    cy.title().then((title) => {
      cy.log("Page title: " + title);
    });

    // Log any text content
    cy.get("body").then(($body) => {
      cy.log("Body text: " + $body.text().substring(0, 200));
    });
  });
});
