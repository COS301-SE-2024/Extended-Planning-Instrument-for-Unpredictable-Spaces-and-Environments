export async function updateShipmentEndTime(supabase: any, shipmentId: number, newEndTime: Date) {
    const { data, error } = await supabase
      .from('Shipment')
      .update({ End_time: newEndTime })
      .eq('id', shipmentId);
  
    if (error) {
      console.error('Error updating shipment end time:', error);
      alert('Failed to update shipment end time');
      return { error: 'Failed to update shipment end time' };
    }
  
    console.log('Shipment end time updated:', data);
    return { data };
  }
  