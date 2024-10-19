import { base, optimism, arbitrum } from "viem/chains";
import { AGENT_CONTRACT_INIT_CODE, AGENT_FACTORY_ADDRESS_ARBITRUM, AGENT_FACTORY_ADDRESS_BASE, AGENT_FACTORY_ADDRESS_OPTIMISM, L0_CHAIN_ID_ARBITRUM, L0_CHAIN_ID_BASE, L0_CHAIN_ID_OPTIMISM, L0_ENDPOINT_ADDRESS_ARBITRUM, L0_ENDPOINT_ADDRESS_BASE, L0_ENDPOINT_ADDRESS_OPTIMISM } from "./constants";
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

export async function setupOAppContracts(srcChainId: number, dstChainId: number, contractAddress: `0x${string}`) {
  // Get the chain based on the chain ID
  let srcChain;
  let dstChain;
  let srcChainL0Id;
  let dstChainL0Id;

  switch (srcChainId) {
    case base.id:
      srcChain = base;
      srcChainL0Id = L0_CHAIN_ID_BASE;
      break;
    case optimism.id:
      srcChain = optimism;
      srcChainL0Id = L0_CHAIN_ID_OPTIMISM;
      break;
    case arbitrum.id:
      srcChain = arbitrum;
      srcChainL0Id = L0_CHAIN_ID_ARBITRUM;
      break;
    default:
      throw new Error(`Unsupported chain ID: ${srcChainId}`);
  }

  switch (dstChainId) {
    case base.id:
      dstChain = base;
      dstChainL0Id = L0_CHAIN_ID_BASE;
      break;
    case optimism.id:
      dstChain = optimism;
      dstChainL0Id = L0_CHAIN_ID_OPTIMISM;
      break;
    case arbitrum.id:
      dstChain = arbitrum;
      dstChainL0Id = L0_CHAIN_ID_ARBITRUM;
      break;
    default:
      throw new Error(`Unsupported chain ID: ${dstChainId}`);
  }

  // Deploy the agent contract
  const publicClient = createPublicClient({
    chain:srcChain,
    transport: http(),
  })
  // Get the private key from the environment variable
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)

  // Create a wallet client
  const walletClient = createWalletClient({
    chain:srcChain,
    account,
    transport: http(),
  })

  // Simulate the contract deployment
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: agentAbi,
    functionName: 'init',
    args: [dstChainL0Id, contractAddress],
    account
  })
  // Execute the deployment through the factory using create3
  await walletClient.writeContract(request);

  console.log(`Agent contract initialized on both ${srcChain.name} and ${dstChain.name}`)

}

//TODO: add ABI, set pvt key