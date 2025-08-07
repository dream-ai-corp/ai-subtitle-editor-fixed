describe("Subtitle Upload Page Test", () => {
  it("should load the subtitle upload page with all content", () => {
    cy.visit("/subtitle-upload");

    // Wait for the page to load completely
    cy.wait(3000);

    // Check if the page loads
    cy.get("body").should("be.visible");

    // Wait for Vue to render the content
    cy.get("h1", { timeout: 15000 }).should("contain", "AI Subtitle Generator");

    // Check for the subtitle text
    cy.contains(
      "Upload your video and let our AI generate accurate subtitles automatically"
    ).should("be.visible");

    // Check for the VideoUpload component
    cy.get('[data-testid="video-upload"]').should("be.visible");

    // Check for the upload area
    cy.get('[data-testid="upload-area"]').should("be.visible");

    // Check for features section
    cy.contains("Features").should("be.visible");
    cy.contains("Easy Upload").should("be.visible");
    cy.contains("AI-Powered").should("be.visible");
    cy.contains("Easy Editing").should("be.visible");
  });
});
