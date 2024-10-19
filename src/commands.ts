import { CommandGroup } from "@xmtp/message-kit";

export const commands: CommandGroup[] = [
  {
    name: "GM",
    triggers: ["@gm", "/gm", "gm"],
    description: "Says good morning.",
    commands: [],
  },
  {
    name: "Create agent",
    triggers: ["@new", "/new"],
    description: "Creates a new agent and adds it to the user group chat.",
    commands: [
      {
        command: "/new [type] [name]",
        description: "Creates a new agent.",
        params: {
          type: {
            type: "string",
            values: ["brian", "savings", "recurring", "trending"],
            default: "",
          },
          name: {
            type: "string",
            default: "",
          },
        },
      },
    ],
  },
  {
    name: "Add agent",
    triggers: ["@add", "/add"],
    description: "Adds an agent to the user group chat.",
    commands: [
      {
        command: "/add [address]",
        description: "Adds an agent to the user group chat.",
        params: {
          address: {
            type: "string",
            default: "",
          },
        },
      },
    ],
  },
  {
    name: "Brian",
    triggers: ["@brian", "/brian"],
    description: "Sends a transaction via the Brian APIs.",
    commands: [
      {
        command: "/brian [prompt]",
        description: "Sends a transaction via the Brian APIs.",
        params: {
          prompt: {
            type: "string",
            default: "",
          },
        },
      },
    ],
  },
  {
    name: "Info",
    triggers: ["@info", "/info"],
    description: "Shows information about the bot.",
    commands: [],
  },
];
