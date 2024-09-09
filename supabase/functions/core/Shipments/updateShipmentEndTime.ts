export async function updateShipmentEndTime(supabase: any, shipmentId: number, newEndTime: any) {
    const { data, error } = await supabase
      .from('Shipment')
      .update({ End_time: newEndTime })
      .eq('id', shipmentId);
  
    if (error) {
      console.error('Error updating shipment end time:', error);
      
      return { error: 'Failed to update shipment end time' };
    }

    console.log('Shipment end time updated:', data);
    return { data };
  }
  