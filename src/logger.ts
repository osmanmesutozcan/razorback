import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as log4js from 'log4js';

const MAX_LOG_SIZE = 1024 * 1024;
const MAX_LOG_BACKUPS = 10;
const LOG_LEVEL = process.env.RAZORBACK_LOG_LEVEL || 'debug';
const LOG_FILE_PATH = process.env.RAZORBACK_LOG_FILE || path.join(os.tmpdir(), 'razorback.log');

const IS_ROOT = process.getuid && process.getuid() === 0;

if (!fs.existsSync(LOG_FILE_PATH)) {
  fs.writeFileSync(LOG_FILE_PATH, '', { encoding: 'utf8', mode: 0o666 });
  fs.chmodSync(LOG_FILE_PATH, 0o666);
}

if (!IS_ROOT) {
  log4js.configure({
    disableClustering: true,
    appenders: {
      out: {
        type: 'file',
        mode: 0o666,
        filename: LOG_FILE_PATH,
        maxLogSize: MAX_LOG_SIZE,
        backups: MAX_LOG_BACKUPS,
        layout: {
          type: 'pattern',
          pattern: `%d{ISO8601} %p (pid:${process.pid}) [%c] - %m`,
        },
      },
    },
    categories: {
      default: {
        appenders: ['out'],
        level: LOG_LEVEL,
      },
    },
  });
}

export const createLogger = (name = 'razorback'): log4js.Logger => {
  return log4js.getLogger(name);
};
