export async function insertDelivery(supabase: any, newDeliveryId: number) {
    const { data: deliveryData, error: deliveryError } = await supabase
      .from('Deliveries')
      .insert([{ id: newDeliveryId, Status: 'Ordered', Driver_id: '55' }])
      .select('id');
  
    if (deliveryError) {
      console.error('Error inserting delivery:', deliveryError);
      alert('Failed to insert delivery');
      return { error: 'Failed to insert delivery' };
    }
  
    return { data: deliveryData };
  }
  