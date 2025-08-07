describe("Stripe Checkout Flow", () => {
  it("should test the complete Stripe checkout flow", () => {
    // Visit the purchase page
    cy.visit("/purchase");
    cy.wait(3000);

    // Enable exploration mode
    cy.window().then((win) => {
      win.localStorage.setItem("exploration_mode", "true");
      cy.log("✅ Enabled exploration mode");
    });

    // Select a plan
    cy.contains("Professional")
      .parent()
      .parent()
      .parent()
      .click({ force: true });
    cy.wait(1000);

    // Scroll to bottom
    cy.scrollTo("bottom");
    cy.wait(1000);

    // Click proceed to payment
    cy.contains("Proceed to Payment").click({ force: true });
    cy.log("✅ Clicked proceed to payment");

    // Should redirect to Stripe checkout
    cy.url().should("include", "checkout.stripe.com");
    cy.log("✅ Redirected to Stripe checkout");

    // Test that the success and cancel URLs are accessible
    cy.request("GET", "http://localhost:8000/subscription/success/").then(
      (response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.include("Payment Successful!");
        cy.log("✅ Success page is accessible");
      }
    );

    cy.request("GET", "http://localhost:8000/subscription/cancel/").then(
      (response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.include("Payment Cancelled");
        cy.log("✅ Cancel page is accessible");
      }
    );

    cy.log("🎉 Complete Stripe checkout flow is working!");
  });

  it("should test success page with plan details", () => {
    // Test success page with session_id parameter
    cy.request(
      "GET",
      "http://localhost:8000/subscription/success/?session_id=cs_test_123"
    ).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.include("Payment Successful!");
      expect(response.body).to.include("Thank you for subscribing");
      cy.log("✅ Success page loads with session parameter");
    });
  });

  it("should test cancel page", () => {
    // Test cancel page
    cy.request("GET", "http://localhost:8000/subscription/cancel/").then(
      (response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.include("Payment Cancelled");
        expect(response.body).to.include("No charges were made");
        expect(response.body).to.include("Try Again");
        cy.log("✅ Cancel page loads correctly");
      }
    );
  });
});
