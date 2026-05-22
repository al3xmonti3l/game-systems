import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function getConstellation(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

const CHINESE_ANIMALS = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
function getChineseZodiac(year: number): string {
  return CHINESE_ANIMALS[((year - 1900) % 12 + 12) % 12];
}

const CONSTELLATION_TITLES: Record<string, string> = {
  Aries: "Ember Vanguard", Taurus: "Iron Bulwark", Gemini: "Twin-Souled Wanderer",
  Cancer: "Tidewarden", Leo: "Crown of Solfire", Virgo: "Sage of the Still Grove",
  Libra: "Arbiter of the Void Scale", Scorpio: "Phantom Sting", Sagittarius: "Starchaser Nomad",
  Capricorn: "Stonepeak Sovereign", Aquarius: "Current Binder", Pisces: "Dreamer of Deep Waters",
};

const ZODIAC_TITLES: Record<string, string> = {
  Rat: "Child of Silver Cunning", Ox: "Bearer of the Iron Yoke", Tiger: "Storm-Mane Challenger",
  Rabbit: "Moonlit Artisan", Dragon: "Heir of Celestial Fire", Snake: "Keeper of Hidden Coils",
  Horse: "Windborn Galloper", Goat: "Tender of the High Pasture", Monkey: "Trickster of the Jade Branch",
  Rooster: "Herald at Dawn's Gate", Dog: "Sentinel of Loyal Bones", Pig: "Feaster in the Golden Hall",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, characterName, password, gender, birthMonth, birthDay, birthYear } = await req.json();

    if (!email || !characterName || !password || !gender || !birthMonth || !birthDay || !birthYear) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Please enter a valid email address" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof characterName !== "string" || characterName.trim().length < 3 || characterName.trim().length > 24) {
      return new Response(JSON.stringify({ error: "Character name must be 3–24 characters" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (gender !== "Male" && gender !== "Female") {
      return new Response(JSON.stringify({ error: "Gender must be Male or Female" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);
    const year = parseInt(birthYear);

    if (month < 1 || month > 12) {
      return new Response(JSON.stringify({ error: "Invalid birth month" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (day < 1 || day > 31) {
      return new Response(JSON.stringify({ error: "Invalid birth day" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (year < 1900 || year > 2026) {
      return new Response(JSON.stringify({ error: "Birth year must be between 1900 and 2026" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check character name uniqueness
    const { data: existingName } = await adminClient
      .from("players")
      .select("id")
      .eq("username", characterName.trim())
      .maybeSingle();

    if (existingName) {
      return new Response(JSON.stringify({ error: "Character name already taken" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Derive cosmic titles
    const constellation = getConstellation(month, day);
    const animal = getChineseZodiac(year);
    const constellationTitle = CONSTELLATION_TITLES[constellation];
    const zodiacTitle = ZODIAC_TITLES[animal];

    // Create Supabase auth user with real email
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      if (authError?.message?.includes("already registered")) {
        return new Response(JSON.stringify({ error: "An account with this email already exists" }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Account creation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sequential global_id
    const { data: maxRow } = await adminClient
      .from("players")
      .select("global_id")
      .order("global_id", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextGlobalId = (maxRow?.global_id ?? 0) + 1;

    const { data: player, error: insertError } = await adminClient
      .from("players")
      .insert({
        auth_user_id: authData.user.id,
        global_id: nextGlobalId,
        username: characterName.trim(),
        character_name: characterName.trim(),
        email: email.trim().toLowerCase(),
        gender,
        birth_month: month,
        birth_day: day,
        birth_year: year,
        constellation_title: constellationTitle,
        zodiac_title: zodiacTitle,
        player_level: 1,
        gold_balance: 500,
      })
      .select()
      .single();

    if (insertError) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return new Response(JSON.stringify({ error: "Registration failed. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sign in to get a session
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    const { data: sessionData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError || !sessionData.session) {
      return new Response(JSON.stringify({ error: "Registered, but login failed. Please log in manually." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ player, session: sessionData.session }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
