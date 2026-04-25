<template>
  <div class="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
    <!-- OS Custom Title Bar -->
    <TitleBar class="flex-shrink-0" />

    <!-- Application Body -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Navigation Menu -->
      <Sidebar />
      
      <!-- Main Content Route Area -->
      <main class="flex-1 overflow-hidden">
        <Dashboard />
      </main>
    </div>
  </div>
</template>

<script setup>
import TitleBar from './components/TitleBar.vue'
import Sidebar from './components/Sidebar.vue'
import Dashboard from './components/Dashboard.vue'
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: transparent;
}
body {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
