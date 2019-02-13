#!/usr/bin/env node

const { main } = require("../dist/main");
const { createLogger } = require("../dist/logger");
const logger = createLogger("razorback#bin");

const options = {
  reader: process.stdin,
  writer: process.stdout
};

Error.stackTraceLimit = 100;

main(options).catch(error => {
  logger.error("Error in application", error.message, error.stack);
});

process.on("uncaughtException", error => {
  logger.error("UncaughtException", error.message, error.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("UnhandledRejection", promise, reason);
});
