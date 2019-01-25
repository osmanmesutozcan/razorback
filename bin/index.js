const { createLogger } = require('../dist/logger');
const logger = createLogger('server');

require('../dist/attach')({
  reader: process.stdin,
  writer: process.stdout,
});

process.on('uncaughtException', function (error) {
  logger.error('UncaughtException', error.message, error.stack);
});

process.on('unhandledRejection', function (reason, promise) {
  logger.error('UnhandledRejection', promise, reason);
});
