export async function uploadSignature(supabase: any, encryptedSignature: string, shipmentID: any) {
  try {
    // Log the incoming encrypted string for debugging
    console.log('Incoming Encrypted Signature:', encryptedSignature);

    // Convert encrypted content to Blob format
    const encryptedBlob = new Blob([encryptedSignature], { type: 'application/octet-stream' });

    // Generate a unique file name
    const fileName = `signature_${shipmentID}.encrypted`;

    // Upload the encrypted file to Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('data_bucket')
      .upload(`signatures/${fileName}`, encryptedBlob);

    if (uploadError) {
      console.error('Error uploading signature:', uploadError);
      return { error: 'Failed to upload signature' };
    }

    console.log('Signature uploaded successfully:', uploadData);
    return { data: uploadData };
  } catch (error) {
    console.error('Error processing signature:', error);
    return { error: 'Error processing signature' };
  }
}