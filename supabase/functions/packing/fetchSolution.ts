export async function fetchSolution(supabase: any, shipmentId: number) {
  try {
    // Generate the file name based on the shipment ID
    const fileName = `shipment_${shipmentId}.json`;
    const filePath = `solutions/${fileName}`; // Adjust this if the file is in a subfolder
  
    const { data: fileData, error: fetchError } = await supabase.storage
      .from('solutions') // Ensure the bucket name is correct
      .download(filePath);

    if (fetchError) {
      console.error('Error fetching shipment solution:', fetchError.message || fetchError);
      return { error: 'Failed to retrieve shipment solution' };
    }

    const fileText = await fileData.text();
    const jsonObject = JSON.parse(fileText);

    return { data: jsonObject };
  } catch (error) {
    console.error('Error processing shipment solution:', error.message || error);
    return { error: 'Error processing shipment solution' };
  }
}
