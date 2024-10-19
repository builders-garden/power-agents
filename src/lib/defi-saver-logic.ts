import { BrianSDK } from "@brian-ai/sdk";

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

const options = {
    apiUrl: process.env.BRIAN_API_URL!,
    apiKey: process.env.BRIAN_API_KEY!,
};
  
const brian = new BrianSDK(options);

export async function analyzeDefiData(data: DefiData, preferences: UserPreferences): Promise<AnalysisResult> {
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

    Format the response as a JSON object.
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
export async function getDefiRecommendation(filePath: string, preferences: UserPreferences): Promise<AnalysisResult> {
  const defiData = loadDefiData(filePath);
  return await analyzeDefiData(defiData, preferences);
}
