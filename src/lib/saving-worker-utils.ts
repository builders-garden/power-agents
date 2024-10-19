import { Abi, AbiFunction, decodeFunctionData } from "viem";
import { BrianSDK } from "@brian-ai/sdk";
import {
  Coinbase,
  ContractInvocation,
  FaucetTransaction,
  Transfer,
  Wallet,
  WalletAddress,
  WalletCreateOptions,
  WalletData,
} from "@coinbase/coinbase-sdk";
import { erc20Abi } from "viem";
import { ENSO_ROUTER_ABI } from "./abi";

const options = {
    apiUrl: process.env.BRIAN_API_URL!,
    apiKey: process.env.BRIAN_API_KEY!,
};
  
const brian = new BrianSDK(options);

export function decodeFunctionDataForCdp(
    abi: Abi,
    data: `0x${string}`
  ): [Record<string, any>, string] {
    const { args, functionName } = decodeFunctionData({ abi, data });
  
    if (!args || args.length === 0) {
      return [{}, functionName];
    }
  
    const abiFunction = abi
      .filter((item) => item.type === "function")
      .find((f: AbiFunction) => f.name === functionName);
  
    if (!abiFunction) {
      throw new Error("Function not found in ABI");
    }
  
    const inputs = abiFunction.inputs || [];
  
    if (inputs.length === 0) {
      return [{}, functionName];
    }
  
    const result: Record<string, any> = {};
  
    inputs.forEach((input, index) => {
      result[input.name!] =
        typeof args[index] === "bigint" ? args[index].toString() : args[index];
    });
  
    return [result, functionName];


}

export async function getSavingData(prompt: string, address: string) {

    //get transaction result from Brian
    const data = await brian.transact({
        prompt,
        address
    })

    for (const transactionResult of data) {
        const { action, data, solver } = transactionResult;

        let txData: Record<string, any>[] = [];
        let functionNames: string[] = [];
        let txTo: string[] = [];

        const txStepsLength = data.steps!.length;
        if (txStepsLength === 0) {
        continue;
        }
        const approveNeeded = data.steps!.length > 1;

        if (approveNeeded) {
            const [decodedData, functionName] = decodeFunctionDataForCdp(
                erc20Abi,
                data.steps![0].data
            );
            
            txData.push(decodedData);
            functionNames.push(functionName);
            txTo.push(data.steps![0].to);
        }

        const solverAbi = ENSO_ROUTER_ABI;
        
        //decode data according to CDP sdk
        const [decodedData, functionName] = decodeFunctionDataForCdp(
            solverAbi,
            data.steps![data.steps!.length - 1].data
        );

        txData.push(decodedData);
        functionNames.push(functionName);
        txTo.push(data.steps![data.steps!.length - 1].to);

        return { txData, functionNames, txTo };
    }

}