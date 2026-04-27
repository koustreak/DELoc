<template>
  <aside class="w-48 bg-slate-800 text-slate-300 flex flex-col border-r border-slate-700/50 flex-shrink-0">
    <nav class="flex-1 py-3 space-y-0.5 overflow-y-auto">
      <ul class="space-y-0.5">
        <li v-for="item in menuItems" :key="item.name">
          <a
            href="#"
            @click.prevent="active = item.name; $emit('change-tab', item.name)"
            :class="[
              'flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors border-l-3',
              active === item.name 
                ? 'bg-blue-600/20 text-white border-blue-500' 
                : 'border-transparent hover:bg-slate-700/50 hover:text-white'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4 opacity-80" />
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
