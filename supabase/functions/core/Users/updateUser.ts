export async function updateUser(supabase: any, email: string, role: string, fullname: string, phone: string) {
    const { data, error } = await supabase
    .from("Users")
    .update({
      "Role": role,
      "FullName": fullname,
      "Phone": phone,

    }).eq("Email", email);
  
    if (error) {
      console.error('Error updating user role', error);
      return { error: 'Failed to update user' };
    }
  
    return { "Role Update":"Succesfully Updated User!" };
  }
  