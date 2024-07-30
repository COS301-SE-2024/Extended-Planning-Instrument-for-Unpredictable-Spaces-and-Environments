export async function setFitnessValue(supabase: any, fit_value: string, delivery_id: string) {
    console.log('Updating Fitness Value for delivery_id:', delivery_id);
    console.log('Fitness Value:', fit_value);
  
    const { data, error } = await supabase
      .from("Shipment")
      .update({
        Fitness_Value: fit_value,
      })
      .eq('Delivery_id', delivery_id);
  
    if (error) {
      console.error('Error updating fitness', error);
      return { error: 'Failed to update fitness' };
    }
  
    console.log('Update successful:', data);
    return { "Update Fitness": "Successfully Updated Fitness!" };
  }
  