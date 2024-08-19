export async function updateDeliveryEndTime(supabase: any, deliveryId: number, newEndTime: Date) {
    const { data, error } = await supabase
      .from('Deliveries')
      .update({ End_time: newEndTime })
      .eq('id', deliveryId);
  
    if (error) {
      console.error('Error updating delivery end time:', error);
      
      return { error: 'Failed to update delivery end time' };
    }
  
    console.log('Delivery end time updated:', data);
    return { data };
  }
  