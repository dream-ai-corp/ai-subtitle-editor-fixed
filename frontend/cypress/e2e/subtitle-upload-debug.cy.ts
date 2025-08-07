import { smartLogin } from "../support/auth";

describe("Subtitle Upload Page Debug", () => {
  it("should debug the subtitle upload page content", () => {
    // Listen for console errors
    cy.window().then((win) => {
      cy.spy(win.console, "error").as("consoleError");
    });

    // Start at login page
    cy.visit("/");
    cy.log("Starting at login page");

    // Perform login
    smartLogin();
    cy.log("Login completed");

    // Check if we're still on login page or moved to app
    cy.url().then((url) => {
      cy.log("URL after login: " + url);
      if (url.includes("/")) {
        cy.log("❌ Still on login page - login failed");
      } else {
        cy.log("✅ Moved away from login page");
      }
    });

    // Now try to visit subtitle upload page
    cy.visit("/subtitle-upload");
    cy.log("Visiting subtitle upload page");

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

    // Log all div elements
    cy.get("div").then(($divs) => {
      cy.log("Found " + $divs.length + " div elements total");
      // Log first 10 divs
      $divs.slice(0, 10).each((index, element) => {
        const className = element.className;
        const text = element.textContent;
        cy.log(
          `Div ${index}: class="${className}", text="${text?.substring(0, 50)}"`
        );
      });
    });

    // Check if we can find any subtitle-related content
    cy.get("body").should("contain", "subtitle");

    // Check if the page contains the expected content
    cy.get("body").then(($body) => {
      const bodyText = $body.text();
      cy.log("Full body text: " + bodyText.substring(0, 500));

      // Check for specific content that should be on the subtitle upload page
      if (bodyText.includes("AI Subtitle Generator")) {
        cy.log("✅ Found 'AI Subtitle Generator' text");
      } else {
        cy.log("❌ 'AI Subtitle Generator' text not found");
      }

      if (bodyText.includes("Upload Video")) {
        cy.log("✅ Found 'Upload Video' text");
      } else {
        cy.log("❌ 'Upload Video' text not found");
      }

      if (bodyText.includes("Drop your video here")) {
        cy.log("✅ Found 'Drop your video here' text");
      } else {
        cy.log("❌ 'Drop your video here' text not found");
      }
    });
  });
});
