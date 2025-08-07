// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Import cypress-file-upload plugin
import "cypress-file-upload";

// Import authentication utilities
import "./auth";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands for the trading bot app
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to toggle language
       * @example cy.toggleLanguage('fr-FR')
       */
      toggleLanguage(language: string): Chainable<void>;

      /**
       * Custom command to toggle theme
       * @example cy.toggleTheme()
       */
      toggleTheme(): Chainable<void>;

      /**
       * Custom command to toggle dev mode
       * @example cy.toggleDevMode()
       */
      toggleDevMode(): Chainable<void>;

      /**
       * Custom command to navigate to settings
       * @example cy.openSettings()
       */
      openSettings(): Chainable<void>;
    }
  }
}
