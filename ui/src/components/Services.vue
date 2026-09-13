of <template>
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="service in filteredServices"
          :key="service.name"
          class="bg-[#f8fafc] rounded-md border shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_6px_-2px_rgba(0,0,0,0.05),0_8px_12px_-3px_rgba(0,0,0,0.03)] flex flex-col p-4 transition-all hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_8px_12px_-3px_rgba(60,120,216,0.15)] group"
          :class="service.status === 'Running' ? 'border-emerald-400/80 ring-1 ring-emerald-400/30' : 'border-slate-300'"
        >
          <!-- Logo, Name & Actions -->
          <div class="flex items-start justify-between gap-2 mb-2 pb-2.5 border-b border-slate-200/60">
            <div
              @click="handleDetailsClick(service)"
              class="flex items-center gap-2.5 min-w-0 cursor-pointer group/title hover:opacity-90 transition-opacity"
              title="Click to view details"
            >
              <ServiceIcon :name="service.name" class="w-8 h-8 drop-shadow-sm flex-shrink-0" />
              <div class="min-w-0">
                <h3 class="text-[15px] font-bold text-slate-800 leading-tight truncate group-hover/title:text-blue-600 transition-colors">
                  {{ service.name }}
                </h3>
                <div class="text-[10px] text-slate-400 font-mono font-medium leading-none mt-1">{{ service.version }}</div>
              </div>
            </div>

            <!-- Top Right: Details Action -->
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <button
                @click.stop="handleDetailsClick(service)"
                title="Click for details"
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer select-none',
                  service.status === 'Running'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'
                ]"
              >
                <span
                  v-if="service.status === 'Running'"
                  class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                ></span>
                Details
              </button>
            </div>
          </div>

          <!-- Description -->
          <div class="text-xs text-slate-600 mb-3 leading-normal line-clamp-2 h-8">{{ service.description }}</div>

          <!-- Endpoints & Ports Section -->
          <div class="mb-4 rounded-md border border-slate-200/90 bg-white/90 p-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col gap-1.5">
            <div class="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-slate-400 px-0.5">
              <span>Endpoints &amp; Ports</span>
              <span class="text-[9px] font-mono text-slate-400 font-normal">
                {{ service.endpoints?.length || 0 }} {{ (service.endpoints?.length === 1) ? 'port' : 'ports' }}
              </span>
            </div>

            <div class="space-y-1">
              <div
                v-for="(ep, idx) in service.endpoints"
                :key="idx"
                class="flex items-center justify-between gap-1.5 px-2 py-1 rounded bg-slate-50 hover:bg-slate-100/90 border border-slate-200/60 text-xs transition-colors"
              >
                <!-- Left: Protocol tag + Name -->
                <div class="flex items-center gap-1.5 min-w-0 flex-1">
                  <span
                    :class="[
                      'text-[9px] font-bold uppercase px-1 py-0.5 rounded leading-none tracking-wider font-mono',
                      ep.type === 'http' ? 'bg-blue-100 text-blue-700 border border-blue-200/50' : 'bg-purple-100 text-purple-700 border border-purple-200/50'
                    ]"
                  >
                    {{ ep.type }}
                  </span>
                  <span class="text-[11px] font-medium text-slate-700 truncate" :title="ep.label">
                    {{ ep.label }}
                  </span>
                </div>

                <!-- Right: Port/Host + Actions -->
                <div class="flex items-center gap-1 flex-shrink-0">
                  <span class="font-mono text-[10px] text-slate-500 font-medium">
                    :{{ ep.port }}
                  </span>

                  <!-- Open in browser for HTTP endpoints -->
                  <button
                    v-if="ep.type === 'http'"
                    @click="openEndpoint(ep.url)"
                    class="p-1 rounded hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-colors"
                    :title="'Open ' + ep.url + ' in browser'"
                  >
                    <ExternalLink class="w-3 h-3" />
                  </button>

                  <!-- Copy button -->
                  <button
                    @click="copyEndpoint(ep.url, service.name + '-' + idx)"
                    class="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                    :title="'Copy ' + ep.url"
                  >
                    <Check v-if="copiedKey === (service.name + '-' + idx)" class="w-3 h-3 text-emerald-600" />
                    <Copy v-else class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2 mt-auto">
            <button
              @click="toggleService(service)"
              :class="[
                'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[11px] font-semibold transition-all active:scale-95 shadow-sm',
                service.status === 'Running'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20'
              ]"
            >
              <Square v-if="service.status === 'Running'" class="w-2.5 h-2.5" fill="currentColor" />
              <Play v-else class="w-2.5 h-2.5" fill="currentColor" />
              {{ service.status === 'Running' ? 'Stop' : 'Start' }}
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
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-[620px] max-w-[95vw] flex flex-col overflow-hidden">

            <!-- Modal Header -->
            <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div class="flex items-center gap-2.5">
                <ServiceIcon :name="selectedService.name" class="w-6 h-6 drop-shadow-sm" />
                <span class="font-semibold text-slate-800 text-sm tracking-tight">Configure — {{ selectedService.name }}</span>
              </div>
              <button @click="showConfigModal = false" class="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded hover:bg-slate-100 cursor-pointer">
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Tabs -->
            <div class="flex items-center border-b border-slate-200 bg-slate-50/50 px-5 pt-1.5 gap-2">
              <button
                type="button"
                @click="configTab = 'resources'"
                :class="[
                  'px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5 cursor-pointer',
                  configTab === 'resources'
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                ]"
              >
                <Cpu class="w-3.5 h-3.5" />
                <span>Image &amp; Resources</span>
              </button>

              <button
                type="button"
                @click="configTab = 'tuning'"
                :class="[
                  'px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5 cursor-pointer',
                  configTab === 'tuning'
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                ]"
              >
                <SlidersHorizontal class="w-3.5 h-3.5" />
                <span>Service Tuning</span>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="px-5 py-4 space-y-4 max-h-[75vh] overflow-y-auto">

              <!-- TAB 1: Resources & Docker Image -->
              <div v-if="configTab === 'resources'" class="space-y-4">
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
                          class="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
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
                        class="px-2.5 py-1.5 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-medium transition-colors cursor-pointer"
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

                <!-- Warning when Dynamic Allocation is Disabled -->
                <div v-if="!configForm.dynamic" class="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200/80 rounded-lg text-amber-900 text-xs transition-all">
                  <CircleAlert class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div class="space-y-0.5">
                    <span class="font-semibold text-amber-900">Manual Resource Allocation Active</span>
                    <p class="text-[11px] text-amber-700 leading-normal">
                      Dynamic auto-scaling is turned off. Setting fixed CPU or memory limits too low can trigger container crashes (OOM kills), while setting them too high may impact system performance.
                    </p>
                  </div>
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

                <!-- Container Allocation Breakdown -->
                <div class="space-y-2 pt-1">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      <Layers class="w-3.5 h-3.5 text-blue-500" />
                      <span>Container Allocation Breakdown</span>
                    </div>
                    <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
                      {{ containerResourceBreakdown.length }} {{ containerResourceBreakdown.length === 1 ? 'Container' : 'Containers' }}
                    </span>
                  </div>

                  <div class="rounded-lg border border-slate-200/80 bg-slate-50/60 divide-y divide-slate-100 overflow-hidden">
                    <div
                      v-for="item in containerResourceBreakdown"
                      :key="item.container"
                      class="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-100/50 transition-colors"
                    >
                      <div class="min-w-0 pr-2">
                        <div class="font-medium text-slate-800 truncate flex items-center gap-1.5">
                          <span>{{ item.role }}</span>
                          <span v-if="item.pct !== 'Dynamic'" class="text-[10px] text-slate-400 font-normal">({{ item.pct }})</span>
                        </div>
                        <div class="font-mono text-[11px] text-slate-400 truncate">{{ item.container }}</div>
                      </div>
                      <div class="flex items-center gap-2 shrink-0">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-mono">
                          <Cpu class="w-3 h-3 text-blue-500" />
                          {{ item.cpu }}
                        </span>
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 text-[11px] font-mono">
                          <HardDrive class="w-3 h-3 text-amber-500" />
                          {{ item.memory }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p class="text-[10px] text-slate-400 leading-tight">
                    Total budget is dynamically distributed across containers so masters, brokers, and workers remain stable without host memory exhaustion.
                  </p>
                </div>
              </div>

              <!-- TAB 2: Customized Service Tuning -->
              <div v-else-if="configTab === 'tuning'" class="space-y-4">

                <!-- HDFS Tuning -->
                <div v-if="selectedService.name === 'HDFS'" class="space-y-3.5">
                  <!-- DataNodes Count -->
                  <div class="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/80 space-y-2.5">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">DataNodes Count</label>
                      <span class="text-xs font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{{ serviceConfigs.HDFS.dataNodes }} DataNode(s)</span>
                    </div>
                    <input type="range" min="1" max="3" step="1" v-model.number="serviceConfigs.HDFS.dataNodes" class="w-full accent-blue-600 cursor-pointer" />
                    <div class="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>1 (Minimal Dev)</span>
                      <span>2 (Balanced)</span>
                      <span>3 (Resilient Cluster)</span>
                    </div>
                  </div>

                  <!-- Topology: Replicas & Block Size -->
                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                      <label class="block text-[11px] font-semibold text-slate-700 mb-1">Replication Factor</label>
                      <select v-model.number="serviceConfigs.HDFS.replicationFactor" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700">
                        <option :value="1">1 (Recommended for local dev)</option>
                        <option :value="2">2</option>
                        <option :value="3">3</option>
                      </select>
                    </div>
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                      <label class="block text-[11px] font-semibold text-slate-700 mb-1">Default Block Size</label>
                      <select v-model="serviceConfigs.HDFS.blockSize" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-mono">
                        <option value="32MB">32 MB</option>
                        <option value="64MB">64 MB (Default)</option>
                        <option value="128MB">128 MB</option>
                      </select>
                    </div>
                  </div>

                  <!-- JVM Heap & Trash Retention -->
                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                      <div class="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1">
                        <Cpu class="w-3 h-3 text-slate-500" />
                        <span>Hadoop JVM Heap</span>
                      </div>
                      <select v-model="serviceConfigs.HDFS.jvmHeap" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-mono">
                        <option value="512M">512 MB (Lightweight)</option>
                        <option value="1024M">1024 MB (Default Dev)</option>
                        <option value="2048M">2048 MB (Heavy ETL)</option>
                      </select>
                    </div>
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                      <div class="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1">
                        <HardDrive class="w-3 h-3 text-slate-500" />
                        <span>Trash Retention</span>
                      </div>
                      <select v-model.number="serviceConfigs.HDFS.trashInterval" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-mono">
                        <option :value="0">0 min (Instant Purge / Save Disk)</option>
                        <option :value="60">60 mins (1 Hour)</option>
                        <option :value="1440">1440 mins (1 Day)</option>
                      </select>
                    </div>
                  </div>

                  <!-- Permission Enforcement Toggle -->
                  <div class="flex items-center justify-between p-3 bg-slate-50/80 border border-slate-200/80 rounded-lg">
                    <div class="pr-2">
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs font-semibold text-slate-700">Enforce File Permissions</span>
                        <span :class="['text-[10px] px-1.5 py-0.2 rounded font-mono', serviceConfigs.HDFS.permissionsEnabled ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700 font-semibold']">
                          {{ serviceConfigs.HDFS.permissionsEnabled ? 'Strict ACLs' : 'Permissive (Dev)' }}
                        </span>
                      </div>
                      <div class="text-[10px] text-slate-500 mt-0.5">
                        {{ serviceConfigs.HDFS.permissionsEnabled ? 'Enforces POSIX file ownership and supergroup permissions' : 'Disables strict checking so Spark/Trino/Hive can read/write freely without permission errors' }}
                      </div>
                    </div>
                    <input type="checkbox" v-model="serviceConfigs.HDFS.permissionsEnabled" class="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer shrink-0" />
                  </div>

                  <!-- WebHDFS REST API & CORS -->
                  <div class="space-y-2 p-3 bg-slate-50/80 border border-slate-200/80 rounded-lg">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="text-xs font-semibold text-slate-700">Enable WebHDFS REST API</div>
                        <div class="text-[10px] text-slate-500">Allow HTTP REST filesystem operations via port 9870</div>
                      </div>
                      <input type="checkbox" v-model="serviceConfigs.HDFS.webhdfs" class="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer" />
                    </div>

                    <div v-if="serviceConfigs.HDFS.webhdfs" class="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <div>
                        <div class="text-xs font-medium text-slate-700">Browser CORS Support</div>
                        <div class="text-[10px] text-slate-400">Allow web apps and browser notebooks to query WebHDFS directly</div>
                      </div>
                      <input type="checkbox" v-model="serviceConfigs.HDFS.webhdfsCors" class="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer" />
                    </div>
                  </div>

                  <!-- Bootstrap Common Directories -->
                  <div class="p-3 bg-slate-50/80 border border-slate-200/80 rounded-lg space-y-2">
                    <div>
                      <div class="text-xs font-semibold text-slate-700">Bootstrap Common Directories</div>
                      <div class="text-[10px] text-slate-500">Auto-create essential HDFS paths during startup so ecosystem tools work immediately</div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <label class="flex items-center gap-2 p-2 rounded bg-white border border-slate-200 text-xs cursor-pointer hover:bg-slate-50/80 transition-colors">
                        <input type="checkbox" v-model="serviceConfigs.HDFS.bootstrapDirs.tmp" class="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600 cursor-pointer" />
                        <div>
                          <div class="font-mono font-medium text-slate-800 text-[11px]">/tmp</div>
                          <div class="text-[9px] text-slate-400">chmod 777 for jobs</div>
                        </div>
                      </label>
                      <label class="flex items-center gap-2 p-2 rounded bg-white border border-slate-200 text-xs cursor-pointer hover:bg-slate-50/80 transition-colors">
                        <input type="checkbox" v-model="serviceConfigs.HDFS.bootstrapDirs.hiveWarehouse" class="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600 cursor-pointer" />
                        <div>
                          <div class="font-mono font-medium text-slate-800 text-[11px]">/user/hive/warehouse</div>
                          <div class="text-[9px] text-slate-400">Hive Metastore data</div>
                        </div>
                      </label>
                      <label class="flex items-center gap-2 p-2 rounded bg-white border border-slate-200 text-xs cursor-pointer hover:bg-slate-50/80 transition-colors">
                        <input type="checkbox" v-model="serviceConfigs.HDFS.bootstrapDirs.sparkEvents" class="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600 cursor-pointer" />
                        <div>
                          <div class="font-mono font-medium text-slate-800 text-[11px]">/spark-events</div>
                          <div class="text-[9px] text-slate-400">Spark History Server</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Kafka Tuning -->
                <div v-else-if="selectedService.name === 'Kafka'" class="space-y-3.5">
                  <div class="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/80 space-y-2">
                    <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Consensus Protocol</label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        @click="serviceConfigs.Kafka.mode = 'kraft'"
                        :class="['p-2 text-xs rounded border text-left cursor-pointer transition-all', serviceConfigs.Kafka.mode === 'kraft' ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50']"
                      >
                        <div class="font-bold">KRaft (Recommended)</div>
                        <div class="text-[10px] text-slate-500 font-normal">Native Raft quorum, no ZooKeeper</div>
                      </button>
                      <button
                        type="button"
                        @click="serviceConfigs.Kafka.mode = 'zookeeper'"
                        :class="['p-2 text-xs rounded border text-left cursor-pointer transition-all', serviceConfigs.Kafka.mode === 'zookeeper' ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50']"
                      >
                        <div class="font-bold">ZooKeeper Mode</div>
                        <div class="text-[10px] text-slate-500 font-normal">Legacy cluster coordination</div>
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                      <label class="block text-[11px] font-semibold text-slate-700 mb-1">Default Partitions</label>
                      <select v-model.number="serviceConfigs.Kafka.defaultPartitions" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-mono">
                        <option :value="1">1 partition</option>
                        <option :value="3">3 partitions (default)</option>
                        <option :value="6">6 partitions</option>
                      </select>
                    </div>
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                      <label class="block text-[11px] font-semibold text-slate-700 mb-1">Log Retention</label>
                      <select v-model="serviceConfigs.Kafka.logRetention" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-mono">
                        <option value="6h">6 hours (Saves disk)</option>
                        <option value="24h">24 hours (Default)</option>
                        <option value="168h">7 days</option>
                      </select>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Developer Add-ons</label>
                    <div class="space-y-1.5">
                      <label class="flex items-center gap-2 p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-lg text-xs cursor-pointer hover:bg-slate-100/70">
                        <input type="checkbox" v-model="serviceConfigs.Kafka.enableKafkaUI" class="rounded accent-blue-600 cursor-pointer" />
                        <div>
                          <div class="font-semibold text-slate-800">Kafka Web UI (AKHQ/Console)</div>
                          <div class="text-[10px] text-slate-500">Visual management for topics, consumer groups, and messages</div>
                        </div>
                      </label>
                      <label class="flex items-center gap-2 p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-lg text-xs cursor-pointer hover:bg-slate-100/70">
                        <input type="checkbox" v-model="serviceConfigs.Kafka.autoCreateTopics" class="rounded accent-blue-600 cursor-pointer" />
                        <div>
                          <div class="font-semibold text-slate-800">Auto-create Topics</div>
                          <div class="text-[10px] text-slate-500">Automatically provision topics upon first produce</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Spark Tuning -->
                <div v-else-if="selectedService.name === 'Spark'" class="space-y-3.5">
                  <div class="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/80 space-y-2.5">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Worker Instances</label>
                      <span class="text-xs font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{{ serviceConfigs.Spark.workers }} Worker Node(s)</span>
                    </div>
                    <input type="range" min="1" max="3" step="1" v-model.number="serviceConfigs.Spark.workers" class="w-full accent-blue-600 cursor-pointer" />
                    <div class="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>1 Worker</span>
                      <span>2 Workers</span>
                      <span>3 Workers</span>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Table Formats &amp; Lakehouse JARs</label>
                    <div class="grid grid-cols-2 gap-2">
                      <label class="flex items-center gap-2 p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-lg text-xs cursor-pointer hover:bg-slate-100/70">
                        <input type="checkbox" v-model="serviceConfigs.Spark.iceberg" class="rounded accent-blue-600 cursor-pointer" />
                        <div>
                          <div class="font-semibold text-slate-800">Apache Iceberg</div>
                          <div class="text-[10px] text-slate-500">Auto-inject iceberg-spark-runtime</div>
                        </div>
                      </label>
                      <label class="flex items-center gap-2 p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-lg text-xs cursor-pointer hover:bg-slate-100/70">
                        <input type="checkbox" v-model="serviceConfigs.Spark.deltaLake" class="rounded accent-blue-600 cursor-pointer" />
                        <div>
                          <div class="font-semibold text-slate-800">Delta Lake</div>
                          <div class="text-[10px] text-slate-500">Auto-inject delta-spark extension</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-slate-50/80 border border-slate-200/80 rounded-lg">
                    <div>
                      <div class="text-xs font-semibold text-slate-700">Spark History Server</div>
                      <div class="text-[10px] text-slate-500">Persist and inspect completed application event logs</div>
                    </div>
                    <input type="checkbox" v-model="serviceConfigs.Spark.historyServer" class="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer" />
                  </div>
                </div>

                <!-- Airflow Tuning -->
                <div v-else-if="selectedService.name === 'Airflow'" class="space-y-3.5">
                  <div class="flex items-center justify-between p-3 bg-slate-50/80 border border-slate-200/80 rounded-lg">
                    <div>
                      <div class="text-xs font-semibold text-slate-700">Load Example DAGs</div>
                      <div class="text-[10px] text-slate-500">Keep disabled for a clean workspace without demo tutorial DAGs</div>
                    </div>
                    <input type="checkbox" v-model="serviceConfigs.Airflow.loadExamples" class="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer" />
                  </div>

                  <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                    <label class="block text-[11px] font-semibold text-slate-700">Executor Type</label>
                    <select v-model="serviceConfigs.Airflow.executor" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700">
                      <option value="LocalExecutor">LocalExecutor (Parallel task execution)</option>
                      <option value="SequentialExecutor">SequentialExecutor (Single thread / Debug)</option>
                    </select>
                  </div>

                  <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                    <label class="block text-[11px] font-semibold text-slate-700">DAGs Folder Directory</label>
                    <input type="text" v-model="serviceConfigs.Airflow.dagsPath" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white font-mono text-slate-700" placeholder="~/airflow/dags" />
                    <span class="text-[10px] text-slate-400">Path on host system mapped into the Airflow container</span>
                  </div>
                </div>

                <!-- Trino Tuning -->
                <div v-else-if="selectedService.name === 'Trino'" class="space-y-3.5">
                  <div class="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/80 space-y-2">
                    <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Auto-mounted Catalogs</label>
                    <div class="grid grid-cols-2 gap-2">
                      <label class="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded text-xs cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" v-model="serviceConfigs.Trino.icebergCatalog" class="rounded accent-blue-600 cursor-pointer" />
                        <span class="font-medium text-slate-800">Iceberg (MinIO S3)</span>
                      </label>
                      <label class="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded text-xs cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" v-model="serviceConfigs.Trino.hiveCatalog" class="rounded accent-blue-600 cursor-pointer" />
                        <span class="font-medium text-slate-800">Hive Metastore</span>
                      </label>
                      <label class="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded text-xs cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" v-model="serviceConfigs.Trino.minioCatalog" class="rounded accent-blue-600 cursor-pointer" />
                        <span class="font-medium text-slate-800">Delta Lake</span>
                      </label>
                      <label class="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded text-xs cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" v-model="serviceConfigs.Trino.postgresCatalog" class="rounded accent-blue-600 cursor-pointer" />
                        <span class="font-medium text-slate-800">PostgreSQL</span>
                      </label>
                    </div>
                  </div>

                  <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                    <label class="block text-[11px] font-semibold text-slate-700 mb-1">Max Query Memory Limit</label>
                    <select v-model="serviceConfigs.Trino.queryMaxMemory" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-mono">
                      <option value="1GB">1 GB</option>
                      <option value="2GB">2 GB (Default)</option>
                      <option value="4GB">4 GB</option>
                    </select>
                  </div>
                </div>

                <!-- MinIO Tuning -->
                <div v-else-if="selectedService.name === 'MinIO'" class="space-y-3.5">
                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1">
                      <label class="block text-[11px] font-semibold text-slate-700">Root User (Access Key)</label>
                      <input type="text" v-model="serviceConfigs.MinIO.rootUser" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white font-mono text-slate-700" />
                    </div>
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1">
                      <label class="block text-[11px] font-semibold text-slate-700">Root Password (Secret Key)</label>
                      <input type="text" v-model="serviceConfigs.MinIO.rootPassword" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white font-mono text-slate-700" />
                    </div>
                  </div>

                  <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                    <label class="block text-[11px] font-semibold text-slate-700">Pre-create S3 Buckets</label>
                    <input type="text" v-model="serviceConfigs.MinIO.defaultBuckets" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white font-mono text-slate-700" placeholder="warehouse, raw, bronze, silver, gold" />
                    <span class="text-[10px] text-slate-400">Comma-separated buckets created automatically on container startup</span>
                  </div>
                </div>

                <!-- PostgreSQL Tuning -->
                <div v-else-if="selectedService.name === 'PostgreSQL'" class="space-y-3.5">
                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1">
                      <label class="block text-[11px] font-semibold text-slate-700">Database Name</label>
                      <input type="text" v-model="serviceConfigs.PostgreSQL.dbName" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white font-mono text-slate-700" />
                    </div>
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1">
                      <label class="block text-[11px] font-semibold text-slate-700">Superuser Password</label>
                      <input type="text" v-model="serviceConfigs.PostgreSQL.password" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white font-mono text-slate-700" />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Popular Data Extensions</label>
                    <div class="grid grid-cols-2 gap-2">
                      <label class="flex items-center gap-2 p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-lg text-xs cursor-pointer hover:bg-slate-100/70">
                        <input type="checkbox" v-model="serviceConfigs.PostgreSQL.enablePgvector" class="rounded accent-blue-600 cursor-pointer" />
                        <div>
                          <div class="font-semibold text-slate-800">pgvector</div>
                          <div class="text-[10px] text-slate-500">Vector embeddings for AI/RAG</div>
                        </div>
                      </label>
                      <label class="flex items-center gap-2 p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-lg text-xs cursor-pointer hover:bg-slate-100/70">
                        <input type="checkbox" v-model="serviceConfigs.PostgreSQL.enablePostGIS" class="rounded accent-blue-600 cursor-pointer" />
                        <div>
                          <div class="font-semibold text-slate-800">PostGIS</div>
                          <div class="text-[10px] text-slate-500">Geospatial queries &amp; shapes</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Apache Hive Tuning -->
                <div v-else-if="selectedService.name === 'Apache Hive'" class="space-y-3.5">
                  <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                    <label class="block text-[11px] font-semibold text-slate-700">Metastore Backend</label>
                    <select v-model="serviceConfigs['Apache Hive'].metastoreBackend" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700">
                      <option value="postgres">PostgreSQL Backend (Recommended for multi-client)</option>
                      <option value="derby">Embedded Derby (Single-session testing)</option>
                    </select>
                  </div>
                  <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                    <label class="block text-[11px] font-semibold text-slate-700">Warehouse Storage Location</label>
                    <input type="text" v-model="serviceConfigs['Apache Hive'].warehouseUri" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white font-mono text-slate-700" />
                  </div>
                </div>

                <!-- Cassandra Tuning -->
                <div v-else-if="selectedService.name === 'Cassandra'" class="space-y-3.5">
                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1">
                      <label class="block text-[11px] font-semibold text-slate-700">Cluster Name</label>
                      <input type="text" v-model="serviceConfigs.Cassandra.clusterName" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white font-mono text-slate-700" />
                    </div>
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1">
                      <label class="block text-[11px] font-semibold text-slate-700">Datacenter</label>
                      <input type="text" v-model="serviceConfigs.Cassandra.datacenter" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white font-mono text-slate-700" />
                    </div>
                  </div>
                  <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                    <label class="block text-[11px] font-semibold text-slate-700">JVM Heap Limit</label>
                    <select v-model="serviceConfigs.Cassandra.heapSize" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-mono">
                      <option value="512M">512 MB (Minimal dev)</option>
                      <option value="1024M">1024 MB (Default)</option>
                      <option value="2048M">2048 MB</option>
                    </select>
                  </div>
                </div>

                <!-- NiFi Tuning -->
                <div v-else-if="selectedService.name === 'NiFi'" class="space-y-3.5">
                  <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                    <label class="block text-[11px] font-semibold text-slate-700">Authentication Mode</label>
                    <select v-model="serviceConfigs.NiFi.authMode" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700">
                      <option value="anonymous">Anonymous / Local Dev (No login required)</option>
                      <option value="credentials">Credentials (Single admin user)</option>
                    </select>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1">
                      <label class="block text-[11px] font-semibold text-slate-700">JVM Heap Size</label>
                      <select v-model="serviceConfigs.NiFi.heapSize" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-mono">
                        <option value="512M">512 MB</option>
                        <option value="1GB">1 GB (Default)</option>
                        <option value="2GB">2 GB</option>
                      </select>
                    </div>
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1">
                      <label class="block text-[11px] font-semibold text-slate-700">FlowFile Storage Quota</label>
                      <select v-model="serviceConfigs.NiFi.flowfileQuota" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-mono">
                        <option value="2GB">2 GB</option>
                        <option value="5GB">5 GB (Default)</option>
                        <option value="10GB">10 GB</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- MongoDB Tuning -->
                <div v-else-if="selectedService.name === 'MongoDB'" class="space-y-3.5">
                  <div class="flex items-center justify-between p-3 bg-slate-50/80 border border-slate-200/80 rounded-lg">
                    <div>
                      <div class="text-xs font-semibold text-slate-700">Replica Set Mode (Single-node)</div>
                      <div class="text-[10px] text-slate-500">Enables Oplog support required for Debezium and Change Streams</div>
                    </div>
                    <input type="checkbox" v-model="serviceConfigs.MongoDB.replicaSet" class="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer" />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1">
                      <label class="block text-[11px] font-semibold text-slate-700">Root Username</label>
                      <input type="text" v-model="serviceConfigs.MongoDB.rootUser" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white font-mono text-slate-700" />
                    </div>
                    <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1">
                      <label class="block text-[11px] font-semibold text-slate-700">Root Password</label>
                      <input type="text" v-model="serviceConfigs.MongoDB.rootPassword" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white font-mono text-slate-700" />
                    </div>
                  </div>
                </div>

                <!-- Neo4j Tuning -->
                <div v-else-if="selectedService.name === 'Neo4j'" class="space-y-3.5">
                  <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1">
                    <label class="block text-[11px] font-semibold text-slate-700">Initial Password (user: neo4j)</label>
                    <input type="text" v-model="serviceConfigs.Neo4j.password" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white font-mono text-slate-700" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Graph Extensions</label>
                    <div class="grid grid-cols-2 gap-2">
                      <label class="flex items-center gap-2 p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-lg text-xs cursor-pointer hover:bg-slate-100/70">
                        <input type="checkbox" v-model="serviceConfigs.Neo4j.enableApoc" class="rounded accent-blue-600 cursor-pointer" />
                        <div>
                          <div class="font-semibold text-slate-800">APOC Library</div>
                          <div class="text-[10px] text-slate-500">Awesome Procedures On Cypher</div>
                        </div>
                      </label>
                      <label class="flex items-center gap-2 p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-lg text-xs cursor-pointer hover:bg-slate-100/70">
                        <input type="checkbox" v-model="serviceConfigs.Neo4j.enableGds" class="rounded accent-blue-600 cursor-pointer" />
                        <div>
                          <div class="font-semibold text-slate-800">GDS (Graph Data Science)</div>
                          <div class="text-[10px] text-slate-500">Graph algorithms &amp; ML</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Pinot Tuning -->
                <div v-else-if="selectedService.name === 'Pinot'" class="space-y-3.5">
                  <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                    <label class="block text-[11px] font-semibold text-slate-700">Cluster Architecture</label>
                    <select v-model="serviceConfigs.Pinot.mode" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700">
                      <option value="quickstart">Quickstart (Controller + Broker + Server All-In-One)</option>
                      <option value="distributed">Decoupled Micro-services</option>
                    </select>
                  </div>
                  <div class="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                    <label class="block text-[11px] font-semibold text-slate-700">Deep Storage Destination</label>
                    <select v-model="serviceConfigs.Pinot.storageBackend" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-mono">
                      <option value="minio">MinIO (s3://pinot-data/)</option>
                      <option value="local">Local Container Filesystem</option>
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

    <!-- ── Service Details & Inspection Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDetailsModal && detailsService"
          class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
          @click.self="showDetailsModal = false"
        >
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-[640px] max-w-[95vw] flex flex-col overflow-hidden max-h-[88vh]">

            <!-- Modal Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div class="flex items-center gap-3">
                <ServiceIcon :name="detailsService.name" class="w-8 h-8 drop-shadow-sm flex-shrink-0" />
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-bold text-slate-800 text-base leading-tight">{{ detailsService.name }}</h3>
                    <span class="text-[10px] font-mono bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                      {{ detailsService.version }}
                    </span>
                    <span
                      :class="[
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                        detailsService.status === 'Running'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-slate-100 border-slate-200 text-slate-500'
                      ]"
                    >
                      <span
                        :class="[
                          'w-1.5 h-1.5 rounded-full',
                          detailsService.status === 'Running' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        ]"
                      ></span>
                      {{ detailsService.status }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">{{ detailsService.description }}</p>
                </div>
              </div>
              <button
                @click="showDetailsModal = false"
                class="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Terminal Exec Action Banner -->
            <div class="px-5 py-3 bg-slate-900 text-slate-200 border-b border-slate-800">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <Terminal class="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <code class="text-xs font-mono text-emerald-300 truncate">
                    docker exec -it {{ detailsService.containerName }} /bin/bash
                  </code>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button
                    @click="copyEndpoint('docker exec -it ' + detailsService.containerName + ' /bin/bash', 'modal-exec')"
                    class="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors flex items-center gap-1 border border-slate-700 cursor-pointer"
                    title="Copy shell command"
                  >
                    <Check v-if="copiedKey === 'modal-exec'" class="w-3 h-3 text-emerald-400" />
                    <Copy v-else class="w-3 h-3" />
                    <span>{{ copiedKey === 'modal-exec' ? 'Copied' : 'Copy' }}</span>
                  </button>
                  <button
                    @click="launchTerminal(detailsService)"
                    :disabled="isLaunchingTerminal"
                    class="px-3 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Terminal class="w-3 h-3" />
                    <span>Open Terminal</span>
                  </button>
                </div>
              </div>
              <!-- Feedback status -->
              <div v-if="terminalStatus" class="mt-2 text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span>✓ {{ terminalStatus }}</span>
              </div>
              <div v-else-if="detailsService.status === 'Stopped'" class="mt-1 text-[10px] text-amber-400/90 font-mono">
                Note: Container is currently stopped. Start container to exec into shell.
              </div>
            </div>

            <!-- Modal Content / Body -->
            <div class="px-5 py-4 space-y-4 overflow-y-auto max-h-[60vh]">
              
              <!-- Container Specifications -->
              <div>
                <div class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Container Specs</div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <div class="text-[10px] font-medium text-slate-400 uppercase">Container Name</div>
                    <div class="font-mono font-medium text-slate-800 text-xs mt-0.5 truncate flex items-center justify-between">
                      <span>{{ detailsService.containerName }}</span>
                      <button
                        @click="copyEndpoint(detailsService.containerName, 'name-copy')"
                        class="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        title="Copy container name"
                      >
                        <Check v-if="copiedKey === 'name-copy'" class="w-2.5 h-2.5 text-emerald-600" />
                        <Copy v-else class="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <div class="text-[10px] font-medium text-slate-400 uppercase">Docker Image</div>
                    <div class="font-mono font-medium text-slate-800 text-xs mt-0.5 truncate">
                      {{ detailsService.repos?.[0] }}:{{ detailsService.defaultTag }}
                    </div>
                  </div>

                  <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <div class="text-[10px] font-medium text-slate-400 uppercase">Network</div>
                    <div class="font-mono text-slate-700 text-xs mt-0.5">{{ detailsService.network || 'deloc-net (bridge)' }}</div>
                  </div>

                  <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <div class="text-[10px] font-medium text-slate-400 uppercase">Process Architecture</div>
                    <div class="font-mono text-slate-700 text-xs mt-0.5">linux / amd64</div>
                  </div>
                </div>
              </div>

              <!-- Endpoints & Ports -->
              <div>
                <div class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 flex items-center justify-between">
                  <span>Endpoints &amp; Ports</span>
                  <span class="text-[10px] font-mono text-slate-400 normal-case">{{ detailsService.endpoints?.length || 0 }} mapped</span>
                </div>
                <div class="space-y-1.5">
                  <div
                    v-for="(ep, idx) in detailsService.endpoints"
                    :key="idx"
                    class="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <span
                        :class="[
                          'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded leading-none font-mono',
                          ep.type === 'http' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        ]"
                      >
                        {{ ep.type }}
                      </span>
                      <div>
                        <div class="font-medium text-slate-800">{{ ep.label }}</div>
                        <div class="font-mono text-[11px] text-slate-500">{{ ep.url }}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <button
                        v-if="ep.type === 'http'"
                        @click="openEndpoint(ep.url)"
                        class="px-2 py-1 text-xs bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-blue-600 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ExternalLink class="w-3 h-3" />
                        <span>Open</span>
                      </button>
                      <button
                        @click="copyEndpoint(ep.url, 'modal-ep-' + idx)"
                        class="px-2 py-1 text-xs bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Check v-if="copiedKey === ('modal-ep-' + idx)" class="w-3 h-3 text-emerald-600" />
                        <Copy v-else class="w-3 h-3" />
                        <span>{{ copiedKey === ('modal-ep-' + idx) ? 'Copied' : 'Copy' }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Storage & Volume Mounts -->
              <div v-if="detailsService.volumes?.length">
                <div class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <HardDrive class="w-3.5 h-3.5 text-slate-500" />
                  <span>Volume Mounts</span>
                </div>
                <div class="space-y-1">
                  <div
                    v-for="(vol, idx) in detailsService.volumes"
                    :key="idx"
                    class="p-2 rounded bg-slate-50 border border-slate-200/80 font-mono text-[11px] text-slate-700 flex items-center justify-between"
                  >
                    <span>{{ vol }}</span>
                    <button
                      @click="copyEndpoint(vol, 'vol-' + idx)"
                      class="text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Copy mount"
                    >
                      <Check v-if="copiedKey === ('vol-' + idx)" class="w-2.5 h-2.5 text-emerald-600" />
                      <Copy v-else class="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Environment Variables -->
              <div v-if="detailsService.environment?.length">
                <div class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Environment Configuration</div>
                <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 space-y-1 max-h-36 overflow-y-auto">
                  <div v-for="(env, idx) in detailsService.environment" :key="idx" class="truncate">
                    <span class="text-slate-400">$ </span>{{ env }}
                  </div>
                </div>
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-100">
              <button
                @click="toggleService(detailsService)"
                :class="[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer',
                  detailsService.status === 'Running'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                ]"
              >
                <Square v-if="detailsService.status === 'Running'" class="w-3 h-3" fill="currentColor" />
                <Play v-else class="w-3 h-3" fill="currentColor" />
                <span>{{ detailsService.status === 'Running' ? 'Stop Service' : 'Start Service' }}</span>
              </button>

              <div class="flex items-center gap-2">
                <button
                  @click="openConfigFromDetails(detailsService)"
                  class="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Configure
                </button>
                <button
                  @click="showDetailsModal = false"
                  class="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Service Not Running Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showNotRunningModal && notRunningService"
          class="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
          @click.self="showNotRunningModal = false"
        >
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-[420px] max-w-[95vw] flex flex-col overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div class="flex items-center gap-2.5">
                <ServiceIcon :name="notRunningService.name" class="w-6 h-6 drop-shadow-sm flex-shrink-0" />
                <span class="font-bold text-slate-800 text-sm tracking-tight">{{ notRunningService.name }}</span>
              </div>
              <button
                @click="showNotRunningModal = false"
                class="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded hover:bg-slate-100 cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 text-center flex flex-col items-center">
              <div class="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mb-3.5 shadow-sm">
                <CircleAlert class="w-6 h-6" />
              </div>
              <h3 class="text-base font-bold text-slate-800 mb-1.5">Service is not running</h3>
              <p class="text-xs text-slate-500 leading-relaxed max-w-xs">
                <span class="font-semibold text-slate-700">{{ notRunningService.name }}</span> is currently stopped. Please start the service to view endpoints, inspect container details, or launch a terminal.
              </p>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-100">
              <button
                @click="showNotRunningModal = false"
                class="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                @click="startAndOpenDetails(notRunningService)"
                class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-sm cursor-pointer"
              >
                <Play class="w-3 h-3" fill="currentColor" />
                <span>Start Service</span>
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
  Search, Layers, Play, Square, X, RefreshCw, ExternalLink, Copy, Check, Terminal, HardDrive, CircleAlert, SlidersHorizontal, Cpu
} from 'lucide-vue-next'
import ServiceIcon from './common/ServiceIcon.vue'
import { FetchDockerTags, OpenTerminal } from '../../wailsjs/go/bindings/Service.js'
import { BrowserOpenURL, ClipboardSetText } from '../../wailsjs/runtime/runtime.js'

