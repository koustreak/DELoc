<template>
  <div class="flex flex-col h-full bg-slate-50 text-slate-800 text-xs">
    <!-- Main Content Grid -->
    <main class="flex-1 p-4 overflow-y-auto space-y-4">
      
      <!-- Top Stats Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- CPU Usage -->
        <div class="bg-gradient-to-b from-white to-[#f4f6f9] rounded-lg border border-slate-300/70 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_4px_-1px_rgba(0,0,0,0.03),0_4px_6px_-2px_rgba(0,0,0,0.03)] p-3.5 flex flex-col justify-between transition-shadow hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_8px_-2px_rgba(0,0,0,0.05)]">
          <div class="flex items-center gap-2 mb-3 text-slate-700 font-semibold border-b border-slate-100 pb-1.5 text-xs">
            <Activity class="w-4 h-4 text-emerald-500" />
            <h3>CPU Usage</h3>
          </div>
          <div>
            <div class="flex items-end gap-2 mb-1.5">
              <span class="text-2xl font-bold text-slate-800">18<span class="text-lg text-slate-500 font-normal">%</span></span>
              <span class="text-xs font-medium text-emerald-600 mb-1 ml-1">Healthy</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2">
              <div class="bg-emerald-500 h-2 rounded-full" style="width: 18%"></div>
            </div>
          </div>
        </div>

        <!-- Memory Usage -->
        <div class="bg-gradient-to-b from-white to-[#f4f6f9] rounded-lg border border-slate-300/70 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_4px_-1px_rgba(0,0,0,0.03),0_4px_6px_-2px_rgba(0,0,0,0.03)] p-3.5 flex flex-col justify-between transition-shadow hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_8px_-2px_rgba(0,0,0,0.05)]">
          <div class="flex items-center gap-2 mb-3 text-slate-700 font-semibold border-b border-slate-100 pb-1.5 text-xs">
            <Server class="w-4 h-4 text-blue-500" />
            <h3>Memory Usage</h3>
          </div>
          <div>
            <div class="flex items-end gap-2 mb-1.5">
              <span class="text-2xl font-bold text-slate-800">5.4</span>
              <span class="text-base text-slate-400 font-light pb-0.5">/ 16 GB</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full" style="width: 34%"></div>
            </div>
          </div>
        </div>

        <!-- DELoc Containers -->
        <div class="bg-gradient-to-b from-white to-[#f4f6f9] rounded-lg border border-slate-300/70 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_4px_-1px_rgba(0,0,0,0.03),0_4px_6px_-2px_rgba(0,0,0,0.03)] p-3.5 flex flex-col justify-between transition-shadow hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_8px_-2px_rgba(0,0,0,0.05)]">
          <div class="flex items-center gap-2 mb-3 text-slate-700 font-semibold border-b border-slate-100 pb-1.5 text-xs">
            <Box class="w-4 h-4 text-orange-500" />
            <h3>DELoc Containers</h3>
          </div>
          <div>
            <div class="flex items-end gap-2 mt-1">
              <span class="text-2xl font-bold text-slate-800">4</span>
              <span class="text-base text-slate-400 font-light pb-0.5">/ 8</span>
              <span class="text-xs font-medium text-emerald-600 mb-1 ml-1">Running</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Running Services Table -->
      <div class="bg-gradient-to-b from-white to-[#f4f6f9] rounded-lg border border-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_4px_-1px_rgba(0,0,0,0.03),0_4px_6px_-2px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col" style="min-height: 300px;">
        <!-- Table Header with Search & Pagination -->
        <div class="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 font-semibold text-slate-700 text-xs">
            <Layers class="w-4 h-4 text-slate-500" />
            Running Services
          </div>
          <div class="flex items-center gap-3">
            <div class="relative w-52">
              <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input v-model="searchQuery" type="text" placeholder="Search services..." class="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" />
            </div>
            <!-- Pagination Controls -->
            <div class="flex items-center gap-2 border-l border-slate-200 pl-3">
              <span class="text-[10px] text-slate-500 whitespace-nowrap">{{ paginationStart }}–{{ paginationEnd }} of {{ filteredServices.length }}</span>
              <div class="flex items-center gap-0.5">
                <button @click="currentPage--" :disabled="currentPage === 1" :class="['p-1 rounded hover:bg-slate-200 transition-colors text-slate-600', currentPage === 1 ? 'opacity-40 cursor-not-allowed' : '']"><ChevronLeft class="w-3.5 h-3.5" /></button>
                <button @click="currentPage++" :disabled="currentPage >= totalPages" :class="['p-1 rounded hover:bg-slate-200 transition-colors text-slate-600', currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : '']"><ChevronRight class="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
        <!-- Scrollable Table Body -->
        <div class="flex-1 overflow-y-auto overflow-x-auto" style="max-height: 280px;">
          <table class="w-full text-left text-xs whitespace-nowrap">
            <thead class="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium sticky top-0 z-10">
              <tr>
                <th class="px-3 py-2 font-medium">Service Name</th>
                <th class="px-3 py-2 font-medium">Start Date</th>
                <th class="px-3 py-2 font-medium">Current Health</th>
                <th class="px-3 py-2 font-medium">Container Name</th>
                <th class="px-3 py-2 font-medium">Volumes</th>
                <th class="px-3 py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="service in paginatedServices" :key="service.name" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-3 py-2 font-semibold text-slate-800 flex items-center gap-2">
                  <div :class="['w-5 h-5 rounded text-white flex items-center justify-center text-[10px] font-black', service.color]">
                    {{ service.abbr }}
                  </div>
                  {{ service.name }}
                </td>
                <td class="px-3 py-2 text-slate-600">{{ service.startDate }}</td>
                <td class="px-3 py-2">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    <Check class="w-3 h-3"/> {{ service.health }}
                  </span>
                </td>
                <td class="px-3 py-2 text-slate-500 font-mono text-[10px]">{{ service.container }}</td>
                <td class="px-3 py-2 text-slate-500 font-mono text-[10px]">{{ service.volume }}</td>
                <td class="px-3 py-2 text-right">
                  <button class="px-2.5 py-1 bg-red-100 hover:bg-red-500 hover:text-white text-red-700 font-semibold text-[10px] rounded transition-colors">Stop</button>
                </td>
              </tr>
              <tr v-if="paginatedServices.length === 0">
                <td colspan="6" class="px-3 py-6 text-center text-slate-400">No services found.</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- Bottom Tables Div -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        
        <!-- Persistent Volumes -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col" style="min-height: 250px;">
          <!-- Table Header with Search & Pagination -->
          <div class="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 font-semibold text-slate-700 text-xs">
              <HardDrive class="w-4 h-4 text-slate-500" />
              Persistent Volumes
            </div>
            <div class="flex items-center gap-3">
              <div class="relative w-40">
                <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input v-model="volumesSearchQuery" type="text" placeholder="Search..." class="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" />
              </div>
              <div class="flex items-center gap-2 border-l border-slate-200 pl-3">
                <span class="text-[10px] text-slate-500 whitespace-nowrap">{{ volumesPaginationStart }}–{{ volumesPaginationEnd }} of {{ filteredVolumes.length }}</span>
                <div class="flex items-center gap-0.5">
                  <button @click="volumesCurrentPage--" :disabled="volumesCurrentPage === 1" :class="['p-1 rounded hover:bg-slate-200 transition-colors text-slate-600', volumesCurrentPage === 1 ? 'opacity-40 cursor-not-allowed' : '']"><ChevronLeft class="w-3.5 h-3.5" /></button>
                  <button @click="volumesCurrentPage++" :disabled="volumesCurrentPage >= totalVolumesPages" :class="['p-1 rounded hover:bg-slate-200 transition-colors text-slate-600', volumesCurrentPage >= totalVolumesPages ? 'opacity-40 cursor-not-allowed' : '']"><ChevronRight class="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
          <!-- Body -->
          <div class="flex-1 overflow-y-auto overflow-x-auto">
            <table class="w-full text-left text-xs whitespace-nowrap">
               <thead class="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium sticky top-0 z-10">
                 <tr>
                   <th class="px-3 py-2 font-medium">Volume Name</th>
                   <th class="px-3 py-2 font-medium">Assigned To</th>
                   <th class="px-3 py-2 font-medium text-right">Actions</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-slate-100">
                 <tr v-for="volume in paginatedVolumes" :key="volume.name" class="hover:bg-slate-50/50 transition-colors">
                    <td class="px-3 py-2 font-semibold text-slate-800 flex items-center gap-2">
                      <div class="p-1 rounded bg-blue-100 text-blue-700"><HardDrive class="w-3 h-3"/></div>
                      {{ volume.name }}
                    </td>
                    <td class="px-3 py-2 text-slate-500 text-[10px]">{{ volume.assignedTo }}</td>
                    <td class="px-3 py-2 text-right">
                       <button class="px-2 py-1 mx-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-mono border border-slate-200">C</button>
                       <button class="px-2 py-1 mx-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-mono border border-slate-200">↗</button>
                    </td>
                 </tr>
                 <tr v-if="paginatedVolumes.length === 0"><td colspan="3" class="px-3 py-4 text-center text-slate-400">No volumes found.</td></tr>
               </tbody>
            </table>
          </div>

        </div>

        <!-- Running Stacks -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col" style="min-height: 250px;">
          <!-- Table Header with Search & Pagination -->
          <div class="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 font-semibold text-slate-700 text-xs">
              <Database class="w-4 h-4 text-slate-500" />
              Running Stacks
            </div>
            <div class="flex items-center gap-3">
              <div class="relative w-40">
                <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input v-model="stacksSearchQuery" type="text" placeholder="Search..." class="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" />
              </div>
              <div class="flex items-center gap-2 border-l border-slate-200 pl-3">
                <span class="text-[10px] text-slate-500 whitespace-nowrap">{{ stacksPaginationStart }}–{{ stacksPaginationEnd }} of {{ filteredStacks.length }}</span>
                <div class="flex items-center gap-0.5">
                  <button @click="stacksCurrentPage--" :disabled="stacksCurrentPage === 1" :class="['p-1 rounded hover:bg-slate-200 transition-colors text-slate-600', stacksCurrentPage === 1 ? 'opacity-40 cursor-not-allowed' : '']"><ChevronLeft class="w-3.5 h-3.5" /></button>
                  <button @click="stacksCurrentPage++" :disabled="stacksCurrentPage >= totalStacksPages" :class="['p-1 rounded hover:bg-slate-200 transition-colors text-slate-600', stacksCurrentPage >= totalStacksPages ? 'opacity-40 cursor-not-allowed' : '']"><ChevronRight class="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
           <!-- Body -->
          <div class="flex-1 overflow-y-auto overflow-x-auto">
            <table class="w-full text-left text-xs whitespace-nowrap">
               <thead class="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium sticky top-0 z-10">
                 <tr>
                   <th class="px-3 py-2 font-medium">Stack Name</th>
                   <th class="px-3 py-2 font-medium">Status</th>
                   <th class="px-3 py-2 font-medium text-right">Action</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-slate-100">
                 <tr v-for="stack in paginatedStacks" :key="stack.name" class="hover:bg-slate-50/50 transition-colors">
                    <td class="px-3 py-2">
                       <div class="font-semibold text-slate-800">{{ stack.name }}</div>
                       <div class="text-[10px] text-slate-500 mt-0.5">{{ stack.components }}</div>
                    </td>
                    <td class="px-3 py-2">
                      <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white', stack.color]">
                        <Check v-if="stack.status === 'Running'" class="w-3 h-3"/> {{ stack.status }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-right">
                       <button v-if="stack.status === 'Running'" class="px-2.5 py-1 bg-red-100 hover:bg-red-500 hover:text-white text-red-700 font-semibold text-[10px] rounded transition-colors">Stop</button>
                       <button v-else class="px-2.5 py-1 bg-blue-100 hover:bg-blue-500 hover:text-white text-blue-700 font-semibold text-[10px] rounded transition-colors">Start</button>
                    </td>
                 </tr>
                 <tr v-if="paginatedStacks.length === 0"><td colspan="3" class="px-3 py-4 text-center text-slate-400">No stacks found.</td></tr>
               </tbody>
            </table>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Server, Box, Activity, Layers, Check, Search, ChevronLeft, ChevronRight, HardDrive, Database
} from 'lucide-vue-next'

