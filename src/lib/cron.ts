import { BrianCoinbaseSDK } from "@brian-ai/cdp-sdk";
import { getPreferredChainString, supabase } from "./supabase.js";
import { createConfig, getToken } from "@lifi/sdk";
import { xmtpClient } from "@xmtp/message-kit";

createConfig({
  integrator: "power-agents",
});

export const handleRecurringTransactions = async () => {
  try {
    const { data: recurrings } = await supabase.from("recurring").select("*");

    console.log(
      "[handleRecurringTransactions] recurrings:",
      recurrings?.length
    );

    if (!recurrings) return;

    const toBeExecuted = [];

    for (const recurring of recurrings) {
      if (
        parseInt((recurring.lastExecution / 1000).toFixed(0)) <
        parseInt((new Date().getTime() / 1000).toFixed(0)) + recurring.interval
      ) {
        toBeExecuted.push(recurring);
      }
    }

    console.log(
      "[handleRecurringTransactions] toBeExecuted:",
      toBeExecuted.length
    );

    for (const transaction of toBeExecuted) {
      console.log("[handleRecurringTransactions] executing transaction...");
      const { data: agentData } = await supabase
        .from("agents")
        .select("*")
        .eq("id", transaction.agentId)
        .single();

      if (agentData) {
        const brianCDPSDK = new BrianCoinbaseSDK({
          brianApiKey: process.env.BRIAN_API_KEY!,
          coinbaseApiKeyName: process.env.CDP_SDK_API_KEY_NAME,
          coinbaseApiKeySecret: process.env.CDP_SDK_API_KEY_SECRET,
        });

        await brianCDPSDK.importWallet(agentData.mpcData);

        const result = await brianCDPSDK.transact(
          `${transaction.prompt} on ${await getPreferredChainString(
            agentData.owner
          )}`
        );

        const { client } = await xmtpClient(undefined, agentData.seed);

        const conversation = client.conversations.getConversationById(
          agentData.group
        );

        await conversation?.send(
          `Recurring transaction executed successfully: ${result[0].getTransactionLink()}`
        );

        await supabase
          .from("recurring")
          .update({
            lastExection: new Date().getTime(),
          })
          .eq("id", transaction.id);

        console.log(
          "[handleRecurringTransactions] transaction executed successfully."
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export const handleLimitTransactions = async () => {
  const { data: limits } = await supabase.from("limits").select("*");

  console.log("[handleLimitTransactions] limits:", limits?.length);

  if (!limits) return;

  const toBeExecuted = [];

  console.log("[handleLimitTransactions] toBeExecuted:", toBeExecuted.length);

  for (const limit of limits) {
    const token = await getToken(8453, limit.token);
    const tokenPrice = parseFloat(token.priceUSD);

    if (tokenPrice >= limit.price) {
      toBeExecuted.push(limit);
    }
  }

  for (const transaction of toBeExecuted) {
    console.log("[handleLimitTransactions] executing transaction...");
    const { data: agentData } = await supabase
      .from("agents")
      .select("*")
      .eq("id", transaction.agentId)
      .single();

    if (agentData) {
      const brianCDPSDK = new BrianCoinbaseSDK({
        brianApiKey: process.env.BRIAN_API_KEY!,
        coinbaseApiKeyName: process.env.CDP_SDK_API_KEY_NAME,
        coinbaseApiKeySecret: process.env.CDP_SDK_API_KEY_SECRET,
      });

      await brianCDPSDK.importWallet(agentData.mpcData);

      const result = await brianCDPSDK.transact(
        `${transaction.prompt}  on ${await getPreferredChainString(
          agentData.owner
        )}`
      );

      const { client } = await xmtpClient(undefined, agentData.seed);

      const conversation = client.conversations.getConversationById(
        agentData.group
      );

      await conversation?.send(
        `Limit transaction executed successfully: ${result[0].getTransactionLink()}`
      );

      await supabase.from("limits").delete().eq("id", transaction.id);

      console.log(
        "[handleLimitTransactions] transaction executed successfully."
      );
    }
  }
};
