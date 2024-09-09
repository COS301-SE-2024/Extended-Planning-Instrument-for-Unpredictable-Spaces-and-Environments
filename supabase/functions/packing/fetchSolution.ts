export async function fetchSolution(supabase: any, shipmentId: bigint) {
  const { data, error } = await supabase.from('Shipment').select('Solution').eq('id', shipmentId)

  if (error) {
    console.error('Error updating fitness value', error)
    return { error: 'Failed to update fitness value' }
  }

  return { data }
}
