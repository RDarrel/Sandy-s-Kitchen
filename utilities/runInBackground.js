const { waitUntil } = require("@vercel/functions");

const runInBackground = (promise) => {
  const task = Promise.resolve(promise).catch((error) => {
    console.error("[BACKGROUND TASK] Failed:", error);
  });

  if (process.env.VERCEL === "1") {
    waitUntil(task);
  }

  return task;
};

module.exports = runInBackground;
