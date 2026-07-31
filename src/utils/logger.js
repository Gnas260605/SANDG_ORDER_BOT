/**
 * Utility ghi log console chuẩn hóa
 */

function formatTimestamp() {
  return new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
}

const logger = {
  info: (msg, ...args) => {
    console.log(`[${formatTimestamp()}] [INFO] ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    console.warn(`[${formatTimestamp()}] [WARN] ${msg}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`[${formatTimestamp()}] [ERROR] ${msg}`, ...args);
  },
  debug: (msg, ...args) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[${formatTimestamp()}] [DEBUG] ${msg}`, ...args);
    }
  },
};

module.exports = logger;
