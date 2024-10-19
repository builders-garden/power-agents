import { BrianCoinbaseSDK } from "@brian-ai/cdp-sdk";
import { run, HandlerContext } from "@xmtp/message-kit";
import "dotenv/config";
import { agentsEmitter } from "./agents-emitter.js";
import { supabase } from "./lib/supabase.js";
import { startExistingAgents } from "./utils.js";
import cron from "node-cron";

const bots: string[] = [];

startExistingAgents().then(() => {
  // check recurring transactions every 2 minutes
  cron.schedule("*/2 * * * *", async () => {
    const { data: recurrings } = await supabase.from("recurring").select("*");

    if (!recurrings) return;

    const toBeExecuted = [];

    for (const recurring of recurrings) {
      if (recurring.lastExection < new Date().getTime() + recurring.interval) {
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
  });

  // check limit orders every 5 minutes
  cron.schedule("*/5 * * * *", async () => {});
});

run(async (context: HandlerContext) => {
  try {
    const {
      typeId,
      content: { content: text, command, params },
      sender,
    } = context.message;

    if (typeId !== "text" || bots.includes(sender.address.toLowerCase())) {
      return;
    }

    if (command === "info") {
      await context.send(
        "I'm a bot that can create agents for you. To create a new agent, use the command /new [type] [name]. Available types: brian, savings, recurring, trending."
      );
      return;
    }

    if (command === "gm" || text.toLowerCase() === "gm") {
      await context.send("gm");
      return;
    }

    if (command === "new") {
      const { type, name } = params;

      if (!type) {
        await context.send(
          "To create a new agent, you must provide the type of agent you want to create. Available types: brian, trader, recurring, trending."
        );
        return;
      }

      if (!name) {
        await context.send(
          "To create a new agent, you must provide a name. You will get a subdomain in the form {name}.brianagents.eth to text your agent."
        );
        return;
      }

      const { data: agentData } = await supabase
        .from("agents")
        .select("*")
        .eq("agentType", type)
        .eq("owner", sender.address)
        .single();

      if (agentData) {
        await context.send(
          `You already have an agent of type "${type}": ${agentData.address}. You can only have one agent of each type.`
        );
        return;
      }

      const brianCDPSDK = new BrianCoinbaseSDK({
        brianApiKey: process.env.BRIAN_API_KEY!,
        coinbaseApiKeyName: process.env.CDP_SDK_API_KEY_NAME,
        coinbaseApiKeySecret: process.env.CDP_SDK_API_KEY_SECRET,
      });

      await brianCDPSDK.createWallet({
        networkId: "base-mainnet",
      });

      const mpcData = brianCDPSDK.exportWallet();

      const defaultAddress = await brianCDPSDK.getDefaultAddress();

      const privateKey = defaultAddress.export();

      const newAgent = await supabase
        .from("agents")
        .insert<any>({
          owner: sender.address,
          seed: privateKey,
          address: defaultAddress.getId(),
          group: context.group.id,
          agentType: type,
          mpcData,
        })
        .select("*")
        .single();

      agentsEmitter.emit("subscribe", {
        ...newAgent.data,
        type,
        name,
        sender,
        privateKey,
        mpcData,
      });

      bots.push(defaultAddress.getId().toLowerCase());

      await context.send(
        `Your new agent is available at ${defaultAddress.getId()}!`
      );
      await context.send(
        `Add it to this group chat and start chatting with it.`
      );

      return;
    }

    if (command === "add") {
      const { address } = params;

      if (context.group) {
        await context.group.addMembers([address]);
        if (!bots.includes(address.toLowerCase())) {
          bots.push(address.toLowerCase());
        }
      }
    }
  } catch (error) {
    console.error(`[🚨 new-message] error: ${error}`);
    await context.send(
      `An error occurred while processing your message: ${error}`
    );
  }
});
