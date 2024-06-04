/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.7";
import { corsHeaders } from '../cors.ts'; // Adjusted relative path

//Users
import {getAllUsers} from './Users/getAllUsers.ts';
import {insertUser} from './Users/insertUser.ts';
import {updateRole} from './Users/updateRole.ts';

const supabaseUrl = "https://rgisazefakhdieigrylb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXNhemVmYWtoZGllaWdyeWxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNjMxMzE1MSwiZXhwIjoyMDMxODg5MTUxfQ.ctQmfWfRjY77afjwWuynIL4lRdjrtBD7Xqh75SxQBeo";
const supabaseUser = createClient(supabaseUrl, supabaseKey);


function defaultResponse() {
  return new Response(JSON.stringify({ error: "Endpoint not found" }), {
    headers: { "Content-Type": "application/json" },
    status: 404,
  });
}

function responseBuilder(data: any) {
  if (!data) {
    const error = { error: 'No data returned' };
    return new Response(JSON.stringify(error), {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
  }
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    if (req.method === 'POST') {
      const requestBody = await req.json();
      // -------------------------------------------
      if (requestBody.type == "insertUser") {
        return responseBuilder(await insertUser(supabaseUser, requestBody.fullname, requestBody.email, requestBody.role, requestBody.phone));
      } 
      if (requestBody.type == "getAllUsers") {
        return responseBuilder(await getAllUsers(supabaseUser));
      } 
      if (requestBody.type == "updateRole") {
        return responseBuilder(await updateRole(supabaseUser, requestBody.email, requestBody.role));
      } else {
        return defaultResponse();
      }
    }
    return new Response(JSON.stringify({ error: "Endpoint not found" }), {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
  } catch (error) {
    console.error("Error processing request:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});

