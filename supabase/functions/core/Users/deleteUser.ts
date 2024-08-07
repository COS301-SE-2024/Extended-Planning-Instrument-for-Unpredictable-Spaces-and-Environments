export async function deleteUser(supabase: any, email: string) {
  // First, delete the user from the auth table

  const { error: userError } = await supabase.from('Users').delete().eq('Email', email)

  if (userError) {
    console.error('Error deleting user from Users table', userError)
    return { error: 'Failed to delete user from Users table' }
  }

  return { message: 'Successfully Deleted User!' }
}
