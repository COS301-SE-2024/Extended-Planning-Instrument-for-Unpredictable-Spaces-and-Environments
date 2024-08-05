export async function getDeliveriesByStatus(supabase: any) {
  const { data, error } = await supabase.from('Deliveries').select('*').eq('Status', 'Shipped')

  if (error) {
    console.error('Error fetching deliveries by status shipped', error)
    return { error: 'Failed to fetch deliveries by status shipped' }
  }

  return { data }
}