const searchQuery = ref('')
const copiedKey = ref(null)

const servicesList = ref([
  {
    name: 'HDFS',
    version: 'v3.3.6',
    defaultTag: '3.3.6',
    status: 'Stopped',
    containerName: 'deloc-hdfs-namenode',
    network: 'deloc-net (bridge)',
    description: 'Distributed file system for big data storage.',
    repos: ['apache/hadoop', 'bde2020/hadoop-namenode'],
    volumes: ['deloc_hdfs_data:/hadoop/dfs/name'],
    environment: [
      'CLUSTER_NAME=deloc-hdfs',
      'CORE_CONF_fs_defaultFS=hdfs://deloc-hdfs-namenode:9000'
    ],
    endpoints: [
      { label: 'NameNode UI', port: 9870, url: 'http://localhost:9870', type: 'http' },
      { label: 'IPC / RPC', port: 9000, url: 'localhost:9000', type: 'tcp' }
    ]
  },
  {
    name: 'Kafka',
    version: 'v3.6.1',
    defaultTag: '3.6.1',
    status: 'Stopped',
    containerName: 'deloc-kafka',
    network: 'deloc-net (bridge)',
    description: 'Distributed event streaming platform.',
    repos: ['apache/kafka', 'bitnami/kafka', 'confluentinc/cp-kafka'],
    volumes: ['deloc_kafka_data:/var/lib/kafka/data'],
    environment: [
      'KAFKA_NODE_ID=1',
      'KAFKA_PROCESS_ROLES=broker,controller',
      'KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093'
    ],
    endpoints: [
      { label: 'Broker', port: 9092, url: 'localhost:9092', type: 'tcp' },
      { label: 'Schema Reg.', port: 8081, url: 'http://localhost:8081', type: 'http' }
    ]
  },
  {
    name: 'Airflow',
    version: 'v2.8.1',
    defaultTag: '2.8.1',
    status: 'Stopped',
    containerName: 'deloc-airflow-webserver',
    network: 'deloc-net (bridge)',
    description: 'Workflow orchestration tool for data pipelines.',
    repos: ['apache/airflow', 'bitnami/airflow', 'puckel/docker-airflow'],
    volumes: [
      'deloc_airflow_dags:/opt/airflow/dags',
      'deloc_airflow_logs:/opt/airflow/logs'
    ],
    environment: [
      'AIRFLOW__CORE__EXECUTOR=LocalExecutor',
      'AIRFLOW__CORE__LOAD_EXAMPLES=False'
    ],
    endpoints: [
      { label: 'Web UI', port: 8080, url: 'http://localhost:8080', type: 'http' }
    ]
  },
  {
    name: 'Trino',
    version: 'v440',
    defaultTag: '440',
    status: 'Stopped',
    containerName: 'deloc-trino',
    network: 'deloc-net (bridge)',
    description: 'Distributed SQL query engine for big data.',
    repos: ['trinodb/trino'],
    volumes: ['deloc_trino_data:/data/trino'],
    environment: [
      'TRINO_SERVER_PORT=8080'
    ],
    endpoints: [
      { label: 'Web UI', port: 8080, url: 'http://localhost:8080', type: 'http' }
    ]
  },
  {
    name: 'Apache Hive',
    version: 'v4.0.0',
    defaultTag: '4.0.0',
    status: 'Stopped',
    containerName: 'deloc-hive-server',
    network: 'deloc-net (bridge)',
    description: 'Data warehouse software for querying and managing large datasets.',
    repos: ['apache/hive', 'bde2020/hive'],
    volumes: ['deloc_hive_warehouse:/opt/hive/data/warehouse'],
    environment: [
      'HIVE_SERVER2_THRIFT_PORT=10000',
      'HIVE_METASTORE_PORT=9083'
    ],
    endpoints: [
      { label: 'JDBC / Thrift', port: 10000, url: 'localhost:10000', type: 'tcp' },
      { label: 'Metastore', port: 9083, url: 'localhost:9083', type: 'tcp' }
    ]
  },
  {
    name: 'Cassandra',
    version: 'v4.1.3',
    defaultTag: '4.1.3',
    status: 'Stopped',
    containerName: 'deloc-cassandra',
    network: 'deloc-net (bridge)',
    description: 'Highly scalable distributed NoSQL database.',
    repos: ['cassandra', 'bitnami/cassandra'],
    volumes: ['deloc_cassandra_data:/var/lib/cassandra'],
    environment: [
      'CASSANDRA_CLUSTER_NAME=deloc-cluster',
      'CASSANDRA_DC=datacenter1'
    ],
    endpoints: [
      { label: 'CQL Native', port: 9042, url: 'localhost:9042', type: 'tcp' },
      { label: 'JMX', port: 7199, url: 'localhost:7199', type: 'tcp' }
    ]
  },
  {
    name: 'Pinot',
    version: 'v1.0.0',
    defaultTag: '1.0.0',
    status: 'Stopped',
    containerName: 'deloc-pinot-controller',
    network: 'deloc-net (bridge)',
    description: 'Real-time distributed OLAP datastore.',
    repos: ['apachepinot/pinot'],
    volumes: ['deloc_pinot_data:/opt/pinot/data'],
    environment: [
      'PINOT_CONTROLLER_PORT=9000',
      'JAVA_OPTS=-Xms512M -Xmx1G'
    ],
    endpoints: [
      { label: 'Controller UI', port: 9000, url: 'http://localhost:9000', type: 'http' },
      { label: 'Broker Query', port: 8099, url: 'localhost:8099', type: 'tcp' }
    ]
  },
  {
    name: 'MinIO',
    version: 'RELEASE.2024',
    defaultTag: 'latest',
    status: 'Stopped',
    containerName: 'deloc-minio',
    network: 'deloc-net (bridge)',
    description: 'High performance S3 compatible object storage.',
    repos: ['minio/minio', 'bitnami/minio'],
    volumes: ['deloc_minio_data:/data'],
    environment: [
      'MINIO_ROOT_USER=minioadmin',
      'MINIO_ROOT_PASSWORD=minioadmin'
    ],
    endpoints: [
      { label: 'Console UI', port: 9001, url: 'http://localhost:9001', type: 'http' },
      { label: 'S3 API', port: 9000, url: 'http://localhost:9000', type: 'http' }
    ]
  },
  {
    name: 'Spark',
    version: 'v3.5.0',
    defaultTag: '3.5.0',
    status: 'Stopped',
    containerName: 'deloc-spark-master',
    network: 'deloc-net (bridge)',
    description: 'Unified analytics engine for large-scale data processing.',
    repos: ['apache/spark', 'bitnami/spark'],
    volumes: [
      'deloc_spark_apps:/opt/spark-apps',
      'deloc_spark_data:/opt/spark-data'
    ],
    environment: [
      'SPARK_MODE=master',
      'SPARK_RPC_AUTHENTICATION_ENABLED=no'
    ],
    endpoints: [
      { label: 'Master UI', port: 8080, url: 'http://localhost:8080', type: 'http' },
      { label: 'Spark RPC', port: 7077, url: 'spark://localhost:7077', type: 'tcp' }
    ]
  },
  {
    name: 'NiFi',
    version: 'v1.25.0',
    defaultTag: '1.25.0',
    status: 'Stopped',
    containerName: 'deloc-nifi',
    network: 'deloc-net (bridge)',
    description: 'Automates the flow of data between systems.',
    repos: ['apache/nifi'],
    volumes: [
      'deloc_nifi_flowfile:/opt/nifi/nifi-current/flowfile_repository',
      'deloc_nifi_database:/opt/nifi/nifi-current/database_repository'
    ],
    environment: [
      'NIFI_WEB_HTTPS_PORT=8443',
      'NIFI_JVM_HEAP_INIT=512m'
    ],
    endpoints: [
      { label: 'Web UI', port: 8443, url: 'https://localhost:8443/nifi', type: 'http' }
    ]
  },
  {
    name: 'PostgreSQL',
    version: 'v16.2',
    defaultTag: '16.2',
    status: 'Stopped',
    containerName: 'deloc-postgres',
    network: 'deloc-net (bridge)',
    description: 'Powerful, open source object-relational database.',
    repos: ['postgres', 'bitnami/postgresql'],
    volumes: ['deloc_postgres_data:/var/lib/postgresql/data'],
    environment: [
      'POSTGRES_USER=postgres',
      'POSTGRES_PASSWORD=postgres',
      'POSTGRES_DB=deloc'
    ],
    endpoints: [
      { label: 'PostgreSQL', port: 5432, url: 'localhost:5432', type: 'tcp' }
    ]
  },
  {
    name: 'MongoDB',
    version: 'v7.0.5',
    defaultTag: '7.0.5',
    status: 'Stopped',
    containerName: 'deloc-mongodb',
    network: 'deloc-net (bridge)',
    description: 'Document-oriented NoSQL database system.',
    repos: ['mongo', 'bitnami/mongodb'],
    volumes: ['deloc_mongo_data:/data/db'],
    environment: [
      'MONGO_INITDB_ROOT_USERNAME=root',
      'MONGO_INITDB_ROOT_PASSWORD=example'
    ],
    endpoints: [
      { label: 'MongoDB', port: 27017, url: 'localhost:27017', type: 'tcp' }
    ]
  },
  {
    name: 'Neo4j',
    version: 'v5.17.0',
    defaultTag: '5.17.0',
    status: 'Stopped',
    containerName: 'deloc-neo4j',
    network: 'deloc-net (bridge)',
    description: 'Native graph database designed for connected data.',
    repos: ['neo4j'],
    volumes: [
      'deloc_neo4j_data:/data',
      'deloc_neo4j_logs:/logs'
    ],
    environment: [
      'NEO4J_AUTH=neo4j/delocpassword',
      'NEO4J_PLUGINS=["apoc"]'
    ],
    endpoints: [
      { label: 'Browser UI', port: 7474, url: 'http://localhost:7474', type: 'http' },
      { label: 'Bolt Protocol', port: 7687, url: 'bolt://localhost:7687', type: 'tcp' }
    ]
  },
])

