export const AGENT_CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_endpoint",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_factoryAdmin",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "AlreadyInitialized",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidDelegate",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidEndpointCall",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidMsgType",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "options",
				"type": "bytes"
			}
		],
		"name": "InvalidOptions",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "LzTokenUnavailable",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint32",
				"name": "eid",
				"type": "uint32"
			}
		],
		"name": "NoPeer",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "msgValue",
				"type": "uint256"
			}
		],
		"name": "NotEnoughNative",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "addr",
				"type": "address"
			}
		],
		"name": "OnlyEndpoint",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "OnlyFactoryAdmin",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint32",
				"name": "eid",
				"type": "uint32"
			},
			{
				"internalType": "bytes32",
				"name": "sender",
				"type": "bytes32"
			}
		],
		"name": "OnlyPeer",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "SafeERC20FailedOperation",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"components": [
					{
						"internalType": "uint32",
						"name": "eid",
						"type": "uint32"
					},
					{
						"internalType": "uint16",
						"name": "msgType",
						"type": "uint16"
					},
					{
						"internalType": "bytes",
						"name": "options",
						"type": "bytes"
					}
				],
				"indexed": false,
				"internalType": "struct EnforcedOptionParam[]",
				"name": "_enforcedOptions",
				"type": "tuple[]"
			}
		],
		"name": "EnforcedOptionSet",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "message",
				"type": "bytes"
			},
			{
				"indexed": false,
				"internalType": "uint32",
				"name": "senderEid",
				"type": "uint32"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "sender",
				"type": "bytes32"
			}
		],
		"name": "MessageReceived",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "message",
				"type": "bytes"
			},
			{
				"indexed": false,
				"internalType": "uint32",
				"name": "dstEid",
				"type": "uint32"
			}
		],
		"name": "MessageSent",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint32",
				"name": "eid",
				"type": "uint32"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "peer",
				"type": "bytes32"
			}
		],
		"name": "PeerSet",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "SEND",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "uint32",
						"name": "srcEid",
						"type": "uint32"
					},
					{
						"internalType": "bytes32",
						"name": "sender",
						"type": "bytes32"
					},
					{
						"internalType": "uint64",
						"name": "nonce",
						"type": "uint64"
					}
				],
				"internalType": "struct Origin",
				"name": "origin",
				"type": "tuple"
			}
		],
		"name": "allowInitializePath",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint32",
				"name": "_eid",
				"type": "uint32"
			},
			{
				"internalType": "uint16",
				"name": "_msgType",
				"type": "uint16"
			},
			{
				"internalType": "bytes",
				"name": "_extraOptions",
				"type": "bytes"
			}
		],
		"name": "combineOptions",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "data",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "endpoint",
		"outputs": [
			{
				"internalType": "contract ILayerZeroEndpointV2",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint32",
				"name": "eid",
				"type": "uint32"
			},
			{
				"internalType": "uint16",
				"name": "msgType",
				"type": "uint16"
			}
		],
		"name": "enforcedOptions",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "enforcedOption",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "factoryAdmin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint32",
				"name": "_eid",
				"type": "uint32"
			},
			{
				"internalType": "bytes32",
				"name": "_peer",
				"type": "bytes32"
			}
		],
		"name": "init",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "initialized",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "uint32",
						"name": "srcEid",
						"type": "uint32"
					},
					{
						"internalType": "bytes32",
						"name": "sender",
						"type": "bytes32"
					},
					{
						"internalType": "uint64",
						"name": "nonce",
						"type": "uint64"
					}
				],
				"internalType": "struct Origin",
				"name": "",
				"type": "tuple"
			},
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			},
			{
				"internalType": "address",
				"name": "_sender",
				"type": "address"
			}
		],
		"name": "isComposeMsgSender",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "uint32",
						"name": "srcEid",
						"type": "uint32"
					},
					{
						"internalType": "bytes32",
						"name": "sender",
						"type": "bytes32"
					},
					{
						"internalType": "uint64",
						"name": "nonce",
						"type": "uint64"
					}
				],
				"internalType": "struct Origin",
				"name": "_origin",
				"type": "tuple"
			},
			{
				"internalType": "bytes32",
				"name": "_guid",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "_message",
				"type": "bytes"
			},
			{
				"internalType": "address",
				"name": "_executor",
				"type": "address"
			},
			{
				"internalType": "bytes",
				"name": "_extraData",
				"type": "bytes"
			}
		],
		"name": "lzReceive",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint32",
				"name": "",
				"type": "uint32"
			},
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "nextNonce",
		"outputs": [
			{
				"internalType": "uint64",
				"name": "nonce",
				"type": "uint64"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "oAppVersion",
		"outputs": [
			{
				"internalType": "uint64",
				"name": "senderVersion",
				"type": "uint64"
			},
			{
				"internalType": "uint64",
				"name": "receiverVersion",
				"type": "uint64"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint32",
				"name": "eid",
				"type": "uint32"
			}
		],
		"name": "peers",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "peer",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint32[]",
				"name": "_dstEids",
				"type": "uint32[]"
			},
			{
				"internalType": "uint16",
				"name": "_msgType",
				"type": "uint16"
			},
			{
				"internalType": "bytes[]",
				"name": "_messages",
				"type": "bytes[]"
			},
			{
				"internalType": "bytes",
				"name": "_extraSendOptions",
				"type": "bytes"
			},
			{
				"internalType": "bool",
				"name": "_payInLzToken",
				"type": "bool"
			}
		],
		"name": "quote",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "nativeFee",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "lzTokenFee",
						"type": "uint256"
					}
				],
				"internalType": "struct MessagingFee",
				"name": "totalFee",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint32[]",
				"name": "_dstEids",
				"type": "uint32[]"
			},
			{
				"internalType": "uint16",
				"name": "_msgType",
				"type": "uint16"
			},
			{
				"internalType": "bytes[]",
				"name": "_messages",
				"type": "bytes[]"
			},
			{
				"internalType": "bytes",
				"name": "_extraSendOptions",
				"type": "bytes"
			}
		],
		"name": "send",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_delegate",
				"type": "address"
			}
		],
		"name": "setDelegate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "uint32",
						"name": "eid",
						"type": "uint32"
					},
					{
						"internalType": "uint16",
						"name": "msgType",
						"type": "uint16"
					},
					{
						"internalType": "bytes",
						"name": "options",
						"type": "bytes"
					}
				],
				"internalType": "struct EnforcedOptionParam[]",
				"name": "_enforcedOptions",
				"type": "tuple[]"
			}
		],
		"name": "setEnforcedOptions",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint32",
				"name": "_eid",
				"type": "uint32"
			},
			{
				"internalType": "bytes32",
				"name": "_peer",
				"type": "bytes32"
			}
		],
		"name": "setPeer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
] as const;


