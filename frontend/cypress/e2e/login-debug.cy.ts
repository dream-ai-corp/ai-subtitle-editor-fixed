describe("Login Page Debug", () => {
  it("should debug the login page content", () => {
    cy.visit("/");

    // Wait for page to load
    cy.wait(3000);

    // Log the current URL
    cy.url().then((url) => {
      cy.log("Current URL: " + url);
    });

    // Log all input elements
    cy.get("input").then(($inputs) => {
      cy.log("Found " + $inputs.length + " input elements:");
      $inputs.each((index, element) => {
        const type = element.getAttribute("type");
        const placeholder = element.getAttribute("placeholder");
        const label = element.getAttribute("label");
        const id = element.getAttribute("id");
        const name = element.getAttribute("name");
        cy.log(
          `Input ${index}: type="${type}", placeholder="${placeholder}", label="${label}", id="${id}", name="${name}"`
        );
      });
    });

    // Log all button elements
    cy.get("button").then(($buttons) => {
      cy.log("Found " + $buttons.length + " button elements:");
      $buttons.each((index, element) => {
        const text = element.textContent;
        const type = element.getAttribute("type");
        const id = element.getAttribute("id");
        const className = element.className;
        cy.log(
          `Button ${index}: type="${type}", text="${text}", id="${id}", class="${className}"`
        );
      });
    });

    // Log all text content
    cy.get("body").then(($body) => {
      cy.log("Body text content: " + $body.text().substring(0, 1000));
    });

    // Check if we can find any login-related content
    cy.get("body").should("contain", "login");
  });
});
