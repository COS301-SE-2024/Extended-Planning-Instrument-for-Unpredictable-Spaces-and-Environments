export async function getSignature(supabase: any, shipmentID: any) {
    try {
      // Generate the file name based on the shipment ID
      const fileName = `signature_${shipmentID}.encrypted`;
  
      // Try to fetch the signature from Supabase storage
      const { data: fileData, error: fetchError } = await supabase.storage
        .from('data_bucket')
        .download(`signatures/${fileName}`);
  
      if (fetchError) {
        console.error('Error fetching signature:', fetchError);
        return { error: 'Failed to fetch signature' };
      }
  
      console.log('Signature retrieved successfully:', fileData);
  
      // Convert the downloaded file (Blob) back to text if needed (depends on your use case)
      const fileText = await fileData.text(); // assuming it needs to be converted from Blob
  
      return { data: fileText };
    } catch (error) {
      console.error('Error retrieving signature:', error);
      return { error: 'Error retrieving signature' };
    }
  }
  