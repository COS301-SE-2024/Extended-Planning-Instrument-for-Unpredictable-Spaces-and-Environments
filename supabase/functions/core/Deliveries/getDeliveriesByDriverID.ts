export async function getDeliveriesByDriverID(supabase: any, driverID: string) {
    const { data, error } = await supabase
      .from("Deliveries")
      .select('*')
      .eq('Driver_id', driverID);
  
    if (error) {
      console.error(`Error fetching deliveries for driver ID: ${driverID}`, error);
      return { error: 'Failed to fetch deliveries for the specified driver' };
    }
  
    return { data };
  }
  