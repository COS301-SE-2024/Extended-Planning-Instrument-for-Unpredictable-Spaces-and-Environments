export async function getNameByEmail(supabase: any, email: string) {
    try {
      const { data, error } = await supabase
        .from('Users')
        .select('FullName, Email')
        .eq('Email', email)
        .single();
  
      if (error) {
        console.error('Error fetching user:', error);
        return { error: 'Failed to fetch user details' };
      } else {
        console.log('User fetched:', data);
        return { data: { fullName: data.FullName, email: data.Email } };
      }
    } catch (error) {
      console.error('Error during getNameByEmail:', error);
      return { error: 'Unexpected error occurred' };
    }
  }
  