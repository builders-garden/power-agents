import { EventEmitter } from "events";
import { Worker } from "node:worker_threads";

class AgentsEmitter extends EventEmitter {}

export const agentsEmitter = new AgentsEmitter();

agentsEmitter.on("subscribe", async (data) => {
  const { type } = data;

  const worker = new Worker(`./dist/workers/${type.toLowerCase()}-worker.js`, {
    workerData: data,
  });

  worker.on("error", (error) => {
    console.error(`[🚨 worker-error] error: ${error}`);
  });

  worker.on("message", (message) => {
    console.log(`[📧 worker-message] received: ${message}`);
  });
});
