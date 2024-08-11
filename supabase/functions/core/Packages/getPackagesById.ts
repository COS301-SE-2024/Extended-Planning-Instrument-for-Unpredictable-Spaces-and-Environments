export async function getPackagesById(supabase: any, ShipmentID: string) {
  const { data, error } = await supabase.from('Packages').select('*').eq('Shipment_id', ShipmentID)

  if (error) {
    console.error('Error fetching packages by ID', error)
    return { error: 'Failed to fetch packages by ID' }
  }

  return { data }
}
