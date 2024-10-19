import { HandlerContext, run } from "@xmtp/message-kit";
import { workerData } from "node:worker_threads";
import { getDefiRecommendation } from "../lib/defi-saver-logic";
import { BrianCoinbaseSDK } from "@brian-ai/cdp-sdk";

const { privateKey, sender: agentCreator, mpcData, address } = workerData;

run(
  async (context: HandlerContext) => {
    const {
      content: { content: text, command, params },
      sender,
    } = context.message;

    const brianCDPSDK = new BrianCoinbaseSDK({
      brianApiKey: process.env.BRIAN_API_KEY!,
      coinbaseApiKeyName: process.env.CDP_SDK_API_KEY_NAME,
      coinbaseApiKeySecret: process.env.CDP_SDK_API_KEY_SECRET,
    });

    await brianCDPSDK.importWallet(mpcData);

    if (sender.address.toLowerCase() !== agentCreator.address.toLowerCase()) {
      return;
    }

    if (command === "gm" || text.toLowerCase() === "gm") {
      await context.send("gm");
      return;
    }

    if (command === "invest") {
      const { amount, context } = params;

      if (!amount) {
        await context.send("You must provide an amount to invest.");
      }
      if (!context) {
        await context.send(
          "You must provide a textual description of your risk/return preference."
        );
      }
      //get recommendation from Brian
      const { analysis, depositPrompt, swapPrompt } =
        await getDefiRecommendation(context, amount);

      //perform the swapPrompt transaction
      if (swapPrompt !== "") {
        const swapResult = await brianCDPSDK.transact(swapPrompt);

        let hasBalance = false;

        while (!hasBalance) {
          const [balance] = await brianCDPSDK.brianSDK.transact({
            chainId:
              analysis.chain.toLowerCase() === "base"
                ? "8453"
                : analysis.chain.toLowerCase() === "polygon"
                ? "137"
                : "42161",
            prompt: `What is the ${analysis.toToken} balance of ${address}?`,
            address: address,
          });

          const balanceAmount = parseFloat(
            balance.data.description
              .split("is")[1]
              .split(")")[0]
              .replace("$", "")
          );

          if (balanceAmount > parseFloat(amount)) {
            hasBalance = true;
          }
          // wait 30 seconds
          await new Promise((resolve) => setTimeout(resolve, 30000));
        }
      }

      //perform the depositPrompt transaction using L0
      const depositResult = await brianCDPSDK.transact(depositPrompt);

      await context.send(
        `Transaction executed successfully: ${depositResult[0].getTransactionLink()}`
      );
    }
  },
  { privateKey }
);
