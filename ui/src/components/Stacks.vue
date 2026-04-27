<template>
  <div class="flex flex-col h-full bg-blue-50/30">
    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto px-6 pb-6">

      <!-- Unified Header Row -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 py-6 border-b border-slate-200/50 mb-6">
        
        <!-- Search Box (Left-aligned/Flexible) -->
        <div class="relative flex-1 w-full max-w-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
          <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search stacks..." 
            class="w-full pl-9 pr-4 py-1.5 text-[12px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder-slate-400 transition-all font-medium" 
          />
        </div>

        <!-- Action Buttons (Right) -->
        <div class="flex items-center gap-3 whitespace-nowrap flex-shrink-0">
          <div class="flex rounded shadow-sm">
            <button class="px-4 py-1.5 bg-[#3c78d8] hover:bg-blue-600 text-white font-medium text-[11px] rounded-l border-r border-[#2b64c0] flex items-center gap-1.5 transition-colors">
              <Plus class="w-3 h-3" /> Create Stack
            </button>
            <button class="px-2 py-1.5 bg-[#3c78d8] hover:bg-blue-600 text-white rounded-r transition-colors">
              <ChevronDown class="w-3 h-3" />
            </button>
          </div>
          <div class="flex rounded shadow-sm">
            <button class="px-4 py-1.5 bg-[#d85858] hover:bg-red-600 text-white font-medium text-[11px] rounded-l border-r border-red-700/80 flex items-center gap-1.5 transition-colors">
              <Database class="w-3 h-3" /> Delete Stack
            </button>
            <button class="px-2 py-1.5 bg-[#d85858] hover:bg-red-600 text-white rounded-r transition-colors">
              <ChevronDown class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <!-- Stacks Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div v-for="stack in filteredStacks" :key="stack.name" class="bg-gradient-to-b from-white to-[#f4f6f9] rounded border border-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_6px_-2px_rgba(0,0,0,0.05),0_8px_12px_-3px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_8px_12px_-3px_rgba(60,120,216,0.15)]">
          <!-- Card Header (Title & Badge) -->
          <div class="flex items-center justify-between px-4 pt-4 pb-3">
            <h3 class="text-[15px] font-semibold text-slate-800">{{ stack.name }}</h3>
            <!-- Status Badge -->
            <span :class="[
              'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm',
              stack.status === 'Running' ? 'bg-emerald-600/90' : 
              stack.status === 'Stopped' ? 'bg-red-600/90' : 'bg-amber-500/90'
            ]">
              {{ stack.status }}
            </span>
          </div>
          
          <!-- Services List -->
          <div class="flex-1 px-4 mb-3 h-48 overflow-y-auto">
            <ul class="space-y-1.5 relative border-r-2 border-slate-200/50 pr-2">
              <li v-for="service in stack.services" :key="service.name" class="flex items-center gap-3 py-1.5 border-b border-slate-200/40 last:border-0 hover:bg-slate-100/50 transition-colors px-1 rounded">
                <component :is="service.icon" :class="['w-4 h-4 drop-shadow-sm', service.color]" />
                <span class="text-[13px] font-medium text-slate-700">{{ service.name }}</span>
              </li>
            </ul>
          </div>
          
          <!-- Action Buttons Footer -->
          <div class="px-4 py-3 bg-[#e4ebf5] border-t border-slate-200 flex items-center gap-2 mt-auto shadow-inner">
            <button class="flex items-center justify-center gap-1 bg-[#477a56] hover:bg-emerald-800 text-white px-4 py-1.5 rounded-sm text-[11px] font-medium shadow transition-colors">
              <Play class="w-2.5 h-2.5" fill="currentColor" /> Start
            </button>
            <button class="bg-[#d5dce6] hover:bg-slate-300 border border-[#b8c2cc] text-slate-800 px-4 py-1.5 rounded-sm text-[11px] font-medium shadow-sm transition-colors">
              Configure
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredStacks.length === 0" class="col-span-full py-12 text-center text-slate-400 bg-white rounded border border-slate-200">
          No stacks match your search query.
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Search, Database, Play, ChevronDown, Plus,
  Zap, Share2, Hexagon, Wind, Droplet, Box
} from 'lucide-vue-next'

const searchQuery = ref('')

// Predefine common service visual traits
const svcs = {
  Spark: { icon: Zap, color: 'text-orange-500' },
  Kafka: { icon: Share2, color: 'text-slate-800' },
  Trino: { icon: Hexagon, color: 'text-indigo-600' },
  Ozone: { icon: Database, color: 'text-blue-700' },
  Airflow: { icon: Wind, color: 'text-cyan-500' },
  NiFi: { icon: Droplet, color: 'text-teal-600' },
  HiveMetastore: { icon: Box, color: 'text-amber-500' }
}

const stacksList = [
  { 
    name: 'Lakehouse Stack', 
    status: 'Running', 
    services: [
      { name: 'Spark', ...svcs.Spark },
      { name: 'Kafka', ...svcs.Kafka },
      { name: 'Trino', ...svcs.Trino },
      { name: 'Ozone', ...svcs.Ozone }
    ]
  },
  { 
    name: 'Streaming Lab', 
    status: 'Stopped', 
    services: [
      { name: 'Kafka', ...svcs.Kafka },
      { name: 'Trino', ...svcs.Trino },
      { name: 'Airflow', ...svcs.Airflow },
      { name: 'Ozone', ...svcs.Ozone }
    ]
  },
  { 
    name: 'CDC Pipeline', 
    status: 'Stopping...', 
    services: [
      { name: 'Kafka', ...svcs.Kafka },
      { name: 'Trino', ...svcs.Trino },
      { name: 'NiFi', ...svcs.NiFi },
      { name: 'Hive Metastore', ...svcs.HiveMetastore }
    ]
  }
]

const filteredStacks = computed(() => {
  if (!searchQuery.value) return stacksList
  const q = searchQuery.value.toLowerCase()
  return stacksList.filter(stack => {
    // Search by stack name
    if (stack.name.toLowerCase().includes(q)) return true
    // Search by contained service names
    return stack.services.some(s => s.name.toLowerCase().includes(q))
  })
})
</script>
