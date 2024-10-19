# 🪄 Power Agents

This repository contains the code for the **Power Agents** project, developed at the **ETHGlobal San Francisco** hackathon.

## ❓ What is this?

Power Agents is a collection of AI agents that you can spawn and chat with in an XMTP Group Chat. These agents are powered by [Brian](https://www.brianknows.org) and leverage the **CDP SDK** to have their own wallets and funds to operate.

Each agent when it's created receives a `poweragents.eth` **ENS** subdomain, so that the user can easily remember it's handle when creating a new group chat, or when chatting with it outside of a group.

### 🤖 Agents

- **Brian Agent** ("brian") - the Brian Agent is a general AI agent that can answer questions, provide information and allows you to execute transactions (like **swaps**, **bridging**, **transfers** and so on) by prompting it with natural language;
- **Limit Orders Agent** ("limit") - the Limit Orders Agent is an agent capable of performing one or multiple actions when a token on Base reaches a particular price. An example would be performing a swap (eg. "I want to swap 1 ETH for USDC") when ETH reaches a certain price (eg. $3000);
- **Recurring Actions Agent** ("recurring") - the Recurring Actions Agent is an agent capable of executing recurring operations every X amount of time. An example would be swapping 100 USDC for ETH every 24 hours;
- **Savings Agent** ("savings") - the Savings Agent is an agent capable of depositing funds into DeFi protocols on chains other than Base (eg. Arbitrum, Optimism). It's also capable of choosing the best DeFi protocol where to put your funds based on the current APY.

## 🚀 How to use it

You need to create a new group chat on [Converse](https://converse.xyz) and add `poweragents.eth` to the chat: this is the main bot that allows you to spawn new agents.

Once you've added `poweragents.eth` to the chat, you can spawn a new agent by typing `/new <agent-type> <agent-name>`. You can only have **one** agent of each type, and the name of the agent will be used to create the ENS subdomain. If the agent name is already taken, you will be prompted to choose a different one.

You can also follow the instructions of the `poweragents.eth` bot in the chat.

## 🏆 Bounties

These are the bounties we applied to at the **ETHGlobal San Francisco** hackathon. For each bounty, you have a description and why and how we implemented that given technology in this project:

- **XMTP** - this is the core technology of our project: in order to create new agents, interact with them, and much more, we use XMTP. We also developed a very clever way for spawning new XMTP bots (agents) in the same repository without needing to redeploy the whole project. This uses NodeJS `worker_threads` that get spawned when a new agent is created, and they run the XMTP bot code relative to their function. This way, we can have multiple agents running in parallel without needing to deploy multiple instances of the same codebase;
- **CDP SDK** - CDP SDK powers all our agents: each agent has its own wallet and funds, created at runtime. This allows us to perform recurring operations, limit orders, and much much more by allowing the user to just interact with their agents via a chat (XMTP);
- **LayerZero** - LayerZero omnichain messaging powers our powerful Savings Agent: by leveraging LayerZero, we're able to move the user funds from Base/Polygon (the main chaisn of the user and the agents) to other chains like Arbitrum, Optimism, and so on. This allows us to deposit funds and earn on chains that are not supported by the CDP SDK. We also support the other way around, so withdrawing funds and rewards and going back to Base, allowing the user to have a seamless experience when interacting with DeFi protocols on different chains;
- **Polygon** - our agents work by default on Polygon, and are able to perform on such chain;
- **ENS** - whenever a new agent gets created, the user specifies a name for it and that name is used to generate a `<name>.poweragents.eth` subdomain for that given agent. This is useful for later retrieval or for interacting with the agent itself.
