export async function getAllProcessing(supabase: any) {
  const { data, error } = await supabase
    .from('Shipment')
    .select('*')
    .eq("WHERE Status = 'Processing")

  if (error) {
    console.error('Error fetching all shipments', error)
    return { error: 'Failed to fetch all shipments' }
  }

  return { data }
}
