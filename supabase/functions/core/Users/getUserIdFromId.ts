export async function getUserIdFromId(supabase: any, id: any) {
    const { data, error } = await supabase
      .from("Users")
      .select("userid")
      .eq("id", id)
      .single();
  
    if (error) {
      console.error('Error fetching userid from Users table', error);
      return { error: 'Failed to fetch userid' };
    }
  
    return { userid: data.userid };
  }
  