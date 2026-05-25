/**
 * Example usage of the frontend logger
 */

import { logger } from './logger';

// Basic logging
logger.info('User logged in', { userId: '123', email: 'user@example.com' });
logger.warn('API request took longer than expected', { duration: 5000 });
logger.error('Failed to load user data', new Error('Network error'), { userId: '123' });

// Log with properties
logger.debug('Component rendered', {
	componentName: 'UserProfile',
	renderTime: 150,
	props: { userId: '123' },
});

// Log errors
try {
	// Some code that might throw
	throw new Error('Something went wrong');
} catch (error) {
	logger.error('An error occurred', error, {
		context: 'UserProfile',
		action: 'loadData',
	});
}

// Fatal errors (will flush immediately)
logger.fatal('Application crashed', new Error('Critical error'), {
	component: 'App',
	state: 'initialization',
});

// Manual flush (useful before page unload)
window.addEventListener('beforeunload', () => {
	logger.flushLogs();
});
