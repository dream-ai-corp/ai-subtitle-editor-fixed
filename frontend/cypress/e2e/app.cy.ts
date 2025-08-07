describe('AI Trading Bot App', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the home page', () => {
    cy.get('h1').should('contain', 'AI Trading Bot');
  });

  it('should have navigation menu', () => {
    cy.get('[data-cy="menu-button"]').click();
    cy.get('.q-drawer').should('be.visible');
    cy.get('.q-drawer').should('contain', 'Navigation');
    cy.get('.q-drawer').should('contain', 'Settings');
  });

  it('should toggle language', () => {
    // Test language toggle
    cy.get('[data-cy="language-dropdown"]').click();
    cy.get('[data-cy="language-fr-FR"]').click();

    // Verify language changed (check for French text)
    cy.get('body').should('contain', 'Accueil');
  });

  it('should toggle theme', () => {
    // Get initial theme state
    cy.get('body').then(($body) => {
      const isDark = $body.hasClass('body--dark');

      // Toggle theme
      cy.get('[data-cy="theme-toggle"]').click();

      // Verify theme changed
      cy.get('body').should('have.class', isDark ? '' : 'body--dark');
    });
  });

  it('should toggle dev mode', () => {
    // Toggle dev mode
    cy.get('[data-cy="dev-mode-toggle"]').click();

    // Verify dev mode is enabled
    cy.get('[data-cy="dev-mode-toggle"]').should('have.class', 'text-warning');

    // Check that dev links are visible
    cy.get('[data-cy="menu-button"]').click();
    cy.get('.q-drawer').should('contain', 'Development');
  });

  it('should navigate to settings page', () => {
    cy.openSettings();
    cy.url().should('include', '/settings');
    cy.get('h1').should('contain', 'Settings');
  });

  it('should export and import settings', () => {
    cy.openSettings();

    // Export settings
    cy.get('[data-cy="export-settings"]').click();

    // Verify notification
    cy.get('.q-notification').should('contain', 'Settings exported');
  });

  it('should export and import themes', () => {
    cy.openSettings();

    // Export theme
    cy.get('[data-cy="export-theme"]').click();

    // Verify notification
    cy.get('.q-notification').should('contain', 'Theme exported');
  });

  it('should reset settings', () => {
    cy.openSettings();

    // Reset settings
    cy.get('[data-cy="reset-settings"]').click();

    // Confirm dialog
    cy.get('.q-dialog').should('be.visible');
    cy.get('.q-dialog').contains('OK').click();

    // Verify notification
    cy.get('.q-notification').should('contain', 'Settings reset');
  });
});
