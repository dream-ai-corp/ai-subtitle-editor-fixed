import { smartLogin } from "../support/auth";

describe("Video Upload Component", () => {
  beforeEach(() => {
    // Login with smart login before each test
    smartLogin();

    // Wait for login to complete and then visit subtitle upload page
    cy.url().should("include", "/app");
    cy.visit("/subtitle-upload");

    // Wait for page to load
    cy.wait(2000);
  });

  it("should display upload interface correctly", () => {
    // Check main elements are visible
    cy.get('[data-testid="video-upload"]').should("be.visible");
    cy.get('[data-testid="upload-area"]').should("be.visible");
    cy.get('[data-testid="upload-icon"]').should("be.visible");
    cy.get('[data-testid="file-input"]').should("exist");

    // Check initial text
    cy.contains("Drag and drop your video file here").should("be.visible");
    cy.contains("or click to browse").should("be.visible");
  });

  it("should show drag and drop feedback", () => {
    // Test drag over feedback
    cy.get('[data-testid="upload-area"]')
      .trigger("dragover")
      .should("have.class", "drag-over");

    // Test drag leave feedback
    cy.get('[data-testid="upload-area"]')
      .trigger("dragleave")
      .should("not.have.class", "drag-over");
  });

  it("should handle file selection and show project form", () => {
    // Create a test video file
    const testVideo = {
      name: "test-video.mp4",
      type: "video/mp4",
      size: 1024 * 1024 // 1MB
    } as any;

    // Mock file input
    cy.get('[data-testid="file-input"]').attachFile(testVideo);

    // Check that project form appears
    cy.get('[data-testid="project-form"]').should("be.visible");

    // Check that project name is pre-filled
    cy.get('[data-testid="project-name-input"]').should(
      "have.value",
      "test-video"
    );
  });

  it("should validate file types correctly", () => {
    // Test invalid file type
    const invalidFile = {
      name: "test.txt",
      type: "text/plain",
      size: 1024
    } as any;

    cy.get('[data-testid="file-input"]').attachFile(invalidFile);

    // Should show error message
    cy.get('[data-testid="error-dialog"]').should("be.visible");
    cy.contains("Please select a valid video file").should("be.visible");
  });

  it("should validate file size correctly", () => {
    // Test file too large
    const largeFile = {
      name: "large-video.mp4",
      type: "video/mp4",
      size: 600 * 1024 * 1024 // 600MB
    } as any;

    cy.get('[data-testid="file-input"]').attachFile(largeFile);

    // Should show error message
    cy.get('[data-testid="error-dialog"]').should("be.visible");
    cy.contains("File size must be less than 500MB").should("be.visible");
  });

  it("should handle successful video upload", () => {
    // Mock successful API response
    cy.intercept("POST", "/api/subtitle/projects/", {
      statusCode: 201,
      body: {
        id: 1,
        name: "Test Video",
        status: "uploading",
        subtitle_count: 0,
        is_processing: false,
        is_completed: false
      }
    }).as("uploadVideo");

    // Create and upload test video
    const testVideo = {
      name: "test-video.mp4",
      type: "video/mp4",
      size: 1024 * 1024
    } as any;

    cy.get('[data-testid="file-input"]').attachFile(testVideo);

    // Fill project details
    cy.get('[data-testid="project-name-input"]')
      .clear()
      .type("Test Video Project");
    cy.get('[data-testid="project-description-input"]').type(
      "A test video for subtitle generation"
    );
    cy.get('[data-testid="language-select"]').click();
    cy.get('[data-testid="language-option-en"]').click();

    // Submit form
    cy.get('[data-testid="upload-button"]').click();

    // Wait for upload to complete
    cy.wait("@uploadVideo");

    // Check success notification
    cy.get('[data-testid="success-notification"]').should("be.visible");
    cy.contains("Video uploaded successfully!").should("be.visible");
  });

  it("should show upload progress", () => {
    // Mock upload progress
    cy.intercept("POST", "/api/subtitle/projects/", {
      statusCode: 201,
      body: { id: 1, name: "Test Video" },
      delay: 2000
    }).as("uploadVideo");

    const testVideo = {
      name: "test-video.mp4",
      type: "video/mp4",
      size: 1024 * 1024
    } as any;

    cy.get('[data-testid="file-input"]').attachFile(testVideo);
    cy.get('[data-testid="project-name-input"]').clear().type("Test Video");
    cy.get('[data-testid="upload-button"]').click();

    // Check progress bar appears
    cy.get('[data-testid="upload-progress"]').should("be.visible");
    cy.get('[data-testid="upload-progress-text"]').should("be.visible");
  });

  it("should handle upload errors gracefully", () => {
    // Mock API error
    cy.intercept("POST", "/api/subtitle/projects/", {
      statusCode: 500,
      body: { error: "Server error" }
    }).as("uploadError");

    const testVideo = {
      name: "test-video.mp4",
      type: "video/mp4",
      size: 1024 * 1024
    } as any;

    cy.get('[data-testid="file-input"]').attachFile(testVideo);
    cy.get('[data-testid="project-name-input"]').clear().type("Test Video");
    cy.get('[data-testid="upload-button"]').click();

    // Wait for error
    cy.wait("@uploadError");

    // Check error notification
    cy.get('[data-testid="error-notification"]').should("be.visible");
    cy.contains("Upload failed").should("be.visible");
  });

  it("should reset form after successful upload", () => {
    // Mock successful upload
    cy.intercept("POST", "/api/subtitle/projects/", {
      statusCode: 201,
      body: { id: 1, name: "Test Video" }
    }).as("uploadVideo");

    const testVideo = {
      name: "test-video.mp4",
      type: "video/mp4",
      size: 1024 * 1024
    } as any;

    cy.get('[data-testid="file-input"]').attachFile(testVideo);
    cy.get('[data-testid="project-name-input"]').clear().type("Test Video");
    cy.get('[data-testid="project-description-input"]').type(
      "Test description"
    );
    cy.get('[data-testid="upload-button"]').click();

    cy.wait("@uploadVideo");

    // Check form is reset
    cy.get('[data-testid="project-form"]').should("not.be.visible");
    cy.get('[data-testid="upload-area"]').should("be.visible");
  });

  it("should support multiple language selection", () => {
    const testVideo = {
      name: "test-video.mp4",
      type: "video/mp4",
      size: 1024 * 1024
    } as any;

    cy.get('[data-testid="file-input"]').attachFile(testVideo);

    // Test different language selections
    const languages = ["en", "fr", "es", "de", "it"];

    languages.forEach((lang) => {
      cy.get('[data-testid="language-select"]').click();
      cy.get(`[data-testid="language-option-${lang}"]`).click();
      cy.get('[data-testid="language-select"]').should(
        "contain",
        lang.toUpperCase()
      );
    });
  });

  it("should handle form validation", () => {
    const testVideo = {
      name: "test-video.mp4",
      type: "video/mp4",
      size: 1024 * 1024
    } as any;

    cy.get('[data-testid="file-input"]').attachFile(testVideo);

    // Try to submit without project name
    cy.get('[data-testid="project-name-input"]').clear();
    cy.get('[data-testid="upload-button"]').click();

    // Should show validation error
    cy.contains("Project name is required").should("be.visible");
  });
});
