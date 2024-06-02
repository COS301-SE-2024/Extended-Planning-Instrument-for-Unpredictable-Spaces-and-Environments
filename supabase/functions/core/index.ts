// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// const supabaseAnonKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key not provided");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Expose-Headers": "Content-Length, X-JSON",
  "Access-Control-Allow-Headers":
    "apikey,X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization",
};

Deno.serve(async (req) => {
  let response;
  let status = 200;

  if (req.method === "OPTIONS") {
    return new Response(
      "ok",
      {
        headers: headers,
      },
    );
  } else {
    const requestBody = await req.json();

    if (!("type" in requestBody)) {
      response = { error: `Missing attribute type in body` };
      status = 400;

      return new Response(
        JSON.stringify(response),
        {
          headers: headers,
          status,
        },
      );
    }

    const { type } = requestBody;
    //=================== Inserting a new User =================
    if (type === "InsertUser") {
      if (!("fullname" in requestBody)) {
        response = { error: `Missing attribute fullname in body` };
        status = 400;
      } else if (!("email" in requestBody)) {
        response = { error: `Missing attribute email in body` };
        status = 400;
      } else if (!("role" in requestBody)) {
        response = { error: `Missing attribute role in body` };
        status = 400;
      } else if (!("phone" in requestBody)) {
        response = { error: `Missing attribute phone in body` };
        status = 400;
      } else {
        const { fullname, email, role, phone } = requestBody;
        const { error } = await supabase
          .from("Users")
          .insert({
            "FullName": fullname,
            "Email": email,
            "Role": role,
            "Phone": phone,
          });

        if (error) {
          response = {
            error: `Error inserting the new User: ${error.details}`,
          };
          status = 400;
        } else {
          response = {
            data: "successfully added new user",
          };
        }
      }
      return new Response(
        JSON.stringify(response),
        {
          headers: headers,
          status,
        },
      );
    } //============================================================

    //==================== Updating user role ====================
    else if (type === "UpdateUser") {
      if (!("email" in requestBody)) {
        response = { error: `Missing attribute email in body` };
        status = 400;
      } else if (!("role" in requestBody)) {
        response = { error: `Missing attribute role in body` };
        status = 400;
      } else {
        const { email, role, fullname, phone } = requestBody;
        const { data, error } = await supabase
          .from("Users")
          .update({
            Role: role,
            Email: email,
            FullName: fullname, 
            Phone: phone,
          })
          .eq("Email", email);
    
        if (error) {
          response = {
            error: `Error updating the User: ${error.message}`,
          };
          status = 400;
        } else {
          response = {
            data: "Successfully changed user",
          };
        }
      }
    }
     else if (type === "GetAllUsers") {
      const { data, error } = await supabase
        .from("Users")
        .select("*");

      if (error) {
        response = { error: `Error fetching all users: ${error.details}` };
        status = 400;
      } else {
        response = {
          data,
        };
      }

      return new Response(
        JSON.stringify(response),
        {
          headers: headers,
          status,
        },
      );
    } else {
      response = { error: `no type ${type} found in core` };
      status = 400;
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: headers,
        status,
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/core' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
