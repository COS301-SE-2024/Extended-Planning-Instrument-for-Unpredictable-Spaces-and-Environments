export async function deleteUser(supabase: any, email: string) {
  try {
    console.log(`Attempting to delete user with email: ${email}`);

    // Retrieve the list of users matching the email
    const { data: userList, error: getUserError } = await supabase.auth.admin.listUsers();

    console.log('User retrieval result:', { userList, getUserError });

    if (getUserError) {
      console.error('Error retrieving user from auth table', getUserError);
      return { error: 'Failed to retrieve user from auth table' };
    }
    const user = userList.users.find((user: any) => user.email === email);

    if (!user) {
      console.error('No user found with the provided email');
      return { error: 'No user found with the provided email' };
    }

    const userId = user.id;
    console.log(`User ID to be deleted: ${userId}`);

    // Delete the user from the auth table
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    console.log('Auth deletion result:', { authError });

    if (authError) {
      console.error('Error deleting user from auth table', authError);
      return { error: 'Failed to delete user from auth table' };
    }

    // Now, delete the user from the Users table in your database using the exact email match
    const { data: deleteResult, error: userError } = await supabase
      .from('Users')
      .delete()
      .eq('Email', email);

    console.log('Database deletion result:', { deleteResult, userError });

    // if (userError) {
    //   console.error('Error deleting user from Users table', userError);
    //   return { error: 'Failed to delete user from Users table' };
    // }

    // if (!deleteResult || deleteResult.length === 0) {
    //   console.error('No matching user found to delete in Users table');
    //   return { error: 'No matching user found to delete in Users table' };
    // }

    console.log('Successfully deleted user from both auth and Users table!');
    return { message: 'Successfully deleted user from both auth and Users table!' };
  } catch (err) {
    console.error('Unexpected error occurred:', err);
    return { error: 'Unexpected error occurred' };
  }
}
