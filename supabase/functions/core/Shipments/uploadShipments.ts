export async function uploadShipments(supabase: any, selectedFile: any) {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('data_bucket')
      .upload(`uploads/${selectedFile.value.name}`, selectedFile.value);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      alert('Failed to upload file');
      return { error: 'Failed to upload file' };
    }
    
    console.log('File uploaded successfully:', uploadData);
    return { data: uploadData };
}
