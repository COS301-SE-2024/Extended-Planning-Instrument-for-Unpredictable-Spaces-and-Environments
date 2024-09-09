export async function getDistanceMatrix(supabase: any, origins: string, destinations: string, apiKey: string) {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${apiKey}`;
  
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('HTTP error! status:', response.status);
        return { error: `Failed to fetch distance matrix. Status code: ${response.status}` };
      }
  
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching distance matrix', error);
      return { error: 'Failed to fetch distance matrix' };
    }
  }
  