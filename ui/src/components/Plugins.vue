<template>
  <div class="flex flex-col h-full bg-[#f2f5f9] overflow-hidden">
    <main class="flex-1 overflow-y-auto w-full p-6 space-y-6">
      <div class="flex items-center gap-2 font-semibold text-slate-700 text-[13px] tracking-tight">
        <Puzzle class="w-4 h-4 text-slate-800" />
        <span>Host Runtimes &amp; Plugins</span>
      </div>

      <!-- Clean Slate Placeholder -->
      <div class="w-full h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-300/80 rounded-xl bg-slate-50/50 p-8 text-center">
        <div class="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 shadow-sm">
          <Puzzle class="w-6 h-6" />
        </div>
        <h3 class="text-sm font-semibold text-slate-800">Clean Slate</h3>
        <p class="text-xs text-slate-500 max-w-sm mt-1">Ready for custom host runtime detection and plugin tiles design.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { Puzzle } from 'lucide-vue-next'
</script>
