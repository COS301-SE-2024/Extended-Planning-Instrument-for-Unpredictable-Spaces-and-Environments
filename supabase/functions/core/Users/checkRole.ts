export async function checkRole(supabase: any, email: string) {
  try {
    const { data, error } = await supabase
      .from('Users')
      .select('id, Role')
      .eq('Email', email)
      .single();

    if (error) {
      console.error('Error fetching user with email:', error);
      return { error: 'Error fetching user with email' };
    }

    return { data };
  } catch (error) {
    console.error('Error during checkRole:', error);
    return { error: 'Unexpected error occurred' };
  }
}
