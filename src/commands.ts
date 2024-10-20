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
            values: ["brian", "savings", "recurring", "limit"],
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
    name: "Confirm",
    triggers: ["@confirm", "/confirm"],
    description: "Confirms a transaction.",
    commands: [
      {
        command: "/confirm",
        description: "Confirms a transaction.",
        params: {},
      },
    ],
  },
  {
    name: "Ask",
    triggers: ["@ask", "/ask"],
    description: "Asks a question to Brian.",
    commands: [
      {
        command: "/ask [prompt]",
        description: "Asks a question to Brian.",
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
    name: "Recurring",
    triggers: ["@recurring", "/recurring"],
    description: "Creates a recurring transaction.",
    commands: [
      {
        command: "/recurring [prompt] [interval]",
        description: "Creates a recurring transaction.",
        params: {
          prompt: {
            type: "string",
            default: "",
          },
          interval: {
            type: "number",
            default: 0,
          },
        },
      },
    ],
  },
  {
    name: "Stop recurring",
    triggers: ["/stop-recurring", "@stop-recurring"],
    description: "Stops a recurring transaction.",
    commands: [
      {
        command: "/stop-recurring [id]",
        description: "Stops a recurring transaction.",
        params: {
          id: {
            type: "string",
            default: "",
          },
        },
      },
    ],
  },
  {
    name: "Limit",
    triggers: ["@limit", "/limit"],
    description: "Creates a limit transaction.",
    commands: [
      {
        command: "/limit [prompt] [token] [price]",
        description: "Creates a limit transaction.",
        params: {
          prompt: {
            type: "string",
            default: "",
          },
          token: {
            type: "string",
            default: "",
          },
          price: {
            type: "number",
            default: 0,
          },
        },
      },
    ],
  },
  {
    name: "Stop limit",
    triggers: ["@stop-limit", "/stop-limit"],
    description: "Removes a limit transaction.",
    commands: [
      {
        command: "/stop-limit [id]",
        description: "Removes a limit transaction.",
        params: {
          id: {
            type: "string",
            default: "",
          },
        },
      },
    ],
  },
  {
    name: "Chain",
    triggers: ["@chain", "/chain"],
    description:
      "Allows the user to change chain from base to polygon or viceversa.",
    commands: [
      {
        command: "/chain [chain]",
        description: "Switches the chain to the given one.",
        params: {
          chain: {
            type: "string",
            default: "base",
            values: ["base", "polygon"],
          },
        },
      },
    ],
  },
  {
    name: "Invest",
    triggers: ["@invest", "/invest"],
    description: "Invests a given amount of money.",
    commands: [
      {
        command: "/invest [amount] [description]",
        description: "Invests a given amount of money.",
        params: {
          amount: {
            type: "number",
            default: 0,
          },
          description: {
            type: "string",
            default:
              "I prefer low-risk investments with stable returns. I'm interested in stablecoin pools.",
          },
        },
      },
    ],
  },
  {
    name: "Info",
    triggers: ["@info", "/info"],
    description: "Shows information about the bot.",
    commands: [
      {
        command: "/info",
        description: "Shows information about the bot.",
        params: {},
      },
    ],
  },
];
