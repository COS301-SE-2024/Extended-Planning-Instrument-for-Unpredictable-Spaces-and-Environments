export async function updateDeliveryStatus(supabase: any, deliveryId: any, newStatus: string) {
    const { data: updatedDeliveryData, error: updateError } = await supabase
      .from('Deliveries')
      .update({ Status: newStatus })
      .eq('id', deliveryId)
      .select();
  
    if (updateError) {
      console.error('Error updating delivery status:', updateError);
      alert('Failed to update delivery status');
      return { error: 'Failed to update delivery status' };
    }
  
    console.log('Updated Delivery Data:', updatedDeliveryData);
  
    return { data: updatedDeliveryData };
  }
  