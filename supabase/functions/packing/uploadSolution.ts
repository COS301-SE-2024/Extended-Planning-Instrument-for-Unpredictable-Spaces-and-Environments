export async function uploadSolution(supabase: any, jsonObject: object, shipment_id: any) {
  try {
    // Log the incoming JSON object for debugging
    console.log('Incoming JSON Object:', jsonObject);

    // Convert the JSON object to a Blob format
    const jsonBlob = new Blob([JSON.stringify(jsonObject)], { type: 'application/json' });

    // Generate a unique file name
    const fileName = `shipment_${shipment_id}.json`;

    // Upload the JSON file to the 'solutions' bucket in Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('solutions')
      .upload(`solutions/${fileName}`, jsonBlob);

    if (uploadError) {
      console.error('Error uploading solution:', uploadError);
      return { error: 'Failed to upload solution' };
    }

    console.log('Solution uploaded successfully:', uploadData);
    return { data: uploadData };
  } catch (error) {
    console.error('Error processing solution:', error);
    return { error: 'Error processing solution' };
  }
}
