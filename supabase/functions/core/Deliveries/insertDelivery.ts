export async function insertDelivery(supabase: any, newDeliveryId: number, driver_id: string) {
    const { data: deliveryData, error: deliveryError } = await supabase
      .from('Deliveries')
      .insert([{ id: newDeliveryId, Status: 'Ordered', Driver_id: driver_id }])
      .select('id');
  
    if (deliveryError) {
      console.error('Error inserting delivery:', deliveryError);
      alert('Failed to insert delivery');
      return { error: 'Failed to insert delivery' };
    }
  
    return { data: deliveryData };
  }
  