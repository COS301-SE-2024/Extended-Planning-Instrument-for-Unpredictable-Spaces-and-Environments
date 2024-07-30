export async function insertShipment(supabase: any, location: string, newDeliveryId: number) {
    const { data: shipmentData, error: shipmentError } = await supabase
      .from('Shipment')
      .insert([{ Start_time: null, Destination: location, Status: 'Processing', Delivery_id: newDeliveryId }])
      .select('id');
  
    if (shipmentError) {
      console.error('Error inserting shipment:', shipmentError);
      alert('Failed to insert shipment');
      return { error: 'Failed to insert shipment' };
    }
  
    return { data: shipmentData };
  }
  