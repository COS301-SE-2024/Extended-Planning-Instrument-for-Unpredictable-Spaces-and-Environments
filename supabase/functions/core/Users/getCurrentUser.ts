export async function getCurrentUser(supabase: any) {
    try {
      const session = await supabase.auth.getSession();
  
      if (session.data.session) {
        const { user } = session.data.session;
        const { data, error } = await supabase
          .from('Users')
          .select('FullName')
          .eq('Email', user.email)
          .single();
  
        if (error) {
          console.error('Error fetching user:', error);
          return { error: 'Failed to fetch user details' };
        } else {
          console.log('Current user fetched:', data.FullName);
          return { data: data.FullName };
        }
      } else {
        console.log('No session found');
        return { error: 'No session found' };
      }
    } catch (error) {
      console.error('Error during fetchCurrentUser:', error);
      return { error: 'Unexpected error occurred' };
    }
  }
  