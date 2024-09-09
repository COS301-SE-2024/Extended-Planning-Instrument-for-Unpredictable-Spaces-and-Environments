export async function uploadSolution(supabase: any, jsonObject: object, shipment_id: any) {
  try {
    const jsonBlob = new Blob([JSON.stringify(jsonObject)], { type: 'application/json' })

    const fileName = `shipment_${shipment_id}.json`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('solutions')
      .upload(`solutions/${fileName}`, jsonBlob)

    if (uploadError) {
      console.error('Error uploading solution:', uploadError)
      return { error: `Failed to upload solution${uploadError}` }
    } else {
      return { data: uploadData }
    }
  } catch (error) {
    console.error('Error processing solution:', error)
    return { error: `Error processing solution${error}` }
  }
}
