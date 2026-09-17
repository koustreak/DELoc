<template>
  <div class="flex flex-col h-full bg-[#f2f5f9] overflow-hidden font-sans">
    <!-- Header -->
    <header class="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
          <Puzzle class="w-4 h-4" />
        </div>
        <div>
          <h1 class="text-sm font-bold text-slate-800 tracking-tight">Host Runtimes &amp; Plugins</h1>
          <p class="text-[11px] text-slate-500">Configure host language environments, interpreters, and big data connectors.</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="scanHost"
          :disabled="isScanning"
          class="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
        >
          <RefreshCw :class="['w-3.5 h-3.5 text-slate-600', isScanning ? 'animate-spin' : '']" />
          <span>{{ isScanning ? 'Scanning System...' : 'Scan Host' }}</span>
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- Section Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Layers class="w-3.5 h-3.5 text-slate-500" />
          <span>Language Runtimes</span>
        </div>
        <span class="text-[11px] text-slate-400">
          {{ isConfigured ? 'Python Configured' : 'Python Not Configured' }}
        </span>
      </div>

      <!-- ── PYTHON RUNTIME CARD ── -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        <!-- Card Top Bar -->
        <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/40">
          <div class="flex items-start gap-3.5">
            <!-- Official Python Vector Icon -->
            <div class="w-12 h-12 rounded-xl bg-white border border-slate-200/80 p-2 shadow-sm flex items-center justify-center flex-shrink-0">
              <img :src="pythonIcon" alt="Python" class="w-full h-full object-contain" />
            </div>

            <div>
              <div class="flex items-center gap-2.5">
                <h2 class="text-base font-bold text-slate-800 tracking-tight">Python</h2>
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                    isConfigured
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  ]"
                >
                  <span :class="['w-1.5 h-1.5 rounded-full', isConfigured ? 'bg-emerald-500' : 'bg-amber-500']"></span>
                  {{ isConfigured ? 'Configured' : 'Not Configured' }}
                </span>
                <span v-if="isConfigured" class="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium border border-slate-200">
                  {{ pythonEnv.typeLabel }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                Core runtime for PySpark, Jupyter notebooks, ETL scripts, and data engineering pipelines.
              </p>
            </div>
          </div>

          <!-- Top Action Buttons -->
          <div class="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
            <button
              v-if="isConfigured"
              type="button"
              @click="openConfigModal"
              class="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal class="w-3.5 h-3.5 text-slate-600" />
              <span>Change Interpreter</span>
            </button>
          </div>
        </div>

        <!-- ── STATE A: NOT CONFIGURED (Hero Setup Prompt) ── -->
        <div v-if="!isConfigured" class="p-8 text-center flex flex-col items-center justify-center bg-slate-50/20">
          <div class="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 shadow-sm">
            <CircleAlert class="w-6 h-6" />
          </div>
          <h3 class="text-sm font-bold text-slate-800">No Python Environment Configured</h3>
          <p class="text-xs text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
            DELoc requires a Python 3 environment for PySpark, lakehouse queries, and notebooks. You can let DELoc set up an isolated, clean environment automatically or point to your existing custom/conda setup.
          </p>

          <div class="flex flex-wrap items-center justify-center gap-3">
            <!-- Button 1: Auto-Configure (The Life-Saver) -->
            <button
              type="button"
              @click="startAutoConfigure"
              class="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles class="w-4 h-4 text-yellow-300" />
              <span>Auto-Configure Python (Recommended)</span>
            </button>

            <!-- Button 2: Manual Configure -->
            <button
              type="button"
              @click="openConfigModal"
              class="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal class="w-3.5 h-3.5 text-slate-600" />
              <span>Configure Manually...</span>
            </button>
          </div>

          <p class="text-[11px] text-slate-400 mt-4">
            Auto-configure creates an isolated virtual environment at <code>~/.deloc/python-env</code> and pre-installs PySpark, Delta Lake, and DuckDB.
          </p>
        </div>

        <!-- ── STATE B: CONFIGURED (Split 2-Column Layout) ── -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          <!-- ── LEFT COLUMN: Python Environment Info (5 Cols) ── -->
          <div class="lg:col-span-5 p-5 space-y-4 bg-slate-50/30 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Interpreter Details</span>
                <span class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 class="w-3.5 h-3.5" /> Healthy
                </span>
              </div>

              <!-- Version & Architecture -->
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Runtime Version</label>
                <div class="text-sm font-bold text-slate-800 mt-0.5">
                  {{ pythonEnv.version }}
                </div>
                <span class="text-[11px] text-slate-500">Linux x86_64 / CPython</span>
              </div>

              <!-- Environment Type -->
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Environment Type</label>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-semibold">
                    {{ pythonEnv.type }}
                  </span>
                  <span class="text-xs text-slate-600 font-mono">{{ pythonEnv.envName }}</span>
                </div>
              </div>

              <!-- Binary Executable Path -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Executable Binary</label>
                  <button
                    type="button"
                    @click="copyPath(pythonEnv.executablePath, 'binary')"
                    class="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Check v-if="copiedKey === 'binary'" class="w-3 h-3 text-emerald-600" />
                    <Copy v-else class="w-3 h-3" />
                    <span>{{ copiedKey === 'binary' ? 'Copied' : 'Copy' }}</span>
                  </button>
                </div>
                <div class="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-md border border-slate-200 break-all select-all">
                  {{ pythonEnv.executablePath }}
                </div>
              </div>

              <!-- Prefix Directory -->
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Environment Prefix</label>
                <div class="font-mono text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 break-all select-all mt-0.5">
                  {{ pythonEnv.envPrefix }}
                </div>
              </div>
            </div>

            <!-- Quick Action Links -->
            <div class="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                type="button"
                @click="openConfigModal"
                class="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal class="w-3.5 h-3.5" />
                <span>Switch Environment</span>
              </button>

              <button
                type="button"
                @click="resetEnvironment"
                class="text-slate-400 hover:text-red-600 transition-colors text-[11px] cursor-pointer"
                title="Unbind current interpreter"
              >
                Unbind
              </button>
            </div>
          </div>

          <!-- ── RIGHT COLUMN: Installed Packages & Installer (7 Cols) ── -->
          <div class="lg:col-span-7 p-5 space-y-4 flex flex-col justify-between">
            <div class="space-y-3.5">
              <!-- Top Header: Search & Count -->
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Installed Packages</span>
                  <span class="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-mono font-semibold border border-slate-200">
                    {{ filteredPackages.length }}
                  </span>
                </div>

                <!-- Package Search Input -->
                <div class="relative w-48">
                  <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    v-model="packageQuery"
                    type="text"
                    placeholder="Filter packages..."
                    class="w-full pl-8 pr-2.5 py-1 text-xs border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              <!-- Installed Packages Scrollable List -->
              <div class="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-[190px] overflow-y-auto divide-y divide-slate-100">
                <div
                  v-for="pkg in filteredPackages"
                  :key="pkg.name"
                  class="px-3 py-2 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-xs"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-semibold text-slate-800">{{ pkg.name }}</span>
                    <span v-if="pkg.isCore" class="text-[9px] font-semibold bg-blue-50 text-blue-600 px-1 py-0.2 rounded border border-blue-200/50">Core</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="font-mono text-[11px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">{{ pkg.version }}</span>
                    <button
                      v-if="!pkg.isCore"
                      type="button"
                      @click="uninstallPackage(pkg.name)"
                      class="text-slate-300 hover:text-red-600 transition-colors p-0.5 rounded"
                      title="Uninstall package"
                    >
                      <Trash2 class="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div v-if="filteredPackages.length === 0" class="py-8 text-center text-xs text-slate-400">
                  No packages match "{{ packageQuery }}".
                </div>
              </div>

              <!-- Quick-Add Essential Big Data Packages -->
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  1-Click Big Data Add-ons
                </label>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="pkgName in ['pyspark', 'delta-spark', 'duckdb', 'pandas', 'psycopg2-binary', 'polars']"
                    :key="pkgName"
                    type="button"
                    @click="installPackage(pkgName)"
                    :disabled="isPackageInstalled(pkgName) || isInstalling"
                    :class="[
                      'px-2.5 py-1 text-[11px] font-mono rounded border transition-all flex items-center gap-1 cursor-pointer',
                      isPackageInstalled(pkgName)
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 shadow-sm'
                    ]"
                  >
                    <Check v-if="isPackageInstalled(pkgName)" class="w-3 h-3 text-emerald-500" />
                    <Plus v-else class="w-3 h-3 text-slate-400" />
                    <span>{{ pkgName }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Install Package Form Bar -->
            <div class="pt-3 border-t border-slate-200">
              <form @submit.prevent="handleCustomInstall" class="flex items-center gap-2">
                <div class="relative flex-1">
                  <input
                    v-model="newPackageName"
                    type="text"
                    placeholder="Install package via pip (e.g. pyarrow, scikit-learn)..."
                    class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 font-mono"
                    :disabled="isInstalling"
                  />
                </div>
                <button
                  type="submit"
                  :disabled="!newPackageName.trim() || isInstalling"
                  class="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all shadow-sm flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  <RefreshCw v-if="isInstalling" class="w-3 h-3 animate-spin" />
                  <Plus v-else class="w-3 h-3" />
                  <span>{{ isInstalling ? 'Installing...' : 'Install' }}</span>
                </button>
              </form>
              <div v-if="installFeedback" class="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 class="w-3 h-3" />
                <span>{{ installFeedback }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ── AUTO-CONFIGURE PROGRESS MODAL (Life-Saver) ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAutoModal"
          class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
        >
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-[480px] max-w-[95vw] flex flex-col overflow-hidden">
            <div class="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Sparkles class="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-800">Auto-Configuring Python Environment</h3>
                <p class="text-[11px] text-slate-500">Creating isolated environment and baseline data engineering packages.</p>
              </div>
            </div>

            <!-- Steps Progress -->
            <div class="p-6 space-y-4">
              <div
                v-for="(step, idx) in autoSteps"
                :key="step.title"
                class="flex items-center gap-3"
              >
                <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  <CheckCircle2 v-if="step.status === 'done'" class="w-5 h-5 text-emerald-600" />
                  <RefreshCw v-else-if="step.status === 'running'" class="w-4 h-4 text-blue-600 animate-spin" />
                  <div v-else class="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
                <div class="flex-1">
                  <div :class="['text-xs font-semibold', step.status === 'done' ? 'text-slate-800' : step.status === 'running' ? 'text-blue-700' : 'text-slate-400']">
                    {{ step.title }}
                  </div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ step.desc }}</div>
                </div>
              </div>
            </div>

            <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                v-if="autoComplete"
                type="button"
                @click="finishAutoConfigure"
                class="px-5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-all cursor-pointer"
              >
                Done &amp; Open Environment
              </button>
              <span v-else class="text-xs text-slate-500 font-medium">Please wait...</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── MANUAL INTERPRETER CONFIGURATION MODAL (PyCharm Style) ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showConfigModal"
          class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
          @click.self="showConfigModal = false"
        >
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-[680px] max-w-[95vw] flex flex-col overflow-hidden max-h-[90vh]">
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div class="flex items-center gap-2.5">
                <img :src="pythonIcon" alt="Python" class="w-5 h-5 object-contain" />
                <span class="font-bold text-slate-800 text-sm tracking-tight">Configure Python Interpreter</span>
              </div>
              <button
                type="button"
                @click="showConfigModal = false"
                class="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Left / Right Layout -->
            <div class="flex flex-1 overflow-hidden min-h-[360px]">
              <!-- Left Sidebar -->
              <div class="w-48 bg-slate-50 border-r border-slate-200 p-2 space-y-1 flex-shrink-0">
                <button
                  type="button"
                  @click="ideTab = 'system'"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer',
                    ideTab === 'system' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'
                  ]"
                >
                  <span>System Interpreter</span>
                  <ChevronRight class="w-3.5 h-3.5 opacity-70" />
                </button>

                <button
                  type="button"
                  @click="ideTab = 'venv'"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer',
                    ideTab === 'venv' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'
                  ]"
                >
                  <span>Virtualenv (venv)</span>
                  <ChevronRight class="w-3.5 h-3.5 opacity-70" />
                </button>

                <button
                  type="button"
                  @click="ideTab = 'conda'"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer',
                    ideTab === 'conda' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'
                  ]"
                >
                  <span>Conda / Mamba</span>
                  <ChevronRight class="w-3.5 h-3.5 opacity-70" />
                </button>

                <button
                  type="button"
                  @click="ideTab = 'custom'"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer',
                    ideTab === 'custom' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'
                  ]"
                >
                  <span>Custom Executable</span>
                  <ChevronRight class="w-3.5 h-3.5 opacity-70" />
                </button>
              </div>

              <!-- Right Panel -->
              <div class="flex-1 p-5 overflow-y-auto space-y-4">
                <!-- System Tab -->
                <div v-if="ideTab === 'system'" class="space-y-4">
                  <div>
                    <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wide">Detected Host System Interpreters</h3>
                    <p class="text-[11px] text-slate-500 mt-0.5">Select a Python binary installed in standard Linux host system paths.</p>
                  </div>

                  <div class="space-y-2">
                    <label
                      v-for="item in detectedSystemInterpreters"
                      :key="item.path"
                      :class="[
                        'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                        form.selectedPath === item.path ? 'bg-blue-50/60 border-blue-500 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'
                      ]"
                    >
                      <input
                        type="radio"
                        name="system_interp"
                        :value="item.path"
                        v-model="form.selectedPath"
                        class="mt-1 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div class="flex-1">
                        <div class="flex items-center justify-between">
                          <span class="text-xs font-bold text-slate-800">{{ item.name }}</span>
                          <span class="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            {{ item.version }}
                          </span>
                        </div>
                        <div class="font-mono text-[11px] text-slate-500 mt-0.5">{{ item.path }}</div>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Virtualenv Tab -->
                <div v-if="ideTab === 'venv'" class="space-y-4">
                  <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <button
                      type="button"
                      @click="venvSubTab = 'existing'"
                      :class="[
                        'text-xs font-semibold px-2.5 py-1 rounded transition-colors',
                        venvSubTab === 'existing' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'
                      ]"
                    >
                      Existing Environment
                    </button>
                    <button
                      type="button"
                      @click="venvSubTab = 'new'"
                      :class="[
                        'text-xs font-semibold px-2.5 py-1 rounded transition-colors',
                        venvSubTab === 'new' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'
                      ]"
                    >
                      New Environment
                    </button>
                  </div>

                  <div v-if="venvSubTab === 'existing'" class="space-y-3">
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-700 mb-1">Virtualenv Python Executable</label>
                      <div class="flex items-center gap-2">
                        <input
                          v-model="form.existingVenvPath"
                          type="text"
                          class="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="/home/user/.venv/bin/python"
                        />
                        <button
                          type="button"
                          @click="browseFolder(p => form.existingVenvPath = p)"
                          class="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <FolderOpen class="w-3.5 h-3.5 text-blue-600" />
                          <span>Browse</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-else class="space-y-3">
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-700 mb-1">Environment Location</label>
                      <div class="flex items-center gap-2">
                        <input
                          v-model="form.newVenvLocation"
                          type="text"
                          class="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="/home/user/.deloc/venvs/deloc-py310"
                        />
                        <button
                          type="button"
                          @click="browseFolder(p => form.newVenvLocation = p)"
                          class="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <FolderOpen class="w-3.5 h-3.5 text-blue-600" />
                          <span>Browse</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-700 mb-1">Base Interpreter</label>
                      <select
                        v-model="form.newVenvBasePython"
                        class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none font-mono"
                      >
                        <option v-for="item in detectedSystemInterpreters" :key="item.path" :value="item.path">
                          {{ item.name }} ({{ item.path }})
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Conda Tab -->
                <div v-if="ideTab === 'conda'" class="space-y-4">
                  <div>
                    <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wide">Conda / Anaconda</h3>
                    <p class="text-[11px] text-slate-500 mt-0.5">Use an active Conda or Mamba environment.</p>
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-700 mb-1">Conda Python Executable</label>
                    <div class="flex items-center gap-2">
                      <input
                        v-model="form.condaPath"
                        type="text"
                        class="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="/home/user/miniconda3/bin/python"
                      />
                      <button
                        type="button"
                        @click="browseFolder(p => form.condaPath = p)"
                        class="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <FolderOpen class="w-3.5 h-3.5 text-blue-600" />
                        <span>Browse</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Custom Executable Tab -->
                <div v-if="ideTab === 'custom'" class="space-y-4">
                  <div>
                    <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wide">Custom Binary Path</h3>
                    <p class="text-[11px] text-slate-500 mt-0.5">Directly specify any valid Python 3 executable on your Linux machine.</p>
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-700 mb-1">Executable Path</label>
                    <div class="flex items-center gap-2">
                      <input
                        v-model="form.customPath"
                        type="text"
                        class="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="/opt/my-python/bin/python3"
                      />
                      <button
                        type="button"
                        @click="browseFolder(p => form.customPath = p)"
                        class="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <FolderOpen class="w-3.5 h-3.5 text-blue-600" />
                        <span>Browse</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-100">
              <div class="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                {{ currentTargetExecutable || 'Select an interpreter' }}
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="showConfigModal = false"
                  class="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  @click="applyManualInterpreter"
                  class="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm cursor-pointer"
                >
                  Apply &amp; Select
                </button>
              </div>
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
  Puzzle, Layers, RefreshCw, SlidersHorizontal, Check, Copy, FolderOpen, X, ChevronRight, CircleAlert, CheckCircle2, Search, Plus, Trash2, Sparkles
} from 'lucide-vue-next'
import pythonIcon from '../assets/icons/python.svg'
import { SelectDirectory } from '../../wailsjs/go/bindings/Service.js'
import { ClipboardSetText } from '../../wailsjs/runtime/runtime.js'

