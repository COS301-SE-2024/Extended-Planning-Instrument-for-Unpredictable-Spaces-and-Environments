/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.7'
// import { corsHeaders } from '../cors.ts'; // Adjusted relative path

// Users
import { getAllUsers } from './Users/getAllUsers.ts'
import { insertUser } from './Users/insertUser.ts'
import { updateUser } from './Users/updateUser.ts'
import { checkRole } from './Users/checkRole.ts'
import { getOpenDriver } from './Users/getOpenDriver.ts'
import { deleteUser } from './Users/deleteUser.ts'
import { getCurrentUser } from './Users/getCurrentUser.ts'
import { getUserIdFromId } from './Users/getUserIdFromId.ts'
import { getNameByEmail } from './Users/getNameByEmail.ts'
import { updateDriverID } from './Users/updateDriverID.ts'

// Package
import { insertPackage } from './Packages/insertPackage.ts'
import { uploadFile } from './Packages/uploadCSV.ts'
import { getAllPackages } from './Packages/getAllPackages.ts'
import { getPackagesById } from './Packages/getPackagesById.ts'
// Shipment
import { getAllShipments } from './Shipments/getAllShipments.ts'
import { getShipmentByDeliveryID } from './Shipments/getShipmentByDeliveryID.ts'
import { getPublicURL } from './Storage/getPublicURL.ts'
import { getAllProcessing } from './Shipments/getAllProcessing.ts'
import { deleteShipment } from './Shipments/deleteShipment.ts'
import { updateShipmentStatus } from './Shipments/updateShipmentStatus.ts'
import { updateShipmentStartTime } from './Shipments/updateShipmentStartTime.ts'
import { updateShipmentEndTime } from './Shipments/updateShipmentEndTime.ts'
// Deliveries
import { getAllDeliveries } from './Deliveries/getAllDeliveries.ts'
import { setFitnessValue } from './Shipments/setFitnessValue.ts'
import { getDeliveriesByDriverID } from './Deliveries/getDeliveriesByDriverID.ts'
import { getDeliveriesByStatus } from './Deliveries/getDeliveriesByStatus.ts'
import { updateDeliveryStartTime } from './Deliveries/updateDeliveryStartTime.ts'
import { updateDeliveryEndTime } from './Deliveries/updateDeliveryEndTime.ts'
// New Endpoints
import { downloadFile } from './Storage/downloadFile.ts'
import { parseCSV } from './Storage/parseCSV.ts'
import { getMaxDeliveryID } from './Deliveries/getMaxDeliveryID.ts'
import { insertDelivery } from './Deliveries/insertDelivery.ts'
import { getMaxShipmentID } from './Shipments/getMaxShipmentID.ts'
import { insertShipment } from './Shipments/insertShipment.ts'
import { deleteCSV } from './Storage/deleteCSV.ts'
import { uploadSignature } from './Deliveries/uploadSignature.ts'
import { getDistanceMatrix } from './Shipments/getDistanceMatrix.js'

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
      if (requestBody.type == 'deleteUser') {
        return responseBuilder(await deleteUser(supabaseUser, requestBody.email))
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
      if (requestBody.type == 'getCurrentUser') {
        return responseBuilder(await getCurrentUser(supabaseUser))
      }
      if (requestBody.type == 'getShipmentByDeliveryID') {
        return responseBuilder(await getShipmentByDeliveryID(supabaseUser, requestBody.deliveryID))
      }
      if (requestBody.type == 'uploadSignature') {
        return responseBuilder(await uploadSignature(supabaseUser, requestBody.dataURL))
      }
      if (requestBody.type == 'getNameByEmail') {
        return responseBuilder(await getNameByEmail(supabaseUser, requestBody.email))
      }
      if (requestBody.type == 'getPublicURL') {
        return responseBuilder(await getPublicURL(supabaseUser, requestBody.fileName))
      }
      if (requestBody.type == 'getUserIdFromId') {
        return responseBuilder(await getUserIdFromId(supabaseUser, requestBody.id))
      }
      if (requestBody.type == 'getDistanceMatrix') {
        return responseBuilder(await getDistanceMatrix(supabaseUser, requestBody.origins, requestBody.destinations, "AIzaSyBBzc-JWcKBXsrHs1h-NQOuj_Vfm_oVKu8"))
      }
      if (requestBody.type == 'updateShipmentStatus') {
        return responseBuilder(
          await updateShipmentStatus(supabaseUser, requestBody.shipmentId, requestBody.newStatus)
        )
      }
      if (requestBody.type == 'updateDeliveryStartTime') {
        return responseBuilder(
          await updateDeliveryStartTime(supabaseUser, requestBody.deliveryId, new Date(requestBody.newStartTime))
        );
      }
      if (requestBody.type == 'updateDeliveryEndTime') {
        return responseBuilder(
          await updateDeliveryEndTime(supabaseUser, requestBody.deliveryId, new Date(requestBody.newEndTime))
        );
      }
      if (requestBody.type == 'updateShipmentStartTime') {
        return responseBuilder(
          await updateShipmentStartTime(supabaseUser, requestBody.shipmentId, new Date(requestBody.newStartTime))
        );
      }
      if (requestBody.type == 'updateShipmentEndTime') {
        return responseBuilder(
          await updateShipmentEndTime(supabaseUser, requestBody.shipmentId, new Date(requestBody.newEndTime))
        );
      }
      if (requestBody.type == 'deleteShipment') {
        return responseBuilder(await deleteShipment(supabaseUser, requestBody.fileName))
      }
      if (requestBody.type == 'getOpenDriver') {
        return responseBuilder(await getOpenDriver(supabaseUser))
      }
      if (requestBody.type == 'deleteCSV') {
        return responseBuilder(await deleteCSV(supabaseUser, requestBody.fileName))
      }
      if (requestBody.type == 'setFitnessValue') {
        return responseBuilder(
          await setFitnessValue(supabaseUser, requestBody.Fitness_Value, requestBody.deliveryID)
        )
      }
      if (requestBody.type == 'getAllUsers') {
        return responseBuilder(await getAllUsers(supabaseUser))
      }
      if (requestBody.type == 'updateDriverID') {
        return responseBuilder(await updateDriverID(supabaseUser
          , requestBody.deliveryID
          , requestBody.driverID
        ))
      }
      if (requestBody.type == 'getAllPackages') {
        return responseBuilder(await getAllPackages(supabaseUser))
      }
      if (requestBody.type == 'getAllShipments') {
        return responseBuilder(await getAllShipments(supabaseUser))
      }
      if (requestBody.type == 'getAllProcessing') {
        return responseBuilder(await getAllProcessing(supabaseUser))
      }
      if (requestBody.type == 'getAllDeliveries') {
        return responseBuilder(await getAllDeliveries(supabaseUser))
      }
      if (requestBody.type == 'getDeliveriesByStatus') {
        return responseBuilder(await getDeliveriesByStatus(supabaseUser))
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
      }
      if (requestBody.type == 'getDeliveriesByDriverID') {
        return responseBuilder(await getDeliveriesByDriverID(supabaseUser, requestBody.driverID))
      }
      if (requestBody.type == 'getPackagesById') {
        return responseBuilder(await getPackagesById(supabaseUser, requestBody.ShipmentID))
      }
      // New endpoints
      if (requestBody.type == 'downloadFile') {
        return responseBuilder(await downloadFile(supabaseUser, requestBody.fileName))
      }
      if (requestBody.type == 'parseCSV') {
        return responseBuilder(await parseCSV(requestBody.csvText))
      }
      if (requestBody.type == 'getMaxDeliveryID') {
        return responseBuilder(await getMaxDeliveryID(supabaseUser))
      }
      if (requestBody.type == 'insertDelivery') {
        return responseBuilder(await insertDelivery(supabaseUser, requestBody.newDeliveryId))
      }
      if (requestBody.type == 'getMaxShipmentID') {
        return responseBuilder(await getMaxShipmentID(supabaseUser))
      }
      if (requestBody.type == 'insertShipment') {
        return responseBuilder(
          await insertShipment(
            supabaseUser,
            requestBody.shipment_id,
            requestBody.location,
            requestBody.newDeliveryId
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
