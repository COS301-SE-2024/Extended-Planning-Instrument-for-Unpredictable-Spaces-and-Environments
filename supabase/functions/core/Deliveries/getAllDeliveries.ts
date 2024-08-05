export async function getAllDeliveries(supabase: any) {
    const { data, error } = await supabase
      .from("Deliveries")
      .select('*');
  
    if (error) {
      console.error('Error fetching all deliveries', error);
      return { error: 'Failed to fetch all deliveries' };
    }
  
    return { data };
  }
  