export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
  'Access-Control-Allow-Headers':
    'apikey,X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization'
}

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
      console.log(requestBody)

      // Perform the genetic algorithm
      const result = await genetic_algorithm(
        requestBody.boxes_data,
        requestBody.container_dimensions
      )

      return responseBuilder(result)
    }

    return new Response(JSON.stringify({ error: 'Invalid request method' }), {
      headers: { 'Content-Type': 'application/json' }
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
