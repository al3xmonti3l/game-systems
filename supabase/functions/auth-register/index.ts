import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const { username, password, birthMonth, birthDay, birthYear } = await req.json();

    if (!username || !password || !birthMonth || !birthDay || !birthYear) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof username !== "string" || username.trim().length < 3 || username.trim().length > 24) {
      return new Response(JSON.stringify({ error: "Username must be 3–24 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);
    const year = parseInt(birthYear);

    if (month < 1 || month > 12) {
      return new Response(JSON.stringify({ error: "Invalid birth month" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (day < 1 || day > 31) {
      return new Response(JSON.stringify({ error: "Invalid birth day" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (year < 1900 || year > 2026) {
      return new Response(JSON.stringify({ error: "Birth year must be between 1900 and 2026" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check username uniqueness
    const { data: existing } = await adminClient
      .from("players")
      .select("id")
      .eq("username", username.trim())
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "Username already taken" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase auth user — use username as the "email" handle
    const fakeEmail = `${username.trim().toLowerCase()}@lifeforge.local`;
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: fakeEmail,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      if (authError?.message?.includes("already registered")) {
        return new Response(JSON.stringify({ error: "Username already taken" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Account creation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        username: username.trim(),
        birth_month: month,
        birth_day: day,
        birth_year: year,
        player_level: 1,
        gold_balance: 500,
      })
      .select()
      .single();

    if (insertError) {
      // Roll back the auth user
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return new Response(JSON.stringify({ error: "Registration failed. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sign in to get a session token for the client
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    const { data: sessionData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: fakeEmail,
      password,
    });

    if (signInError || !sessionData.session) {
      return new Response(JSON.stringify({ error: "Registered, but login failed. Please log in manually." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ player, session: sessionData.session }), {
      status: 201,
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
