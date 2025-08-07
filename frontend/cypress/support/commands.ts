/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to toggle language
Cypress.Commands.add('toggleLanguage', (language: string) => {
  cy.get('[data-cy="language-dropdown"]').click();
  cy.get(`[data-cy="language-${language}"]`).click();
});

// Custom command to toggle theme
Cypress.Commands.add('toggleTheme', () => {
  cy.get('[data-cy="theme-toggle"]').click();
});

// Custom command to toggle dev mode
Cypress.Commands.add('toggleDevMode', () => {
  cy.get('[data-cy="dev-mode-toggle"]').click();
});

// Custom command to open settings
Cypress.Commands.add('openSettings', () => {
  cy.visit('/settings');
});

// Override visit command to wait for app to be ready
// Temporarily disabled due to TypeScript compatibility issues
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
//   return originalFn(url, options).then(() => {
//     // Wait for the app to be fully loaded
//     cy.get('body').should('not.have.class', 'loading');
//   });
// });
