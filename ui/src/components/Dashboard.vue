<template>
  <div class="flex flex-col h-full bg-slate-50 text-slate-800">
    <!-- Main Content Grid -->
    <main class="flex-1 p-6 overflow-y-auto space-y-6">
      
      <!-- Top Stats Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- CPU Usage -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div class="flex items-center gap-2 mb-4 text-slate-700 font-semibold border-b border-slate-100 pb-2">
            <Activity class="w-5 h-5 text-emerald-500" />
            <h3>CPU Usage</h3>
          </div>
          <div>
            <div class="flex items-end gap-2 mb-2">
              <span class="text-4xl font-bold text-slate-800">18<span class="text-2xl text-slate-500 font-normal">%</span></span>
              <span class="text-sm font-medium text-emerald-600 mb-2 ml-1">Healthy</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2.5">
              <div class="bg-emerald-500 h-2.5 rounded-full" style="width: 18%"></div>
            </div>
          </div>
        </div>

        <!-- Memory Usage -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div class="flex items-center gap-2 mb-4 text-slate-700 font-semibold border-b border-slate-100 pb-2">
            <Server class="w-5 h-5 text-blue-500" />
            <h3>Memory Usage</h3>
          </div>
          <div>
            <div class="flex items-end gap-2 mb-2">
              <span class="text-4xl font-bold text-slate-800">5.4</span>
              <span class="text-xl text-slate-400 font-light pb-1">/ 16 GB</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2.5">
              <div class="bg-blue-500 h-2.5 rounded-full" style="width: 34%"></div>
            </div>
          </div>
        </div>

        <!-- DELoc Containers -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div class="flex items-center gap-2 mb-4 text-slate-700 font-semibold border-b border-slate-100 pb-2">
            <Box class="w-5 h-5 text-orange-500" />
            <h3>DELoc Containers</h3>
          </div>
          <div>
            <div class="flex items-end gap-2 mt-2">
              <span class="text-4xl font-bold text-slate-800">4</span>
              <span class="text-xl text-slate-400 font-light pb-1">/ 8</span>
              <span class="text-sm font-medium text-emerald-600 mb-2 ml-1">Running</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Running Services Table -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 font-semibold text-slate-700">
          <Layers class="w-5 h-5 text-slate-500" />
          Running Services
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-white text-slate-500 border-b border-slate-200 font-medium">
              <tr>
                <th class="px-4 py-3 font-medium">Service Name</th>
                <th class="px-4 py-3 font-medium">Start Date</th>
                <th class="px-4 py-3 font-medium">Current Health</th>
                <th class="px-4 py-3 font-medium">Container Name</th>
                <th class="px-4 py-3 font-medium">Volumes</th>
                <th class="px-4 py-3 font-medium text-right">Stack Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="px-4 py-3 font-bold text-slate-800 flex items-center gap-2">
                  <div class="w-6 h-6 bg-orange-500 rounded text-white flex items-center justify-center text-xs font-black">*</div> Spark
                </td>
                <td class="px-4 py-3 text-slate-600">4/24/24 10:15 AM</td>
                <td class="px-4 py-3"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800"><Check class="w-3 h-3"/> Healthy</span></td>
                <td class="px-4 py-3 text-slate-500 font-mono text-xs">spark-master</td>
                <td class="px-4 py-3 text-slate-500 font-mono text-xs">/data/ozone</td>
                <td class="px-4 py-3 text-right">
                  <button class="px-3 py-1.5 bg-red-100 hover:bg-red-500 hover:text-white text-red-700 font-semibold text-xs rounded transition-colors shadow-sm">Stop</button>
                </td>
              </tr>
              <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="px-4 py-3 font-bold text-slate-800 flex items-center gap-2">
                   <div class="w-6 h-6 bg-slate-800 rounded text-white flex items-center justify-center text-xs font-black">K</div> Kafka
                </td>
                <td class="px-4 py-3 text-slate-600">4/24/24 10:15 AM</td>
                <td class="px-4 py-3"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800"><Check class="w-3 h-3"/> Healthy</span></td>
                <td class="px-4 py-3 text-slate-500 font-mono text-xs">kafka-broker</td>
                <td class="px-4 py-3 text-slate-400">—</td>
                <td class="px-4 py-3 text-right">
                  <button class="px-3 py-1.5 bg-red-100 hover:bg-red-500 hover:text-white text-red-700 font-semibold text-xs rounded transition-colors shadow-sm">Stop</button>
                </td>
              </tr>
              <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="px-4 py-3 font-bold text-slate-800 flex items-center gap-2">
                  <div class="w-6 h-6 bg-indigo-600 rounded text-white flex items-center justify-center text-xs font-black">T</div> Trino
                </td>
                <td class="px-4 py-3 text-slate-600">4/24/24 10:15 AM</td>
                <td class="px-4 py-3"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800"><Check class="w-3 h-3"/> Healthy</span></td>
                <td class="px-4 py-3 text-slate-500 font-mono text-xs">trino-coordinator</td>
                <td class="px-4 py-3 text-slate-500 font-mono text-xs">/data/ozone</td>
                <td class="px-4 py-3 text-right">
                  <button class="px-3 py-1.5 bg-red-100 hover:bg-red-500 hover:text-white text-red-700 font-semibold text-xs rounded transition-colors shadow-sm">Stop</button>
                </td>
              </tr>
              <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="px-4 py-3 font-bold text-slate-800 flex items-center gap-2">
                   <div class="w-6 h-6 bg-cyan-500 rounded text-white flex items-center justify-center text-xs font-black">A</div> Airflow
                </td>
                <td class="px-4 py-3 text-slate-600">4/24/24 10:15 AM</td>
                <td class="px-4 py-3"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800"><Check class="w-3 h-3"/> Healthy</span></td>
                <td class="px-4 py-3 text-slate-500 font-mono text-xs">airflow-scheduler</td>
                <td class="px-4 py-3 text-slate-500 font-mono text-xs">/airflow/logs</td>
                <td class="px-4 py-3 text-right">
                  <button class="px-3 py-1.5 bg-red-100 hover:bg-red-500 hover:text-white text-red-700 font-semibold text-xs rounded transition-colors shadow-sm">Stop</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { 
  Server, 
  Box, 
  Activity, 
  ChevronRight, 
  Layers, 
  Check 
} from 'lucide-vue-next'
</script>
