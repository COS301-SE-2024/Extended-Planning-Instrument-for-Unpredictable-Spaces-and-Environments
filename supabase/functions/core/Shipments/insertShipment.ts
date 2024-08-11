export async function insertShipment(supabase: any, shipment_id: any, location: string, newDeliveryId: number) {
    const { data: shipmentData, error: shipmentError } = await supabase
      .from('Shipment')
      .insert([{ id: shipment_id, Start_time: null, Destination: location, Status: 'Processing', Delivery_id: newDeliveryId }])
  
    if (shipmentError) {
      console.error('Error inserting shipment:', shipmentError);
      return { error: 'Failed to insert shipment' };
    }
  
    return { "Insert Shipment": "Sucessfully Inserted Shipment" };
  }
  