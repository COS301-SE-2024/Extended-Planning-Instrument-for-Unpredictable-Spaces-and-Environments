import CryptoJS from 'https://esm.sh/crypto-js@4.1.1';

export async function uploadSignature(supabase: any, signatureDataUrl: string) {
  try {
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY') || 'default_key'; // Use Deno.env.get for environment variables, or a fallback key

    // Log the incoming Data URL for debugging
    console.log('Incoming Data URL:', signatureDataUrl);

    // Convert Data URL to ArrayBuffer
    const fileContent = await dataUrlToArrayBuffer(signatureDataUrl);

    // Convert ArrayBuffer to Hex String
    const hexString = arrayBufferToHex(fileContent);

    // Encrypt the file content
    const encryptedContent = CryptoJS.AES.encrypt(hexString, encryptionKey).toString();

    // Convert encrypted content to Blob format
    const encryptedBlob = new Blob([encryptedContent], { type: 'application/octet-stream' });

    // Generate a unique file name
    const fileName = `signature_${Date.now()}.encrypted`;

    // Upload the encrypted file to Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('data_bucket')
      .upload(`signatures/${fileName}`, encryptedBlob);

    if (uploadError) {
      console.error('Error uploading sign ature:', uploadError);
      return { error: 'Failed to upload signature' };
    }

    console.log('Signature uploaded successfully:', uploadData);
    return { data: uploadData };
  } catch (error) {
    console.error('Error processing signature:', error);
    return { error: 'Error processing signature' };
  }
}

// Helper function to convert Data URL to ArrayBuffer
function dataUrlToArrayBuffer(dataUrl: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    try {
      const base64String = dataUrl.split(',')[1];
      const binaryString = atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      resolve(bytes.buffer);
    } catch (error) {
      console.error('Failed to decode Base64 string:', error);
      reject(new Error('Failed to decode Base64 string'));
    }
  });
}

// Helper function to convert ArrayBuffer to Hex String
function arrayBufferToHex(arrayBuffer: ArrayBuffer) {
  const byteArray = new Uint8Array(arrayBuffer);
  let hexString = '';
  for (let i = 0; i < byteArray.length; i++) {
    const hex = byteArray[i].toString(16).padStart(2, '0');
    hexString += hex;
  }
  return hexString;
}
