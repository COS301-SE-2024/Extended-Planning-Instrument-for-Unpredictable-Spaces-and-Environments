export async function getPublicURL(supabase: any, fileName: any) {

    // Get the public URL of the uploaded file
    const { data: publicURLData, error: urlError } = supabase.storage
      .from('data_bucket')
      .getPublicUrl(`uploads/${fileName}`);

    if (urlError) {
      console.error('Error getting public URL:', urlError);
      alert('Failed to get public URL');
      return { error: 'Failed to get public URL' };
    }

    console.log('Public URL obtained successfully:', publicURLData);

    return {data: publicURLData };
}
