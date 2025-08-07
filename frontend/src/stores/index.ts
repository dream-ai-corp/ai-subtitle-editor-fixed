import { createPinia } from 'pinia';

// Import template stores (they auto-register when imported)
import './template-stores';

// Import app stores (they auto-register when imported)
import './app-stores';

// Create pinia instance
const pinia = createPinia();

export default pinia;
