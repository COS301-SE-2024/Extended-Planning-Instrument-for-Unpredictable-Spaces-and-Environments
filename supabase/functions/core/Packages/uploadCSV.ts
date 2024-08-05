export async function uploadFile(supabase: any, file: File) {
    const { data, error } = await supabase
      .storage
      .from('data_bucket')
      .upload(`uploads/${file.name}`, file);
  
    if (error) {
      console.error('Error uploading file:', error);
      return { error: 'Failed to upload file' };
    }
  
    return { message: 'File uploaded successfully', data };
  }