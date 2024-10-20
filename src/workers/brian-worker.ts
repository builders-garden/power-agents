import { BrianCoinbaseSDK } from "@brian-ai/cdp-sdk";
import { HandlerContext, run } from "@xmtp/message-kit";
import { ethers } from "ethers";
import { workerData } from "node:worker_threads";
import { getPreferredChain, getPreferredChainString } from "../lib/supabase.js";

const { privateKey, sender: agentCreator, mpcData } = workerData;

const cache: Record<string, any> = { data: null };

run(
  async (context: HandlerContext) => {
    console.log("[brian-worker] received a new message.");
    const wallet = new ethers.Wallet(privateKey);

    const brianCDPSDK = new BrianCoinbaseSDK({
      brianApiKey: process.env.BRIAN_API_KEY!,
      coinbaseApiKeyName: process.env.CDP_SDK_API_KEY_NAME,
      coinbaseApiKeySecret: process.env.CDP_SDK_API_KEY_SECRET,
    });

    await brianCDPSDK.importWallet(mpcData);

    const {
      content: { content: text, command, params },
      sender,
    } = context.message;

    if (sender.address.toLowerCase() !== agentCreator.address.toLowerCase()) {
      return;
    }

    if (command === "confirm" && cache.data) {
      // execute transaction
      await context.send("Executing your transaction...");

      const result = await brianCDPSDK.transact(
        `${cache.data.prompt} on ${await getPreferredChainString(
          sender.address
        )}`
      );

      await context.send(
        `Transaction executed successfully: ${result[0].getTransactionLink()}`
      );

      cache.data = null;
      return;
    } else {
      cache.data = null;
    }

    if (command === "gm" || text.toLowerCase() === "gm") {
      await context.send("gm");
      return;
    }

    if (command === "brian") {
      const { prompt } = params;

      const promptWithoutQuotes = prompt.replace(/"/g, "").replace(/“/g, "");

      await context.send("I'm processing your request.. Please wait.");

      const response = await (
        brianCDPSDK as BrianCoinbaseSDK
      ).brianSDK.transact({
        prompt: promptWithoutQuotes,
        address: wallet.address,
        chainId: await getPreferredChain(sender.address),
      });

      const [data] = response;

      cache.data = { prompt: promptWithoutQuotes };

      await context.send(data.data.description);
      await context.send(
        `Send "/confirm" to confirm your transaction. Any other message will cancel the operation.`
      );
    }

    if (command === "ask") {
      const { prompt } = params;

      if (!prompt) {
        await context.send("You must provide a valid prompt.");
        return;
      }

      const promptWithoutQuotes = prompt.replace(/"/g, "").replace(/“/g, "");

      const response = await (brianCDPSDK as BrianCoinbaseSDK).brianSDK.ask({
        prompt: promptWithoutQuotes,
        kb: "public-knowledge-box",
      });

      await context.send(response.answer);
    }
  },
  { privateKey }
);
