<template>
  <div class="h-screen w-screen flex flex-col bg-slate-50 dark:bg-[#15171e] overflow-hidden font-sans transition-colors duration-300">
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
        <Notebooks v-else-if="currentTab === 'Notebooks'" />
      </main>
    </div>

    <!-- Advertisement & Status Footer -->
    <footer class="h-[22px] flex-shrink-0 bg-gradient-to-r from-[#1e4e8c] to-[#0f644b] text-white flex items-center justify-between px-3 text-[10.5px] font-medium tracking-wide z-50 shadow-[0_-1px_4px_rgba(0,0,0,0.1)]">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5 hover:text-blue-200 transition-colors cursor-default"><Activity class="w-[11px] h-[11px] opacity-70" /> Mode: Local</div>
        <div class="flex items-center gap-1.5 hover:text-blue-200 transition-colors cursor-default"><Tag class="w-[11px] h-[11px] opacity-70" /> v1.0.0</div>
        <div class="flex items-center gap-1.5 opacity-90"><User class="w-[11px] h-[11px] opacity-70" /> Developer: Koushik (Aka Bhootnath)</div>
      </div>
      
      <div class="flex items-center gap-4">
        <a href="https://www.linkedin.com/in/koushik-dutta-9797a8209" target="_blank" class="flex items-center gap-1 hover:text-blue-200 hover:underline transition-all">
          <Linkedin class="w-[11px] h-[11px] opacity-80" /> LinkedIn
        </a>
        <a href="https://github.com/koustreak/DELoc" target="_blank" class="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition-all cursor-pointer">
          <Star class="w-3 h-3 text-yellow-300 fill-yellow-300" /> <span class="tracking-tight text-yellow-50">( hit me a star ) GitHub</span>
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Activity, Tag, User, Star, Linkedin } from 'lucide-vue-next'
import TitleBar from './components/TitleBar.vue'
import Sidebar from './components/Sidebar.vue'
import Dashboard from './components/Dashboard.vue'
import Services from './components/Services.vue'
import Stacks from './components/Stacks.vue'
import Volumes from './components/Volumes.vue'
import Plugins from './components/Plugins.vue'
import Notebooks from './components/Notebooks.vue'

const currentTab = ref('Dashboard')
</script>

<style>
/* Dark Mode Global Overrides */
html.dark .bg-white { background-color: #1a1d24 !important; }
html.dark .bg-slate-50, html.dark .bg-slate-100 { background-color: #14171d !important; }
html.dark .bg-\[\#f8fafc\], html.dark .bg-\[\#fbfcfd\] { background-color: #14171d !important; border-color: #2a2e36 !important; }
html.dark .bg-\[\#f2f5f9\] { background-color: #0f1115 !important; }
html.dark .border-slate-100, html.dark .border-slate-200, html.dark .border-slate-300 { border-color: #2a2e36 !important; }
html.dark .text-slate-800, html.dark .text-slate-700 { color: #f1f5f9 !important; }
html.dark .text-slate-600, html.dark .text-slate-500 { color: #94a3b8 !important; }
html.dark .text-slate-400 { color: #64748b !important; }
html.dark .divide-slate-100 > :not([hidden]) ~ :not([hidden]) { border-color: #2a2e36 !important; }
html.dark .hover\:bg-slate-50:hover, html.dark .hover\:bg-slate-100:hover { background-color: #2a2e36 !important; }
html.dark input, html.dark select { background-color: #0f1115 !important; color: #f1f5f9 !important; border-color: #2a2e36 !important; }

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
