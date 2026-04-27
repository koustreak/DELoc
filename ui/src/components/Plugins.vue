<template>
  <div class="flex flex-col h-full bg-[#f2f5f9]">
    <main class="flex-1 overflow-y-auto w-full p-6 space-y-6">
      
      <!-- Java Environment Card -->
      <div class="bg-[#f8fafc] rounded-md border border-slate-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="px-5 py-3.5 bg-[#f8fafc] border-b border-slate-200/80 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
              <path fill="#E76F00" d="M72.2 44.4s-14.8-19.4 6-27.4c0 0 8.7-2.6 5.8 4-4 9-20.2 12.5-11.8 23.4zM54.5 44s-19.6-18.4 6.7-29c0 0 14-8 8.6 1.8-8.1 14.7-28 11.2-15.3 27.2zM39.6 42.6S17 29.8 41.5 12.7c0 0 14.8-12 8.2-1.9-9.8 15.2-31.4 12-10.1 31.8z"/>
              <path fill="#5382A1" d="M21 54.7c-9 2-8 9-8 9s-2.8 13.8 29.8 14.1c0 0 35.8 1 34.3-15.6 0 0 .5-8.5-8.8-9.4h-6v10.5h10.8s-3.7 9.8-31 9c0 0-23.7 1-25.7-10.4H50v-7.2H21z"/>
              <path fill="#5382A1" d="M19.9 66s-8.7 17.5 35 17c0 0 44 .9 42-18h-4.8s-1.4 15.5-35.7 15c0 0-33.5-.8-31.7-14H19.9z"/>
              <path fill="#5382A1" d="M19 75.3s-9.3 19.3 40.5 19.3c0 0 46 .8 43.5-19.5h-4.3s-.5 18-38 17.6c0 0-36.8-1-36.9-17.4h-4.8zM92 48s15.3-.2 15.6 15c0 0 .5 9.8-14 12v4.8s20 .7 18.2-16.6c0 0-1-17.6-19.8-15.2z"/>
            </svg>
            <h3 class="text-[16px] font-semibold text-slate-800 tracking-tight">Java & Scala Environment</h3>
          </div>
          <button class="px-3 py-1.5 bg-[#3c78d8] hover:bg-blue-600 text-white rounded shadow text-[12px] font-medium transition-colors flex items-center gap-1.5 border border-[#2b64c0]">
            <Plus class="w-3.5 h-3.5" /> Install JAR
          </button>
        </div>

        <!-- Body (Split) -->
        <div class="flex flex-col md:flex-row">
          <!-- Left Info Panel -->
          <div class="w-full md:w-[260px] border-r border-slate-200/80 bg-[#fbfcfd] p-5 flex flex-col gap-6 flex-shrink-0">
            <div class="space-y-4 text-[13px] text-slate-700 font-medium">
              <div><span class="text-slate-500 mr-1">Java Version:</span> OpenJDK 11</div>
              <div><span class="text-slate-500 mr-1">Java Path:</span> <br><span class="font-mono text-[11px] text-slate-800">/opt/jdk-11/</span></div>
              <div><span class="text-slate-500 mr-1">Scala Version:</span> 2.12.18</div>
              <div><span class="text-slate-500 mr-1">Scala Path:</span> <br><span class="font-mono text-[11px] text-slate-800">/opt/scala-2.12.18/</span></div>
            </div>
            <button class="w-full px-4 py-2.5 bg-[#3c78d8] hover:bg-blue-600 text-white rounded shadow text-[13px] font-medium transition-colors border border-[#2b64c0] active:scale-95">
              Update Environment
            </button>
          </div>

          <!-- Right Table Panel -->
          <div class="flex-1 flex flex-col min-w-0 bg-white">
            <!-- Table Action Bar -->
            <div class="px-4 py-2 border-b border-slate-200/80">
              <div class="relative w-full max-w-sm">
                <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input v-model="javaSearch" type="text" placeholder="Search JARs..." class="w-full pl-9 pr-4 py-1.5 text-[12px] border border-slate-300 rounded outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400" />
              </div>
            </div>

            <!-- Table content -->
            <div class="flex-1 overflow-y-auto h-[260px]">
              <table class="w-full text-left text-[12px] whitespace-nowrap">
                <thead class="bg-slate-50/50 text-slate-500 border-b border-slate-200 font-medium sticky top-0 z-10">
                  <tr>
                    <th class="px-4 py-1.5">Name</th>
                    <th class="px-4 py-1.5">Path</th>
                    <th class="px-4 py-1.5">Size</th>
                    <th class="px-4 py-1.5">Version</th>
                    <th class="px-4 py-1.5 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="jar in paginatedJava" :key="jar.name" class="hover:bg-slate-50/80 transition-colors">
                    <td class="px-4 py-1.5 font-medium text-slate-700 truncate max-w-[180px]">{{ jar.name }}</td>
                    <td class="px-4 py-1.5 font-mono text-[10px] text-slate-500 truncate max-w-[200px]">{{ jar.path }}</td>
                    <td class="px-4 py-1.5 text-slate-600 text-[11px]">{{ jar.size }}</td>
                    <td class="px-4 py-1.5 text-slate-600 text-[11px]">{{ jar.version }}</td>
                    <td class="px-4 py-1.5 flex justify-center">
                      <button class="p-1 px-1.5 bg-[#d85858] hover:bg-red-600 text-white rounded shadow-sm border border-red-700 transition-colors">
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="paginatedJava.length === 0"><td colspan="5" class="py-8 text-center text-slate-400">No JARs found.</td></tr>
                </tbody>
              </table>
            </div>

            <!-- Table Footer Pagination -->
            <div class="px-4 py-2 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-600">
              <span>Showing {{ javaStart }} to {{ javaEnd }} of {{ filteredJava.length }} JARs</span>
              <div class="flex items-center gap-1 font-medium select-none">
                 <button @click="javaPage--" :disabled="javaPage === 1" class="hidden md:flex px-2 py-1.5 items-center gap-1 hover:text-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
                 <button @click="javaPage--" :disabled="javaPage === 1" :class="['p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 transition-colors', javaPage===1?'opacity-50 cursor-not-allowed':'']"><ChevronLeft class="w-3.5 h-3.5 text-slate-600"/></button>
                 <button 
                   v-for="p in javaTotalPages" 
                   :key="p" 
                   @click="javaPage = p"
                   :class="[
                     'px-2.5 py-1 rounded transition-colors hidden sm:inline',
                     javaPage === p ? 'bg-[#3c78d8] text-white shadow-sm border border-[#2b64c0]' : 'text-slate-500 hover:bg-slate-200'
                   ]">
                   {{ p }}
                 </button>                 <button @click="javaPage++" :disabled="javaPage >= javaTotalPages" :class="['flex items-center gap-1 px-3 py-1.5 rounded border border-[#2b64c0] bg-[#3c78d8] hover:bg-blue-600 text-white shadow-sm transition-colors ml-1', javaPage>=javaTotalPages?'opacity-80 cursor-not-allowed':'']">Next <ChevronRight class="w-3.5 h-3.5"/></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Python Environment Card -->
      <div class="bg-[#f8fafc] rounded-md border border-slate-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="px-5 py-3 bg-[#f8fafc] border-b border-slate-200/80 flex items-center justify-between">
          <div class="flex items-center gap-3">
             <svg class="w-6 h-6" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
              <path fill="#3776AB" d="M64 6c-29.2 0-27.7 12.6-27.7 12.6l.2 13h27.9v4h-39s-14-1.5-14 19.3c0 21 12 19.9 12 19.9h8.8v-12.4s-.3-14.7 14.3-14.7h19.5s12.5.3 12.5-12.1V20s1.6-14-14.5-14zM47.7 14.1c2.4 0 4.4 2 4.4 4.5 0 2.4-2 4.4-4.4 4.4-2.5 0-4.5-2-4.5-4.4 0-2.5 2-4.5 4.5-4.5z"/>
              <path fill="#FFD43B" d="M64 122c29.2 0 27.7-12.6 27.7-12.6l-.2-13H63.6v-4h39s14 1.5 14-19.3c0-21-12-19.9-12-19.9h-8.8v12.4s.3 14.7-14.3 14.7H62s-12.5-.3-12.5 12.1v15.6s-1.6 14 14.5 14zm16.3-8.1c-2.4 0-4.4-2-4.4-4.5 0-2.4 2-4.4 4.4-4.4 2.5 0 4.5 2 4.5 4.4 0 2.5-2 4.5-4.5 4.5z"/>
            </svg>
            <h3 class="text-[16px] font-semibold text-slate-800 tracking-tight">Python Environment</h3>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 bg-[#3c78d8] hover:bg-blue-600 text-white rounded shadow text-[12px] font-medium transition-colors flex items-center gap-1.5 border border-[#2b64c0]">
              <Plus class="w-3.5 h-3.5" /> Pip Install
            </button>
          </div>
        </div>

        <!-- Body (Split) -->
        <div class="flex flex-col md:flex-row">
          <!-- Left Info Panel -->
          <div class="w-full md:w-[260px] border-r border-slate-200/80 bg-[#fbfcfd] p-5 flex flex-col gap-6 flex-shrink-0">
            <div class="space-y-4 text-[13px] text-slate-700 font-medium">
              <div><span class="text-slate-500 mr-1">Env Name:</span> DELoc</div>
              <div><span class="text-slate-500 mr-1">Version:</span> Python 3.9</div>
              <div><span class="text-slate-500 mr-1">Environment Path:</span> <br><code class="text-[11px] text-slate-800 bg-slate-200/50 px-1 py-0.5 rounded">/opt/my_env/</code></div>
            </div>
            <button class="w-full px-4 py-2.5 bg-[#3c78d8] hover:bg-blue-600 text-white rounded shadow text-[13px] font-medium transition-colors border border-[#2b64c0] active:scale-95">
              Update Environment
            </button>
          </div>

          <!-- Right Table Panel -->
          <div class="flex-1 flex flex-col min-w-0 bg-white">
            <!-- Table Action Bar -->
            <div class="px-4 py-2 border-b border-slate-200/80">
              <div class="relative w-full max-w-sm">
                <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input v-model="pythonSearch" type="text" placeholder="Search packages..." class="w-full pl-9 pr-4 py-1.5 text-[12px] border border-slate-300 rounded outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400" />
              </div>
            </div>

            <!-- Table content -->
            <div class="flex-1 overflow-y-auto h-[260px]">
              <table class="w-full text-left text-[12px] whitespace-nowrap">
                <thead class="bg-slate-50/50 text-slate-500 border-b border-slate-200 font-medium sticky top-0 z-10">
                  <tr>
                    <th class="px-4 py-1.5 w-1/2">Name</th>
                    <th class="px-4 py-1.5">Size</th>
                    <th class="px-4 py-1.5">Version</th>
                    <th class="px-4 py-1.5 text-center w-20">Delete</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="pkg in paginatedPython" :key="pkg.name" class="hover:bg-slate-50/80 transition-colors">
                    <td class="px-4 py-1.5 font-medium text-slate-700 truncate max-w-[300px]">{{ pkg.name }}</td>
                    <td class="px-4 py-1.5 text-slate-600 text-[11px]">{{ pkg.size }}</td>
                    <td class="px-4 py-1.5 text-slate-600 text-[11px]">{{ pkg.version }}</td>
                    <td class="px-4 py-1.5">
                      <div class="flex items-center justify-center">
                         <button class="p-1 px-1.5 bg-[#d85858] hover:bg-red-600 text-white rounded shadow-sm border border-red-700 transition-colors"><Trash2 class="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="paginatedPython.length === 0"><td colspan="4" class="py-8 text-center text-slate-400">No packages found.</td></tr>
                </tbody>
              </table>
            </div>

            <!-- Table Footer Pagination -->
            <div class="px-4 py-2 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-600">
              <span>Showing {{ pythonStart }} to {{ pythonEnd }} of {{ filteredPython.length }} packages</span>
              <div class="flex items-center gap-1 font-medium select-none">
                 <button @click="pythonPage--" :disabled="pythonPage === 1" class="hidden md:flex px-2 py-1.5 items-center gap-1 hover:text-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
                 <button @click="pythonPage--" :disabled="pythonPage === 1" :class="['p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 transition-colors', pythonPage===1?'opacity-50 cursor-not-allowed':'']"><ChevronLeft class="w-3.5 h-3.5 text-slate-600"/></button>
                 <button 
                   v-for="p in pythonTotalPages" 
                   :key="p" 
                   @click="pythonPage = p"
                   :class="[
                     'px-2.5 py-1 rounded transition-colors hidden sm:inline',
                     pythonPage === p ? 'bg-[#3c78d8] text-white shadow-sm border border-[#2b64c0]' : 'text-slate-500 hover:bg-slate-200'
                   ]">
                   {{ p }}
                 </button>                 <button @click="pythonPage++" :disabled="pythonPage >= pythonTotalPages" :class="['flex items-center gap-1 px-3 py-1.5 rounded border border-[#2b64c0] bg-[#3c78d8] hover:bg-blue-600 text-white shadow-sm transition-colors ml-1', pythonPage>=pythonTotalPages?'opacity-80 cursor-not-allowed':'']">Next <ChevronRight class="w-3.5 h-3.5"/></button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Puzzle, Coffee, Plus, Search, Trash2, ChevronLeft, ChevronRight, ChevronDown, Folder
} from 'lucide-vue-next'

