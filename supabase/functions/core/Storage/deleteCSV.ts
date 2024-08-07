export async function deleteCSV(supabase: any, fileName: string) {
    const { data, error } = await supabase
      .storage
      .from('data_bucket')
      .remove(`uploads/${fileName}`);
  
    if (error) {
      console.error('Error deleting file', error);
      return { error: 'Failed to delete file' };
    }
  
    return { data };
  }
  