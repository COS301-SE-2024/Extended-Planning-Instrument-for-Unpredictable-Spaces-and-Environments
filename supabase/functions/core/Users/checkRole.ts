export async function checkRole(supabase: any, email: string) {
  const { data, error } = await supabase.from('Users').select('Role').eq('Email', email)

  if (error) {
    console.error('Error fetching user with email', error)
    return { error: 'Error fetching user with email' }
  }
  return { data }
}
