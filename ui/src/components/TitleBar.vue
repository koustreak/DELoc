<template>
  <div class="titlebar" :class="{ maximized: isMaximized }">
    <!-- Drag region -->
    <div class="titlebar-drag">
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

          <!-- Extensions -->
          <div class="p-3.5 flex flex-col gap-2 bg-slate-50/50">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Extension Paths</span>
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] text-slate-600 font-medium">Java Home</label>
              <input type="text" value="/opt/jdk-11/" class="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono text-slate-600 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              
              <label class="text-[11px] text-slate-600 font-medium mt-1">Python Base</label>
              <input type="text" value="/opt/my_env/" class="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono text-slate-600 outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
          </div>
        </div>
      </div>

      <button class="ctrl-btn minimize ml-2" @click="minimise" title="Minimize">
        <svg width="10" height="2" viewBox="0 0 10 2"><rect width="10" height="2" fill="currentColor"/></svg>
      </button>
      <button class="ctrl-btn maximise" @click="toggleMaximise" :title="isMaximized ? 'Restore' : 'Maximize'">
        <svg v-if="!isMaximized" width="10" height="10" viewBox="0 0 10 10">
          <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" stroke-width="1.2" fill="none"/>
        </svg>
        <svg v-else width="10" height="10" viewBox="0 0 10 10">
          <rect x="2" y="0" width="8" height="8" stroke="currentColor" stroke-width="1.2" fill="none"/>
          <rect x="0" y="2" width="8" height="8" stroke="currentColor" stroke-width="1.2" fill="none" style="fill: var(--titlebar-bg)"/>
        </svg>
      </button>
      <button class="ctrl-btn close" @click="quit" title="Close">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" stroke-width="1.5"/>
          <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Settings, Bell, Sun, Moon, Monitor } from 'lucide-vue-next'
import { WindowMinimise, WindowMaximise, WindowUnmaximise, WindowIsMaximised, Quit } from '../../wailsjs/runtime/runtime.js'

const isMaximized = ref(false)
const showSettingsMenu = ref(false)
const currentTheme = ref('light')

function setTheme(theme) {
  currentTheme.value = theme
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

async function checkMaximized() {
  isMaximized.value = await WindowIsMaximised()
}

function minimise() {
  WindowMinimise()
}

async function toggleMaximise() {
  if (isMaximized.value) {
    await WindowUnmaximise()
  } else {
    await WindowMaximise()
  }
  isMaximized.value = !isMaximized.value
}

function quit() {
  Quit()
}

onMounted(() => {
  checkMaximized()
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

.ctrl-btn.maximise:hover {
  background: rgba(255, 165, 0, 0.15);
  color: #ff8c00;
}
</style>
