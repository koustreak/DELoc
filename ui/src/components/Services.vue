<template>
  <div class="flex flex-col h-full bg-slate-50/50">
    <main class="flex-1 overflow-y-auto p-6">

      <!-- Header -->
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
        <div
          v-for="service in filteredServices"
          :key="service.name"
          class="bg-[#f8fafc] rounded-md border border-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_6px_-2px_rgba(0,0,0,0.05),0_8px_12px_-3px_rgba(0,0,0,0.03)] flex flex-col p-4 transition-all hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_8px_12px_-3px_rgba(60,120,216,0.15)] group"
        >
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
            <button
              @click="openConfig(service)"
              class="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300/80 text-slate-700 py-1.5 rounded text-[11px] font-semibold shadow-sm transition-all active:scale-95"
            >
              Configure
            </button>
          </div>
        </div>

        <div v-if="filteredServices.length === 0" class="col-span-full py-12 text-center text-slate-400">
          No services match your search query.
        </div>
      </div>
    </main>

    <!-- ── Configure Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showConfigModal"
          class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          @click.self="showConfigModal = false"
        >
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-[520px] max-w-[95vw] flex flex-col overflow-hidden">

            <!-- Modal Header -->
            <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div class="flex items-center gap-2.5">
                <component :is="selectedService.icon" :class="['w-5 h-5', selectedService.color]" />
                <span class="font-semibold text-slate-800 text-sm tracking-tight">Configure — {{ selectedService.name }}</span>
              </div>
              <button @click="showConfigModal = false" class="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded hover:bg-slate-100">
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Body -->
            <div class="px-5 py-4 space-y-4 max-h-[80vh] overflow-y-auto">

              <!-- Docker Image Section -->
              <div class="space-y-3 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
                <div class="flex items-center justify-between">
                  <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Docker Image</label>
                  <span class="text-[10px] text-slate-400 font-mono">Docker Hub registry</span>
                </div>

                <!-- Repository & Tag Pickers -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <!-- Image / Repository Dropdown -->
                  <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Image Repository</label>
                    <select
                      v-model="selectedRepoChoice"
                      @change="onRepoChoiceChange"
                      class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option v-for="repo in selectedService.repos" :key="repo" :value="repo">
                        {{ repo }}
                      </option>
                      <option value="__custom__">Custom Repository...</option>
                    </select>
                  </div>

                  <!-- Tag Dropdown from Docker Hub -->
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="block text-[11px] font-medium text-slate-600">Tag / Version</label>
                      <button
                        type="button"
                        @click="fetchTagsForRepo(activeRepo)"
                        :disabled="isLoadingTags"
                        class="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors disabled:opacity-50"
                        title="Re-fetch tags from Docker Hub"
                      >
                        <RefreshCw :class="['w-2.5 h-2.5', isLoadingTags ? 'animate-spin' : '']" />
                        <span>Refresh</span>
                      </button>
                    </div>

                    <div class="relative">
                      <select
                        v-model="selectedTagChoice"
                        @change="onTagChoiceChange"
                        :disabled="isLoadingTags"
                        class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option v-if="isLoadingTags" value="" disabled>Fetching Docker Hub tags...</option>
                        <option v-else-if="availableTags.length === 0" value="latest">latest (default)</option>
                        <option v-for="tag in availableTags" :key="tag" :value="tag">
                          {{ tag }}
                        </option>
                        <option value="__custom__">Custom tag...</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Custom Repo Input (shown if user selects custom) -->
                <div v-if="selectedRepoChoice === '__custom__'" class="space-y-1 pt-1">
                  <div class="flex items-center gap-2">
                    <input
                      v-model="customRepoInput"
                      @blur="onCustomRepoBlur"
                      @keyup.enter="onCustomRepoBlur"
                      type="text"
                      placeholder="e.g. library/postgres, apache/spark, myorg/repo"
                      class="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      @click="onCustomRepoBlur"
                      class="px-2.5 py-1.5 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-medium transition-colors"
                    >
                      Fetch
                    </button>
                  </div>
                </div>

                <!-- Full Image Path (Free Text) -->
                <div class="space-y-1 pt-1">
                  <label class="block text-[11px] font-medium text-slate-600">Full Image Path (editable)</label>
                  <div class="relative">
                    <input
                      v-model="configForm.fullImage"
                      @input="onFullImageManualInput"
                      type="text"
                      placeholder="e.g. apache/kafka:latest"
                      class="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-medium shadow-inner"
                    />
                  </div>
                  <p v-if="fetchTagError" class="text-[10px] text-amber-600 leading-tight mt-1">
                    Notice: {{ fetchTagError }} You can still type any custom image &amp; tag above.
                  </p>
                  <p v-else class="text-[10px] text-slate-400 leading-tight">
                    Select from the presets or freely type any custom image name and tag.
                  </p>
                </div>
              </div>

              <!-- Dynamic Allotment Toggle -->
              <div class="flex items-center justify-between py-2 px-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div>
                  <div class="text-xs font-semibold text-slate-700">Dynamic Allotment</div>
                  <div class="text-[11px] text-slate-500 mt-0.5">Let DELoc auto-manage CPU &amp; memory based on availability</div>
                </div>
                <!-- Toggle switch -->
                <button
                  @click="configForm.dynamic = !configForm.dynamic"
                  :class="[
                    'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                    configForm.dynamic ? 'bg-blue-500' : 'bg-slate-300'
                  ]"
                >
                  <span
                    :class="[
                      'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200',
                      configForm.dynamic ? 'translate-x-4' : 'translate-x-0'
                    ]"
                  />
                </button>
              </div>

              <!-- CPU & Memory (greyed when dynamic) -->
              <div class="grid grid-cols-2 gap-3">
                <!-- CPU Cores -->
                <div class="space-y-1.5">
                  <label :class="['block text-xs font-semibold uppercase tracking-wide', configForm.dynamic ? 'text-slate-300' : 'text-slate-600']">
                    CPU Cores
                  </label>
                  <input
                    v-model.number="configForm.cpuCores"
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="Auto"
                    :disabled="configForm.dynamic"
                    :class="[
                      'w-full px-3 py-2 text-sm border rounded-md font-mono focus:outline-none transition-all',
                      configForm.dynamic
                        ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed placeholder-slate-300'
                        : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                    ]"
                  />
                </div>

                <!-- Memory -->
                <div class="space-y-1.5">
                  <label :class="['block text-xs font-semibold uppercase tracking-wide', configForm.dynamic ? 'text-slate-300' : 'text-slate-600']">
                    Memory
                  </label>
                  <div class="flex gap-1.5">
                    <input
                      v-model="configForm.memory"
                      type="text"
                      placeholder="Auto"
                      :disabled="configForm.dynamic"
                      :class="[
                        'flex-1 min-w-0 px-3 py-2 text-sm border rounded-md font-mono focus:outline-none transition-all',
                        configForm.dynamic
                          ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed placeholder-slate-300'
                          : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                      ]"
                    />
                    <select
                      v-model="configForm.memoryUnit"
                      :disabled="configForm.dynamic"
                      :class="[
                        'px-2 py-2 text-xs border rounded-md focus:outline-none transition-all',
                        configForm.dynamic
                          ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-white border-slate-200 text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                      ]"
                    >
                      <option>MB</option>
                      <option>GB</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-100">
              <button
                @click="showConfigModal = false"
                class="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="applyConfig"
                class="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
              >
                Apply
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Search, Layers, Play, Database, Server, Hexagon, Component,
  Wind, HardDrive, Zap, Share2, Leaf, Box, Network, X, RefreshCw
} from 'lucide-vue-next'
import { FetchDockerTags } from '../../wailsjs/go/bindings/Service.js'

