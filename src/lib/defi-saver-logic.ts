import { BrianSDK } from "@brian-ai/sdk";
import { encodeAbiParameters } from 'viem'


import * as fs from 'fs';

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

interface UserPreferences {
  riskPreference: 'low' | 'medium' | 'high';
  returnPreference: 'low' | 'medium' | 'high';
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
  prompt: string;
}

const options = {
    apiUrl: process.env.BRIAN_API_URL!,
    apiKey: process.env.BRIAN_API_KEY!,
};
  
const brian = new BrianSDK(options);

export async function analyzeDefiData(data: DefiData, preferences: UserPreferences, amount: number): Promise<AnalysisResult> {
  // Filter and sort data based on user preferences
  const filteredData = filterAndSortData(data.data, preferences);

  const prompt = `
    Analyze the following DeFi project data:
    ${JSON.stringify(filteredData)}

    User preferences:
    Risk: ${preferences.riskPreference}
    Return: ${preferences.returnPreference}

    Provide the following information for the best option, it's mandatory to provide all of them:
    1. Project name
    2. Chain
    3. Token symbol
    4. To Token
    5. A brief explanation of why this option is recommended, considering the user's preferences.

    Format the response as JSON.
  `;

  const response = await brian.ask({
    prompt: prompt,
    kb: "public-knowledge-box",
  });

  return JSON.parse(response.answer || '{}') as AnalysisResult;
}

export function filterAndSortData(data: DefiDataItem[], preferences: UserPreferences): DefiDataItem[] {
  // Filter data based on risk preference
  let filteredData = data.filter(item => {
    if (preferences.riskPreference === 'low') {
      return item.stablecoin && item.ilRisk === 'no';
    } else if (preferences.riskPreference === 'medium') {
      return item.ilRisk === 'no';
    }
    return true; // For high risk, include all options
  });

  // Sort data based on return preference
  filteredData.sort((a, b) => {
    if (preferences.returnPreference === 'high') {
      return b.apy - a.apy;
    } else if (preferences.returnPreference === 'low') {
      return a.apy - b.apy;
    }
    return 0; // For medium return, keep original order
  });

  // Return top 5 options
  return filteredData.slice(0, 5);
}

export function loadDefiData(filePath: string): DefiData {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Add this new function to demonstrate usage
export async function getDefiRecommendation(preferences: UserPreferences, amount: number): Promise<RecommendationResult> {
  const defiData = loadDefiData('./defi-saver-data.json');
  const analysis = await analyzeDefiData(defiData, preferences, amount);
  
  const prompt = `deposit ${amount} ${analysis.tokenSymbol} on ${analysis.projectName} on ${analysis.chain}`;
  
  return { analysis, prompt };
}

// Get transaction data
export async function getTransactionDataFromBrian(prompt: string, agentAddress: string){
    //get prompt from txDataInput
    const response = await brian.transact({
        prompt: prompt,
        address: agentAddress,
    })

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

    return {txData, txValues, txTo};
}

//Build Layer Zero transaction
export async function buildLayerZeroTransaction(txData: string[], txValues: string[], txTo: string[]){
    let l0Tx: `0x${string}`[] = [];
    for (let i = 0; i < txData.length; i++) {
        const encoded = encodeAbiParameters(
            [{type: 'address', name: 'target'}, {type: 'bytes', name: 'callData'}, {type: 'uint256', name: 'value'}],
            [txTo[i] as `0x${string}`, txData[i] as `0x${string}`, BigInt(txValues[i])]
        );
        l0Tx.push(encoded);
    }
    return l0Tx;
}

//TODO: add crosshchain swap/bridge before deposit
//TODO: save on db the deposit