// Master State: Is Python environment active/configured?
const isConfigured = ref(true)
const isScanning = ref(false)
const copiedKey = ref(null)

// Auto-Configure Progress Modal State
const showAutoModal = ref(false)
const autoComplete = ref(false)
const autoSteps = ref([
  { title: 'Locate stable Python 3 runtime', desc: 'Discovered /usr/bin/python3 (Python 3.10.12)', status: 'pending' },
  { title: 'Create isolated virtual environment', desc: 'Target: ~/.deloc/python-env', status: 'pending' },
  { title: 'Bootstrap pip & setuptools', desc: 'Upgrading to latest secure packaging toolchain', status: 'pending' },
  { title: 'Install core Big Data packages', desc: 'pyspark, delta-spark, duckdb, psycopg2-binary', status: 'pending' },
])

// Manual Modal State
const showConfigModal = ref(false)
const ideTab = ref('system') // 'system' | 'venv' | 'conda' | 'custom'
const venvSubTab = ref('existing') // 'existing' | 'new'

// Active Configured Environment Model
const pythonEnv = ref({
  version: 'Python 3.10.12',
  type: 'Virtualenv',
  typeLabel: 'venv (deloc-env)',
  envName: 'deloc-env',
  executablePath: '/home/koushik/.deloc/python-env/bin/python',
  envPrefix: '/home/koushik/.deloc/python-env',
})

