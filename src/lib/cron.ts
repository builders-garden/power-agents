import { BrianCoinbaseSDK } from "@brian-ai/cdp-sdk";
import { supabase } from "./supabase.js";

export const handleRecurringTransactions = async () => {
  const { data: recurrings } = await supabase.from("recurring").select("*");

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

  for (const transaction of toBeExecuted) {
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

      brianCDPSDK.importWallet(agentData.mpcData);

      await brianCDPSDK.transact(transaction.command);

      await supabase
        .from("recurring")
        .update({
          lastExection: new Date().getTime(),
        })
        .eq("id", transaction.id);
    }
  }
};

export const handleLimitTransactions = async () => {};
