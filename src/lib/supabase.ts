import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export const getPreferredChainString = async (address: string) => {
  const { data, error } = await supabase
    .from("preferences")
    .select("*")
    .eq("address", address)
    .single();

  if (!data || error) {
    await supabase
      .from("preferences")
      .insert({ address, chain: "base" })
      .select("*")
      .single();

    return "base";
  }

  return data.chain;
};

export const getPreferredChain = async (address: string) => {
  const { data, error } = await supabase
    .from("preferences")
    .select("*")
    .eq("address", address)
    .single();

  if (!data || error) {
    await supabase
      .from("preferences")
      .insert({ address, chain: "base" })
      .select("*")
      .single();

    return "8453";
  }

  return data.chain === "base" ? "8453" : "137";
};

export const getDeposit = async (id: number) => {
  const {
    data: { chain, protocol, token, amount },
  } = await supabase.from("deposits").select("*").eq("id", id).single();

  return { chain, protocol, token, amount };
};
