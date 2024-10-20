import { BrianSDK } from "@brian-ai/sdk";
import { encodeAbiParameters } from "viem";

import * as fs from "fs";

interface DefiDataItem {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number;
  apy: number;
  pool: string;
  stablecoin: boolean;
  ilRisk: string;
  exposure: string;
  predictions: {
    predictedClass: string;
    predictedProbability: number;
    binnedConfidence: number;
  };
  underlyingTokens: { [key: string]: string };
  toToken: string;
}

interface DefiData {
  status: string;
  data: DefiDataItem[];
}

interface AnalysisResult {
  projectName: string;
  chain: string;
  tokenSymbol: string;
  toToken: string;
  explanation: string;
}

interface RecommendationResult {
  analysis: AnalysisResult;
  depositPrompt: string;
  swapPrompt: string;
  isSwap: boolean;
  destinationChain: string;
}

const options = {
  apiUrl: process.env.BRIAN_API_URL!,
  apiKey: process.env.BRIAN_API_KEY!,
};

const brian = new BrianSDK(options);

export async function analyzeDefiData(
  data: DefiData,
  userPreferencesPrompt: string,
  amount: number
): Promise<AnalysisResult> {
  const prompt = `
    Analyze the following DeFi project data:
    ${JSON.stringify(data.data)}

    User preferences:
    ${userPreferencesPrompt}

    Amount to invest: ${amount}

    Provide the following information for the best option, it's mandatory to provide all of them:
    1. Project name
    2. Chain
    3. Token symbol
    4. To Token
    5. A brief explanation of why this option is recommended, considering the user's preferences and the amount to invest.

    Rules:
    - The chain must be one of the following: Base, Arbitrum, Optimism
    - The token symbol must be one of the following: USDC, WETH, DAI, WBTC
    - The project name must be one of the following: Compound, AAVE
    Format the response as a simple list with labels.
  `;

  try {
    const response = await brian.ask({
      prompt: prompt,
      kb: "public-knowledge-box",
    });

    if (!response.answer) {
      throw new Error("Empty response from Brian");
    }

    // Parse the string response into AnalysisResult
    const lines = response.answer.split("\n").map((line) => line.trim());
    const result: Partial<AnalysisResult> = {};

    for (const line of lines) {
      const [key, ...valueParts] = line.split(":").map((part) => part.trim());
      const value = valueParts.join(":").trim();

      if (key.toLowerCase().includes("project name"))
        result.projectName = value;
      else if (key.toLowerCase().includes("chain"))
        result.chain = value.toLowerCase();
      else if (key.toLowerCase().includes("token symbol"))
        result.tokenSymbol = value;
      else if (key.toLowerCase().includes("to token")) result.toToken = value;
      else if (key.toLowerCase().includes("explanation"))
        result.explanation = value;
    }

    // Validate the parsed response
    if (
      !result.projectName ||
      !result.chain ||
      !result.tokenSymbol ||
      !result.toToken ||
      !result.explanation
    ) {
      console.error("Missing fields in parsed result:", result);
      throw new Error("Incomplete response from Brian");
    }

    return result as AnalysisResult;
  } catch (error) {
    console.error("Error in analyzeDefiData:", error);
    throw error;
  }
}

export function loadDefiData(filePath: string): DefiData {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// Add this new function to demonstrate usage
export async function getDefiRecommendation(
  userPreferencesPrompt: string,
  amount: number,
  agentContract: string
): Promise<RecommendationResult> {
  const defiData = loadDefiData("src/lib/defi-saver-data.json");
  const analysis = await analyzeDefiData(
    defiData,
    userPreferencesPrompt,
    amount
  );

  const isSwap =
    analysis.chain.toLowerCase() === "base" &&
    analysis.tokenSymbol.toLowerCase() !== "usdc";

  const swapPrompt =
    analysis.chain.toLowerCase() === "base"
      ? analysis.tokenSymbol.toLowerCase() === "usdc"
        ? ""
        : `swap ${amount} USDC to ${analysis.tokenSymbol} on Base with ${agentContract} as a receiver`
      : `bridge ${amount} USDC to ${analysis.tokenSymbol} from Base to ${analysis.chain} with ${agentContract} as a receiver`;

  const newAmount = amount * 0.8;

  const depositPrompt = `deposit ${newAmount} ${analysis.tokenSymbol} on ${analysis.projectName} on ${analysis.chain}`;

  return {
    analysis,
    swapPrompt,
    depositPrompt,
    isSwap,
    destinationChain: analysis.chain.toLowerCase(),
  };
}

// Get transaction data
export async function getTransactionDataFromBrian(
  prompt: string,
  agentAddress: string
) {
  //get prompt from txDataInput
  const response = await brian.transact({
    prompt: prompt,
    address: agentAddress,
  });

  //array of txData
  let txData: string[] = [];
  let txValues: string[] = [];
  let txTo: string[] = [];

  //get length of steps
  const txDataLength = response[0].data.steps!.length;

  //push in the array
  for (let i = 0; i < txDataLength; i++) {
    txData.push(response[0].data.steps![i].data);
    txValues.push(response[0].data.steps![i].value);
    txTo.push(response[0].data.steps![i].to);
  }

  return { txData, txValues, txTo };
}

//Build Layer Zero transaction
export async function buildLayerZeroTransaction(
  txData: string[],
  txValues: string[],
  txTo: string[]
) {
  let l0Tx: `0x${string}`[] = [];
  for (let i = 0; i < txData.length; i++) {
    const encoded = encodeAbiParameters(
      [
        { type: "address", name: "target" },
        { type: "bytes", name: "callData" },
        { type: "uint256", name: "value" },
      ],
      [
        txTo[i] as `0x${string}`,
        txData[i] as `0x${string}`,
        BigInt(txValues[i]),
      ]
    );
    l0Tx.push(encoded);
  }
  return l0Tx;
}

//TODO: add crosshchain swap/bridge before deposit
//TODO: save on db the deposit
