<template>
    <div class="sign-up-view">
      <div class="welcome-section">
        <h2>Create Your Account</h2>
        <p>Join us and revolutionize logistics efficiency.</p>
      </div>
      <SignUp />
    </div>
  </template>
  
  <script>
  import SignUp from '@/components/SignUp.vue';
  
  export default {
    components: {
      SignUp
    }
  };
  </script>
  
  <style scoped>
  .sign-up-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f5f5f5;
    padding: 20px;
  }
  
  .welcome-section {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .welcome-section h2 {
    font-size: 32px;
    color: #333;
  }
  
  .welcome-section p {
    font-size: 18px;
    color: #666;
    margin-top: 10px;
  }
  </style>
  