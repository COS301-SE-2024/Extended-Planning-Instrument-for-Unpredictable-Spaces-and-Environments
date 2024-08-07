export async function updateDriverID(supabase: any, deliveryId: any, driverId: any) {
    try {
      // Update the Driver_id in the Deliveries table
      const { data: deliveryData, error: updateDeliveryError } = await supabase
        .from('Deliveries')
        .update({ Driver_id: driverId })
        .eq('id', deliveryId);
  
      if (updateDeliveryError) {
        console.error('Error updating Driver_id:', updateDeliveryError);
        return { error: 'Failed to update Driver_id' };
      }
  
      // Update the Status in the Drivers table
      const { data: driverData, error: updateDriverError } = await supabase
        .from('Drivers')
        .update({ Status: 'Closed' })
        .eq('Driver_id', driverId);
  
      if (updateDriverError) {
        console.error('Error updating driver status:', updateDriverError);
        return { error: 'Failed to update driver status' };
      }
  
      console.log('Driver_id and status updated successfully');
      return { data: 'Driver_id and status updated successfully' };
  
    } catch (error) {
      console.error('Error during updateDriverID:', error);
      return { error: 'Unexpected error occurred' };
    }
  }
  