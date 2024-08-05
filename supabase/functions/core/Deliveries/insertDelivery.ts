export async function insertDelivery(supabase: any, newDeliveryId: number) {
  const { data: deliveryData, error: deliveryError } = await supabase
    .from('Deliveries')
    .insert([{ id: newDeliveryId, Status: 'Ordered' }])
    .select('id')

  if (deliveryError) {
    console.error('Error inserting delivery:', deliveryError)
    return { error: 'Failed to insert delivery' }
  }

  return { data: deliveryData }
}
