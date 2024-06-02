export async function insertUser(supabase: any, fullname: string, email: string, role: string, phone: string) {
    const { data, error } = await supabase
      .from("Users")
      .insert([
        {
          FullName: fullname,
          Email: email,
          Role: role,
          Phone: phone,
        }
      ]);
  
    if (error) {
      console.error('Error inserting user', error);
      return { error: 'Failed to insert user' };
    }
  
    return { "Insert Update":"Succesfully Inserted User!" };
  }
  