import CryptoJS from 'https://esm.sh/crypto-js@4.1.1';

export async function uploadEncryptedSignature(supabase: any, encryptedSignature: string) {
  try {
    // Log the incoming encrypted string for debugging
    console.log('Incoming Encrypted Signature:', encryptedSignature);

    // Convert encrypted content to Blob format
    const encryptedBlob = new Blob([encryptedSignature], { type: 'application/octet-stream' });

    // Generate a unique file name
    const fileName = `signature_${Date.now()}.encrypted`;

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