const filteredServices = computed(() => {
  if (!searchQuery.value) return servicesList.value
  const q = searchQuery.value.toLowerCase()
  return servicesList.value.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q)
  )
})

// ── Configure Modal State ──
const showConfigModal = ref(false)
const selectedService = ref(null)
const configTab = ref('resources')

const serviceConfigs = ref({
  HDFS: {
    dataNodes: 1,
    replicationFactor: 1,
    blockSize: '64MB',
    webhdfs: true,
    webhdfsCors: true,
    permissionsEnabled: false,
    jvmHeap: '1024M',
    trashInterval: 0,
    bootstrapDirs: {
      tmp: true,
      hiveWarehouse: true,
      sparkEvents: true,
    },
  },
  Kafka: {
    mode: 'kraft',
    defaultPartitions: 3,
    logRetention: '24h',
    autoCreateTopics: true,
    enableKafkaUI: true,
  },
  Spark: {
    workers: 1,
    iceberg: true,
    deltaLake: true,
    historyServer: true,
  },
  Airflow: {
    loadExamples: false,
    executor: 'LocalExecutor',
    dagsPath: '~/airflow/dags',
  },
  Trino: {
    icebergCatalog: true,
    hiveCatalog: true,
    minioCatalog: true,
    postgresCatalog: false,
    queryMaxMemory: '2GB',
  },
  MinIO: {
    rootUser: 'minioadmin',
    rootPassword: 'minioadmin',
    defaultBuckets: 'warehouse, raw, bronze, silver, gold',
  },
  PostgreSQL: {
    dbName: 'deloc',
    password: 'postgres',
    enablePgvector: true,
    enablePostGIS: false,
  },
  'Apache Hive': {
    metastoreBackend: 'postgres',
    warehouseUri: 's3a://warehouse/',
  },
  Cassandra: {
    clusterName: 'deloc-cluster',
    datacenter: 'dc1',
    heapSize: '1024M',
  },
  NiFi: {
    authMode: 'anonymous',
    heapSize: '1GB',
    flowfileQuota: '5GB',
  },
  MongoDB: {
    replicaSet: false,
    rootUser: 'root',
    rootPassword: 'example',
  },
  Neo4j: {
    password: 'delocpassword',
    enableApoc: true,
    enableGds: false,
  },
  Pinot: {
    mode: 'quickstart',
    storageBackend: 'minio',
  },
})

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
  dynamic: true,
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

