export async function checkUserExistsByEmail(supabase, email) {
    try {
      const { data, error } = await supabase
        .from('Users')  // Replace 'Users' with the actual table name if different
        .select('id')   // Only fetch the id or any primary key column to check existence
        .eq('email', email)
        .single();
  
      if (error) {
        console.error('Error fetching user:', error);
        return { error: 'Failed to fetch user details' };
      } else if (data) {
        return { exists: true };
      } else {
        return { exists: false };
      }
    } catch (error) {
      console.error('Error during checkUserExistsByEmail:', error);
      return { error: 'Unexpected error occurred' };
    }
  }
  