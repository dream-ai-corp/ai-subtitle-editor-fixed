import { smartLogin } from "../support/auth";

describe("Subtitle Editor", () => {
  beforeEach(() => {
    // Login with smart login before each test
    smartLogin();

    // Mock API responses
    cy.intercept("GET", "/api/subtitle/projects/1/", {
      statusCode: 200,
      body: {
        id: 1,
        name: "Test Video",
        video_file: "/media/videos/test-video.mp4",
        status: "completed",
        subtitle_count: 3,
        is_processing: false,
        is_completed: true
      }
    }).as("getProject");

    cy.intercept("GET", "/api/subtitle/projects/1/subtitles/", {
      statusCode: 200,
      body: [
        {
          id: 1,
          project: 1,
          start_time: 0,
          end_time: 5,
          text: "Hello, welcome to our video",
          confidence: 0.95,
          is_edited: false,
          formatted_start_time: "00:00:00.000",
          formatted_end_time: "00:00:05.000"
        },
        {
          id: 2,
          project: 1,
          start_time: 5,
          end_time: 10,
          text: "This is the second subtitle",
          confidence: 0.87,
          is_edited: false,
          formatted_start_time: "00:00:05.000",
          formatted_end_time: "00:00:10.000"
        },
        {
          id: 3,
          project: 1,
          start_time: 10,
          end_time: 15,
          text: "And this is the final subtitle",
          confidence: 0.92,
          is_edited: false,
          formatted_start_time: "00:00:10.000",
          formatted_end_time: "00:00:15.000"
        }
      ]
    }).as("getSubtitles");

    // Visit the subtitle editor page
    cy.visit("/subtitle-editor/1");

    // Wait for the page to load
    cy.get('[data-testid="subtitle-editor"]').should("be.visible");
  });

  it("should display video player correctly", () => {
    // Check video player is visible
    cy.get('[data-testid="video-player"]').should("be.visible");

    // Check video source is set
    cy.get('[data-testid="video-player"]').should(
      "have.attr",
      "src",
      "/media/videos/test-video.mp4"
    );

    // Check video controls are present
    cy.get('[data-testid="video-player"]').should(
      "have.prop",
      "controls",
      true
    );
  });

  it("should load and display subtitles in timeline", () => {
    // Wait for subtitles to load
    cy.wait("@getSubtitles");

    // Check timeline items are displayed
    cy.get('[data-testid="timeline-item"]').should("have.length", 3);

    // Check first subtitle content
    cy.get('[data-testid="timeline-item"]')
      .first()
      .within(() => {
        cy.contains("00:00:00.000 - 00:00:05.000").should("be.visible");
        cy.contains("Hello, welcome to our video").should("be.visible");
      });
  });

  it("should highlight active subtitle during video playback", () => {
    // Mock video time update
    cy.get('[data-testid="video-player"]').then(($video) => {
      // Simulate video playing at 3 seconds (within first subtitle)
      const videoElement = $video[0] as HTMLVideoElement;
      videoElement.currentTime = 3;
      videoElement.dispatchEvent(new Event("timeupdate"));
    });

    // Check first subtitle is highlighted
    cy.get('[data-testid="timeline-item"]')
      .first()
      .should("have.class", "timeline-item--active");

    // Simulate video playing at 7 seconds (within second subtitle)
    cy.get('[data-testid="video-player"]').then(($video) => {
      const videoElement = $video[0] as HTMLVideoElement;
      videoElement.currentTime = 7;
      videoElement.dispatchEvent(new Event("timeupdate"));
    });

    // Check second subtitle is highlighted
    cy.get('[data-testid="timeline-item"]')
      .eq(1)
      .should("have.class", "timeline-item--active");
  });

  it("should seek to subtitle when clicking timeline item", () => {
    // Click on second subtitle in timeline
    cy.get('[data-testid="timeline-item"]').eq(1).click();

    // Check video seeks to correct time
    cy.get('[data-testid="video-player"]').should(
      "have.prop",
      "currentTime",
      5
    );
  });

  it("should select subtitle for editing", () => {
    // Click on first subtitle in list
    cy.get('[data-testid="subtitle-list-item"]').first().click();

    // Check subtitle editor panel shows selected subtitle
    cy.get('[data-testid="subtitle-editor-panel"]').should("be.visible");
    cy.get('[data-testid="start-time-input"]').should("have.value", "0");
    cy.get('[data-testid="end-time-input"]').should("have.value", "5");
    cy.get('[data-testid="subtitle-text-input"]').should(
      "have.value",
      "Hello, welcome to our video"
    );
  });

  it("should update subtitle text", () => {
    // Mock API update response
    cy.intercept("PATCH", "/api/subtitle/entries/1/", {
      statusCode: 200,
      body: {
        id: 1,
        start_time: 0,
        end_time: 5,
        text: "Updated subtitle text",
        is_edited: true
      }
    }).as("updateSubtitle");

    // Select subtitle for editing
    cy.get('[data-testid="subtitle-list-item"]').first().click();

    // Update subtitle text
    cy.get('[data-testid="subtitle-text-input"]')
      .clear()
      .type("Updated subtitle text");

    // Save changes
    cy.get('[data-testid="save-button"]').click();

    // Wait for API call
    cy.wait("@updateSubtitle");

    // Check success notification
    cy.get('[data-testid="success-notification"]').should("be.visible");
    cy.contains("Subtitle updated successfully").should("be.visible");

    // Check subtitle shows as edited
    cy.get('[data-testid="subtitle-list-item"]')
      .first()
      .within(() => {
        cy.get('[data-testid="edited-chip"]').should("be.visible");
      });
  });

  it("should update subtitle timing", () => {
    // Mock API update response
    cy.intercept("PATCH", "/api/subtitle/entries/1/", {
      statusCode: 200,
      body: {
        id: 1,
        start_time: 1,
        end_time: 6,
        text: "Hello, welcome to our video",
        is_edited: true
      }
    }).as("updateSubtitle");

    // Select subtitle for editing
    cy.get('[data-testid="subtitle-list-item"]').first().click();

    // Update timing
    cy.get('[data-testid="start-time-input"]').clear().type("1");
    cy.get('[data-testid="end-time-input"]').clear().type("6");

    // Save changes
    cy.get('[data-testid="save-button"]').click();

    // Wait for API call
    cy.wait("@updateSubtitle");

    // Check success notification
    cy.get('[data-testid="success-notification"]').should("be.visible");
  });

  it("should split subtitle correctly", () => {
    // Mock API split response
    cy.intercept("POST", "/api/subtitle/entries/1/split/", {
      statusCode: 200,
      body: {
        original_entry: {
          id: 1,
          start_time: 0,
          end_time: 2.5,
          text: "Hello, welcome to our video"
        },
        new_entry: {
          id: 4,
          start_time: 2.5,
          end_time: 5,
          text: "Hello, welcome to our video"
        }
      }
    }).as("splitSubtitle");

    // Select subtitle for editing
    cy.get('[data-testid="subtitle-list-item"]').first().click();

    // Click split button
    cy.get('[data-testid="split-button"]').click();

    // Check split dialog appears
    cy.get('[data-testid="split-dialog"]').should("be.visible");

    // Enter split time
    cy.get('[data-testid="split-time-input"]').clear().type("2.5");

    // Confirm split
    cy.get('[data-testid="confirm-split-button"]').click();

    // Wait for API call
    cy.wait("@splitSubtitle");

    // Check success notification
    cy.get('[data-testid="success-notification"]').should("be.visible");
    cy.contains("Subtitle split successfully").should("be.visible");

    // Check timeline now has 4 items
    cy.get('[data-testid="timeline-item"]').should("have.length", 4);
  });

  it("should delete subtitle", () => {
    // Mock API delete response
    cy.intercept("DELETE", "/api/subtitle/entries/1/", {
      statusCode: 204
    }).as("deleteSubtitle");

    // Select subtitle for editing
    cy.get('[data-testid="subtitle-list-item"]').first().click();

    // Click delete button
    cy.get('[data-testid="delete-button"]').click();

    // Wait for API call
    cy.wait("@deleteSubtitle");

    // Check success notification
    cy.get('[data-testid="success-notification"]').should("be.visible");
    cy.contains("Subtitle deleted successfully").should("be.visible");

    // Check subtitle is removed from list
    cy.get('[data-testid="subtitle-list-item"]').should("have.length", 2);
  });

  it("should display confidence scores correctly", () => {
    // Check confidence chips are displayed
    cy.get('[data-testid="confidence-chip"]').should("have.length", 3);

    // Check first subtitle has high confidence (green)
    cy.get('[data-testid="confidence-chip"]').first().should("contain", "95%");
    cy.get('[data-testid="confidence-chip"]')
      .first()
      .should("have.class", "bg-positive");

    // Check second subtitle has medium confidence (orange)
    cy.get('[data-testid="confidence-chip"]').eq(1).should("contain", "87%");
    cy.get('[data-testid="confidence-chip"]')
      .eq(1)
      .should("have.class", "bg-warning");
  });

  it("should format time display correctly", () => {
    // Check time formatting in timeline
    cy.get('[data-testid="timeline-item"]')
      .first()
      .within(() => {
        cy.contains("00:00:00.000 - 00:00:05.000").should("be.visible");
      });

    cy.get('[data-testid="timeline-item"]')
      .eq(1)
      .within(() => {
        cy.contains("00:00:05.000 - 00:00:10.000").should("be.visible");
      });
  });

  it("should handle video loading", () => {
    // Mock video loaded event
    cy.get('[data-testid="video-player"]').then(($video) => {
      const videoElement = $video[0] as HTMLVideoElement;
      videoElement.dispatchEvent(new Event("loadedmetadata"));
    });

    // Check subtitles are loaded after video loads
    cy.get('[data-testid="timeline-item"]').should("have.length", 3);
  });

  it("should cancel subtitle editing", () => {
    // Select subtitle for editing
    cy.get('[data-testid="subtitle-list-item"]').first().click();

    // Modify subtitle text
    cy.get('[data-testid="subtitle-text-input"]').clear().type("Modified text");

    // Click cancel
    cy.get('[data-testid="cancel-button"]').click();

    // Check editor panel is cleared
    cy.get('[data-testid="subtitle-editor-panel"]').should(
      "contain",
      "Select a subtitle from the timeline to edit"
    );

    // Check subtitle text is not changed
    cy.get('[data-testid="subtitle-list-item"]')
      .first()
      .should("contain", "Hello, welcome to our video");
  });

  it("should handle API errors gracefully", () => {
    // Mock API error
    cy.intercept("PATCH", "/api/subtitle/entries/1/", {
      statusCode: 500,
      body: { error: "Server error" }
    }).as("updateError");

    // Select subtitle for editing
    cy.get('[data-testid="subtitle-list-item"]').first().click();

    // Try to update subtitle
    cy.get('[data-testid="subtitle-text-input"]').clear().type("Updated text");
    cy.get('[data-testid="save-button"]').click();

    // Wait for error
    cy.wait("@updateError");

    // Check error notification
    cy.get('[data-testid="error-notification"]').should("be.visible");
    cy.contains("Failed to save subtitle").should("be.visible");
  });
});
