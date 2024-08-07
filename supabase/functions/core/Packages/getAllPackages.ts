export async function getAllPackages(supabase: any) {
    const { data, error } = await supabase
      .from("Packages")
      .select('*');
  
    if (error) {
      console.error('Error fetching all packages', error);
      return { error: 'Failed to fetch all packages' };
    }
  
    return { data };
  }
  