const containerResourceBreakdown = computed(() => {
  if (!selectedService.value) return []

  const isDynamic = configForm.value.dynamic
  const totalCores = parseFloat(configForm.value.cpuCores) || 2
  const rawMem = parseFloat(configForm.value.memory) || (configForm.value.memoryUnit === 'GB' ? 2 : 1024)
  const totalMemMB = configForm.value.memoryUnit === 'GB' ? rawMem * 1024 : rawMem

  const fmtCpu = (cores) => {
    if (isDynamic) return 'Dynamic'
    const rounded = parseFloat(cores.toFixed(2))
    return `${rounded} Core${rounded > 1 ? 's' : ''}`
  }
  const fmtMem = (mb) => {
    if (isDynamic) return 'Dynamic'
    if (mb >= 1024) {
      const gb = mb / 1024
      return `${parseFloat(gb.toFixed(2))} GB`
    }
    return `${Math.round(mb)} MB`
  }

  const sName = selectedService.value.name
  const list = []

  if (sName === 'Spark') {
    const numWorkers = serviceConfigs.value.Spark?.workers || 1
    const hasHistory = serviceConfigs.value.Spark?.historyServer
    let availCpu = totalCores
    let availMem = totalMemMB
    let histCpu = 0
    let histMem = 0

    if (hasHistory) {
      histCpu = Math.min(0.25, availCpu * 0.1)
      histMem = Math.min(256, availMem * 0.1)
      availCpu = Math.max(0.5, availCpu - histCpu)
      availMem = Math.max(512, availMem - histMem)
    }

    const masterShare = 0.3
    const masterCpu = Math.max(0.5, availCpu * masterShare)
    const masterMem = Math.max(256, availMem * masterShare)
    const remCpu = Math.max(0.2, (availCpu - masterCpu) / numWorkers)
    const remMem = Math.max(256, (availMem - masterMem) / numWorkers)

    list.push({
      role: 'Spark Master',
      container: 'deloc-spark-master',
      cpu: fmtCpu(masterCpu),
      memory: fmtMem(masterMem),
      pct: isDynamic ? 'Dynamic' : `${Math.round((masterMem / totalMemMB) * 100)}%`
    })
    for (let i = 1; i <= numWorkers; i++) {
      list.push({
        role: `Worker ${i}`,
        container: `deloc-spark-worker-${i}`,
        cpu: fmtCpu(remCpu),
        memory: fmtMem(remMem),
        pct: isDynamic ? 'Dynamic' : `${Math.round((remMem / totalMemMB) * 100)}%`
      })
    }
    if (hasHistory) {
      list.push({
        role: 'History Server',
        container: 'deloc-spark-history',
        cpu: fmtCpu(histCpu),
        memory: fmtMem(histMem),
        pct: isDynamic ? 'Dynamic' : `${Math.round((histMem / totalMemMB) * 100)}%`
      })
    }
  } else if (sName === 'HDFS') {
    const numDN = serviceConfigs.value.HDFS?.dataNodes || 1
    const nnShare = 0.35
    const nnCpu = Math.max(0.5, totalCores * nnShare)
    const nnMem = Math.max(512, totalMemMB * nnShare)
    const dnCpu = Math.max(0.2, (totalCores - nnCpu) / numDN)
    const dnMem = Math.max(256, (totalMemMB - nnMem) / numDN)

    list.push({
      role: 'NameNode',
      container: 'deloc-hdfs-namenode',
      cpu: fmtCpu(nnCpu),
      memory: fmtMem(nnMem),
      pct: isDynamic ? 'Dynamic' : `${Math.round((nnMem / totalMemMB) * 100)}%`
    })
    for (let i = 1; i <= numDN; i++) {
      list.push({
        role: `DataNode ${i}`,
        container: `deloc-hdfs-datanode-${i}`,
        cpu: fmtCpu(dnCpu),
        memory: fmtMem(dnMem),
        pct: isDynamic ? 'Dynamic' : `${Math.round((dnMem / totalMemMB) * 100)}%`
      })
    }
  } else if (sName === 'Kafka') {
    const hasUI = serviceConfigs.value.Kafka?.enableKafkaUI
    if (hasUI) {
      const brokerCpu = totalCores * 0.8
      const brokerMem = totalMemMB * 0.8
      const uiCpu = totalCores * 0.2
      const uiMem = totalMemMB * 0.2
      list.push({
        role: 'Kafka Broker (KRaft)',
        container: 'deloc-kafka',
        cpu: fmtCpu(brokerCpu),
        memory: fmtMem(brokerMem),
        pct: isDynamic ? 'Dynamic' : '80%'
      })
      list.push({
        role: 'Kafka UI',
        container: 'deloc-kafka-ui',
        cpu: fmtCpu(uiCpu),
        memory: fmtMem(uiMem),
        pct: isDynamic ? 'Dynamic' : '20%'
      })
    } else {
      list.push({
        role: 'Kafka Broker (KRaft)',
        container: 'deloc-kafka',
        cpu: fmtCpu(totalCores),
        memory: fmtMem(totalMemMB),
        pct: isDynamic ? 'Dynamic' : '100%'
      })
    }
  } else if (sName === 'Airflow') {
    const wsCpu = totalCores * 0.45
    const wsMem = totalMemMB * 0.45
    const scCpu = totalCores * 0.55
    const scMem = totalMemMB * 0.55
    list.push({
      role: 'Airflow Webserver',
      container: 'deloc-airflow-webserver',
      cpu: fmtCpu(wsCpu),
      memory: fmtMem(wsMem),
      pct: isDynamic ? 'Dynamic' : '45%'
    })
    list.push({
      role: 'Airflow Scheduler',
      container: 'deloc-airflow-scheduler',
      cpu: fmtCpu(scCpu),
      memory: fmtMem(scMem),
      pct: isDynamic ? 'Dynamic' : '55%'
    })
  } else {
    // Single container service
    list.push({
      role: selectedService.value.name,
      container: selectedService.value.containerName || `deloc-${selectedService.value.name.toLowerCase()}`,
      cpu: fmtCpu(totalCores),
      memory: fmtMem(totalMemMB),
      pct: isDynamic ? 'Dynamic' : '100%'
    })
  }

  return list
})

