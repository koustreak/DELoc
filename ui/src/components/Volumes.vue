<template>
  <div class="flex flex-col h-full bg-blue-50/30">
    <!-- Scrollable Content -->
    <main class="flex-1 overflow-y-auto w-full p-6 space-y-6">
      
      <!-- Table 1: Volumes in Action (PVCs) -->
      <div class="bg-white/90 rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <!-- Header & Top Pagination -->
        <div class="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 font-semibold text-slate-700 text-[13px]">
            <HardDrive class="w-4 h-4 text-slate-600" /> PVCs
          </div>
          <div class="flex items-center gap-3">
            <div class="relative w-48">
              <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input v-model="inActionSearch" type="text" placeholder="Search by name..." class="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-blue-500/50 placeholder-slate-400" />
            </div>
            <div class="flex items-center gap-2 border-l border-slate-200 pl-3">
              <span class="text-[10px] text-slate-500 whitespace-nowrap">{{ inActionStart }}–{{ inActionEnd }} of {{ filteredInAction.length }}</span>
              <div class="flex items-center gap-0.5">
                <button @click="inActionPage--" :disabled="inActionPage === 1" :class="['p-1 rounded hover:bg-slate-200 transition-colors text-slate-600', inActionPage === 1 ? 'opacity-40 cursor-not-allowed' : '']"><ChevronLeft class="w-3 h-3" /></button>
                <button @click="inActionPage++" :disabled="inActionPage >= inActionTotalPages" :class="['p-1 rounded hover:bg-slate-200 transition-colors text-slate-600', inActionPage >= inActionTotalPages ? 'opacity-40 cursor-not-allowed' : '']"><ChevronRight class="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Table -->
        <div class="overflow-x-auto min-h-[160px]">
          <table class="w-full text-left text-[12px] whitespace-nowrap">
            <thead class="bg-white text-slate-500 border-b border-slate-200 font-medium">
              <tr>
                <th class="px-4 py-2">Name</th>
                <th class="px-4 py-2">Services Attached</th>
                <th class="px-4 py-2">File Path</th>
                <th class="px-4 py-2">Occupied Since</th>
                <th class="px-4 py-2">Status</th>
                <th class="px-4 py-2 text-center px-4 w-15">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="vol in paginatedInAction" :key="vol.name" class="hover:bg-slate-50/70 transition-colors">
                <td class="px-4 py-2 font-medium text-slate-700">{{ vol.name }}</td>
                <td class="px-4 py-2">
                  <div class="flex items-center gap-4">
                    <div v-for="svc in vol.services" :key="svc.name" class="flex items-center gap-1.5">
                       <component :is="svc.icon" :class="['w-3.5 h-3.5', svc.color]" fill="currentColor" fill-opacity="0.2"/> 
                       <span class="text-slate-600">{{ svc.name }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-2 font-mono text-[11px] text-slate-500">{{ vol.path }}</td>
                <td class="px-4 py-2 text-slate-600">{{ vol.date }}</td>
                <td class="px-4 py-2">
                  <div v-if="vol.status === 'In Use'" class="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#608b68] text-white">In Use</div>
                  <div v-else class="flex flex-col gap-0">
                    <span class="text-slate-700 font-medium text-[11px]">Archived</span>
                    <span class="text-[10px] text-slate-400">{{ vol.archivedPath }}</span>
                  </div>
                </td>
                <td class="px-4 py-2">
                  <div class="flex items-center justify-center gap-2">
                    <button class="px-2 py-1 bg-[#d5dce6] hover:bg-[#c2ccdb] text-blue-900 rounded shadow-sm border border-[#aebbd1] transition-colors" title="Explorer">
                      <Folder class="w-3.5 h-3.5" fill="currentColor" fill-opacity="0.4" />
                    </button>
                    <button class="px-2 py-1 bg-[#d85858] hover:bg-red-600 text-white rounded shadow-sm border border-red-700 transition-colors" title="Delete">
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Table 2: Archived Volumes -->
      <div class="bg-white/90 rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-6">
        <!-- Header & Top Pagination -->
        <div class="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 font-semibold text-slate-700 text-[13px]">
            <Archive class="w-4 h-4 text-slate-600" /> Archived PVCs
          </div>
          <div class="flex items-center gap-3">
            <div class="relative w-48">
              <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input v-model="archivedSearch" type="text" placeholder="Search by name..." class="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-blue-500/50 placeholder-slate-400" />
            </div>
            <div class="flex items-center gap-2 border-l border-slate-200 pl-3">
              <span class="text-[10px] text-slate-500 whitespace-nowrap">{{ archivedStart }}–{{ archivedEnd }} of {{ filteredArchived.length }}</span>
              <div class="flex items-center gap-0.5">
                <button @click="archivedPage--" :disabled="archivedPage === 1" :class="['p-1 rounded hover:bg-slate-200 transition-colors text-slate-600', archivedPage === 1 ? 'opacity-40 cursor-not-allowed' : '']"><ChevronLeft class="w-3 h-3" /></button>
                <button @click="archivedPage++" :disabled="archivedPage >= archivedTotalPages" :class="['p-1 rounded hover:bg-slate-200 transition-colors text-slate-600', archivedPage >= archivedTotalPages ? 'opacity-40 cursor-not-allowed' : '']"><ChevronRight class="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Table -->
        <div class="overflow-x-auto min-h-[140px]">
          <table class="w-full text-left text-[12px] whitespace-nowrap">
            <thead class="bg-white text-slate-500 border-b border-slate-200 font-medium">
              <tr>
                <th class="px-4 py-2">Archived Path</th>
                <th class="px-4 py-2">PVCs Used In</th>
                <th class="px-4 py-2">Archived Date</th>
                <th class="px-4 py-2">Reinstall PVC</th>
                <th class="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="vol in paginatedArchived" :key="vol.archivedPath" class="hover:bg-slate-50/70 transition-colors">
                <td class="px-4 py-2 font-mono text-[11px] text-slate-600">{{ vol.archivedPath }}</td>
                <td class="px-4 py-2">
                  <div class="flex items-center gap-4">
                    <div v-for="svc in vol.services" :key="svc.name" class="flex items-center gap-1.5">
                       <component :is="svc.icon" :class="['w-3.5 h-3.5', svc.color]" fill="currentColor" fill-opacity="0.2" /> 
                       <span class="text-slate-600">{{ svc.name }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-2 text-slate-600">{{ vol.date }}</td>
                <td class="px-4 py-2">
                  <button v-if="vol.canReinstall" class="flex items-center justify-center gap-1 px-3 py-1.5 bg-[#e4ebf5] hover:bg-[#d5dce6] text-slate-700 rounded shadow-sm border border-slate-300 transition-colors text-[11px] font-semibold">
                    <FolderOutput class="w-3.5 h-3.5" fill="currentColor" fill-opacity="0.3" /> Reinstall
                  </button>
                </td>
                <td class="px-4 py-2">
                  <div class="flex items-center justify-center gap-2">
                    <button class="px-2 py-1 bg-[#d5dce6] hover:bg-[#c2ccdb] text-blue-900 rounded shadow-sm border border-[#aebbd1] transition-colors" title="Explorer">
                      <Folder class="w-3.5 h-3.5" fill="currentColor" fill-opacity="0.4" />
                    </button>
                    <button class="px-2 py-1 bg-[#d85858] hover:bg-red-600 text-white rounded shadow-sm border border-red-700 transition-colors" title="Delete">
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bottom Form: Archive a PVC -->
      <div class="bg-white/90 rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-6">
         <div class="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 font-semibold text-slate-700 text-[13px] flex items-center gap-2">
            <ArchiveRestore class="w-4 h-4 text-slate-600" /> Archive a PVC
         </div>
         <div class="p-5 flex flex-col md:flex-row items-center gap-4 bg-white">
            <div class="text-slate-600 text-[13px]">Select PVC to Archive.</div>
            
            <div class="relative w-full md:w-64">
              <select class="w-full appearance-none pl-3 pr-8 py-2 bg-[#eef2f7] border border-slate-300 rounded text-[13px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/50 shadow-sm">
                <option value="" disabled selected>Select PVC...</option>
                <option value="Ozone Data">Ozone Data</option>
                <option value="Airflow Logs">Airflow Logs</option>
              </select>
              <ChevronDown class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <!-- Uneditable Display Path box -->
            <div class="flex-1 w-full relative">
              <div class="w-full flex items-center gap-2 px-4 py-2 bg-[#ebf0f7] border border-[#d1dae8] rounded shadow-inner text-slate-600 text-[12px] cursor-not-allowed select-none">
                <Folder class="w-3.5 h-3.5 text-slate-500" fill="currentColor" fill-opacity="0.3" />
                <span class="font-mono">/results/archived</span>
              </div>
            </div>

            <button class="w-full md:w-auto flex-shrink-0 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-[12px] font-semibold shadow border border-blue-600 transition-colors">
              Start Archive
            </button>
         </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Search, HardDrive, Archive, ArchiveRestore, ChevronLeft, ChevronRight, 
  Folder, Trash2, FolderOutput, Zap, Share2, Hexagon, Wind, Droplet, Box, ChevronDown
} from 'lucide-vue-next'

// Global search connects functionally to everything or just filters the UI logic
const globalSearch = ref('')

// Helpers for Icons
const sSpark = { name: 'Spark', icon: Zap, color: 'text-orange-500' }
const sKafka = { name: 'Kafka', icon: Share2, color: 'text-slate-800' }
const sTrino = { name: 'Trino', icon: Hexagon, color: 'text-indigo-600' }
const sAirflow = { name: 'Airflow', icon: Wind, color: 'text-cyan-500' }
const sHive = { name: 'Hive Metastore', icon: Box, color: 'text-amber-500' }

// --- In Action PVCs State ---
const inActionSearch = ref('')
const inActionPage = ref(1)
const inActionPerPage = 4

const rawInAction = [
  { name: 'Ozone Data', services: [sSpark, sTrino], path: '/data/ozone', date: '4/24/24', status: 'In Use' },
  { name: 'Airflow Logs', services: [sKafka], path: '/airflow/logs', date: '4/24/24', status: 'In Use' },
  { name: 'Metastore DB', services: [sHive], path: '/var/lib/hive/metastore', date: '4/24/24', status: 'Archived', archivedPath: '/archive/airflow-logs' },
  { name: 'Archived Results', services: [sTrino], path: '/results/archived', date: '4/22/24', status: 'Archived', archivedPath: '/archive/ozone-backup' },
]

const filteredInAction = computed(() => {
  let res = rawInAction
  // global filter
  if (globalSearch.value) {
    const gq = globalSearch.value.toLowerCase()
    res = res.filter(v => v.name.toLowerCase().includes(gq))
  }
  // local filter
  if (inActionSearch.value) {
    const q = inActionSearch.value.toLowerCase()
    res = res.filter(v => 
      v.name.toLowerCase().includes(q) || 
      v.path.toLowerCase().includes(q) ||
      v.services.some(s => s.name.toLowerCase().includes(q))
    )
  }
  return res
})

const inActionTotalPages = computed(() => Math.max(1, Math.ceil(filteredInAction.value.length / inActionPerPage)))
const paginatedInAction = computed(() => {
  const start = (inActionPage.value - 1) * inActionPerPage
  return filteredInAction.value.slice(start, start + inActionPerPage)
})
const inActionStart = computed(() => filteredInAction.value.length === 0 ? 0 : (inActionPage.value - 1) * inActionPerPage + 1)
const inActionEnd = computed(() => Math.min(inActionPage.value * inActionPerPage, filteredInAction.value.length))


// --- Archived PVCs State ---
const archivedSearch = ref('')
const archivedPage = ref(1)
const archivedPerPage = 3

const rawArchived = [
  { archivedPath: '/archive/ozone-backup', services: [sSpark, sTrino], date: '4/25/24', canReinstall: false },
  { archivedPath: '/archive/airflow-logs', services: [sKafka], date: '4/25/24', canReinstall: true },
  { archivedPath: '/archive/metastore-backup', services: [sHive], date: '4/25/24', canReinstall: true },
]

const filteredArchived = computed(() => {
  let res = rawArchived
  // local filter (Advanced search for archived table)
  if (archivedSearch.value) {
    const q = archivedSearch.value.toLowerCase()
    res = res.filter(v => 
      v.archivedPath.toLowerCase().includes(q) ||
      v.services.some(s => s.name.toLowerCase().includes(q))
    )
  }
  return res
})

const archivedTotalPages = computed(() => Math.max(1, Math.ceil(filteredArchived.value.length / archivedPerPage)))
const paginatedArchived = computed(() => {
  const start = (archivedPage.value - 1) * archivedPerPage
  return filteredArchived.value.slice(start, start + archivedPerPage)
})
const archivedStart = computed(() => filteredArchived.value.length === 0 ? 0 : (archivedPage.value - 1) * archivedPerPage + 1)
const archivedEnd = computed(() => Math.min(archivedPage.value * archivedPerPage, filteredArchived.value.length))
</script>
