export async function getAllShipments(supabase: any) {
    const { data, error } = await supabase
      .from("Shipment")
      .select('*');
  
    if (error) {
      console.error('Error fetching all shipments', error);
      return { error: 'Failed to fetch all shipments' };
    }
  
    return { data };
  }
  