function openConfig(service) {
  selectedService.value = service
  fetchTagError.value = ''
  availableTags.value = []

  const initialRepo = service.repos?.[0] || service.name.toLowerCase()
  selectedRepoChoice.value = initialRepo
  customRepoInput.value = ''
  selectedTagChoice.value = service.defaultTag || 'latest'

  const defaultResources = {
    Spark: { cpu: 2, mem: '2', unit: 'GB' },
    HDFS: { cpu: 2, mem: '2', unit: 'GB' },
    Airflow: { cpu: 2, mem: '2', unit: 'GB' },
    Trino: { cpu: 2, mem: '2', unit: 'GB' },
    Kafka: { cpu: 1.5, mem: '1', unit: 'GB' },
    NiFi: { cpu: 2, mem: '1.5', unit: 'GB' },
    Cassandra: { cpu: 1.5, mem: '1', unit: 'GB' },
    Pinot: { cpu: 2, mem: '1.5', unit: 'GB' },
  }
  const res = defaultResources[service.name] || { cpu: 1, mem: '512', unit: 'MB' }

  configForm.value = {
    fullImage: `${initialRepo}:${selectedTagChoice.value}`,
    cpuCores: res.cpu,
    memory: res.mem,
    memoryUnit: res.unit,
    dynamic: true,
  }

  configTab.value = 'resources'
  showConfigModal.value = true
  fetchTagsForRepo(initialRepo)
}

