export async function updateRole(supabase: any, email: string, role: string) {
    const { data, error } = await supabase
    .from("Users")
    .update({
      "Role": role,
    }).eq("Email", email);
  
    if (error) {
      console.error('Error updating user role', error);
      return { error: 'Failed to update user' };
    }
  
    return { "Role Update":"Succesfully Updated User!" };
  }
  