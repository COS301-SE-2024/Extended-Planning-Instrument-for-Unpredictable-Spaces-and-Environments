export async function getAllUsers(supabase: any) {
    const { data, error } = await supabase
      .from("Users")
      .select('*');
  
    if (error) {
      console.error('Error fetching all users', error);
      return { error: 'Failed to fetch all users' };
    }
  
    return { data };
  }
  