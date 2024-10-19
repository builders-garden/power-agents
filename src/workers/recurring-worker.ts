import { HandlerContext, run } from "@xmtp/message-kit";
import { workerData } from "node:worker_threads";
import { supabase } from "../lib/supabase";

const { privateKey, sender: agentCreator, id } = workerData;

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

    if (command === "recurring") {
      const { prompt, interval } = params;

      if (!interval) {
        await context.send(
          "You must provide a valid interval for the recurring transaction."
        );
      }

      if (!prompt) {
        await context.send(
          "You must provide a prompt for the recurring transaction."
        );
      }

      const promptWithoutQuotes = prompt.replace(/"/g, "").replace(/“/g, "");

      const { data: newRecurring } = await supabase
        .from("recurring")
        .insert({
          agentId: id,
          prompt: promptWithoutQuotes,
          interval,
          lastExecution: new Date().getTime(),
        })
        .select("*")
        .single();

      await context.send(
        `Recurring transaction created successfully. I will execute this transaction every ${interval} seconds.`
      );
      await context.send(
        `If you want to stop this recurring transaction, use the command /stop-recurring ${newRecurring.id}.`
      );
    }

    if (command === "stop-recurring") {
      const { id } = params;

      if (!id) {
        await context.send(
          "You must provide a valid ID for the recurring transaction."
        );
      }

      const { data: recurring } = await supabase
        .from("recurring")
        .select("*")
        .eq("id", id)
        .single();

      if (!recurring) {
        await context.send(
          "I couldn't find a recurring transaction with that ID."
        );
        return;
      }

      const { data: agent } = await supabase
        .from("agents")
        .select("*")
        .eq("id", recurring.agentId)
        .single();

      if (agent.owner !== sender.address) {
        await context.send(
          "You don't have permission to stop this recurring transaction."
        );
        return;
      }

      await supabase.from("recurring").delete().eq("id", id);

      await context.send("Recurring transaction stopped successfully.");
    }
  },
  { privateKey }
);
