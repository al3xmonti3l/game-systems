import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const VALID_CLASSES = [
  "Warrior", "Mage", "Rogue", "Paladin", "Ranger",
  "Necromancer", "Monk", "Druid", "Berserker",
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { globalId, combatClass, constellationTitle, zodiacTitle } = await req.json();

    if (!globalId || !combatClass || !constellationTitle || !zodiacTitle) {
      return new Response(JSON.stringify({ error: "All fields required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!VALID_CLASSES.includes(combatClass)) {
      return new Response(JSON.stringify({ error: "Invalid combat class" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: player, error } = await supabase
      .from("players")
      .update({ combat_class: combatClass, constellation_title: constellationTitle, zodiac_title: zodiacTitle })
      .eq("global_id", globalId)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return new Response(JSON.stringify({ error: "Failed to save class" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ player }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
