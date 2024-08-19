export async function updateFitnessValue(supabase: any, shipmentId: bigint, newFitnessValue: number) {
    const { data, error } = await supabase
      .from("Shipment")
      .update({ "Fitness_Value": newFitnessValue })
      .eq('id', shipmentId);
  
    if (error) {
      console.error('Error updating fitness value', error);
      return { error: 'Failed to update fitness value' };
    }
  
    return { data };
  }
  