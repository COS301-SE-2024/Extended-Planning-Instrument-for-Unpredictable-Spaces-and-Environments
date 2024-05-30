<template>
  <div class="home-view">
    <header class="header">
      <h1>Unlocking South Africa's Logistics Potential</h1>
      <p>Revolutionizing Efficiency in Logistics with Intelligent Packing and Optimal Space Management</p>
    </header>
    
    <section class="introduction">
      <h2>Introduction</h2>
      <p>
        Unlocking the potential within South Africa's logistics juggernaut: 1.5 billion tonnes of goods annually,
        10% of the nation's GDP, and a million-strong workforce. In this landscape of untapped opportunities, our mission is clear – 
        design a system that transforms inefficiency into a symphony of precision. Imagine a logistics realm where every truck is a marvel of intelligent 
        packing and optimal space management. This project isn't just an upgrade; it's a revolution in efficiency.
      </p>
    </section>
    
    <section class="background-motivation">
      <h2>Background & Motivation</h2>
      <p>
        The motivation behind this project is rooted in the recognition of these missed opportunities within the logistics behemoth.
        Imagine the transformative power of a system that can seamlessly convert inefficiency into precision, elevating each logistical operation to the level of a finely tuned symphony. 
        The goal is not merely an incremental upgrade; it's a bold revolution aimed at reshaping the very essence of efficiency within the logistics sector.
      </p>
    </section>
    
    <section class="system-requirements">
      <h2>System Requirements</h2>
      
      <h3>Core Requirements</h3>
      <ol>
        <li>Design an algorithm to dynamically adjust the placement of goods in real-time, optimizing the available space within the logistics truck.</li>
        <li>Develop a robust machine learning model that learns from historical data, user feedback, and real-world outcomes to continuously enhance the packing algorithm.</li>
        <li>Create an interface for logistics managers to input specific constraints, preferences, and priorities for the packing algorithm.</li>
        <li>Provide a dashboard that displays real-time information about the packing progress as well as process, essentially displaying the data of the algorithm.</li>
      </ol>
      
      <h3>Optional Requirements</h3>
      <ol>
        <li>Add route-based optimization, where the truck will be packed in the order of its destinations, so unpacking of the truck will happen intuitively in the sense last-in is first-out algorithm.</li>
      </ol>
      
      <h3>Wow Factors</h3>
      <ol>
        <li>Design a way to simulate the packing of the truck through the use of the algorithm/model using a renderer/simulation which would showcase the packing of the truck.</li>
      </ol>
    </section>
    
    <section class="architecture-requirements">
      <h2>Architecture Requirements</h2>
      
      <h3>Performance</h3>
      <p>The system should return the optimal packing route within 2-5 minutes of the provided configuration/input parameters.</p>
      
      <h3>Scalability</h3>
      <p>The system should be scalable in the sense the algorithm could potentially be used for packing cargo trains, or shipping containers.</p>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
};
</script>

<style scoped>
.home-view {
  font-family: Arial, sans-serif;
  padding: 20px;
  line-height: 1.6;
  background-color: #f5f5f5;
  color: #333;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 36px;
  color: #333;
}

.header p {
  font-size: 18px;
  color: #666;
}

section {
  margin-bottom: 30px;
}

h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 15px;
}

h3 {
  font-size: 22px;
  color: #444;
  margin-top: 20px;
  margin-bottom: 10px;
}

p {
  font-size: 16px;
  color: #555;
}

ol {
  padding-left: 20px;
  font-size: 16px;
}

ol li {
  margin-bottom: 10px;
}
</style>