// Installed Packages List
const packages = ref([
  { name: 'pip', version: '24.0', isCore: true },
  { name: 'setuptools', version: '69.5.1', isCore: true },
  { name: 'pyspark', version: '3.5.1', isCore: false },
  { name: 'delta-spark', version: '3.2.0', isCore: false },
  { name: 'duckdb', version: '1.0.0', isCore: false },
  { name: 'pyarrow', version: '16.1.0', isCore: false },
  { name: 'pandas', version: '2.2.2', isCore: false },
  { name: 'psycopg2-binary', version: '2.9.9', isCore: false },
])

// Package Search / Filter
const packageQuery = ref('')
const filteredPackages = computed(() => {
  if (!packageQuery.value) return packages.value
  const q = packageQuery.value.toLowerCase()
  return packages.value.filter(p => p.name.toLowerCase().includes(q))
})

// Inline Installer Form
const newPackageName = ref('')
const isInstalling = ref(false)
const installFeedback = ref('')

function isPackageInstalled(name) {
  return packages.value.some(p => p.name.toLowerCase() === name.toLowerCase())
}

function installPackage(name) {
  if (isPackageInstalled(name)) return
  isInstalling.value = true
  installFeedback.value = ''
  setTimeout(() => {
    packages.value.push({
      name: name,
      version: 'latest',
      isCore: false
    })
    isInstalling.value = false
    installFeedback.value = `Package '${name}' installed successfully!`
    setTimeout(() => {
      installFeedback.value = ''
    }, 2500)
  }, 900)
}