const searchQuery = ref('')
const currentPage = ref(1)
const perPage = 5

const allServices = [
  { name: 'Spark', abbr: '*', color: 'bg-orange-500', startDate: '4/24/24 10:15 AM', health: 'Healthy', container: 'spark-master', volume: '/data/ozone' },
  { name: 'Kafka', abbr: 'K', color: 'bg-slate-800', startDate: '4/24/24 10:15 AM', health: 'Healthy', container: 'kafka-broker', volume: '—' },
  { name: 'Trino', abbr: 'T', color: 'bg-indigo-600', startDate: '4/24/24 10:15 AM', health: 'Healthy', container: 'trino-coordinator', volume: '/data/ozone' },
  { name: 'Airflow', abbr: 'A', color: 'bg-cyan-500', startDate: '4/24/24 10:15 AM', health: 'Healthy', container: 'airflow-scheduler', volume: '/airflow/logs' },
  { name: 'Hadoop', abbr: 'H', color: 'bg-yellow-600', startDate: '4/24/24 10:20 AM', health: 'Healthy', container: 'hadoop-namenode', volume: '/hdfs/data' },
  { name: 'Hive', abbr: 'Hi', color: 'bg-amber-700', startDate: '4/24/24 10:22 AM', health: 'Healthy', container: 'hive-metastore', volume: '/hive/warehouse' },
  { name: 'Ozone', abbr: 'Oz', color: 'bg-teal-600', startDate: '4/24/24 10:25 AM', health: 'Healthy', container: 'ozone-manager', volume: '/ozone/data' },
  { name: 'Zeppelin', abbr: 'Z', color: 'bg-purple-600', startDate: '4/24/24 10:30 AM', health: 'Healthy', container: 'zeppelin-server', volume: '/zeppelin/notebooks' },
]

