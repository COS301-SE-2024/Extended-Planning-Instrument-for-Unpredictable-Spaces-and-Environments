export async function getMaxDeliveryID(supabase: any) {
    const { data: maxDeliveryData, error: maxDeliveryError } = await supabase
      .from('Deliveries')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
  
    if (maxDeliveryError) {
      console.error('Error fetching max delivery ID:', maxDeliveryError);
      alert('Failed to fetch max delivery ID');
      return { error: 'Failed to fetch max delivery ID' };
    }
  
    const newDeliveryId = maxDeliveryData.length > 0 ? maxDeliveryData[0].id + 1 : 1;
    console.log('New Delivery ID:', newDeliveryId);
  
    return { id: newDeliveryId };
  }
  