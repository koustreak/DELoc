<template>
  <aside class="w-64 bg-slate-800 text-slate-300 flex flex-col border-r border-slate-700/50 flex-shrink-0">
    <!-- App Logo Area for Sidebar (Optional if using standard TitleBar, but good for branding below it) -->
    
    <nav class="flex-1 py-4 space-y-1 overflow-y-auto">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.name">
          <a
            href="#"
            @click.prevent="active = item.name"
            :class="[
              'flex items-center gap-3 px-6 py-3 font-medium transition-colors border-l-4',
              active === item.name 
                ? 'bg-blue-600/20 text-white border-blue-500' 
                : 'border-transparent hover:bg-slate-700/50 hover:text-white'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 opacity-80" />
            <span>{{ item.name }}</span>
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Home, 
  Layers, 
  Database, 
  HardDrive, 
  Puzzle, 
  BookOpen 
} from 'lucide-vue-next'

const active = ref('Dashboard')

const menuItems = [
  { name: 'Dashboard', icon: Home },
  { name: 'Services', icon: Layers },
  { name: 'Stacks', icon: Database },
  { name: 'Volumes', icon: HardDrive },
  { name: 'Plugins', icon: Puzzle },
  { name: 'Notebook', icon: BookOpen },
]
</script>
