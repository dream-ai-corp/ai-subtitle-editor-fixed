describe("Debug Plan Selection", () => {
  it("should debug the plan selection DOM structure", () => {
    // Visit purchase page
    cy.visit("/purchase");
    cy.log("✅ Purchase page loaded");

    // Wait for page to load
    cy.wait(5000);

    // Find all plan cards
    cy.get(".plan-card").then(($cards) => {
      cy.log(`Found ${$cards.length} plan cards`);

      $cards.each((index, card) => {
        cy.log(`Plan Card ${index}:`);
        cy.log(`  - HTML: ${card.outerHTML}`);
        cy.log(`  - Classes: ${card.className}`);
        cy.log(
          `  - Click handlers: ${card.onclick ? "Has click handler" : "No click handler"}`
        );

        // Check for click event listeners
        const events = card.getAttribute("onclick") || "No onclick attribute";
        cy.log(`  - Onclick: ${events}`);
      });
    });

    // Find the Basic plan specifically
    cy.contains("Basic").then(($basic) => {
      cy.log("Basic plan element:");
      cy.log(`  - HTML: ${$basic[0].outerHTML}`);
      cy.log(`  - Parent: ${$basic[0].parentElement?.outerHTML}`);
      cy.log(
        `  - Parent's parent: ${$basic[0].parentElement?.parentElement?.outerHTML}`
      );

      // Find the clickable parent
      let clickableParent = $basic[0];
      for (let i = 0; i < 5; i++) {
        if (
          clickableParent.onclick ||
          clickableParent.getAttribute("onclick") ||
          clickableParent.classList.contains("plan-card")
        ) {
          cy.log(
            `  - Clickable parent at level ${i}: ${clickableParent.outerHTML}`
          );
          break;
        }
        clickableParent = clickableParent.parentElement;
        if (!clickableParent) break;
      }
    });

    // Check for Vue click handlers
    cy.get("[@click]").then(($clickElements) => {
      cy.log(`Found ${$clickElements.length} elements with @click handlers`);
      $clickElements.each((index, element) => {
        cy.log(`Click element ${index}: ${element.outerHTML}`);
      });
    });

    // Take a screenshot
    cy.screenshot("plan-selection-debug");
  });
});
