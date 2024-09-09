export async function deleteSavedSoln(supabase: any, ShipmentID: any) {
  const { data, error } = await supabase.storage
    .from('solutions')
    .remove(`solutions/shipment_${ShipmentID}.json`)

  if (error) {
    console.error('Error deleting saved soilution', error)
    return { error: 'Failed to delete saved solution' }
  }

  return { data }
}
