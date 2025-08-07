import { smartLogin } from "../support/auth";

describe("Subscription Page Debug", () => {
  it("should debug the subscription page content", () => {
    // Listen for console errors
    cy.window().then((win) => {
      cy.spy(win.console, "error").as("consoleError");
    });

    // Use proper login process
    smartLogin();
    cy.log("Login completed");

    // Wait for login to complete and then visit subscription page
    cy.url().should("include", "/app");
    cy.visit("/app/subscription");
    cy.log("Visiting subscription page");

    // Wait for page to load
    cy.wait(3000);

    // Log the current URL
    cy.url().then((url) => {
      cy.log("Final URL: " + url);
    });

    // Check for console errors
    cy.get("@consoleError").then((spy) => {
      if (spy.callCount > 0) {
        cy.log("❌ Console errors found:");
        spy.getCalls().forEach((call, index) => {
          cy.log(`Error ${index}: ${call.args.join(" ")}`);
        });
      } else {
        cy.log("✅ No console errors found");
      }
    });

    // Log all text content
    cy.get("body").then(($body) => {
      cy.log("Body text content: " + $body.text().substring(0, 1000));
    });

    // Log all h1, h2, h3 elements
    cy.get("h1, h2, h3").then(($headers) => {
      cy.log("Found " + $headers.length + " header elements:");
      $headers.each((index, element) => {
        const text = element.textContent;
        const tagName = element.tagName;
        cy.log(`Header ${index}: tag="${tagName}", text="${text}"`);
      });
    });

    // Log all button elements
    cy.get("button").then(($buttons) => {
      cy.log("Found " + $buttons.length + " button elements:");
      $buttons.each((index, element) => {
        const text = element.textContent;
        const className = element.className;
        cy.log(`Button ${index}: text="${text}", class="${className}"`);
      });
    });

    // Check if we can find any subscription-related content
    cy.get("body").then(($body) => {
      const bodyText = $body.text();
      cy.log("Body text: " + bodyText.substring(0, 200));

      if (bodyText.includes("subscription")) {
        cy.log("✅ Found 'subscription' text");
      } else {
        cy.log("❌ 'subscription' text not found");
      }
    });

    // Check if the page contains the expected content
    cy.get("body").then(($body) => {
      const bodyText = $body.text();
      cy.log("Full body text: " + bodyText.substring(0, 500));

      // Check for specific content that should be on the subscription page
      if (bodyText.includes("Choose Your Subscription Plan")) {
        cy.log("✅ Found 'Choose Your Subscription Plan' text");
      } else {
        cy.log("❌ 'Choose Your Subscription Plan' text not found");
      }

      if (bodyText.includes("Basic")) {
        cy.log("✅ Found 'Basic' text");
      } else {
        cy.log("❌ 'Basic' text not found");
      }

      if (bodyText.includes("Professional")) {
        cy.log("✅ Found 'Professional' text");
      } else {
        cy.log("❌ 'Professional' text not found");
      }
    });
  });
});
