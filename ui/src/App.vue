<template>
  <div class="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
    <!-- OS Custom Title Bar -->
    <TitleBar class="flex-shrink-0" />

    <!-- Application Body -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Navigation Menu -->
      <Sidebar @change-tab="tab => currentTab = tab" />
      
      <main class="flex-1 overflow-hidden">
        <Dashboard v-if="currentTab === 'Dashboard'" />
        <Services v-else-if="currentTab === 'Services'" />
        <Stacks v-else-if="currentTab === 'Stacks'" />
        <Volumes v-else-if="currentTab === 'Volumes'" />
        <Plugins v-else-if="currentTab === 'Plugins'" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TitleBar from './components/TitleBar.vue'
import Sidebar from './components/Sidebar.vue'
import Dashboard from './components/Dashboard.vue'
import Services from './components/Services.vue'
import Stacks from './components/Stacks.vue'
import Volumes from './components/Volumes.vue'
import Plugins from './components/Plugins.vue'

const currentTab = ref('Dashboard')
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