const searchQuery = ref('')

const servicesList = [
  {
    name: 'HDFS',
    icon: Database,
    color: 'text-yellow-600',
    version: 'v3.3.6',
    defaultTag: '3.3.6',
    description: 'Distributed file system for big data storage.',
    repos: ['apache/hadoop', 'bde2020/hadoop-namenode']
  },
  {
    name: 'Kafka',
    icon: Share2,
    color: 'text-slate-800',
    version: 'v3.6.1',
    defaultTag: '3.6.1',
    description: 'Distributed event streaming platform.',
    repos: ['apache/kafka', 'bitnami/kafka', 'confluentinc/cp-kafka']
  },
  {
    name: 'Airflow',
    icon: Wind,
    color: 'text-cyan-500',
    version: 'v2.8.1',
    defaultTag: '2.8.1',
    description: 'Workflow orchestration tool for data pipelines.',
    repos: ['apache/airflow', 'bitnami/airflow', 'puckel/docker-airflow']
  },
  {
    name: 'Trino',
    icon: Hexagon,
    color: 'text-indigo-600',
    version: 'v440',
    defaultTag: '440',
    description: 'Distributed SQL query engine for big data.',
    repos: ['trinodb/trino']
  },
  {
    name: 'Apache Hive',
    icon: Box,
    color: 'text-amber-500',
    version: 'v4.0.0',
    defaultTag: '4.0.0',
    description: 'Data warehouse software for querying and managing large datasets.',
    repos: ['apache/hive', 'bde2020/hive']
  },
  {
    name: 'Cassandra',
    icon: Server,
    color: 'text-blue-500',
    version: 'v4.1.3',
    defaultTag: '4.1.3',
    description: 'Highly scalable distributed NoSQL database.',
    repos: ['cassandra', 'bitnami/cassandra']
  },
  {
    name: 'Pinot',
    icon: Component,
    color: 'text-rose-600',
    version: 'v1.0.0',
    defaultTag: '1.0.0',
    description: 'Real-time distributed OLAP datastore.',
    repos: ['apachepinot/pinot']
  },
  {
    name: 'Minio',
    icon: HardDrive,
    color: 'text-red-500',
    version: 'RELEASE.2024',
    defaultTag: 'latest',
    description: 'High performance S3 compatible object storage.',
    repos: ['minio/minio', 'bitnami/minio']
  },
  {
    name: 'Spark',
    icon: Zap,
    color: 'text-orange-500',
    version: 'v3.5.0',
    defaultTag: '3.5.0',
    description: 'Unified analytics engine for large-scale data processing.',
    repos: ['apache/spark', 'bitnami/spark']
  },
  {
    name: 'Nifi',
    icon: Network,
    color: 'text-teal-600',
    version: 'v1.25.0',
    defaultTag: '1.25.0',
    description: 'Automates the flow of data between systems.',
    repos: ['apache/nifi']
  },
  {
    name: 'PostgreSQL',
    icon: Database,
    color: 'text-blue-400',
    version: 'v16.2',
    defaultTag: '16.2',
    description: 'Powerful, open source object-relational database.',
    repos: ['postgres', 'bitnami/postgresql']
  },
  {
    name: 'MongoDB',
    icon: Leaf,
    color: 'text-emerald-500',
    version: 'v7.0.5',
    defaultTag: '7.0.5',
    description: 'Document-oriented NoSQL database system.',
    repos: ['mongo', 'bitnami/mongodb']
  },
  {
    name: 'Neo4J',
    icon: Share2,
    color: 'text-cyan-700',
    version: 'v5.17.0',
    defaultTag: '5.17.0',
    description: 'Native graph database designed for connected data.',
    repos: ['neo4j']
  },
]