function handleCustomInstall() {
  const name = newPackageName.value.trim()
  if (!name) return
  installPackage(name)
  newPackageName.value = ''
}

function uninstallPackage(name) {
  packages.value = packages.value.filter(p => p.name !== name)
}

// Detected System Interpreters
const detectedSystemInterpreters = ref([
  { name: 'Python 3.10 (Host System)', path: '/usr/bin/python3', version: '3.10.12' },
  { name: 'Python 3.10 (Direct binary)', path: '/usr/bin/python3.10', version: '3.10.12' },
])

// Manual Form State
const form = ref({
  selectedPath: '/usr/bin/python3',
  existingVenvPath: '',
  newVenvLocation: '/home/koushik/.deloc/venvs/deloc-py310',
  newVenvBasePython: '/usr/bin/python3',
  condaPath: '',
  customPath: '',
})

const currentTargetExecutable = computed(() => {
  if (ideTab.value === 'system') return form.value.selectedPath
  if (ideTab.value === 'venv') {
    return venvSubTab.value === 'existing'
      ? form.value.existingVenvPath
      : `${form.value.newVenvLocation}/bin/python`
  }
  if (ideTab.value === 'conda') return form.value.condaPath
  if (ideTab.value === 'custom') return form.value.customPath
  return ''
})

