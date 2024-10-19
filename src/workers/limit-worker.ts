import { HandlerContext, run } from "@xmtp/message-kit";
import { workerData } from "node:worker_threads";
import { supabase } from "../lib/supabase.js";

const { privateKey, sender: agentCreator, id } = workerData;

run(
  async (context: HandlerContext) => {
    const {
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

    if (command === "limit") {
      const { prompt, token, price } = params;

      if (!prompt) {
        await context.send(
          "You must provide a prompt for the limit order transaction."
        );
      }

      if (!token) {
        await context.send(
          "You must provide a token for the limit order transaction."
        );
      }

      if (!token.startsWith("0x")) {
        await context.send("Invalid token address.");
        return;
      }

      if (!price || price < 0) {
        await context.send(
          "You must provide a valid price for the limit order transaction."
        );
      }

      const promptWithoutQuotes = prompt.replace(/"/g, "").replace(/“/g, "");

      const { data: newLimit } = await supabase
        .from("limits")
        .insert({
          agentId: id,
          prompt: promptWithoutQuotes,
          price,
          token,
        })
        .select("*")
        .single();

      await context.send(`Limit order transaction created successfully.`);
      await context.send(
        `If you want to stop this limit order transaction, use the command /stop-limit ${newLimit.id}.`
      );
    }

    if (command === "stop-limit") {
      const { id } = params;

      if (!id) {
        await context.send(
          "You must provide a valid ID for the limit transaction."
        );
      }

      const { data: limit } = await supabase
        .from("limits")
        .select("*")
        .eq("id", id)
        .single();

      if (!limit) {
        await context.send("I couldn't find a limit transaction with that ID.");
        return;
      }

      const { data: agent } = await supabase
        .from("agents")
        .select("*")
        .eq("id", limit.agentId)
        .single();

      if (agent.owner !== sender.address) {
        await context.send(
          "You don't have permission to stop this limit transaction."
        );
        return;
      }

      await supabase.from("limits").delete().eq("id", id);

      await context.send("Limit transaction stopped successfully.");
    }
  },
  { privateKey }
);
