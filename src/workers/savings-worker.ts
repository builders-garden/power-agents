import { HandlerContext, run } from "@xmtp/message-kit";
import { workerData } from "node:worker_threads";
import {
  buildLayerZeroTransaction,
  getDefiRecommendation,
  getTransactionDataFromBrian,
} from "../lib/defi-saver-logic.js";
import { BrianCoinbaseSDK } from "@brian-ai/cdp-sdk";
import {
  L0_CHAIN_ID_ARBITRUM,
  L0_CHAIN_ID_OPTIMISM,
} from "../lib/constants.js";
import { Options } from "@layerzerolabs/lz-v2-utilities";
import { createPublicClient, createWalletClient, http } from "viem";
import { base } from "viem/chains";
import { AGENT_CONTRACT_ABI } from "../lib/abi.js";
import { supabase } from "../lib/supabase.js";
import { privateKeyToAccount } from "viem/accounts";

const {
  privateKey,
  sender: agentCreator,
  mpcData,
  address,
  agentContract,
  seed,
  id,
} = workerData;

run(
  async (context: HandlerContext) => {
    console.log("[savings-worker] received a new message.");
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

    if (command === "deposits") {
      const { data: deposits } = await supabase
        .from("deposits")
        .select("*")
        .eq("agentId", id);

      if (!deposits) {
        await context.send("No deposits found.");
        return;
      }

      let message = "Deposits:\n";

      for (const deposit of deposits) {
        message += `ID: ${deposit.id} - ${deposit.amount} ${deposit.token} from ${deposit.protocol} on ${deposit.chain}\n`;
      }

      await context.send(message);

      await context.send(
        `To withdraw a deposit, use the command /withdraw {id}`
      );
    }

    if (command === "invest") {
      const { amount, description } = params;

      if (!amount) {
        await context.send("You must provide an amount to invest.");
      }
      if (!description) {
        await context.send(
          "You must provide a textual description of your risk/return preference."
        );
      }
      let l0Transaction;
      //get recommendation from Brian
      const { analysis, depositPrompt, swapPrompt, isSwap, destinationChain } =
        await getDefiRecommendation(description, amount, agentContract);

      await context.send(
        analysis.projectName +
          " " +
          analysis.tokenSymbol +
          " -- " +
          analysis.explanation
      );

      console.log("[savings-worker] depositPrompt", depositPrompt);
      console.log("[savings-worker] swapPrompt", swapPrompt);
      console.log("[savings-worker] isSwap", isSwap);
      console.log("[savings-worker] destinationChain", destinationChain);

      // // Check balance
      // const publicClient = createPublicClient({
      //   transport: http(),
      //   chain: base,
      // });

      // const balance = await publicClient.readContract({
      //   abi: erc20Abi,
      //   address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      //   functionName: "balanceOf",
      //   args: [agentContract as `0x${string}`],
      // });

      // const parsedBalance = formatUnits(balance, 6);

      // if (parseFloat(parsedBalance) < parseFloat(amount)) {
      //   console.log("[savings-worker] insufficient balance, transfering funds");
      //   await brianCDPSDK.transact(
      //     `Transfer ${amount} ${analysis.tokenSymbol} to ${agentContract} on Base`
      //   );
      // }

      //perform the swapPrompt transaction
      if (swapPrompt !== "" && isSwap) {
        console.log("[savings-worker] swap and deposit on base");
        //swap on Base and deposit on Base
        const swapResult = await brianCDPSDK.transact(swapPrompt);
        const depositResult = await brianCDPSDK.transact(depositPrompt);
        console.log("[savings-worker] swap and deposit on base executed.");
      }
      if (swapPrompt === "" && !isSwap) {
        console.log("[savings-worker] deposit on base");
        //deposit on Base
        const depositResult = await brianCDPSDK.transact(depositPrompt);
        console.log("[savings-worker] deposit on base executed.");
      }
      if (swapPrompt !== "" && !isSwap) {
        console.log("[savings-worker] cross chain swap");
        //cross chain swap from Base and deposit on destination chain
        const swapResult = await brianCDPSDK.transact(swapPrompt);
        console.log("[savings-worker] cross chain swap executed.");

        let hasBalance = false;

        while (!hasBalance) {
          console.log("[savings-worker] checking balance...");
          const [balance] = await brianCDPSDK.brianSDK.transact({
            chainId:
              analysis.chain.toLowerCase() === "base"
                ? "8453"
                : analysis.chain.toLowerCase() === "polygon"
                ? "137"
                : "42161",
            prompt: `What is the ${analysis.tokenSymbol} balance of ${agentContract}?`,
            address: agentContract,
          });

          const balanceAmount = parseFloat(
            balance.data.description
              .split("is")[1]
              .split(")")[0]
              .replace("$", "")
          );

          console.log("[savings-worker] balanceAmount", balanceAmount);
          console.log("[savings-worker] amount", amount);

          if (balanceAmount > parseFloat(amount) * 0.8) {
            hasBalance = true;
          }
          // wait 5 seconds
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        console.log("[savings-worker] balance check passed.");

        //prendere tx da brian
        const { txData, txTo, txValues } = await getTransactionDataFromBrian(
          depositPrompt,
          agentContract
        );

        //encode messages: approve + deposit
        const messages = await buildLayerZeroTransaction(
          txData,
          txValues,
          txTo
        );

        const publicClient = createPublicClient({
          transport: http(),
          chain: base,
        });

        const dstEids = destinationChain.toLowerCase().includes("arbitrum")
          ? [L0_CHAIN_ID_ARBITRUM.toString(), L0_CHAIN_ID_ARBITRUM.toString()]
          : [L0_CHAIN_ID_OPTIMISM.toString(), L0_CHAIN_ID_OPTIMISM.toString()];

        const GAS_LIMIT = 1000000; // Gas limit for the executor
        const MSG_VALUE = 0; // msg.value for the lzReceive() function on destination in wei

        const options = Options.newOptions().addExecutorLzReceiveOption(
          GAS_LIMIT,
          MSG_VALUE
        );

        //send args for cdp
        const sendArgs = {
          _dstEids: dstEids,
          _msgType: "1", //SEND
          _messages: messages,
          _extraSendOptions: options.toHex(),
        };

        //quote fee
        const quoteFee = await publicClient.readContract({
          abi: AGENT_CONTRACT_ABI,
          functionName: "quote",
          address: agentContract,
          args: [
            sendArgs._dstEids.map((item) => Number(item)),
            1,
            sendArgs._messages,
            sendArgs._extraSendOptions as `0x${string}`,
            false,
          ],
        });

        //first message is the approve
        // const l0Transaction = await brianCDPSDK.currentWallet?.invokeContract({
        //   contractAddress: agentContract,
        //   method: "send",
        //   abi: AGENT_CONTRACT_ABI,
        //   args: sendArgs,
        //   amount: quoteFee.nativeFee,
        //   assetId: Coinbase.assets.Wei,
        // });
        const wallet = privateKeyToAccount(seed);

        const walletClient = createWalletClient({
          account: wallet,
          chain: base,
          transport: http(),
        });

        const l0Transaction = await walletClient.writeContract({
          abi: AGENT_CONTRACT_ABI,
          functionName: "send",
          address: agentContract,
          args: [
            sendArgs._dstEids.map((item) => parseInt(item)),
            parseInt(sendArgs._msgType),
            sendArgs._messages,
            sendArgs._extraSendOptions as `0x${string}`,
          ],
          value: quoteFee.nativeFee,
        });

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: l0Transaction,
        });

        // check if another deposit exists
        await supabase.from("deposits").insert({
          agentId: id,
          amount: amount * 0.8,
          chain: destinationChain,
          token: analysis.tokenSymbol,
          protocol: analysis.projectName,
        });

        await context.send(
          `Deposit transaction executed successfully: https://basescan.org/tx/${receipt.transactionHash}`
        );
      }
    }
    if (command === "withdraw") {
      const { id: depositId } = params;

      const { data: deposit } = await supabase
        .from("deposits")
        .select("*")
        .eq("id", depositId)
        .eq("agentId", id)
        .single();

      if (!id || !deposit) {
        await context.send("Invalid deposit id.");
        return;
      }

      if (deposit.chain.toLowerCase() === "base") {
        const withdrawPrompt = `Withdraw ${deposit.amount} ${deposit.token} from ${deposit.protocol} on Base`;
        const withdrawTx = await brianCDPSDK.transact(withdrawPrompt);
        await context.send(
          `Withdraw transaction executed successfully: ${withdrawTx[0].getTransactionLink()}` //TODO: add link
        );
        //if the token received is not USDC, then perform a swap
        if (deposit.token.toLowerCase() !== "usdc") {
          const swapPrompt = `Swap ${deposit.amount} ${deposit.token} to USDC on Base`;
          await brianCDPSDK.transact(swapPrompt);
        }
      } else {
        const withdrawAmount =
          parseFloat(deposit.amount) - parseFloat(deposit.amount) * 0.02;
        //build prompt for withdraw
        const withdrawPrompt = `Withdraw ${withdrawAmount} ${deposit.token} from ${deposit.protocol} on ${deposit.chain}`;

        console.log("[savings-worker] withdrawPrompt", withdrawPrompt);

        //withdraw tx from Brian
        const {
          txData: withdrawTxData,
          txTo: withdrawTxTo,
          txValues: withdrawTxValues,
        } = await getTransactionDataFromBrian(withdrawPrompt, agentContract);

        console.log("[savings-worker] withdrawTxData", withdrawTxData);

        //crosschain swap from Brian
        const crosschainSwapPrompt = `Bridge ${withdrawAmount} ${deposit.token} to USDC from ${deposit.chain} to Base with ${address} as a receiver`;

        //get crosschain swap tx from Brian
        const {
          txData: crosschainSwapTxData,
          txTo: crosschainSwapTxTo,
          txValues: crosschainSwapTxValues,
        } = await getTransactionDataFromBrian(
          crosschainSwapPrompt,
          agentContract
        );

        //get composed parameters appending the two txs data
        const composedTxData = withdrawTxData.concat(crosschainSwapTxData);
        const composedTxTo = withdrawTxTo.concat(crosschainSwapTxTo);
        const composedTxValues = withdrawTxValues.concat(
          crosschainSwapTxValues
        );

        //encode messages: approve + deposit
        const messages = await buildLayerZeroTransaction(
          composedTxData,
          composedTxValues,
          composedTxTo
        );

        const publicClient = createPublicClient({
          transport: http(),
          chain: base,
        });
        // const messages = [l0Tx];

        const dstEids = deposit.chain.toLowerCase().includes("arbitrum")
          ? [L0_CHAIN_ID_ARBITRUM.toString(), L0_CHAIN_ID_ARBITRUM.toString()]
          : [L0_CHAIN_ID_OPTIMISM.toString(), L0_CHAIN_ID_OPTIMISM.toString()];

        const GAS_LIMIT = 1000000; // Gas limit for the executor
        const MSG_VALUE = 0; // msg.value for the lzReceive() function on destination in wei

        const options = Options.newOptions().addExecutorLzReceiveOption(
          GAS_LIMIT,
          MSG_VALUE
        );

        //send args for cdp
        const sendArgs = {
          _dstEids: dstEids,
          _msgType: "1", //SEND
          _messages: messages,
          _extraSendOptions: options.toHex(),
        };

        //quote fee
        const quoteFee = await publicClient.readContract({
          abi: AGENT_CONTRACT_ABI,
          functionName: "quote",
          address: agentContract,
          args: [
            sendArgs._dstEids.map((item) => Number(item)),
            1,
            sendArgs._messages,
            sendArgs._extraSendOptions as `0x${string}`,
            false,
          ],
        });

        console.log("[savings-worker] sendArgs", sendArgs);

        //first message is the approve
        // const l0Transaction = await brianCDPSDK.currentWallet?.invokeContract({
        //   contractAddress: agentContract,
        //   method: "send",
        //   abi: AGENT_CONTRACT_ABI,
        //   args: sendArgs,
        //   amount: quoteFee.nativeFee,
        //   assetId: Coinbase.assets.Wei,
        // });

        const wallet = privateKeyToAccount(seed);

        const walletClient = createWalletClient({
          account: wallet,
          chain: base,
          transport: http(),
        });

        const l0Transaction = await walletClient.writeContract({
          abi: AGENT_CONTRACT_ABI,
          functionName: "send",
          address: agentContract,
          args: [
            sendArgs._dstEids.map((item) => parseInt(item)),
            parseInt(sendArgs._msgType),
            sendArgs._messages,
            sendArgs._extraSendOptions as `0x${string}`,
          ],
          value: quoteFee.nativeFee,
        });

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: l0Transaction,
        });

        await context.send(
          `Withdraw  transaction executed successfully: https://basescan.org/tx/${receipt.transactionHash}`
        );
        await supabase.from("deposits").delete().eq("id", depositId);
      }
    }
  },
  { privateKey }
);
