import { getTransactionDataFromBrian, buildLayerZeroTransaction } from "../defi-saver-logic";
import { BrianSDK } from "@brian-ai/sdk";

async function runDeFiSaverDemo() {
  // Initialize BrianSDK (you might need to add your API key or other configuration)
  const brian = new BrianSDK({
    apiUrl: process.env.BRIAN_API_URL!,
    apiKey: process.env.BRIAN_API_KEY!,
  });

  // Example prompt and agent address
  const prompt = "deposit 100 usdc to aave on arbitrum";
  const agentAddress = "0x1234567890123456789012345678901234567890";

  try {
    console.log("Getting transaction data from Brian...");
    const txData = await getTransactionDataFromBrian(prompt, agentAddress);
    console.log("Transaction data received:", txData);

    console.log("\nBuilding Layer Zero transaction...");
    const l0Tx = await buildLayerZeroTransaction(txData.txData, txData.txValues, txData.txTo);
    console.log("Layer Zero transaction built:", l0Tx);

  } catch (error) {
    console.error("An error occurred:", error);
  }
}

runDeFiSaverDemo();