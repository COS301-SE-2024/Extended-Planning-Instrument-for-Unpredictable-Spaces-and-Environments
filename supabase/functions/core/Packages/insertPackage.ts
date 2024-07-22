export async function insertPackage(supabase: any, ship_id: string, width: string, length: string, height: string, weight: string, volume: string) {
    const { data, error } = await supabase
      .from("Packages")
      .insert([
        {
          Shipment_id: ship_id,
          Width: width,
          Length: length,
          Height: height,
          Weight: weight,
          Volume: volume,
        }
      ]);
  
    if (error) {
      console.error('Error inserting package', error);
      return { error: 'Failed to insert package' };
    }
  
    return { "Insert Package":"Succesfully Inserted Package!" };
  }
  