const filteredServices = computed(() => {
  if (!searchQuery.value) return servicesList
  const q = searchQuery.value.toLowerCase()
  return servicesList.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q)
  )
})

// ── Configure Modal State ──
const showConfigModal = ref(false)
const selectedService = ref(null)

const selectedRepoChoice = ref('')
const customRepoInput = ref('')
const selectedTagChoice = ref('')
const availableTags = ref([])
const isLoadingTags = ref(false)
const fetchTagError = ref('')

const configForm = ref({
  fullImage: '',
  cpuCores: 1,
  memory: '512',
  memoryUnit: 'MB',
  dynamic: false,
})

// Active repository currently selected/targeted
const activeRepo = computed(() => {
  if (selectedRepoChoice.value === '__custom__') {
    return customRepoInput.value.trim() || 'custom-image'
  }
  return selectedRepoChoice.value
})

async function fetchTagsForRepo(repo) {
  if (!repo || repo === '__custom__') return
  isLoadingTags.value = true
  fetchTagError.value = ''
  try {
    let tags = []
    if (typeof FetchDockerTags === 'function') {
      tags = await FetchDockerTags(repo)
    }
    availableTags.value = Array.isArray(tags) ? tags : []

    // If current selected tag is not in fetched tags and not custom, default to first or keep
    if (availableTags.value.length > 0) {
      if (!availableTags.value.includes(selectedTagChoice.value)) {
        selectedTagChoice.value = availableTags.value.includes('latest') ? 'latest' : availableTags.value[0]
      }
    } else {
      if (!selectedTagChoice.value) {
        selectedTagChoice.value = 'latest'
      }
    }
    syncFullImage()
  } catch (err) {
    console.warn('Docker Hub tags fetch failed:', err)
    fetchTagError.value = err?.message || 'Could not reach Docker Hub.'
    if (availableTags.value.length === 0) {
      availableTags.value = ['latest']
      selectedTagChoice.value = 'latest'
    }
    syncFullImage()
  } finally {
    isLoadingTags.value = false
  }
}

