import "dotenv/config";

import { BrianCoinbaseSDK } from "@brian-ai/cdp-sdk";
import { run, HandlerContext } from "@xmtp/message-kit";
import cron from "node-cron";

import {
  handleLimitTransactions,
  handleRecurringTransactions,
} from "./lib/cron.js";
import { supabase } from "./lib/supabase.js";
import { agentsEmitter } from "./agents-emitter.js";
import { startExistingAgents } from "./utils.js";
import { bytesToHex, createPublicClient, http, numberToBytes, pad } from "viem";
import { createAgent, setupOAppContracts } from "./lib/layer-zero-setup.js";
import { mainnet } from "viem/chains";

const bots: string[] = [];

startExistingAgents();

// check recurring transactions every minute
cron.schedule("* * * * *", handleRecurringTransactions);

// check limit orders every 5 minutes
cron.schedule("*/5 * * * *", handleLimitTransactions);

run(async (context: HandlerContext) => {
  try {
    console.log("[bot-worker] received a new message.");
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
        "I'm the Power Agents bot. You can create multiple agents through me and interact with them in this chat. To create a new agent, use the command /new."
      );
      await context.send(
        "The command /new takes two parameters: type and name. The type parameter specifies the type of agent you want to create (brian, trader, recurring, limit). The name parameter specifies the name of the agent."
      );
      await context.send(
        "The name parameter will be used to create a subdomain in the form {name}.poweragents.eth, which you can use to interact with your agent."
      );
      await context.send(
        "These are the various types of agents you can create:"
      );
      await context.send(
        "1. Brian: An agent that can interact with the Brian API to perform various tasks such as searching information or perform basic operations (swaps, bridging, transfers, etc)."
      );
      await context.send(
        "2. Limit: An agent that will manage limit orders for you. You can create a limit order by providing a prompt, token address, and price."
      );
      await context.send(
        "3. Recurring: An agent that will execute a transaction at a specified interval. You can create a recurring transaction by providing a prompt and interval."
      );
      await context.send(
        "4. Savings: An agent that will allow you to deposit funds and earn interest on Base, Arbitrum or Optimism based on the best current market conditions (powered by LayerZero)."
      );
      return;
    }

    if (command === "new") {
      const { type, name } = params;

      if (!type) {
        await context.send(
          "To create a new agent, you must provide the type of agent you want to create. Available types: brian, trader, recurring, limit."
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

      const { data: existingRecord } = await supabase
        .from("records")
        .select("*")
        .eq("name", `${name}.poweragents.eth`)
        .single();

      if (existingRecord) {
        await context.send(
          `The name "${name}.poweragents.eth" is already taken. Please choose another name.`
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
      let agentContract;

      if (type === "savings") {
        await context.send(
          "Setting up savings agent... This may take a while, please wait."
        );
        // deploy agent contract
        const chainIds = [8453, 42161, 10];

        for (const chainId of chainIds) {
          agentContract = await createAgent(
            defaultAddress.getId() as `0x${string}`,
            chainId,
            bytesToHex(numberToBytes(8), { size: 32 })
          );
        }

        await context.send("LayerZero contracts deployed successfully.");
        await context.send("Setting up connections...");

        await setupOAppContracts(
          8453,
          42161,
          agentContract! as `0x${string}`,
          pad(agentContract! as `0x${string}`)
        );
        await setupOAppContracts(
          8453,
          10,
          agentContract! as `0x${string}`,
          pad(agentContract! as `0x${string}`)
        );
        await setupOAppContracts(
          10,
          42161,
          agentContract! as `0x${string}`,
          pad(agentContract! as `0x${string}`)
        );
        await setupOAppContracts(
          10,
          8453,
          agentContract! as `0x${string}`,
          pad(agentContract! as `0x${string}`)
        );
        await setupOAppContracts(
          42161,
          8453,
          agentContract! as `0x${string}`,
          pad(agentContract! as `0x${string}`)
        );
        await setupOAppContracts(
          42161,
          10,
          agentContract! as `0x${string}`,
          pad(agentContract! as `0x${string}`)
        );

        await context.send("Smart Contracts connected successfully.");
      }

      const newAgent = await supabase
        .from("agents")
        .insert<any>({
          owner: sender.address,
          seed: privateKey,
          address: defaultAddress.getId(),
          group: context.group.id,
          agentType: type,
          mpcData,
          agentContract: agentContract,
        })
        .select("*")
        .single();

      await supabase.from("records").insert({
        owner: sender.address,
        name: `${name}.poweragents.eth`,
        contenthash: "",
        texts: "",
        addresses: {
          60: defaultAddress.getId() as `0x${string}`,
        },
      });

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
        `Your new agent is available at ${name}.poweragents.eth!`
      );
      await context.send(
        `Add it to this group chat and start chatting with it.`
      );

      return;
    }

    if (command === "add") {
      const { address } = params;

      let resolvedAddress = address;

      if (!address.startsWith("0x") && address.includes(".poweragents.eth")) {
        const publicClient = createPublicClient({
          transport: http(),
          chain: mainnet,
        });
        resolvedAddress = await publicClient.getEnsAddress({ name: address });
      }

      if (context.group) {
        await context.group.addMembers([resolvedAddress]);
        if (!bots.includes(resolvedAddress.toLowerCase())) {
          bots.push(resolvedAddress.toLowerCase());
        }
      }
    }

    if (command === "chain") {
      const { chain } = params;

      if (!chain || !["base", "polygon"].includes(chain.toLowerCase())) {
        await context.send(
          "You must provide a valid chain. Available chains: base, polygon."
        );
        return;
      }

      await supabase
        .from("preferences")
        .upsert({ address: sender.address, chain: chain.toLowerCase() });

      await context.send(`You're now connected to ${chain.toLowerCase()}.`);
    }
  } catch (error) {
    console.error(`[🚨 new-message] error: ${error}`);
    await context.send(
      `An error occurred while processing your message. Please try again.`
    );
  }
});
