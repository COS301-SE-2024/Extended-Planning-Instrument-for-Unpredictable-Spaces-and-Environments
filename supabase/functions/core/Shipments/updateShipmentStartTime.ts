export async function updateShipmentStartTime(supabase: any, shipmentId: number, newStartTime: Date) {
    const { data, error } = await supabase
      .from('Shipment')
      .update({ Start_time: newStartTime })
      .eq('id', shipmentId);
  
    if (error) {
      console.error('Error updating shipment start time:', error);
      alert('Failed to update shipment start time');
      return { error: 'Failed to update shipment start time' };
    }
  
    console.log('Shipment start time updated:', data);
    return { data };
  }
  