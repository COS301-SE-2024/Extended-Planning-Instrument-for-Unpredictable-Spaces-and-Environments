export async function getOpenDriver(supabase: any) {
    const { data, error } = await supabase
      .from("Drivers")
      .select('Driver_id')
      .eq('Status', 'Open');
  
    if (error) {
      console.error('Error fetching open drivers', error);
      return { error: 'Failed to fetch open drivers' };
    }
  
    return { data };
  }
