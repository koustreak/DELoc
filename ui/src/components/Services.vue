<template>
  <div class="flex flex-col h-full bg-slate-50/50">
    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto p-6">

      <!-- Compact Header with Inline Search -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2 font-semibold text-slate-700 text-sm tracking-tight">
          <Layers class="w-4 h-4 text-slate-800" />
          Services
        </div>

        <div class="relative w-full max-w-sm drop-shadow-sm">
          <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search services..." 
            class="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200/80 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder-slate-400 transition-all font-medium" 
          />
        </div>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        
        <div v-for="service in filteredServices" :key="service.name" class="bg-gradient-to-b from-white to-[#f4f6f9] rounded-md border border-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_6px_-2px_rgba(0,0,0,0.05),0_8px_12px_-3px_rgba(0,0,0,0.03)] flex flex-col p-4 transition-all hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_8px_12px_-3px_rgba(60,120,216,0.15)] group">
          <!-- Logo & Name -->
          <div class="flex items-end gap-2.5 mb-3 text-slate-800 border-b border-slate-50/0 pb-2">
            <component :is="service.icon" :class="['w-8 h-8 drop-shadow-sm', service.color]" />
            <h3 class="text-[17px] font-semibold leading-tight tracking-tight">{{ service.name }}</h3>
          </div>
          
          <!-- Version -->
          <div class="text-[11px] text-slate-500 mb-2 font-mono font-medium">{{ service.version }}</div>
          
          <!-- Description -->
          <div class="text-xs text-slate-600 mb-5 leading-normal flex-1">{{ service.description }}</div>
          
          <!-- Action Buttons -->
          <div class="flex items-center gap-2 mt-auto">
            <button class="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded text-[11px] font-semibold shadow-sm shadow-emerald-900/20 transition-all active:scale-95">
              <Play class="w-2.5 h-2.5" fill="currentColor" /> Start
            </button>
            <button class="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300/80 text-slate-700 py-1.5 rounded text-[11px] font-semibold shadow-sm transition-all active:scale-95">
              Configure
            </button>
          </div>
        </div>

        <div v-if="filteredServices.length === 0" class="col-span-full py-12 text-center text-slate-400">
          No services match your search query.
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Search, Layers, Play, Database, Server, Hexagon, Component, 
  Wind, HardDrive, Zap, Share2, Leaf, Box, Network
} from 'lucide-vue-next'

const searchQuery = ref('')

const servicesList = [
  { name: 'HDFS', icon: Database, color: 'text-yellow-600', version: 'v3.3.6', description: 'Distributed file system for big data storage.' },
  { name: 'Kafka', icon: Share2, color: 'text-slate-800', version: 'v3.6.1', description: 'Distributed event streaming platform.' },
  { name: 'Airflow', icon: Wind, color: 'text-cyan-500', version: 'v2.8.1', description: 'Workflow orchestration tool for data pipelines.' },
  { name: 'Trino', icon: Hexagon, color: 'text-indigo-600', version: 'v440', description: 'Distributed SQL query engine for big data.' },
  { name: 'Apache Hive', icon: Box, color: 'text-amber-500', version: 'v4.0.0', description: 'Data warehouse software for querying and managing large datasets.' },
  { name: 'Cassandra', icon: Server, color: 'text-blue-500', version: 'v4.1.3', description: 'Highly scalable distributed NoSQL database.' },
  { name: 'Pinot', icon: Component, color: 'text-rose-600', version: 'v1.0.0', description: 'Real-time distributed OLAP datastore.' },
  { name: 'Minio', icon: HardDrive, color: 'text-red-500', version: 'RELEASE.2024', description: 'High performance S3 compatible object storage.' },
  { name: 'Spark', icon: Zap, color: 'text-orange-500', version: 'v3.5.0', description: 'Unified analytics engine for large-scale data processing.' },
  { name: 'Nifi', icon: Network, color: 'text-teal-600', version: 'v1.25.0', description: 'Automates the flow of data between systems.' },
  { name: 'PostgreSQL', icon: Database, color: 'text-blue-400', version: 'v16.2', description: 'Powerful, open source object-relational database.' },
  { name: 'MongoDB', icon: Leaf, color: 'text-emerald-500', version: 'v7.0.5', description: 'Document-oriented NoSQL database system.' },
  { name: 'Neo4J', icon: Share2, color: 'text-cyan-700', version: 'v5.17.0', description: 'Native graph database designed for connected data.' },
]

const filteredServices = computed(() => {
  if (!searchQuery.value) return servicesList
  const q = searchQuery.value.toLowerCase()
  return servicesList.filter(s => 
    s.name.toLowerCase().includes(q) || 
    s.description.toLowerCase().includes(q)
  )
})
</script>
