export async function updateDriverID(supabase: any, deliveryId: any, driverId: any) {
    try {
      const { data, error } = await supabase
        .from('Deliveries')
        .update({ Driver_id: driverId })
        .eq('id', deliveryId);
  
      if (error) {
        console.error('Error updating Driver_id:', error);
        return { error: 'Failed to update Driver_id' };
      } else {
        console.log('Driver_id updated successfully:', data);
        return { data: 'Driver_id updated successfully' };
      }
    } catch (error) {
      console.error('Error during updateDriverID:', error);
      return { error: 'Unexpected error occurred' };
    }
  }
  