const filteredServices = computed(() => {
  if (!searchQuery.value) return allServices
  const q = searchQuery.value.toLowerCase()
  return allServices.filter(s => 
    s.name.toLowerCase().includes(q) || 
    s.container.toLowerCase().includes(q) ||
    s.volume.toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredServices.value.length / perPage)))

const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredServices.value.slice(start, start + perPage)
})

const paginationStart = computed(() => filteredServices.value.length === 0 ? 0 : (currentPage.value - 1) * perPage + 1)
const paginationEnd = computed(() => Math.min(currentPage.value * perPage, filteredServices.value.length))

// --- Volumes State ---
const volumesSearchQuery = ref('')
const volumesCurrentPage = ref(1)
const volumesPerPage = 3

const allVolumes = [
  { name: 'Ozone Data', assignedTo: 'Spark, Trino', read: 'C', write: 'W' },
  { name: 'Airflow Logs', assignedTo: 'Apache Airflow', read: 'C', write: 'W' },
  { name: 'Metastore DB', assignedTo: 'Hive Metastore', read: 'C', write: 'W' },
  { name: 'Kafka Data', assignedTo: 'Kafka Broker', read: 'C', write: 'W' },
  { name: 'Zeppelin Notebooks', assignedTo: 'Zeppelin', read: 'C', write: 'W' },
]

