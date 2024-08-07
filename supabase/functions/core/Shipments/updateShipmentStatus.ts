export async function updateShipmentStatus(supabase: any, shipmentId: any, newStatus: string) {
    const { data: updatedShipmentData, error: updateError } = await supabase
      .from('Shipment')
      .update({ Status: newStatus })
      .eq('id', shipmentId)
      .select();
  
    if (updateError) {
      console.error('Error updating shipment status:', updateError);
      alert('Failed to update shipment status');
      return { error: 'Failed to update shipment status' };
    }
  
    console.log('Updated Shipment Data:', updatedShipmentData);
  
    return { data: updatedShipmentData };
  }
  