export async function updateDeliveryStartTime(supabase: any, deliveryId: number, newStartTime: Date) {
    const { data, error } = await supabase
      .from('Deliveries')
      .update({ Start_time: newStartTime })
      .eq('id', deliveryId);
  
    if (error) {
      console.error('Error updating delivery start time:', error);
      
      return { error: 'Failed to update delivery start time' };
    }
  
    console.log('Delivery start time updated:', data);
    return { data };
  }
  