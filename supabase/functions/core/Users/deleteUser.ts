export async function deleteUser(supabase: any, userId: string) {
    const { data, error } = await supabase
      .from("Users")
      .delete()
      .eq("id", userId);
  
    if (error) {
      console.error('Error deleting user', error);
      return { error: 'Failed to delete user' };
    }
  
    return { "Delete Update": "Successfully Deleted User!" };
}