// --- Java Logic ---
const javaSearch = ref('')
const javaPage = ref(1)
const javaPerPage = 5

const rawJava = [
  { name: 'spark-3.2.2.jar', path: '/opt/jdk-11/jars/', size: '0 Bytes', version: '3.2.2' },
  { name: 'kafka-clients-3.3.2.jar', path: '/opt/jdk-11/jars/', size: '3.1 MB', version: '3.3.2' },
  { name: 'hadoop-common-3.2.2.jar', path: '/opt/jdk-11/jars/', size: '4.2 MB', version: '3.2.2' },
  { name: 'hbase-common-3.2.0.jar', path: '671 KB', size: '-', version: '3.2.0' },
  { name: 'flink-core-1.14.5.jar', path: '4.5 MB', size: '-', version: '1.14.5' },
  { name: 'avro-1.11.0.jar', path: '2.7 MB', size: '-', version: '1.11.0' },
  { name: 'log4j-1.2-api-2.17.1.jar', path: '295 KB', size: '-', version: '2.17.1' },
  { name: 'joda-time-2.10.14.jar', path: '632 KB', size: '-', version: '2.10.14' },
  { name: 'jackson-databind-2.13.4.jar', path: '1.7 MB', size: '-', version: '2.13.4' },
  { name: 'jcommander-1.82.jar', path: '101 KB', size: '-', version: '1.82' },
]

