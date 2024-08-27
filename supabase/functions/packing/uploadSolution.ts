export async function uploadSolution(supabase: any, shipmentId: bigint, solution: String) {
  
  if (!solution) {
    console.error('Solution is undefined')
    return { error: 'Solution is undefined' }
  }

  const solutionString = JSON.stringify(solution)
  const { data, error } = await supabase
    .from('Shipment')
    .update({ Solution: solutionString })
    .eq('id', shipmentId)

  if (error) {
    console.error('Error updating fitness value', error)
    return { error: 'Failed to update fitness value' }
  }

  return { data: 'sucessfull inserted record' }
}
