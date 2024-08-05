export async function getMaxShipmentID(supabase: any) {
    const { data: maxShipmentData, error: maxShipmentError } = await supabase
      .from('Shipment')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
  
    if (maxShipmentError) {
      console.error('Error fetching max shipment ID:', maxShipmentError);
      alert('Failed to fetch max shipment ID');
      return { error: 'Failed to fetch max shipment ID' };
    }
  
    const newShipmentId = maxShipmentData.length > 0 ? maxShipmentData[0].id + 1 : 1;
    console.log('New Shipment ID:', newShipmentId);
  
    return { id: newShipmentId };
  }
  