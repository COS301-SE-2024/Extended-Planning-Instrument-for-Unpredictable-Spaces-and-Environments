/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.7'

const supabaseUrl = 'https://rgisazefakhdieigrylb.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXNhemVmYWtoZGllaWdyeWxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNjMxMzE1MSwiZXhwIjoyMDMxODg5MTUxfQ.ctQmfWfRjY77afjwWuynIL4lRdjrtBD7Xqh75SxQBeo'

const supabaseUser = createClient(supabaseUrl, supabaseKey)

import { getPackagesById } from '../core/Packages/getPackagesById.ts'
import { updateFitnessValue } from './updateFitnessValue.ts'
import { fetchSolution } from './fetchSolution.ts'
import { uploadSolution } from './uploadSolution.ts'
import { deleteSavedSoln } from './deleteSavedSoln.ts'

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

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }
    if (req.method === 'POST') {
      const requestBody = await req.json()
      if (requestBody.type == 'getPackages') {
        // Invoke the Supabase function to get packages by Shipment ID
        const { data, error } = await supabaseUser.functions.invoke('core', {
          body: JSON.stringify({ type: 'getPackagesById', ShipmentID: requestBody.ShipmentID }),
          method: 'POST'
        })

        if (error) {
          console.error('Error fetching packages:', error)

          return responseBuilder({ error: 'Failed to fetch packages.' })
        } else {
          return responseBuilder(data)
        }
      }

      if (requestBody.type == 'fetchSolution') {
        return responseBuilder(await fetchSolution(supabaseUser, requestBody.shipmentId))
      }
      if (requestBody.type == 'uploadSolution') {
        return responseBuilder(
          await uploadSolution(supabaseUser, requestBody.jsonObject)
        )
      }
      if (requestBody.type == 'deleteSavedSoln') {
        return responseBuilder(await deleteSavedSoln(supabaseUser, requestBody.shipmentId))
      }
      if (requestBody.type == 'updateFitnessValue') {
        return responseBuilder(
          await updateFitnessValue(
            supabaseUser,
            requestBody.ShipmentId,
            requestBody.newFitnessValue
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
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
  'Access-Control-Allow-Headers':
    'apikey,X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization'
}
