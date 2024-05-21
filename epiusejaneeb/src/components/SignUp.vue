<template>
    <div class="sign-up-container">
      <h1>Sign Up</h1>
      <form @submit.prevent="signUp" class="sign-up-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required class="form-control" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" required class="form-control" />
        </div>
        <button type="submit" class="sign-up-button">Sign Up</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: '',
        password: ''
      };
    },
    methods: {
      async signUp() {
        try {
          const { user, error } = await this.$supabase.auth.signUp({
            email: this.email,
            password: this.password
          });
          if (error) {
            alert(error.message);
          } else {
            console.log('User signed up:', user);
            alert('Sign up successful!');
            this.$router.push({ name: 'home' }); // Navigate to the login page after successful sign-up
          }
        } catch (error) {
          console.error('Error signing up:', error);
          alert('Error signing up.');
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .sign-up-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #fff;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
    color: #333;
  }
  
  .sign-up-form {
    display: flex;
    flex-direction: column;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
  }
  
  .form-control {
    width: calc(100% - 22px);
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
  }
  
  .sign-up-button {
    padding: 10px;
    font-size: 16px;
    color: #fff;
    background-color: #28a745;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .sign-up-button:hover {
    background-color: #218838;
  }
  </style>
  