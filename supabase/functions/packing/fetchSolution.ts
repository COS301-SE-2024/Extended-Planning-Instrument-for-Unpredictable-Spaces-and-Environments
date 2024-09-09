export async function fetchSolution(supabase: any, shipmentId: number) {
  try {
    // Generate the file name based on the shipment ID
    const fileName = `shipment_${shipmentId}.json`;
    const filePath = `solutions/${fileName}`; // Adjust this if the file is in a subfolder
    
    console.log('Attempting to fetch shipment solution from path:', filePath);

    // Fetch the file from the 'solutions' bucket
    const { data: fileData, error: fetchError } = await supabase.storage
      .from('solutions') // Ensure the bucket name is correct
      .download(filePath);

    if (fetchError) {
      console.error('Error fetching shipment solution:', fetchError.message || fetchError);
      return { error: 'Failed to retrieve shipment solution' };
    }

    // Convert the file data to JSON (assuming it's a JSON file)
    const fileText = await fileData.text();
    console.log('File content:', fileText);

    const jsonObject = JSON.parse(fileText);
    console.log('Shipment solution retrieved successfully:', jsonObject);

    return { data: jsonObject };
  } catch (error) {
    console.error('Error processing shipment solution:', error.message || error);
    return { error: 'Error processing shipment solution' };
  }
}
