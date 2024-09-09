export async function getDeliveriesByProcessing(supabase: any) {
  const { data: shipmentData, error: shipmentError } = await supabase
    .from('Shipment')
    .select('Delivery_id')
    .eq('Status', 'Processing')

  if (shipmentError) {
    console.error('Error fetching shipments with processing status', shipmentError)
    return { error: 'Failed to fetch shipments with processing status' }
  }

  const deliveryIds = shipmentData.map((shipment) => shipment.Delivery_id)
  const uniqueDeliveryIds = [...new Set(deliveryIds)]

  if (uniqueDeliveryIds.length === 0) {
    return { data: [] }
  }

  const { data: deliveriesData, error: deliveriesError } = await supabase
    .from('Deliveries')
    .select('id, Start_time, Status, Driver_id, End_time')
    .in('id', uniqueDeliveryIds)

  if (deliveriesError) {
    console.error('Error fetching deliveries', deliveriesError)
    return { error: 'Failed to fetch deliveries' }
  }

  return { data: deliveriesData }
}
