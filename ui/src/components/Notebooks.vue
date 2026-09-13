<template>
  <div class="flex flex-col h-full bg-[#f2f5f9]">
    <main class="flex-1 overflow-y-auto w-full p-6 space-y-6">
      <div class="flex items-center gap-2 font-semibold text-slate-700 mb-2 text-[13px] tracking-tight">
        <BookOpen class="w-4 h-4 text-slate-800" />
        Notebook Environments
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <!-- Apache Zeppelin Card -->
        <div class="bg-[#f8fafc] rounded-lg border border-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_6px_-2px_rgba(0,0,0,0.05),0_8px_12px_-3px_rgba(0,0,0,0.03)] flex flex-col items-center p-8 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_8px_12px_-3px_rgba(60,120,216,0.15)] transition-all duration-300">
          <!-- Background decoration -->
          <div class="absolute -left-12 -bottom-12 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
          
          <div class="mb-5 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-center w-20 h-20">
            <ServiceIcon name="Zeppelin" class="w-14 h-14" />
          </div>
          
          <h3 class="text-[17px] font-bold text-slate-800 tracking-tight mb-2">Apache Zeppelin</h3>
          <p class="text-slate-500 text-[13px] text-center mb-8 px-4 h-10 leading-snug max-w-[280px]">Web-based notebook that enables data-driven, interactive enterprise analytics.</p>
          
          <div class="flex items-center gap-3 w-full max-w-[240px]">
            <button class="flex-1 py-2 bg-[#608b68] hover:bg-green-600 active:bg-green-700 text-white rounded shadow-sm transition-colors text-[13px] font-semibold border border-green-700">
              Start
            </button>
            <button class="flex-1 py-2 bg-slate-100/50 hover:bg-slate-200 text-slate-400 cursor-not-allowed rounded text-[13px] font-semibold border border-slate-200">
              Stop
            </button>
          </div>
          <div class="mt-5"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 shadow-inner"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Offline</span></div>
        </div>

        <!-- Jupyter Card -->
        <div class="bg-[#f8fafc] rounded-lg border border-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_6px_-2px_rgba(0,0,0,0.05),0_8px_12px_-3px_rgba(0,0,0,0.03)] flex flex-col items-center p-8 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_8px_12px_-3px_rgba(60,120,216,0.15)] transition-all duration-300">
          <!-- Background decoration -->
          <div class="absolute -right-12 -bottom-12 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors pointer-events-none"></div>

          <div class="mb-5 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-center w-20 h-20">
            <ServiceIcon name="JupyterLab" class="w-14 h-14" />
          </div>

          <h3 class="text-[17px] font-bold text-slate-800 tracking-tight mb-2">JupyterLab</h3>
          <p class="text-slate-500 text-[13px] text-center mb-8 px-4 h-10 leading-snug max-w-[280px]">Interactive computational environment for Python pipelines, notebooks, and data workflows.</p>

          <div class="flex items-center gap-3 w-full max-w-[240px]">
            <button class="flex-1 py-2 bg-slate-100/50 hover:bg-slate-200 text-slate-400 cursor-not-allowed rounded text-[13px] font-semibold border border-slate-200">
              Start
            </button>
            <button class="flex-1 py-2 bg-[#d85858] hover:bg-red-600 active:bg-red-700 text-white rounded shadow-sm transition-colors text-[13px] font-semibold border border-red-700">
              Stop
            </button>
          </div>
          <!-- One online for contrast -->
          <div class="mt-5"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 shadow-inner"><span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Running</span></div>
        </div>
        
      </div>
    </main>
  </div>
</template>

<script setup>
import { BookOpen } from 'lucide-vue-next'
import ServiceIcon from './common/ServiceIcon.vue'
</script>
