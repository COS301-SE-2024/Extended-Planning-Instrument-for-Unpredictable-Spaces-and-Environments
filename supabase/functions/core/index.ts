/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.7'
//import { corsHeaders } from '../cors.ts'; // Adjusted relative path

//Users
import { getAllUsers } from './Users/getAllUsers.ts'
import { insertUser } from './Users/insertUser.ts'
import { updateUser } from './Users/updateUser.ts'
import { checkRole } from './Users/checkRole.ts'

//Package
import { insertPackage } from './Packages/insertPackage.ts'
import { uploadFile } from './Packages/uploadCSV.ts'
import { getAllPackages } from './Packages/getAllPackages.ts'

//Shipment
import { getAllShipments } from './Shipments/getAllShipments.ts'
import { getShipmentByDeliveryID } from './Shipments/getShipmentByDeliveryID.ts'

//Deliveries
import { getAllDeliveries } from './Deliveries/getAllDeliveries.ts'

const supabaseUrl = 'https://rgisazefakhdieigrylb.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXNhemVmYWtoZGllaWdyeWxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNjMxMzE1MSwiZXhwIjoyMDMxODg5MTUxfQ.ctQmfWfRjY77afjwWuynIL4lRdjrtBD7Xqh75SxQBeo'

const supabaseUser = createClient(supabaseUrl, supabaseKey)

function defaultResponse() {
  return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 404
  })
}

function responseBuilder(data: any) {
  if (!data) {
    const error = { error: 'No data returned' }
    return new Response(JSON.stringify(error), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 404
    })
  }
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  })
}

// const fileInput = document.getElementById('fileInput') as HTMLInputElement;
// fileInput.addEventListener('change', async (event: Event) => {
//   const target = event.target as HTMLInputElement;
//   const file = target.files?.[0];
//   if (file) {
//     const result = await uploadFile(supabaseUser, file);
//     console.log(result);
//   }
// });

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }
    if (req.method === 'POST') {
      const requestBody = await req.json()
      if (requestBody.type == 'insertUser') {
        return responseBuilder(
          await insertUser(
            supabaseUser,
            requestBody.fullname,
            requestBody.email,
            requestBody.role,
            requestBody.phone
          )
        )
      }
      if (requestBody.type == 'insertPackage') {
        return responseBuilder(
          await insertPackage(
            supabaseUser,
            requestBody.Shipment_id,
            requestBody.Width,
            requestBody.Length,
            requestBody.Height,
            requestBody.Weight,
            requestBody.Volume
          )
        )
      }
      if (requestBody.type == 'getShipmentByDeliveryID') {
        return responseBuilder(
          await getShipmentByDeliveryID(
            supabaseUser,
            requestBody.deliveryID
          )
        )
      }
      if (requestBody.type == 'getAllUsers') {
        return responseBuilder(await getAllUsers(supabaseUser))
      }
      if (requestBody.type == 'getAllPackages') {
        return responseBuilder(await getAllPackages(supabaseUser))
      }
      if (requestBody.type == 'getAllShipments') {
        return responseBuilder(await getAllShipments(supabaseUser))
      }
      if (requestBody.type == 'getAllDeliveries') {
        return responseBuilder(await getAllDeliveries(supabaseUser))
      }
      if (requestBody.type == 'checkRole') {
        return responseBuilder(await checkRole(supabaseUser, requestBody.email))
      }
      if (requestBody.type == 'updateUser') {
        return responseBuilder(
          await updateUser(
            supabaseUser,
            requestBody.email,
            requestBody.role,
            requestBody.fullname,
            requestBody.phone
          )
        )
      } else {
        return defaultResponse()
      }
    }
    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 404
    })
  } catch (error) {
    console.error('Error processing request:', error.message)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
  'Access-Control-Allow-Headers':
    'apikey,X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization'
}
