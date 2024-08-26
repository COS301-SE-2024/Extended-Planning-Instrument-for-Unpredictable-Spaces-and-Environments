export async function uploadSolution(supabase: any, shipmentId: bigint, solution: JSON) {
  const { data, error } = await supabase
    .from('Shipment')
    .update({ Solution: solution })
    .eq('id', shipmentId)

  if (error) {
    console.error('Error updating fitness value', error)
    return { error: 'Failed to update fitness value' }
  }

  return { data }
}