const filteredJava = computed(() => {
  if (!javaSearch.value) return rawJava
  const q = javaSearch.value.toLowerCase()
  return rawJava.filter(j => j.name.toLowerCase().includes(q))
})

const javaTotalPages = computed(() => Math.max(1, Math.ceil(filteredJava.value.length / javaPerPage)))
const paginatedJava = computed(() => {
  const start = (javaPage.value - 1) * javaPerPage
  return filteredJava.value.slice(start, start + javaPerPage)
})
const javaStart = computed(() => filteredJava.value.length === 0 ? 0 : (javaPage.value - 1) * javaPerPage + 1)
const javaEnd = computed(() => Math.min(javaPage.value * javaPerPage, filteredJava.value.length))


// --- Python Logic ---
const pythonSearch = ref('')
const pythonPage = ref(1)
const pythonPerPage = 5

const rawPython = [
  { name: 'numpy', size: '74.2 MB', version: '1.21.6' },
  { name: '/opt/my_env/lib/python3.9/site-packages/', size: '50.3 MB', version: '1.3.5' },
  { name: '/opt/my_env/lib/python3.9/site-packages/', size: '4.5 MB', version: '1.26.157' },
  { name: '/opt/my_env/lib/python3.9/site-packages/', size: '14.4 MB', version: '0.24.2' },
  { name: '/opt/my_env/lib/python3.9/site-packages/', size: '107.9 MB', version: '1.7.3' },
  { name: '/opt/my_env/lib/python3.9/site-packages/', size: '18.4 MB', version: '1.4.43' },
  { name: '/opt/my_env/lib/python3.9/site-packages/', size: '1 MB', version: '6.8.6' },
  { name: '/opt/my_env/lib/python3.9/site-packages/', size: '1.0B', version: '1.4.47' },
  { name: '/opt/my_env/lib/python3.9/site-packages/', size: '166 KB', version: '2.3.3' },
  { name: '/opt/my_env/lib/python3.9/site-packages/', size: '024.52', version: '1.26.157' },
]

const filteredPython = computed(() => {
  if (!pythonSearch.value) return rawPython
  const q = pythonSearch.value.toLowerCase()
  return rawPython.filter(p => p.name.toLowerCase().includes(q))
})

const pythonTotalPages = computed(() => Math.max(1, Math.ceil(filteredPython.value.length / pythonPerPage)))
const paginatedPython = computed(() => {
  const start = (pythonPage.value - 1) * pythonPerPage
  return filteredPython.value.slice(start, start + pythonPerPage)
})
const pythonStart = computed(() => filteredPython.value.length === 0 ? 0 : (pythonPage.value - 1) * pythonPerPage + 1)
const pythonEnd = computed(() => Math.min(pythonPage.value * pythonPerPage, filteredPython.value.length))
</script>
