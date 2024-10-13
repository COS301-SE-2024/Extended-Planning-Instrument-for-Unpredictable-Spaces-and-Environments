export async function getXPackages(supabase: any, numberBoxes: number) {
  const { data, error } = await supabase.from('Packages').select('*').limit(numberBoxes)

  if (error) {
    console.error('Error fetching packages', error)
    return { error: 'Failed to fetch packages' }
  }

  return { data }
}