export const AGENT_FACTORY_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "agent",
				"type": "address"
			}
		],
		"name": "AgentDeployed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "salt",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "creationCode",
				"type": "bytes"
			}
		],
		"name": "deploy",
		"outputs": [
			{
				"internalType": "address",
				"name": "deployed",
				"type": "address"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "deployer",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "salt",
				"type": "bytes32"
			}
		],
		"name": "getDeployed",
		"outputs": [
			{
				"internalType": "address",
				"name": "deployed",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;

// Swap/Bridge Routers
export const ENSO_ROUTER_ABI = [
  {
    inputs: [{ internalType: "address", name: "owner_", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "AmountTooLow",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "Duplicate",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "WrongValue",
    type: "error",
  },
  {
    inputs: [],
    name: "enso",
    outputs: [
      { internalType: "contract EnsoShortcuts", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "contract IERC20", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        internalType: "struct Token[]",
        name: "tokensIn",
        type: "tuple[]",
      },
      { internalType: "bytes32[]", name: "commands", type: "bytes32[]" },
      { internalType: "bytes[]", name: "state", type: "bytes[]" },
    ],
    name: "routeMulti",
    outputs: [{ internalType: "bytes[]", name: "returnData", type: "bytes[]" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "contract IERC20", name: "tokenIn", type: "address" },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "bytes32[]", name: "commands", type: "bytes32[]" },
      { internalType: "bytes[]", name: "state", type: "bytes[]" },
    ],
    name: "routeSingle",
    outputs: [{ internalType: "bytes[]", name: "returnData", type: "bytes[]" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "contract IERC20", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        internalType: "struct Token[]",
        name: "tokensIn",
        type: "tuple[]",
      },
      {
        components: [
          { internalType: "contract IERC20", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        internalType: "struct Token[]",
        name: "tokensOut",
        type: "tuple[]",
      },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "bytes32[]", name: "commands", type: "bytes32[]" },
      { internalType: "bytes[]", name: "state", type: "bytes[]" },
    ],
    name: "safeRouteMulti",
    outputs: [{ internalType: "bytes[]", name: "returnData", type: "bytes[]" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "contract IERC20", name: "tokenIn", type: "address" },
      { internalType: "contract IERC20", name: "tokenOut", type: "address" },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "minAmountOut", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "bytes32[]", name: "commands", type: "bytes32[]" },
      { internalType: "bytes[]", name: "state", type: "bytes[]" },
    ],
    name: "safeRouteSingle",
    outputs: [{ internalType: "bytes[]", name: "returnData", type: "bytes[]" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;
