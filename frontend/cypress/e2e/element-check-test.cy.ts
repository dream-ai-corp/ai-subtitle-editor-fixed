describe("Element Check Test", () => {
  it("should check what elements are available on the subtitle upload page", () => {
    cy.visit("/subtitle-upload");
    
    // Wait for the page to load
    cy.wait(5000);
    
    // Log the current URL
    cy.url().then((url) => {
      cy.log("Current URL: " + url);
    });
    
    // Check for any elements with data-testid
    cy.get("[data-testid]").then(($elements) => {
      cy.log("Found " + $elements.length + " elements with data-testid:");
      $elements.each((index, element) => {
        const testId = element.getAttribute('data-testid');
        const tagName = element.tagName;
        const className = element.className;
        cy.log(`Element ${index}: data-testid="${testId}", tag="${tagName}", class="${className}"`);
      });
    });
    
    // Check for specific elements we're looking for
    cy.get("body").then(($body) => {
      const hasVideoUpload = $body.find('[data-testid="video-upload"]').length > 0;
      const hasUploadArea = $body.find('[data-testid="upload-area"]').length > 0;
      const hasFileInput = $body.find('[data-testid="file-input"]').length > 0;
      
      cy.log("Element presence check:");
      cy.log("- video-upload: " + hasVideoUpload);
      cy.log("- upload-area: " + hasUploadArea);
      cy.log("- file-input: " + hasFileInput);
      
      // Also check for any file input elements
      const fileInputs = $body.find('input[type="file"]');
      cy.log("Found " + fileInputs.length + " file input elements");
      
      // Check for any div elements that might be our components
      const divs = $body.find('div');
      cy.log("Found " + divs.length + " div elements");
      
      // Check for any elements with "upload" in their class or id
      const uploadElements = $body.find('[class*="upload"], [id*="upload"]');
      cy.log("Found " + uploadElements.length + " elements with 'upload' in class or id");
    });
    
    // Check if we can find any subtitle-related content
    cy.get("body").should("contain", "subtitle");
  });
}); 