const filteredVolumes = computed(() => {
  if (!volumesSearchQuery.value) return allVolumes
  const q = volumesSearchQuery.value.toLowerCase()
  return allVolumes.filter(v => v.name.toLowerCase().includes(q) || v.assignedTo.toLowerCase().includes(q))
})

const totalVolumesPages = computed(() => Math.max(1, Math.ceil(filteredVolumes.value.length / volumesPerPage)))
const paginatedVolumes = computed(() => {
  const start = (volumesCurrentPage.value - 1) * volumesPerPage
  return filteredVolumes.value.slice(start, start + volumesPerPage)
})
const volumesPaginationStart = computed(() => filteredVolumes.value.length === 0 ? 0 : (volumesCurrentPage.value - 1) * volumesPerPage + 1)
const volumesPaginationEnd = computed(() => Math.min(volumesCurrentPage.value * volumesPerPage, filteredVolumes.value.length))

// --- Stacks State ---
const stacksSearchQuery = ref('')
const stacksCurrentPage = ref(1)
const stacksPerPage = 3

const allStacks = [
  { name: 'Lakehouse Stack', components: 'Spark, Kafka, Trino', status: 'Running', color: 'bg-emerald-500' },
  { name: 'Streaming Lab', components: 'Kafka, Airflow', status: 'Running', color: 'bg-emerald-500' },
  { name: 'Hadoop Core', components: 'HDFS, YARN', status: 'Stopped', color: 'bg-slate-400' },
  { name: 'Data Science', components: 'Zeppelin, Spark', status: 'Running', color: 'bg-emerald-500' },
]

const filteredStacks = computed(() => {
  if (!stacksSearchQuery.value) return allStacks
  const q = stacksSearchQuery.value.toLowerCase()
  return allStacks.filter(s => s.name.toLowerCase().includes(q) || s.components.toLowerCase().includes(q))
})

const totalStacksPages = computed(() => Math.max(1, Math.ceil(filteredStacks.value.length / stacksPerPage)))
const paginatedStacks = computed(() => {
  const start = (stacksCurrentPage.value - 1) * stacksPerPage
  return filteredStacks.value.slice(start, start + stacksPerPage)
})
const stacksPaginationStart = computed(() => filteredStacks.value.length === 0 ? 0 : (stacksCurrentPage.value - 1) * stacksPerPage + 1)
const stacksPaginationEnd = computed(() => Math.min(stacksCurrentPage.value * stacksPerPage, filteredStacks.value.length))
</script>
