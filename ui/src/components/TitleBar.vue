<template>
  <div class="titlebar" :class="{ maximized: isMaximized }">
    <!-- Drag region -->
    <div class="titlebar-drag">
      <img src="/deloc-navbar-logo.png" alt="DELoc" class="titlebar-logo" />
      <span class="titlebar-title">DELoc</span>
    </div>

    <!-- Window Controls -->
    <div class="titlebar-controls">
      <button class="flex items-center justify-center w-10 h-10 px-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors" title="Notifications">
        <Bell class="w-4 h-4" />
      </button>
      <button class="flex items-center justify-center w-10 h-10 px-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors" title="Settings">
        <Settings class="w-4 h-4" />
      </button>
      <button class="ctrl-btn minimize" @click="minimise" title="Minimize">
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
import { Settings, Bell } from 'lucide-vue-next'
import { WindowMinimise, WindowMaximise, WindowUnmaximise, WindowIsMaximised, Quit } from '../../wailsjs/runtime/runtime.js'

const isMaximized = ref(false)

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
  -webkit-app-region: drag;
  /* Makes this area draggable to move the window */
  app-region: drag;
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
  -webkit-app-region: no-drag;
  app-region: no-drag;
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
