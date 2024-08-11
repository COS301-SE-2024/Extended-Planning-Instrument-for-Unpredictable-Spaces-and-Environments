export async function getShipmentByDeliveryID(supabase: any, deliveryID: string) {
    const { data, error } = await supabase
      .from("Shipment")
      .select('*')
      .eq('Delivery_id', deliveryID);
  
    if (error) {
      console.error('Error fetching shipment by delivery ID', error);
      return { error: 'Failed to fetch shipment by delivery ID' };
    }
  
    return { data };
  }
  