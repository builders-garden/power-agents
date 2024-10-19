import { base, optimism, arbitrum } from "viem/chains";
import { AGENT_CONTRACT_INIT_CODE, AGENT_FACTORY_ADDRESS_ARBITRUM, AGENT_FACTORY_ADDRESS_BASE, AGENT_FACTORY_ADDRESS_OPTIMISM, L0_ENDPOINT_ADDRESS_ARBITRUM, L0_ENDPOINT_ADDRESS_BASE, L0_ENDPOINT_ADDRESS_OPTIMISM } from "./constants";
import { encodeAbiParameters, createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from "viem/accounts";
import { agentAbi } from "./abi";

export async function createAgent(addressAgentCreator: `0x${string}`, chainId: number, salt:`0x${string}`) {
  // Get the factory address and L0 endpoint address based on the chain ID
  let factoryAddress: `0x${string}`;
  let l0EndpointAddress: `0x${string}`;
  let chain;

  // Get the factory address and L0 endpoint address based on the chain ID
  switch (chainId) {
    case base.id:
      factoryAddress = AGENT_FACTORY_ADDRESS_BASE;
      l0EndpointAddress = L0_ENDPOINT_ADDRESS_BASE;
      chain = base;
      break;
    case optimism.id:
      factoryAddress = AGENT_FACTORY_ADDRESS_OPTIMISM;
      l0EndpointAddress = L0_ENDPOINT_ADDRESS_OPTIMISM;
      chain = optimism;
      break;
    case arbitrum.id:
      factoryAddress = AGENT_FACTORY_ADDRESS_ARBITRUM;
      l0EndpointAddress = L0_ENDPOINT_ADDRESS_ARBITRUM;
      chain = arbitrum;
      break;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  // Calculate initialization parameters
  const encodedData = encodeAbiParameters(
    [
      { type: "address", name: "_endpoint" },
      { type: "address", name: "_admin" },
    ],
    [l0EndpointAddress, addressAgentCreator]
  ) as `0x${string}`;
  const cleanEncodedData = encodedData.slice(2);

  // Get the init code for the agent contract
  const initCode = AGENT_CONTRACT_INIT_CODE + cleanEncodedData as `0x${string}`;

  // Deploy the agent contract
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  })
  // Get the private key from the environment variable
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)

  // Create a wallet client
  const walletClient = createWalletClient({
    chain,
    account,
    transport: http(),
  })

  // Simulate the contract deployment
  const { request } = await publicClient.simulateContract({
    address: factoryAddress,
    abi: agentAbi,
    functionName: 'deploy',
    args: [salt, initCode],
    account
  })
  // Execute the deployment through the factory using create3
  await walletClient.writeContract(request);

  console.log(`Agent deployed to ${factoryAddress} on chain ${chain.name}`)
}
