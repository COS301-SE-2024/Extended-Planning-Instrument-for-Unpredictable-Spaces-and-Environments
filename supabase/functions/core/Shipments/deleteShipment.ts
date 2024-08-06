export async function deleteShipment(supabase: any, fileName: string) {
    const { data: deleteData, error: deleteError } = await supabase.storage
      .from('data_bucket')
      .remove([`uploads/${fileName}`]);
  
    if (deleteError) {
      console.error('Error deleting file:', deleteError);
      alert('Failed to delete file');
      return { error: 'Failed to delete file' };
    }
  
    console.log('File deleted successfully:', deleteData);
    return { data: deleteData };
  }
  