// ── Auto-Configure Runner (The Life Saver) ──
function startAutoConfigure() {
  showAutoModal.value = true
  autoComplete.value = false
  autoSteps.value.forEach(s => s.status = 'pending')

  // Step 1
  autoSteps.value[0].status = 'running'
  setTimeout(() => {
    autoSteps.value[0].status = 'done'
    autoSteps.value[1].status = 'running'

    // Step 2
    setTimeout(() => {
      autoSteps.value[1].status = 'done'
      autoSteps.value[2].status = 'running'

      // Step 3
      setTimeout(() => {
        autoSteps.value[2].status = 'done'
        autoSteps.value[3].status = 'running'

        // Step 4
        setTimeout(() => {
          autoSteps.value[3].status = 'done'
          autoComplete.value = true
        }, 800)
      }, 700)
    }, 600)
  }, 500)
}

function finishAutoConfigure() {
  pythonEnv.value = {
    version: 'Python 3.10.12',
    type: 'Virtualenv',
    typeLabel: 'venv (deloc-env)',
    envName: 'deloc-env',
    executablePath: '/home/koushik/.deloc/python-env/bin/python',
    envPrefix: '/home/koushik/.deloc/python-env',
  }
  isConfigured.value = true
  showAutoModal.value = false
}

// ── Manual Modal Handlers ──
function openConfigModal() {
  form.value.selectedPath = pythonEnv.value.executablePath
  showConfigModal.value = true
}

