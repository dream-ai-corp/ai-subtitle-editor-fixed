import { smartLogin } from "../support/auth";

describe("Subtitle Embedding", () => {
  beforeEach(() => {
    // Login with smart login before each test
    smartLogin();

    // Mock a project with subtitles
    cy.intercept("GET", "/api/subtitle/projects/1/", {
      statusCode: 200,
      body: {
        id: 1,
        name: "Test Video",
        description: "A test video for subtitle embedding",
        status: "completed",
        is_completed: true,
        is_processing: false,
        subtitle_count: 5,
        video_file: "/media/videos/test.mp4"
      }
    }).as("getProject");

    cy.intercept("GET", "/api/subtitle/projects/1/subtitles/", {
      statusCode: 200,
      body: [
        {
          id: 1,
          start_time: 0,
          end_time: 3,
          text: "Hello, this is a test subtitle",
          language: "en",
          confidence: 0.95,
          is_edited: false
        },
        {
          id: 2,
          start_time: 3,
          end_time: 6,
          text: "This is the second subtitle",
          language: "en",
          confidence: 0.92,
          is_edited: false
        }
      ]
    }).as("getSubtitles");

    cy.visit("/subtitle-editor/1");
    cy.wait(["@getProject", "@getSubtitles"]);
  });

  it("should display embed button for completed projects", () => {
    cy.get('[data-testid="embed-button"]').should("be.visible");
    cy.contains("Embed").should("be.visible");
  });

  it("should open embed dialog when embed button is clicked", () => {
    cy.get('[data-testid="embed-button"]').click();
    cy.get('[data-testid="subtitle-embedder"]').should("be.visible");
    cy.contains("Embed Subtitles in Video").should("be.visible");
  });

  it("should display style selection options", () => {
    cy.get('[data-testid="embed-button"]').click();

    // Check style buttons
    cy.get('[data-testid="style-btn-default"]').should("be.visible");
    cy.get('[data-testid="style-btn-modern"]').should("be.visible");
    cy.get('[data-testid="style-btn-bold"]').should("be.visible");
    cy.get('[data-testid="style-btn-minimal"]').should("be.visible");
  });

  it("should allow style selection", () => {
    cy.get('[data-testid="embed-button"]').click();

    // Select different styles
    cy.get('[data-testid="style-btn-modern"]').click();
    cy.get('[data-testid="style-btn-modern"]').should(
      "have.class",
      "bg-primary"
    );

    cy.get('[data-testid="style-btn-bold"]').click();
    cy.get('[data-testid="style-btn-bold"]').should("have.class", "bg-primary");
  });

  it("should show style preview", () => {
    cy.get('[data-testid="embed-button"]').click();

    // Check preview container
    cy.get('[data-testid="style-preview"]').should("be.visible");
    cy.contains("Sample subtitle text").should("be.visible");

    // Check preview changes with style selection
    cy.get('[data-testid="style-btn-modern"]').click();
    cy.get('[data-testid="style-preview"]').should(
      "have.class",
      "preview-modern"
    );

    cy.get('[data-testid="style-btn-bold"]').click();
    cy.get('[data-testid="style-preview"]').should(
      "have.class",
      "preview-bold"
    );
  });

  it("should display customization options", () => {
    cy.get('[data-testid="embed-button"]').click();

    // Check customization inputs
    cy.get('[data-testid="font-size-input"]').should("be.visible");
    cy.get('[data-testid="font-color-select"]').should("be.visible");
    cy.get('[data-testid="outline-color-select"]').should("be.visible");
    cy.get('[data-testid="output-filename-input"]').should("be.visible");
  });

  it("should allow font size customization", () => {
    cy.get('[data-testid="embed-button"]').click();

    cy.get('[data-testid="font-size-input"]').clear().type("32");
    cy.get('[data-testid="font-size-input"]').should("have.value", "32");
  });

  it("should allow color customization", () => {
    cy.get('[data-testid="embed-button"]').click();

    // Test font color selection
    cy.get('[data-testid="font-color-select"]').click();
    cy.contains("Yellow").click();

    // Test outline color selection
    cy.get('[data-testid="outline-color-select"]').click();
    cy.contains("Dark Blue").click();
  });

  it("should allow output filename customization", () => {
    cy.get('[data-testid="embed-button"]').click();

    cy.get('[data-testid="output-filename-input"]')
      .clear()
      .type("my_custom_video.mp4");
    cy.get('[data-testid="output-filename-input"]').should(
      "have.value",
      "my_custom_video.mp4"
    );
  });

  it("should show preview button functionality", () => {
    cy.get('[data-testid="embed-button"]').click();

    cy.get('[data-testid="preview-button"]').click();

    // Check for notification
    cy.contains("Previewing").should("be.visible");
  });

  it("should handle successful subtitle embedding", () => {
    // Mock successful embedding response
    cy.intercept("POST", "/api/subtitle/projects/1/embed_subtitles/", {
      statusCode: 200,
      body: {
        success: true,
        export_id: 123,
        download_url: "/api/subtitle/exports/123/download/",
        message: "Subtitles embedded successfully"
      }
    }).as("embedSubtitles");

    cy.get('[data-testid="embed-button"]').click();

    // Select style and customize
    cy.get('[data-testid="style-btn-modern"]').click();
    cy.get('[data-testid="font-size-input"]').clear().type("28");

    // Start embedding
    cy.get('[data-testid="embed-button"]').click();

    // Check progress
    cy.get('[data-testid="embedding-progress"]').should("be.visible");
    cy.contains("Processing...").should("be.visible");

    // Wait for completion
    cy.wait("@embedSubtitles");

    // Check success dialog
    cy.contains("Subtitles Embedded Successfully!").should("be.visible");
    cy.contains("Download").should("be.visible");
  });

  it("should handle embedding errors", () => {
    // Mock error response
    cy.intercept("POST", "/api/subtitle/projects/1/embed_subtitles/", {
      statusCode: 500,
      body: {
        success: false,
        message: "Failed to embed subtitles"
      }
    }).as("embedSubtitlesError");

    cy.get('[data-testid="embed-button"]').click();
    cy.get('[data-testid="embed-button"]').click();

    cy.wait("@embedSubtitlesError");

    // Check error dialog
    cy.contains("Embedding Failed").should("be.visible");
    cy.contains("Failed to embed subtitles").should("be.visible");
  });

  it("should allow downloading embedded video", () => {
    // Mock successful embedding
    cy.intercept("POST", "/api/subtitle/projects/1/embed_subtitles/", {
      statusCode: 200,
      body: {
        success: true,
        export_id: 123,
        download_url: "/api/subtitle/exports/123/download/",
        message: "Subtitles embedded successfully"
      }
    }).as("embedSubtitles");

    // Mock download response
    cy.intercept("GET", "/api/subtitle/exports/123/download/", {
      statusCode: 200,
      body: "fake video content",
      headers: {
        "Content-Disposition":
          'attachment; filename="Test_Video_with_subtitles.mp4"'
      }
    }).as("downloadVideo");

    cy.get('[data-testid="embed-button"]').click();
    cy.get('[data-testid="embed-button"]').click();

    cy.wait("@embedSubtitles");

    // Click download button
    cy.contains("Download").click();

    cy.wait("@downloadVideo");
  });

  it("should disable controls during processing", () => {
    cy.get('[data-testid="embed-button"]').click();

    // Start embedding (this will trigger processing state)
    cy.intercept("POST", "/api/subtitle/projects/1/embed_subtitles/", {
      statusCode: 200,
      body: { success: true },
      delay: 2000
    }).as("embedSubtitles");

    cy.get('[data-testid="embed-button"]').click();

    // Check that controls are disabled during processing
    cy.get('[data-testid="preview-button"]').should("be.disabled");
    cy.get('[data-testid="font-size-input"]').should("be.disabled");
    cy.get('[data-testid="font-color-select"]').should("be.disabled");
  });

  it("should show processing progress", () => {
    cy.get('[data-testid="embed-button"]').click();

    cy.intercept("POST", "/api/subtitle/projects/1/embed_subtitles/", {
      statusCode: 200,
      body: { success: true },
      delay: 3000
    }).as("embedSubtitles");

    cy.get('[data-testid="embed-button"]').click();

    // Check progress messages
    cy.contains("Preparing video...").should("be.visible");
    cy.contains("Extracting subtitles...").should("be.visible");
    cy.contains("Embedding subtitles...").should("be.visible");
    cy.contains("Finalizing video...").should("be.visible");
  });

  it("should validate input parameters", () => {
    cy.get('[data-testid="embed-button"]').click();

    // Test font size validation
    cy.get('[data-testid="font-size-input"]').clear().type("5"); // Too small
    cy.get('[data-testid="font-size-input"]').should("have.attr", "min", "12");

    cy.get('[data-testid="font-size-input"]').clear().type("100"); // Too large
    cy.get('[data-testid="font-size-input"]').should("have.attr", "max", "72");
  });

  it("should close dialogs properly", () => {
    cy.get('[data-testid="embed-button"]').click();
    cy.get('[data-testid="subtitle-embedder"]').should("be.visible");

    // Close dialog
    cy.contains("Close").click();
    cy.get('[data-testid="subtitle-embedder"]').should("not.be.visible");
  });
});
