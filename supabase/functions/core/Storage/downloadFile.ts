export async function downloadFile(supabase: any, fileName: string) {
  const { data, error: downloadError } = await supabase.storage
    .from('data_bucket')
    .download(`uploads/${fileName}`)

  if (downloadError) {
    console.error('Error downloading file:', downloadError)
    // alert('Failed to download file');
    return { error: 'Failed to download file' }
  }

  const csvText = await data.text()
  console.log('CSV Text (first 100 characters):', csvText.substring(0, 100))

  return { data: csvText }
}
