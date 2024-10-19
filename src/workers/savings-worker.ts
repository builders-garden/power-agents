import { HandlerContext, run } from "@xmtp/message-kit";
import { workerData } from "node:worker_threads";
import { buildLayerZeroTransaction, getDefiRecommendation, getTransactionDataFromBrian } from "../lib/defi-saver-logic";
import { BrianCoinbaseSDK } from "@brian-ai/cdp-sdk";
import { decodeFunctionDataForCdp, getSavingData } from "../lib/saving-worker-utils";
import { erc20Abi } from "viem";
import { agentAbi } from "../lib/abi";
import { L0_CHAIN_ID_ARBITRUM, L0_CHAIN_ID_OPTIMISM } from "../lib/constants";
import { Options } from '@layerzerolabs/lz-v2-utilities';

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
      let l0Transaction;
      //get recommendation from Brian
      const { analysis, depositPrompt, swapPrompt, isSwap, destinationChain } = await getDefiRecommendation(context, amount);
      //perform the swapPrompt transaction
      if (swapPrompt !== "" && isSwap) { //swap on Base and deposit on Base
        const swapResult = await brianCDPSDK.transact(swapPrompt);
        const depositResult = await brianCDPSDK.transact(depositPrompt);
      }
      if (swapPrompt === "" && !isSwap) { //deposit on Base
        const depositResult = await brianCDPSDK.transact(depositPrompt);
      }
      if (swapPrompt !== "" && !isSwap) { //cross chain swap from Base and deposit on destination chain
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

        //prendere tx da brian
        const {txData, txTo, txValues} = await getTransactionDataFromBrian(depositPrompt, address);

        //encode messages: approve + deposit
        const [l0Tx] = await buildLayerZeroTransaction(txData, txValues, txTo);

        const messages = [l0Tx];

        const dstEids = destinationChain.toLowerCase() === "arbitrum" ? [L0_CHAIN_ID_ARBITRUM, L0_CHAIN_ID_ARBITRUM] : [L0_CHAIN_ID_OPTIMISM, L0_CHAIN_ID_OPTIMISM];
        
        const GAS_LIMIT = 1000000; // Gas limit for the executor
        const MSG_VALUE = 0; // msg.value for the lzReceive() function on destination in wei
        
        const options = Options.newOptions().addExecutorLzReceiveOption(GAS_LIMIT, MSG_VALUE);

        //send args for cdp
        const sendArgs = {
          _dstEids: dstEids,
          _msgType: "SEND",
          _messages: messages,
          _extraSendOptions: options,
        };

        //TODO: get address of the agent contract
        const agentContractAddress = "0x0000000000000000000000000000000000000000";

        //first message is the approve
        const l0Transaction = await brianCDPSDK.currentWallet?.invokeContract({
          contractAddress: agentContractAddress, //TODO: change
          method: "send",
          abi: agentAbi,
          args: sendArgs
        });
      }
      await context.send(
        `Transaction executed successfully: ${l0Transaction!.getTransactionLink()}`
      );
    }
  },
  { privateKey }
);
