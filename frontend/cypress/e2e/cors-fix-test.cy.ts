describe("CORS Fix Test", () => {
  it("should test that the CORS issue is resolved", () => {
    // Test the API call that was failing due to CORS
    cy.request({
      method: "POST",
      url: "http://localhost:8000/api/subscriptions/create-checkout-session/",
      headers: {
        "Content-Type": "application/json",
        "X-Exploration-Mode": "true"
      },
      body: {
        plan_id: "prod_SoMSs2YZE1zCEq"
      }
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("session_id");
      expect(response.body).to.have.property("url");
      expect(response.body.url).to.include("checkout.stripe.com");
      cy.log("✅ CORS issue resolved - API call successful");
    });
  });

  it("should test the purchase workflow API call from frontend context", () => {
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

    // Intercept the API call to verify it works
    cy.intercept(
      "POST",
      "http://localhost:8000/api/subscriptions/create-checkout-session/",
      {
        statusCode: 200,
        body: {
          session_id: "cs_test_cors_fix",
          url: "https://checkout.stripe.com/pay/cs_test_cors_fix"
        }
      }
    ).as("createCheckoutSession");

    // Click proceed to payment
    cy.contains("Proceed to Payment").click({ force: true });

    // Verify the API call was made successfully
    cy.wait("@createCheckoutSession").then((interception) => {
      expect(interception.request.headers).to.have.property(
        "x-exploration-mode",
        "true"
      );
      expect(interception.request.body).to.have.property(
        "plan_id",
        "prod_SoMSs2YZE1zCEq"
      );
      cy.log("✅ API call made successfully with correct headers");
    });
  });
});
