<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none"
        @click.self="close"
      >
        <div class="bg-[#1e222b] text-slate-200 border border-slate-700/80 rounded-xl shadow-2xl w-[950px] max-w-[95vw] h-[640px] max-h-[92vh] flex flex-col overflow-hidden font-sans">
          
          <!-- Header -->
          <div class="px-5 py-3.5 bg-[#181b22] border-b border-slate-700/80 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <FileCode class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  Configuration Center
                  <span class="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    config/*.json
                  </span>
                </h2>
                <p class="text-[11px] text-slate-400 leading-none mt-0.5">
                  View and manage raw DELoc system, network, and runtime compliance configurations.
                </p>
              </div>
            </div>

            <button
              @click="close"
              class="w-7 h-7 rounded-lg hover:bg-slate-700/60 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close editor"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Main Body: Sidebar + Code Editor -->
          <div class="flex-1 flex overflow-hidden">
            
            <!-- Left Sidebar: File List -->
            <div class="w-56 bg-[#16181f] border-r border-slate-800/80 flex flex-col p-2 space-y-1 overflow-y-auto">
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1.5">
                Managed Files
              </div>
              <button
                v-for="file in configFiles"
                :key="file.name"
                @click="selectFile(file.name)"
                :class="[
                  'w-full flex flex-col text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer group',
                  selectedFile === file.name
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent'
                ]"
              >
                <div class="flex items-center gap-2 font-mono text-[11.5px]">
                  <FileJson class="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  <span class="truncate">{{ file.name }}</span>
                </div>
                <div class="text-[10px] text-slate-400 font-sans font-normal truncate mt-0.5">
                  {{ file.description }}
                </div>
              </button>
            </div>

            <!-- Right Area: Editor -->
            <div class="flex-1 flex flex-col bg-[#1e222b] overflow-hidden">
              
              <!-- Editor Toolbar -->
              <div class="px-4 py-2 bg-[#1b1e26] border-b border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="font-mono text-xs text-blue-400 font-semibold truncate">
                    config/{{ selectedFile }}
                  </span>
                  <!-- Validation status -->
                  <span
                    v-if="jsonError"
                    class="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/40 border border-rose-800/50 px-2 py-0.5 rounded"
                  >
                    <AlertCircle class="w-3 h-3 shrink-0" />
                    <span class="truncate max-w-[280px]">{{ jsonError }}</span>
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded"
                  >
                    <Check class="w-3 h-3" />
                    Valid JSON
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    @click="formatJson"
                    :disabled="!!jsonError"
                    class="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Prettify and auto-indent JSON"
                  >
                    <Code2 class="w-3 h-3" />
                    Format
                  </button>
                  <button
                    @click="reloadCurrentFile"
                    class="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Reload from disk"
                  >
                    <RotateCcw class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="saveCurrentFile"
                    :disabled="!!jsonError || isSaving"
                    class="px-3.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    <Save class="w-3 h-3" />
                    <span>{{ isSaving ? 'Saving...' : 'Save & Apply' }}</span>
                  </button>
                </div>
              </div>

              <!-- Editor Textarea -->
              <div class="flex-1 relative overflow-hidden flex flex-col p-3">
                <textarea
                  v-model="editorContent"
                  @keydown.tab.prevent="handleTab"
                  spellcheck="false"
                  class="w-full h-full bg-[#15171e] text-slate-100 font-mono text-xs p-3.5 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 resize-none leading-relaxed selection:bg-blue-600/40"
                  placeholder="Loading configuration..."
                ></textarea>
              </div>

              <!-- Toast notification -->
              <div
                v-if="saveMessage"
                class="px-4 py-2 bg-emerald-950/80 border-t border-emerald-800 text-emerald-300 text-xs font-medium flex items-center justify-between"
              >
                <div class="flex items-center gap-2">
                  <Check class="w-3.5 h-3.5 text-emerald-400" />
                  <span>{{ saveMessage }}</span>
                </div>
                <button @click="saveMessage = ''" class="text-emerald-400 hover:text-white">
                  <X class="w-3 h-3" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import {
  FileCode, FileJson, X, Check, AlertCircle, Save, Code2, RotateCcw
} from 'lucide-vue-next'
import {
  GetConfigFile, SaveConfigFile, ListConfigFiles
} from '../../wailsjs/go/bindings/Service.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const selectedFile = ref('services.json')
const editorContent = ref('')
const isSaving = ref(false)
const saveMessage = ref('')
const configFiles = ref([
  { name: 'services.json', description: 'Database services & container specifications' },
  { name: 'network.json', description: 'Docker bridge network, subnets, and aliases' },
  { name: 'python.json', description: 'Python virtualenv and package compatibility' },
  { name: 'java.json', description: 'Java OpenJDK runtime and JVM options' },
  { name: 'scala.json', description: 'Scala compiler versions and SBT build tool matrix' },
  { name: 'notebook.json', description: 'JupyterLab and Apache Zeppelin extensions' }
])

// Validate JSON on the fly
const jsonError = computed(() => {
  if (!editorContent.value.trim()) return 'Empty configuration'
  try {
    JSON.parse(editorContent.value)
    return null
  } catch (err) {
    return err.message.replace(/^JSON.parse: /, '')
  }
})

watch(() => props.isOpen, async (opened) => {
  if (opened) {
    await fetchFilesList()
    await loadFile(selectedFile.value)
  }
})

async function fetchFilesList() {
  try {
    if (typeof ListConfigFiles === 'function') {
      const list = await ListConfigFiles()
      if (list && list.length) {
        configFiles.value = list
      }
    }
  } catch (err) {
    console.warn('Could not list config files:', err)
  }
}

async function selectFile(filename) {
  selectedFile.value = filename
  saveMessage.value = ''
  await loadFile(filename)
}

async function loadFile(filename) {
  try {
    if (typeof GetConfigFile === 'function') {
      const content = await GetConfigFile(filename)
      editorContent.value = content || '{}'
    } else {
      editorContent.value = '{\n  "mock": "Web preview"\n}'
    }
  } catch (err) {
    console.error('Failed to load config file:', err)
    editorContent.value = `// Failed to load ${filename}: ${err?.message || err}`
  }
}

async function reloadCurrentFile() {
  saveMessage.value = ''
  await loadFile(selectedFile.value)
}

function formatJson() {
  try {
    const parsed = JSON.parse(editorContent.value)
    editorContent.value = JSON.stringify(parsed, null, 2)
  } catch (err) {
    // ignore if invalid
  }
}

function handleTab(e) {
  const start = e.target.selectionStart
  const end = e.target.selectionEnd
  editorContent.value = editorContent.value.substring(0, start) + '  ' + editorContent.value.substring(end)
  setTimeout(() => {
    e.target.selectionStart = e.target.selectionEnd = start + 2
  }, 0)
}

async function saveCurrentFile() {
  if (jsonError.value) return
  isSaving.value = true
  saveMessage.value = ''
  try {
    if (typeof SaveConfigFile === 'function') {
      await SaveConfigFile(selectedFile.value, editorContent.value)
      saveMessage.value = `Changes saved and applied to config/${selectedFile.value}`
      setTimeout(() => {
        if (saveMessage.value) saveMessage.value = ''
      }, 4000)
    }
  } catch (err) {
    alert(`Failed to save configuration: ${err?.message || err}`)
  } finally {
    isSaving.value = false
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