function applyManualInterpreter() {
  const chosen = currentTargetExecutable.value.trim()
  if (!chosen) {
    showConfigModal.value = false
    return
  }

  let type = 'Custom'
  let typeLabel = 'Custom'
  let envName = 'custom'

  if (ideTab.value === 'system') {
    type = 'System'
    typeLabel = 'System Python'
    envName = 'system'
  } else if (ideTab.value === 'venv') {
    type = 'Virtualenv'
    typeLabel = 'venv'
    envName = 'user-venv'
  } else if (ideTab.value === 'conda') {
    type = 'Conda'
    typeLabel = 'Conda'
    envName = 'conda-env'
  }

  pythonEnv.value = {
    version: 'Python 3.10.12',
    type,
    typeLabel,
    envName,
    executablePath: chosen,
    envPrefix: chosen.replace(/\/bin\/python.*$/, ''),
  }

  isConfigured.value = true
  showConfigModal.value = false
}

function resetEnvironment() {
  isConfigured.value = false
}

async function browseFolder(callback) {
  try {
    let chosen = ''
    if (typeof SelectDirectory === 'function') {
      chosen = await SelectDirectory('Select Python Environment Directory')
    } else if (window?.go?.bindings?.Service?.SelectDirectory) {
      chosen = await window.go.bindings.Service.SelectDirectory('Select Python Environment Directory')
    }
    if (chosen) {
      callback(chosen)
    }
  } catch (err) {
    console.warn('Directory chooser error:', err)
  }
}

async function copyPath(text, key) {
  if (!text) return
  try {
    if (typeof ClipboardSetText === 'function') {
      await ClipboardSetText(text)
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    }
    copiedKey.value = key
    setTimeout(() => {
      if (copiedKey.value === key) copiedKey.value = null
    }, 1800)
  } catch (err) {
    console.warn('Copy failed:', err)
  }
}

function scanHost() {
  isScanning.value = true
  setTimeout(() => {
    isScanning.value = false
  }, 600)
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
