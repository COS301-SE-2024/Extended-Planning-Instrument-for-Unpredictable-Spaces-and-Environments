<!-- src/components/SignIn.vue -->
<template>
    <div>
      <h1>Sign In</h1>
      <form @submit.prevent="signIn">
        <div>
          <label for="email">Email</label>
          <input type="email" v-model="email" required />
        </div>
        <div>
          <label for="password">Password</label>
          <input type="password" v-model="password" required />
        </div>
        <button type="submit">Sign In</button>
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
      async signIn() {
        const { user, error } = await this.$supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password
        });
        if (error) {
          alert(error.message);
        } else {
            console.log(user);
          alert('Sign in successful!');
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .sign-in-container {
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
  
  .sign-in-form {
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
  
  .sign-in-button {
    padding: 10px;
    font-size: 16px;
    color: #fff;
    background-color: #007bff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .sign-in-button:hover {
    background-color: #0056b3;
  }
  </style>
  