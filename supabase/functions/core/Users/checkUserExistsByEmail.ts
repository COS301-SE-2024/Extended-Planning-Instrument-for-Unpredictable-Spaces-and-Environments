export async function checkUserExistsByEmail(supabase, email) {
  try {
    const { data, error } = await supabase.from('Users').select('id').eq('Email', email)

    if (error) {
      console.error('Error fetching user:', error)
      return { error: 'Failed to fetch user details' }
    } else if (data && data.length > 0) {
      return { exists: true }
    } else {
      return { exists: false }
    }
  } catch (error) {
    return { error: 'Unexpected error occurred' }
  }
}