function syncFullImage() {
  const repo = activeRepo.value
  const tag = selectedTagChoice.value === '__custom__' ? 'latest' : selectedTagChoice.value
  configForm.value.fullImage = `${repo}:${tag}`
}

function onRepoChoiceChange() {
  if (selectedRepoChoice.value === '__custom__') {
    if (!customRepoInput.value) {
      customRepoInput.value = 'my-repo'
    }
    syncFullImage()
  } else {
    fetchTagsForRepo(selectedRepoChoice.value)
  }
}

function onCustomRepoBlur() {
  const r = customRepoInput.value.trim()
  if (r) {
    fetchTagsForRepo(r)
  }
}

function onTagChoiceChange() {
  if (selectedTagChoice.value !== '__custom__') {
    syncFullImage()
  }
}

function onFullImageManualInput() {
  // If user freely edits the full image text, update choices to custom if they don't match
  const text = configForm.value.fullImage.trim()
  if (text.includes(':')) {
    const [r, t] = text.split(':')
    if (selectedService.value?.repos?.includes(r)) {
      selectedRepoChoice.value = r
    } else {
      selectedRepoChoice.value = '__custom__'
      customRepoInput.value = r
    }
    if (availableTags.value.includes(t)) {
      selectedTagChoice.value = t
    } else {
      selectedTagChoice.value = '__custom__'
    }
  }
}

function openConfig(service) {
  selectedService.value = service
  fetchTagError.value = ''
  availableTags.value = []

  const initialRepo = service.repos?.[0] || service.name.toLowerCase()
  selectedRepoChoice.value = initialRepo
  customRepoInput.value = ''
  selectedTagChoice.value = service.defaultTag || 'latest'

  configForm.value = {
    fullImage: `${initialRepo}:${selectedTagChoice.value}`,
    cpuCores: 1,
    memory: '512',
    memoryUnit: 'MB',
    dynamic: false,
  }

  showConfigModal.value = true
  fetchTagsForRepo(initialRepo)
}

function applyConfig() {
  // Apply the selected configuration
  showConfigModal.value = false
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
