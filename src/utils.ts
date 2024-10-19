import { Worker } from "worker_threads";
import { supabase } from "./lib/supabase.js";
import { BrianCoinbaseSDK } from "@brian-ai/cdp-sdk";

export const startExistingAgents = async () => {
  const { data, error } = await supabase.from("agents").select("*");

  if (error) {
    console.error(`[🚨 supabase-error] error: ${error.message}`);
    return;
  }

  if (data.length > 0) {
    await Promise.all(
      data.map(async (agent) => {
        const { owner, seed, agentType: type, mpcData } = agent;

        const brianCDPSDK = new BrianCoinbaseSDK({
          brianApiKey: process.env.BRIAN_API_KEY!,
          coinbaseApiKeyName: process.env.CDP_SDK_API_KEY_NAME,
          coinbaseApiKeySecret: process.env.CDP_SDK_API_KEY_SECRET,
        });

        await brianCDPSDK.importWallet(mpcData);

        const workerData = {
          ...agent,
          type,
          sender: { address: owner },
          privateKey: seed,
          mpcData,
        };

        const worker = new Worker(
          `./dist/workers/${type.toLowerCase()}-worker.js`,
          {
            workerData,
          }
        );

        worker.on("error", (error) => {
          console.error(`[🚨 worker-error] error: ${error}`);
        });

        worker.on("message", (message) => {
          console.log(`[📧 worker-message] received: ${message}`);
        });
      })
    );
  }
};
