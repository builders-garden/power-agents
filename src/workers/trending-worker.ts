import { HandlerContext, run } from "@xmtp/message-kit";
import { workerData } from "node:worker_threads";

const { brianCDPSDK, privateKey, sender: agentCreator } = workerData;

run(
  async (context: HandlerContext) => {
    const {
      typeId,
      content: { content: text, command, params },
      sender,
    } = context.message;

    if (sender.address.toLowerCase() !== agentCreator.address.toLowerCase()) {
      return;
    }

    if (command === "gm" || text.toLowerCase() === "gm") {
      await context.send("gm");
      return;
    }
  },
  { privateKey }
);