function applyConfig() {
  // Apply the selected configuration
  showConfigModal.value = false
}

async function copyEndpoint(text, key) {
  try {
    if (typeof ClipboardSetText === 'function') {
      await ClipboardSetText(text)
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
    copiedKey.value = key
    setTimeout(() => {
      if (copiedKey.value === key) {
        copiedKey.value = null
      }
    }, 1800)
  } catch (err) {
    console.error('Failed to copy endpoint:', err)
  }
}

function openEndpoint(url) {
  if (typeof BrowserOpenURL === 'function') {
    BrowserOpenURL(url)
  } else {
    window.open(url, '_blank')
  }
}

function toggleService(service) {
  service.status = service.status === 'Running' ? 'Stopped' : 'Running'
  if (service.status === 'Running' && notRunningNotice.value[service.name]) {
    notRunningNotice.value[service.name] = false
  }
}

// ── Service Details & Inspection State ──
const showDetailsModal = ref(false)
const detailsService = ref(null)
const showNotRunningModal = ref(false)
const notRunningService = ref(null)
const isLaunchingTerminal = ref(false)
const terminalStatus = ref('')

function handleDetailsClick(service) {
  if (service.status !== 'Running') {
    notRunningService.value = service
    showNotRunningModal.value = true
    return
  }
  openDetails(service)
}

function startAndOpenDetails(service) {
  service.status = 'Running'
  showNotRunningModal.value = false
  openDetails(service)
}

function openDetails(service) {
  detailsService.value = service
  terminalStatus.value = ''
  showDetailsModal.value = true
}

function openConfigFromDetails(service) {
  showDetailsModal.value = false
  openConfig(service)
}

async function launchTerminal(service) {
  if (!service || !service.containerName) return
  isLaunchingTerminal.value = true
  terminalStatus.value = ''
  try {
    if (typeof OpenTerminal === 'function') {
      await OpenTerminal(service.containerName)
      terminalStatus.value = `Terminal launched for ${service.containerName}`
      setTimeout(() => {
        if (terminalStatus.value.includes(service.containerName)) {
          terminalStatus.value = ''
        }
      }, 4000)
    } else {
      console.warn('OpenTerminal backend binding not available')
      terminalStatus.value = 'Terminal binding not available in web preview.'
    }
  } catch (err) {
    console.error('Failed to open terminal:', err)
    terminalStatus.value = err?.message || 'Could not launch terminal.'
  } finally {
    isLaunchingTerminal.value = false
  }
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
