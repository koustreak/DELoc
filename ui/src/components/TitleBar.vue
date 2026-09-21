<template>
  <div class="titlebar" :class="{ maximized: isMaximized }">
    <!-- Drag region -->
    <div class="titlebar-drag" @dblclick="toggleMaximise">
      <img src="/deloc-navbar-logo.png" alt="DELoc" class="titlebar-logo" />
      <span class="titlebar-title">DELoc</span>
    </div>

    <!-- Window Controls -->
    <div class="titlebar-controls flex items-center">
      <button class="flex items-center justify-center w-10 h-10 px-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors" title="Notifications">
        <Bell class="w-4 h-4" />
      </button>

      <!-- Settings Dropdown Container -->
      <div class="relative flex items-center h-full">
        <!-- Dark overlay to catch outside clicks and close popover -->
        <div v-if="showSettingsMenu" @click="showSettingsMenu = false" class="fixed inset-0 z-[90] cursor-default bg-transparent"></div>

        <button @click="showSettingsMenu = !showSettingsMenu" class="relative z-[95] flex items-center justify-center w-10 h-10 px-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors" :class="{ 'bg-white/10 text-white': showSettingsMenu }" title="Settings">
          <Settings class="w-4 h-4" />
        </button>

        <!-- The Settings Menu -->
        <div v-if="showSettingsMenu" class="absolute top-[40px] right-0 w-80 bg-white rounded-bl-md rounded-br-md shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] border border-slate-200 z-[100] text-slate-800 overflow-hidden flex flex-col font-sans cursor-default">
          
          <!-- System Configuration JSONs -->
          <div class="p-3 border-b border-slate-100 bg-slate-50/80">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Config</span>
              <span class="text-[9px] font-mono bg-blue-50 text-blue-600 border border-blue-200/60 px-1.5 py-0.5 rounded">config/*.json</span>
            </div>
            <button
              @click="openConfigEditor"
              class="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded text-xs font-medium text-slate-700 hover:text-blue-600 transition-colors shadow-sm group cursor-pointer"
            >
              <div class="flex items-center gap-2">
                <FileCode class="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                <span>Manage JSON Configs</span>
              </div>
              <ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>

          <!-- Networking -->
          <div class="p-3.5 border-b border-slate-100 flex flex-col gap-2">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data & Networking</span>
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] text-slate-600 font-medium">Archive Target Path</label>
              <input type="text" value="/home/DELoc/archives" class="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              
              <label class="text-[11px] text-slate-600 font-medium mt-1">HTTP Proxy</label>
              <input type="text" placeholder="http://proxy.corp.com:8080" class="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
          </div>

          <!-- Version & Author Details -->
          <div class="p-3.5 flex flex-col gap-2 bg-slate-50/70 border-t border-slate-100">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">About & Version Details</span>
            
            <div class="flex flex-col gap-1.5 text-xs">
              <div class="flex items-center justify-between py-1.5 px-2.5 rounded bg-white border border-slate-200/80 shadow-xs">
                <span class="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <Tag class="w-3.5 h-3.5 text-blue-500" /> Version
                </span>
                <span class="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">v1.0.0</span>
              </div>

              <div class="flex items-center justify-between py-1.5 px-2.5 rounded bg-white border border-slate-200/80 shadow-xs">
                <span class="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-blue-500" /> Developer
                </span>
                <span class="text-[11px] font-medium text-slate-700">Koushik (Bhootnath)</span>
              </div>

              <div class="flex items-center justify-between py-1.5 px-2.5 rounded bg-white border border-slate-200/80 shadow-xs">
                <span class="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <Mail class="w-3.5 h-3.5 text-blue-500" /> Author Email
                </span>
                <div class="flex items-center gap-1.5">
                  <a
                    href="mailto:koushik.dutta.py@protonmail.com"
                    class="font-mono text-[10.5px] text-blue-600 hover:text-blue-700 hover:underline select-all"
                  >
                    koushik.dutta.py@protonmail.com
                  </a>
                  <button
                    @click="copyEmail"
                    class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    :title="emailCopied ? 'Copied!' : 'Copy email'"
                  >
                    <Check v-if="emailCopied" class="w-3 h-3 text-emerald-600" />
                    <Copy v-else class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button class="ctrl-btn minimize ml-2" @click="minimise" title="Minimize">
        <svg width="10" height="2" viewBox="0 0 10 2"><rect width="10" height="2" fill="currentColor"/></svg>
      </button>

      <!-- Button 1: Maximize Window (Keeps Taskbar & Panels) -->
      <button class="ctrl-btn maximise" @click="toggleMaximise" :title="isMaximized ? 'Restore Window' : 'Maximize Window'">
        <svg v-if="!isMaximized" width="10" height="10" viewBox="0 0 10 10">
          <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" stroke-width="1.2" fill="none"/>
        </svg>
        <svg v-else width="10" height="10" viewBox="0 0 10 10">
          <rect x="2" y="0" width="8" height="8" stroke="currentColor" stroke-width="1.2" fill="none"/>
          <rect x="0" y="2" width="8" height="8" stroke="currentColor" stroke-width="1.2" fill="none" style="fill: var(--titlebar-bg)"/>
        </svg>
      </button>

      <!-- Button 2: Maximize Fullscreen (Full 24-inch Display Expansion) -->
      <button class="ctrl-btn fullscreen" @click="toggleFullscreen" :title="isFullscreen ? 'Exit Fullscreen' : 'Maximize Fullscreen'">
        <svg v-if="!isFullscreen" width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
        </svg>
        <svg v-else width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 1 0v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
        </svg>
      </button>

      <button class="ctrl-btn close" @click="quit" title="Close">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" stroke-width="1.5"/>
          <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
    </div>

    <!-- Configuration Editor Modal -->
    <ConfigEditorModal :is-open="showConfigEditor" @close="showConfigEditor = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Settings,
  Bell,
  Sun,
  Moon,
  Monitor,
  FileCode,
  ChevronRight,
  Tag,
  User,
  Mail,
  Copy,
  Check
} from 'lucide-vue-next'
import ConfigEditorModal from './ConfigEditorModal.vue'
import {
  WindowMinimise,
  WindowToggleMaximise,
  WindowIsMaximised,
  WindowFullscreen,
  WindowUnfullscreen,
  WindowIsFullscreen,
  Quit
} from '../../wailsjs/runtime/runtime.js'

const isMaximized = ref(false)
const isFullscreen = ref(false)
const showSettingsMenu = ref(false)
const showConfigEditor = ref(false)
const currentTheme = ref('light')
const emailCopied = ref(false)

function copyEmail() {
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText('koushik.dutta.py@protonmail.com')
  }
  emailCopied.value = true
  setTimeout(() => {
    emailCopied.value = false
  }, 2000)
}

function openConfigEditor() {
  showSettingsMenu.value = false
  showConfigEditor.value = true
}

function setTheme(theme) {
  currentTheme.value = theme
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function minimise() {
  WindowMinimise()
}

async function checkWindowState() {
  try {
    isMaximized.value = await WindowIsMaximised()
    isFullscreen.value = await WindowIsFullscreen()
  } catch (e) {
    // ignore
  }
}

async function toggleMaximise() {
  try {
    if (isFullscreen.value) {
      WindowUnfullscreen()
      isFullscreen.value = false
    }
    WindowToggleMaximise()
    setTimeout(checkWindowState, 150)
  } catch (err) {
    console.error('Maximize toggle error:', err)
  }
}

async function toggleFullscreen() {
  try {
    const full = await WindowIsFullscreen()
    if (full || isFullscreen.value) {
      WindowUnfullscreen()
      isFullscreen.value = false
    } else {
      WindowFullscreen()
      isFullscreen.value = true
    }
    setTimeout(checkWindowState, 150)
  } catch (err) {
    console.error('Fullscreen toggle error:', err)
  }
}

function quit() {
  Quit()
}

onMounted(() => {
  checkWindowState()
  window.addEventListener('resize', checkWindowState)
})
</script>

<style scoped>
.titlebar {
  --titlebar-bg: #f97316;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  background: var(--titlebar-bg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  user-select: none;
  flex-shrink: 0;
  position: relative;
  z-index: 1000;
}

.titlebar-drag {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 14px;
  flex: 1;
  /* Wails v2 specific dragging property */
  --wails-draggable: drag;
}

.titlebar-logo {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  object-fit: contain;
}

.titlebar-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.3px;
}

.titlebar-controls {
  display: flex;
  align-items: center;
  height: 100%;
  --wails-draggable: no-drag;
}

.ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 40px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
}

.ctrl-btn.close:hover {
  background: #e8112a;
  color: #fff;
}

.ctrl-btn.maximise:hover,
.ctrl-btn.fullscreen:hover {
  background: rgba(255, 165, 0, 0.15);
  color: #ff8c00;
}
</style>
