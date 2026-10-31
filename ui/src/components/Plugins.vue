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
        <div class="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Python: <strong :class="isConfigured ? 'text-emerald-600' : 'text-amber-600'">{{ isConfigured ? 'Configured' : 'Not Configured' }}</strong></span>
          <span>•</span>
          <span>Scala: <strong :class="isScalaConfigured ? 'text-emerald-600' : 'text-amber-600'">{{ isScalaConfigured ? 'Configured' : 'Not Configured' }}</strong></span>
        </div>
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
            Auto-configure creates an isolated virtual environment at <code>{{ targetVenvDisplay }}</code> and pre-installs DuckDB, PyArrow, Pandas, and PostgreSQL client connectors.
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
                @click="openDisableModal"
                class="text-slate-400 hover:text-rose-600 transition-colors text-[11px] cursor-pointer flex items-center gap-1 font-medium"
                title="Unbind and disable current Python environment"
              >
                <Trash2 class="w-3.5 h-3.5 text-rose-500" />
                <span>Disable Environment</span>
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

      <!-- ── SCALA RUNTIME CARD ── -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        <!-- Card Top Bar -->
        <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/40">
          <div class="flex items-start gap-3.5">
            <!-- Official Scala Vector Icon -->
            <div class="w-12 h-12 rounded-xl bg-white border border-slate-200/80 p-2 shadow-sm flex items-center justify-center flex-shrink-0">
              <img :src="scalaIcon" alt="Scala" class="w-full h-full object-contain" />
            </div>

            <div>
              <div class="flex items-center gap-2.5">
                <h2 class="text-base font-bold text-slate-800 tracking-tight">Scala</h2>
                <span
                  :class="[
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                    isScalaConfigured
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  ]"
                >
                  <span :class="['w-1.5 h-1.5 rounded-full', isScalaConfigured ? 'bg-emerald-500' : 'bg-amber-500']"></span>
                  {{ isScalaConfigured ? 'Configured' : 'Not Configured' }}
                </span>
                <span v-if="isScalaConfigured" class="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium border border-slate-200">
                  Scala {{ scalaEnv.version }}
                </span>
                <span v-if="isScalaConfigured && scalaEnv.targetSpark" class="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium border border-blue-200">
                  Spark {{ scalaEnv.targetSpark }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                Compiler, SBT build toolchain, and Apache Spark compatibility environment for high-throughput distributed pipelines.
              </p>
            </div>
          </div>

          <!-- Top Action Buttons -->
          <div class="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
            <button
              v-if="isScalaConfigured"
              type="button"
              @click="openScalaConfigModal"
              class="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal class="w-3.5 h-3.5 text-slate-600" />
              <span>Change SDK</span>
            </button>
          </div>
        </div>

        <!-- ── STATE A: NOT CONFIGURED (Hero Setup Prompt) ── -->
        <div v-if="!isScalaConfigured" class="p-8 text-center flex flex-col items-center justify-center bg-slate-50/20">
          <div class="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 shadow-sm">
            <CircleAlert class="w-6 h-6" />
          </div>
          <h3 class="text-sm font-bold text-slate-800">No Scala Environment Configured</h3>
          <p class="text-xs text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
            DELoc requires a Scala compiler and SBT build tool to compile, package, and execute Spark jobs and lakehouse analytical transformations. You can let DELoc configure your local environment automatically or point to an existing host SDK.
          </p>

          <div class="flex flex-wrap items-center justify-center gap-3">
            <!-- Button 1: Auto-Configure (The Life-Saver) -->
            <button
              type="button"
              @click="startAutoConfigureScala"
              class="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles class="w-4 h-4 text-yellow-300" />
              <span>Auto-Configure Scala (Recommended)</span>
            </button>

            <!-- Button 2: Manual Configure -->
            <button
              type="button"
              @click="openScalaConfigModal"
              class="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal class="w-3.5 h-3.5 text-slate-600" />
              <span>Configure Manually...</span>
            </button>
          </div>

          <p class="text-[11px] text-slate-400 mt-4">
            Auto-configure provisions Scala runtime and SBT toolchain under <code>{{ targetScalaDisplay }}</code> targeting Apache Spark 3.5.1 compatibility.
          </p>
        </div>

        <!-- ── STATE B: CONFIGURED (Split 2-Column Layout) ── -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          <!-- ── LEFT COLUMN: Scala SDK Info (5 Cols) ── -->
          <div class="lg:col-span-5 p-5 space-y-4 bg-slate-50/30 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">SDK &amp; Toolchain Details</span>
                <span class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 class="w-3.5 h-3.5" /> Healthy
                </span>
              </div>

              <!-- Version & Runtime -->
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scala Compiler Version</label>
                <div class="text-sm font-bold text-slate-800 mt-0.5">
                  {{ scalaEnv.version }}
                </div>
                <span class="text-[11px] text-slate-500">Linux x86_64 / HotSpot JVM</span>
              </div>

              <!-- Build Tool & Spark -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Build Tool (SBT)</label>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold font-mono">
                      sbt {{ scalaEnv.sbtVersion || '1.9.9' }}
                    </span>
                  </div>
                </div>

                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Spark</label>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-semibold font-mono">
                      Spark {{ scalaEnv.targetSpark || '3.5.1' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Binary Executable Path -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scala Executable</label>
                  <button
                    type="button"
                    @click="copyPath(scalaEnv.executablePath, 'scala-bin')"
                    class="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Check v-if="copiedKey === 'scala-bin'" class="w-3 h-3 text-emerald-600" />
                    <Copy v-else class="w-3 h-3" />
                    <span>{{ copiedKey === 'scala-bin' ? 'Copied' : 'Copy' }}</span>
                  </button>
                </div>
                <div class="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-md border border-slate-200 break-all select-all">
                  {{ scalaEnv.executablePath || 'Auto-resolved from host PATH' }}
                </div>
              </div>

              <!-- SBT Path -->
              <div v-if="scalaEnv.sbtPath">
                <div class="flex items-center justify-between mb-1">
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SBT Executable</label>
                  <button
                    type="button"
                    @click="copyPath(scalaEnv.sbtPath, 'sbt-bin')"
                    class="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Check v-if="copiedKey === 'sbt-bin'" class="w-3 h-3 text-emerald-600" />
                    <Copy v-else class="w-3 h-3" />
                    <span>{{ copiedKey === 'sbt-bin' ? 'Copied' : 'Copy' }}</span>
                  </button>
                </div>
                <div class="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-md border border-slate-200 break-all select-all">
                  {{ scalaEnv.sbtPath }}
                </div>
              </div>

              <!-- Install Directory -->
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Install Directory</label>
                <div class="font-mono text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 break-all select-all mt-0.5">
                  {{ scalaEnv.installDir || targetScalaDisplay }}
                </div>
              </div>
            </div>

            <!-- Quick Action Links -->
            <div class="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                type="button"
                @click="openScalaConfigModal"
                class="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal class="w-3.5 h-3.5" />
                <span>Switch SDK</span>
              </button>

              <button
                type="button"
                @click="openScalaDisableModal"
                class="text-slate-400 hover:text-rose-600 transition-colors text-[11px] cursor-pointer flex items-center gap-1 font-medium"
                title="Unbind and disable current Scala environment"
              >
                <Trash2 class="w-3.5 h-3.5 text-rose-500" />
                <span>Disable Environment</span>
              </button>
            </div>
          </div>

          <!-- ── RIGHT COLUMN: Compatibility Matrix & Build Details (7 Cols) ── -->
          <div class="lg:col-span-7 p-5 space-y-4 flex flex-col justify-between">
            <div class="space-y-4">
              <!-- Header -->
              <div class="flex items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Ecosystem Compatibility Matrix</span>
                  <span class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono font-semibold border border-blue-200">
                    Spark 3.5.x LTS Target
                  </span>
                </div>
                <span class="text-[11px] text-slate-400 font-medium">config/scala.json</span>
              </div>

              <!-- Matrix Table -->
              <div class="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                      <th class="py-2.5 px-3">Scala</th>
                      <th class="py-2.5 px-3">Compatible SBT</th>
                      <th class="py-2.5 px-3">Java (JDK)</th>
                      <th class="py-2.5 px-3">Target Spark</th>
                      <th class="py-2.5 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-mono">
                    <tr class="hover:bg-blue-50/40 transition-colors bg-blue-50/20">
                      <td class="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>2.12.18</span>
                        <span class="text-[9px] font-sans font-bold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded border border-emerald-200 ml-1">Spark Core</span>
                      </td>
                      <td class="py-2.5 px-3 text-slate-600">1.9.9, 1.10.1</td>
                      <td class="py-2.5 px-3 text-slate-600">8, 11, 17</td>
                      <td class="py-2.5 px-3 text-blue-700 font-semibold">3.5.1</td>
                      <td class="py-2.5 px-3 font-sans text-[11px] text-slate-500">Default binary release for Spark 3.5.x</td>
                    </tr>
                    <tr class="hover:bg-slate-50/80 transition-colors">
                      <td class="py-2.5 px-3 font-semibold text-slate-800">2.13.13</td>
                      <td class="py-2.5 px-3 text-slate-600">1.9.9, 1.10.1</td>
                      <td class="py-2.5 px-3 text-slate-600">8, 11, 17, 21</td>
                      <td class="py-2.5 px-3 text-slate-700">3.5.1</td>
                      <td class="py-2.5 px-3 font-sans text-[11px] text-slate-500">Modern Scala 2 ecosystem target</td>
                    </tr>
                    <tr class="hover:bg-slate-50/80 transition-colors">
                      <td class="py-2.5 px-3 font-semibold text-slate-800">3.3.3</td>
                      <td class="py-2.5 px-3 text-slate-600">1.9.9, 1.10.1</td>
                      <td class="py-2.5 px-3 text-slate-600">11, 17, 21</td>
                      <td class="py-2.5 px-3 text-amber-700 font-semibold">Experimental</td>
                      <td class="py-2.5 px-3 font-sans text-[11px] text-slate-500">Scala 3 LTS for standalone microservices</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Quick Build Command Reference -->
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  SBT Build Toolchain Reference
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <div class="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                    <span class="font-mono text-xs font-bold text-slate-800">sbt compile</span>
                    <span class="text-[10px] text-slate-500 mt-1">Incremental typecheck and compilation</span>
                  </div>
                  <div class="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                    <span class="font-mono text-xs font-bold text-slate-800">sbt package</span>
                    <span class="text-[10px] text-slate-500 mt-1">Build application JAR for Spark submission</span>
                  </div>
                  <div class="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                    <span class="font-mono text-xs font-bold text-slate-800">sbt test</span>
                    <span class="text-[10px] text-slate-500 mt-1">Execute test suites &amp; pipeline assertions</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer info notice -->
            <div class="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span class="flex items-center gap-1.5">
                <Terminal class="w-3.5 h-3.5 text-slate-500" />
                <span>Compatible with DELoc interactive notebook shells &amp; JAR jobs</span>
              </span>
              <span class="font-mono text-[10px] text-slate-500">Scala SDK 2.12.18 / sbt 1.9.9</span>
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

            <div v-if="autoError" class="mx-6 mb-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-mono">
              {{ autoError }}
            </div>

            <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                v-if="autoError"
                type="button"
                @click="showAutoModal = false"
                class="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-100 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                v-if="autoComplete"
                type="button"
                @click="finishAutoConfigure"
                class="px-5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-all cursor-pointer"
              >
                Done &amp; Open Environment
              </button>
              <span v-else-if="!autoError" class="text-xs text-slate-500 font-medium">Please wait...</span>
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

    <!-- ── Disable Python Environment Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="disableModal.isOpen"
          class="fixed inset-0 z-[220] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 select-none"
          @click.self="!disableModal.isLoading && (disableModal.isOpen = false)"
        >
          <div class="bg-white rounded-xl shadow-2xl border border-rose-200 w-[440px] max-w-[95vw] flex flex-col overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-3.5 border-b border-rose-100 bg-rose-50/70">
              <div class="flex items-center gap-2.5">
                <div class="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Trash2 class="w-3.5 h-3.5" />
                </div>
                <span class="font-bold text-slate-800 text-sm tracking-tight">Disable Python Environment</span>
              </div>
              <button
                v-if="!disableModal.isLoading"
                @click="disableModal.isOpen = false"
                class="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded hover:bg-rose-100/60 cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-5 flex flex-col gap-3.5">
              <p class="text-xs text-slate-600 leading-relaxed">
                Disabling will unbind the current Python environment from DELoc and reset its configuration state.
              </p>

              <!-- Delete Virtualenv Checkbox if it's a managed venv -->
              <label v-if="pythonEnv.type === 'Virtualenv' && pythonEnv.envPrefix" class="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  v-model="disableModal.deleteFiles"
                  :disabled="disableModal.isLoading"
                  class="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer shrink-0"
                />
                <div class="flex flex-col">
                  <span class="text-xs font-semibold text-slate-700">Delete Virtual Environment Directory</span>
                  <span class="text-[10.5px] text-slate-500 font-mono break-all">{{ pythonEnv.envPrefix }}</span>
                </div>
              </label>

              <!-- Error display if any -->
              <div v-if="disableModal.error" class="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 font-mono">
                {{ disableModal.error }}
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                @click="disableModal.isOpen = false"
                :disabled="disableModal.isLoading"
                class="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 rounded transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="confirmDisablePython"
                :disabled="disableModal.isLoading"
                class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded transition-colors shadow-sm cursor-pointer disabled:opacity-75"
              >
                <RefreshCw v-if="disableModal.isLoading" class="w-3 h-3 animate-spin" />
                <Trash2 v-else class="w-3 h-3" />
                <span>{{ disableModal.isLoading ? 'Disabling...' : 'Disable & Unbind' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── SCALA AUTO-CONFIGURE PROGRESS MODAL ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showScalaAutoModal"
          class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
        >
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-[480px] max-w-[95vw] flex flex-col overflow-hidden">
            <div class="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Sparkles class="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-800">Auto-Configuring Scala Environment</h3>
                <p class="text-[11px] text-slate-500">Configuring Scala runtime, SBT toolchain, and Spark compatibility.</p>
              </div>
            </div>

            <!-- Steps Progress -->
            <div class="p-6 space-y-4">
              <div
                v-for="step in scalaAutoSteps"
                :key="step.title"
                class="flex items-center gap-3"
              >
                <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  <CheckCircle2 v-if="step.status === 'done'" class="w-5 h-5 text-emerald-600" />
                  <RefreshCw v-else-if="step.status === 'running'" class="w-4 h-4 text-red-600 animate-spin" />
                  <div v-else class="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
                <div class="flex-1">
                  <div :class="['text-xs font-semibold', step.status === 'done' ? 'text-slate-800' : step.status === 'running' ? 'text-red-700' : 'text-slate-400']">
                    {{ step.title }}
                  </div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ step.desc }}</div>
                </div>
              </div>
            </div>

            <div v-if="scalaAutoError" class="mx-6 mb-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-mono">
              {{ scalaAutoError }}
            </div>

            <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                v-if="scalaAutoError"
                type="button"
                @click="showScalaAutoModal = false"
                class="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-100 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                v-if="scalaAutoComplete"
                type="button"
                @click="showScalaAutoModal = false"
                class="px-5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-all cursor-pointer"
              >
                Done &amp; Open Environment
              </button>
              <span v-else-if="!scalaAutoError" class="text-xs text-slate-500 font-medium">Please wait...</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── MANUAL SCALA SDK CONFIGURATION MODAL ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showScalaConfigModal"
          class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
          @click.self="showScalaConfigModal = false"
        >
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-[640px] max-w-[95vw] flex flex-col overflow-hidden max-h-[90vh]">
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div class="flex items-center gap-2.5">
                <img :src="scalaIcon" alt="Scala" class="w-5 h-5 object-contain" />
                <span class="font-bold text-slate-800 text-sm tracking-tight">Configure Scala SDK &amp; Toolchain</span>
              </div>
              <button
                type="button"
                @click="showScalaConfigModal = false"
                class="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Left / Right Layout -->
            <div class="flex flex-1 overflow-hidden min-h-[300px]">
              <!-- Left Sidebar -->
              <div class="w-44 bg-slate-50 border-r border-slate-200 p-2 space-y-1 flex-shrink-0">
                <button
                  type="button"
                  @click="scalaIdeTab = 'system'"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer',
                    scalaIdeTab === 'system' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'
                  ]"
                >
                  <span>Detected SDKs</span>
                  <ChevronRight class="w-3.5 h-3.5 opacity-70" />
                </button>

                <button
                  type="button"
                  @click="scalaIdeTab = 'custom'"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer',
                    scalaIdeTab === 'custom' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'
                  ]"
                >
                  <span>Custom Binaries</span>
                  <ChevronRight class="w-3.5 h-3.5 opacity-70" />
                </button>
              </div>

              <!-- Right Panel -->
              <div class="flex-1 p-5 overflow-y-auto space-y-4">
                <!-- System Detected Tab -->
                <div v-if="scalaIdeTab === 'system'" class="space-y-4">
                  <div>
                    <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wide">Detected Host Scala SDKs</h3>
                    <p class="text-[11px] text-slate-500 mt-0.5">Found via system PATH, SDKMAN, or Coursier installations.</p>
                  </div>

                  <div v-if="detectedScalaList.length > 0" class="space-y-2">
                    <label
                      v-for="sdk in detectedScalaList"
                      :key="sdk.path"
                      class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                      :class="scalaForm.selectedPath === sdk.path ? 'border-red-500 bg-red-50/20' : ''"
                    >
                      <input
                        type="radio"
                        name="detected-scala"
                        :value="sdk.path"
                        v-model="scalaForm.selectedPath"
                        class="accent-red-600 cursor-pointer"
                      />
                      <div class="flex-1">
                        <div class="text-xs font-semibold text-slate-800 flex items-center gap-2">
                          <span>Scala {{ sdk.version }}</span>
                          <span class="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">{{ sdk.type }}</span>
                          <span v-if="sdk.sbtVersion" class="text-[10px] font-mono px-1.5 py-0.2 bg-red-50 text-red-700 rounded border border-red-200">sbt {{ sdk.sbtVersion }}</span>
                        </div>
                        <div class="text-[10.5px] font-mono text-slate-500 truncate mt-0.5">{{ sdk.path }}</div>
                      </div>
                    </label>
                  </div>

                  <div v-else class="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-lg">
                    No system Scala binaries found on PATH. Use Custom Binaries to specify paths or use Auto-Configure.
                  </div>
                </div>

                <!-- Custom Binaries Tab -->
                <div v-if="scalaIdeTab === 'custom'" class="space-y-4">
                  <div>
                    <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wide">Custom Executable Paths</h3>
                    <p class="text-[11px] text-slate-500 mt-0.5">Specify absolute paths to your Scala compiler and SBT binaries.</p>
                  </div>

                  <div>
                    <label class="block text-[11px] font-semibold text-slate-700 mb-1">Scala Executable Path</label>
                    <div class="flex items-center gap-2">
                      <input
                        v-model="scalaForm.customExecPath"
                        type="text"
                        class="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                        placeholder="/usr/bin/scala or ~/.sdkman/candidates/scala/current/bin/scala"
                      />
                      <button
                        type="button"
                        @click="browseFolder(p => scalaForm.customExecPath = p)"
                        class="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <FolderOpen class="w-3.5 h-3.5 text-red-600" />
                        <span>Browse</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="block text-[11px] font-semibold text-slate-700 mb-1">SBT Executable Path (Optional)</label>
                    <div class="flex items-center gap-2">
                      <input
                        v-model="scalaForm.customSbtPath"
                        type="text"
                        class="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                        placeholder="/usr/bin/sbt or ~/.sdkman/candidates/sbt/current/bin/sbt"
                      />
                      <button
                        type="button"
                        @click="browseFolder(p => scalaForm.customSbtPath = p)"
                        class="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <FolderOpen class="w-3.5 h-3.5 text-red-600" />
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
                {{ currentScalaTargetExecutable || 'Select an SDK' }}
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="showScalaConfigModal = false"
                  class="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  @click="applyManualScala"
                  class="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm cursor-pointer"
                >
                  Apply &amp; Select
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── SCALA DISABLE ENVIRONMENT MODAL ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="scalaDisableModal.isOpen"
          class="fixed inset-0 z-[220] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 select-none"
          @click.self="!scalaDisableModal.isLoading && (scalaDisableModal.isOpen = false)"
        >
          <div class="bg-white rounded-xl shadow-2xl border border-rose-200 w-[440px] max-w-[95vw] flex flex-col overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-3.5 border-b border-rose-100 bg-rose-50/70">
              <div class="flex items-center gap-2.5">
                <div class="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Trash2 class="w-3.5 h-3.5" />
                </div>
                <span class="font-bold text-slate-800 text-sm tracking-tight">Disable Scala Environment</span>
              </div>
              <button
                v-if="!scalaDisableModal.isLoading"
                @click="scalaDisableModal.isOpen = false"
                class="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded hover:bg-rose-100/60 cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-5 flex flex-col gap-3.5">
              <p class="text-xs text-slate-600 leading-relaxed">
                Disabling will unbind the current Scala SDK and SBT toolchain from DELoc and reset its configuration state.
              </p>

              <!-- Delete Directory Checkbox if configured -->
              <label v-if="scalaEnv.installDir" class="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  v-model="scalaDisableModal.deleteFiles"
                  :disabled="scalaDisableModal.isLoading"
                  class="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer shrink-0"
                />
                <div class="flex flex-col">
                  <span class="text-xs font-semibold text-slate-700">Delete Local Scala Directory</span>
                  <span class="text-[10.5px] text-slate-500 font-mono break-all">{{ scalaEnv.installDir }}</span>
                </div>
              </label>

              <!-- Error display if any -->
              <div v-if="scalaDisableModal.error" class="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 font-mono">
                {{ scalaDisableModal.error }}
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                @click="scalaDisableModal.isOpen = false"
                :disabled="scalaDisableModal.isLoading"
                class="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 rounded transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="confirmDisableScala"
                :disabled="scalaDisableModal.isLoading"
                class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded transition-colors shadow-sm cursor-pointer disabled:opacity-75"
              >
                <RefreshCw v-if="scalaDisableModal.isLoading" class="w-3 h-3 animate-spin" />
                <Trash2 v-else class="w-3 h-3" />
                <span>{{ scalaDisableModal.isLoading ? 'Disabling...' : 'Disable & Unbind' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Puzzle, Layers, RefreshCw, SlidersHorizontal, Check, Copy, FolderOpen, X, ChevronRight, CircleAlert, CheckCircle2, Search, Plus, Trash2, Sparkles, Terminal, HardDrive
} from 'lucide-vue-next'
import pythonIcon from '../assets/icons/python.svg'
import scalaIcon from '../assets/icons/scala.svg'
import {
  SelectDirectory,
  GetAppSettings,
  GetPythonState,
  AutoConfigurePython,
  ConfigureManualPython,
  DisablePython,
  ScanHostPython,
  InstallPythonPackage,
  UninstallPythonPackage,
  GetScalaState,
  AutoConfigureScala,
  ConfigureManualScala,
  DisableScala,
  ScanHostScala
} from '../../wailsjs/go/bindings/Service.js'
import { ClipboardSetText, EventsOn } from '../../wailsjs/runtime/runtime.js'

// Master State: Is Python environment active/configured?
const isConfigured = ref(false)
const isScalaConfigured = ref(false)
const isScanning = ref(false)
const copiedKey = ref(null)

// Root Volume Path for runtimes
const rootVolumeDir = ref('~/.deloc/data')
const targetVenvDisplay = computed(() => `${rootVolumeDir.value}/python/deloc-env`)
const targetScalaDisplay = computed(() => `${rootVolumeDir.value}/scala`)

// Active Configured Scala Model
const scalaEnv = ref({
  version: '',
  sbtVersion: '',
  installDir: '',
  executablePath: '',
  sbtPath: '',
  targetSpark: '',
})

// Detected Scala on Host
const detectedScalaList = ref([])

// Scala Auto-Configure Modal State
const showScalaAutoModal = ref(false)
const scalaAutoComplete = ref(false)
const scalaAutoError = ref('')
const scalaAutoSteps = ref([
  { title: 'Locate Java / JVM runtime on host', desc: 'Validating JDK 8, 11, or 17 environment', status: 'pending' },
  { title: 'Provision isolated Scala runtime directory', desc: 'Target: ~/.deloc/data/scala', status: 'pending' },
  { title: 'Configure SBT build toolchain & local cache', desc: 'Target: ~/.deloc/data/scala/sbt', status: 'pending' },
  { title: 'Validate Apache Spark compatibility matrix', desc: 'Scala 2.12.18 / Spark 3.5.1 target', status: 'pending' },
])

// Scala Manual Modal State
const showScalaConfigModal = ref(false)
const scalaIdeTab = ref('system') // 'system' | 'custom'
const scalaForm = ref({
  selectedPath: '',
  sbtPath: '',
  customExecPath: '',
  customSbtPath: '',
})

const currentScalaTargetExecutable = computed(() => {
  if (scalaIdeTab.value === 'system') return scalaForm.value.selectedPath
  if (scalaIdeTab.value === 'custom') return scalaForm.value.customExecPath
  return ''
})

// Scala Disable Modal State
const scalaDisableModal = ref({
  isOpen: false,
  deleteFiles: false,
  isLoading: false,
  error: null,
})

// Auto-Configure Progress Modal State
const showAutoModal = ref(false)
const autoComplete = ref(false)
const autoError = ref('')
const autoSteps = ref([
  { title: 'Locate stable Python 3 runtime on host', desc: 'Checking /usr/bin/python3 and system binaries', status: 'pending' },
  { title: 'Create isolated virtual environment', desc: 'Target: ~/.deloc/data/python/deloc-env', status: 'pending' },
  { title: 'Bootstrap pip & packaging toolchain', desc: 'Upgrading pip and setuptools to latest secure release', status: 'pending' },
  { title: 'Install foundational Big Data packages', desc: 'duckdb, psycopg2-binary, pyarrow, pandas', status: 'pending' },
])

// Disable Environment Modal State
const disableModal = ref({
  isOpen: false,
  deleteFiles: false,
  isLoading: false,
  error: null
})

// Manual Modal State
const showConfigModal = ref(false)
const ideTab = ref('system') // 'system' | 'venv' | 'conda' | 'custom'
const venvSubTab = ref('existing') // 'existing' | 'new'

// Active Configured Environment Model
const pythonEnv = ref({
  version: '',
  type: '',
  typeLabel: '',
  envName: '',
  executablePath: '',
  envPrefix: '',
})

// Installed Packages List
const packages = ref([])

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

// Detected System Interpreters
const detectedSystemInterpreters = ref([])

// Manual Form State
const form = ref({
  selectedPath: '/usr/bin/python3',
  existingVenvPath: '',
  newVenvLocation: '',
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

// ── Settings & State Loader ──
async function loadSettingsAndState() {
  try {
    if (typeof GetAppSettings === 'function') {
      const settings = await GetAppSettings()
      if (settings && settings.rootVolumePath) {
        rootVolumeDir.value = settings.rootVolumePath
        form.value.newVenvLocation = `${settings.rootVolumePath}/python/custom-venv`
      }
    }
  } catch (err) {
    console.warn('Could not load app settings:', err)
  }

  try {
    if (typeof GetPythonState === 'function') {
      const state = await GetPythonState()
      if (state && state.configured) {
        isConfigured.value = true
        pythonEnv.value = state
        packages.value = state.packages || []
      } else {
        isConfigured.value = false
        packages.value = []
        pythonEnv.value = {
          version: '',
          type: '',
          typeLabel: '',
          envName: '',
          executablePath: '',
          envPrefix: '',
        }
      }
    }
  } catch (err) {
    console.warn('Could not load python state:', err)
  }

  try {
    if (typeof GetScalaState === 'function') {
      const state = await GetScalaState()
      if (state && state.configured) {
        isScalaConfigured.value = true
        scalaEnv.value = state
      } else {
        isScalaConfigured.value = false
        scalaEnv.value = {
          version: '',
          sbtVersion: '',
          installDir: '',
          executablePath: '',
          sbtPath: '',
          targetSpark: '',
        }
      }
    }
  } catch (err) {
    console.warn('Could not load scala state:', err)
  }
}

// ── Host Scanner ──
async function scanHost() {
  isScanning.value = true
  try {
    if (typeof ScanHostPython === 'function') {
      const discovered = await ScanHostPython()
      if (discovered && discovered.length > 0) {
        detectedSystemInterpreters.value = discovered.map(d => ({
          name: `${d.version} (${d.type})`,
          path: d.path,
          version: d.version,
          type: d.type
        }))
        if (!form.value.selectedPath && discovered[0]) {
          form.value.selectedPath = discovered[0].path
        }
      }
    }

    if (typeof ScanHostScala === 'function') {
      const discoveredSc = await ScanHostScala()
      if (discoveredSc && discoveredSc.length > 0) {
        detectedScalaList.value = discoveredSc
        if (!scalaForm.value.selectedPath && discoveredSc[0]) {
          scalaForm.value.selectedPath = discoveredSc[0].path
          scalaForm.value.sbtPath = discoveredSc[0].sbtPath || ''
        }
      }
    }
  } catch (err) {
    console.warn('Failed scanning host:', err)
  } finally {
    isScanning.value = false
  }
}

// ── Auto-Configure Runner ──
async function startAutoConfigure() {
  showAutoModal.value = true
  autoComplete.value = false
  autoError.value = ''
  autoSteps.value = [
    { title: 'Locate stable Python 3 runtime on host', desc: 'Checking /usr/bin/python3 and system binaries', status: 'running' },
    { title: 'Create isolated virtual environment', desc: `Target: ${targetVenvDisplay.value}`, status: 'pending' },
    { title: 'Bootstrap pip & packaging toolchain', desc: 'Upgrading pip and setuptools to latest secure release', status: 'pending' },
    { title: 'Install foundational Big Data packages', desc: 'duckdb, psycopg2-binary, pyarrow, pandas', status: 'pending' },
  ]

  // Animation ticks for visual clarity while backend work is executing
  const t1 = setTimeout(() => {
    if (!autoComplete.value && !autoError.value) {
      autoSteps.value[0].status = 'done'
      autoSteps.value[1].status = 'running'
    }
  }, 400)

  const t2 = setTimeout(() => {
    if (!autoComplete.value && !autoError.value) {
      autoSteps.value[1].status = 'done'
      autoSteps.value[2].status = 'running'
    }
  }, 1200)

  try {
    if (typeof AutoConfigurePython === 'function') {
      const res = await AutoConfigurePython()
      clearTimeout(t1)
      clearTimeout(t2)
      if (res && res.configured) {
        autoSteps.value.forEach(s => s.status = 'done')
        autoComplete.value = true
        pythonEnv.value = res
        packages.value = res.packages || []
        isConfigured.value = true
      }
    }
  } catch (err) {
    clearTimeout(t1)
    clearTimeout(t2)
    console.error('Auto configure python failed:', err)
    autoError.value = err?.message || String(err)
    autoSteps.value.forEach(s => {
      if (s.status === 'running') s.status = 'pending'
    })
  }
}

function finishAutoConfigure() {
  showAutoModal.value = false
}

// ── Manual Modal Handlers ──
function openConfigModal() {
  if (pythonEnv.value.executablePath) {
    form.value.selectedPath = pythonEnv.value.executablePath
  }
  showConfigModal.value = true
}

async function applyManualInterpreter() {
  const chosen = currentTargetExecutable.value.trim()
  if (!chosen) {
    showConfigModal.value = false
    return
  }

  let type = 'Custom'
  let envName = 'custom'

  if (ideTab.value === 'system') {
    type = 'System'
    envName = 'system'
  } else if (ideTab.value === 'venv') {
    type = 'Virtualenv'
    envName = 'user-venv'
  } else if (ideTab.value === 'conda') {
    type = 'Conda'
    envName = 'conda'
  }

  try {
    if (typeof ConfigureManualPython === 'function') {
      const res = await ConfigureManualPython(chosen, type, envName)
      if (res && res.configured) {
        pythonEnv.value = res
        packages.value = res.packages || []
        isConfigured.value = true
      }
    }
  } catch (err) {
    console.error('Failed to configure manual interpreter:', err)
  }
  showConfigModal.value = false
}

// ── Disable / Unbind Modal Handlers ──
function openDisableModal() {
  disableModal.value = {
    isOpen: true,
    deleteFiles: pythonEnv.value.type === 'Virtualenv' && Boolean(pythonEnv.value.envPrefix),
    isLoading: false,
    error: null
  }
}

async function confirmDisablePython() {
  disableModal.value.isLoading = true
  disableModal.value.error = null
  try {
    if (typeof DisablePython === 'function') {
      const res = await DisablePython(disableModal.value.deleteFiles)
      if (res && !res.configured) {
        isConfigured.value = false
        packages.value = []
        pythonEnv.value = {
          version: '',
          type: '',
          typeLabel: '',
          envName: '',
          executablePath: '',
          envPrefix: '',
        }
      }
    } else {
      isConfigured.value = false
    }
    disableModal.value.isOpen = false
  } catch (err) {
    console.error('Failed to disable python environment:', err)
    disableModal.value.error = err?.message || String(err)
  } finally {
    disableModal.value.isLoading = false
  }
}

// ── Package Management ──
function isPackageInstalled(name) {
  return packages.value.some(p => p.name.toLowerCase() === name.toLowerCase())
}

async function installPackage(name) {
  if (isPackageInstalled(name)) return
  isInstalling.value = true
  installFeedback.value = ''
  try {
    if (typeof InstallPythonPackage === 'function') {
      const updated = await InstallPythonPackage(name)
      if (updated) {
        packages.value = updated
      }
    } else {
      packages.value.push({ name, version: 'installed', isCore: false })
    }
    installFeedback.value = `Package '${name}' installed successfully!`
  } catch (err) {
    console.error('Package installation error:', err)
    installFeedback.value = `Error: ${err?.message || err}`
  } finally {
    isInstalling.value = false
    setTimeout(() => {
      installFeedback.value = ''
    }, 3000)
  }
}

function handleCustomInstall() {
  const name = newPackageName.value.trim()
  if (!name) return
  installPackage(name)
  newPackageName.value = ''
}

async function uninstallPackage(name) {
  try {
    if (typeof UninstallPythonPackage === 'function') {
      const updated = await UninstallPythonPackage(name)
      if (updated) {
        packages.value = updated
      }
    } else {
      packages.value = packages.value.filter(p => p.name !== name)
    }
  } catch (err) {
    console.error('Failed to uninstall package:', err)
  }
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

// ── Scala Auto-Configure Runner ──
async function startAutoConfigureScala() {
  showScalaAutoModal.value = true
  scalaAutoComplete.value = false
  scalaAutoError.value = ''
  scalaAutoSteps.value = [
    { title: 'Locate Java / JVM runtime on host', desc: 'Validating JDK 8, 11, or 17 environment', status: 'running' },
    { title: 'Provision isolated Scala runtime directory', desc: `Target: ${targetScalaDisplay.value}`, status: 'pending' },
    { title: 'Configure SBT build toolchain & local cache', desc: `Target: ${targetScalaDisplay.value}/sbt`, status: 'pending' },
    { title: 'Validate Apache Spark compatibility matrix', desc: 'Scala 2.12.18 / Spark 3.5.1 target', status: 'pending' },
  ]

  const t1 = setTimeout(() => {
    if (!scalaAutoComplete.value && !scalaAutoError.value) {
      scalaAutoSteps.value[0].status = 'done'
      scalaAutoSteps.value[1].status = 'running'
    }
  }, 400)

  const t2 = setTimeout(() => {
    if (!scalaAutoComplete.value && !scalaAutoError.value) {
      scalaAutoSteps.value[1].status = 'done'
      scalaAutoSteps.value[2].status = 'running'
    }
  }, 1000)

  try {
    if (typeof AutoConfigureScala === 'function') {
      const res = await AutoConfigureScala()
      clearTimeout(t1)
      clearTimeout(t2)
      if (res && res.configured) {
        scalaAutoSteps.value.forEach(s => s.status = 'done')
        scalaAutoComplete.value = true
        scalaEnv.value = res
        isScalaConfigured.value = true
      }
    }
  } catch (err) {
    clearTimeout(t1)
    clearTimeout(t2)
    console.error('Auto configure scala failed:', err)
    scalaAutoError.value = err?.message || String(err)
    scalaAutoSteps.value.forEach(s => {
      if (s.status === 'running') s.status = 'pending'
    })
  }
}

// ── Scala Manual Modal Handlers ──
function openScalaConfigModal() {
  if (scalaEnv.value.executablePath) {
    scalaForm.value.selectedPath = scalaEnv.value.executablePath
  }
  showScalaConfigModal.value = true
}

async function applyManualScala() {
  const chosenExec = currentScalaTargetExecutable.value.trim()
  if (!chosenExec) {
    showScalaConfigModal.value = false
    return
  }

  const chosenSbt = scalaIdeTab.value === 'system'
    ? (detectedScalaList.value.find(s => s.path === chosenExec)?.sbtPath || scalaForm.value.sbtPath || '')
    : scalaForm.value.customSbtPath.trim()

  try {
    if (typeof ConfigureManualScala === 'function') {
      const res = await ConfigureManualScala(chosenExec, chosenSbt)
      if (res && res.configured) {
        scalaEnv.value = res
        isScalaConfigured.value = true
      }
    }
  } catch (err) {
    console.error('Failed to configure manual Scala SDK:', err)
  }
  showScalaConfigModal.value = false
}

// ── Scala Disable Modal Handlers ──
function openScalaDisableModal() {
  scalaDisableModal.value = {
    isOpen: true,
    deleteFiles: Boolean(scalaEnv.value.installDir),
    isLoading: false,
    error: null,
  }
}

async function confirmDisableScala() {
  scalaDisableModal.value.isLoading = true
  scalaDisableModal.value.error = null
  try {
    if (typeof DisableScala === 'function') {
      const res = await DisableScala(scalaDisableModal.value.deleteFiles)
      if (res && !res.configured) {
        isScalaConfigured.value = false
        scalaEnv.value = {
          version: '',
          sbtVersion: '',
          installDir: '',
          executablePath: '',
          sbtPath: '',
          targetSpark: '',
        }
      }
    } else {
      isScalaConfigured.value = false
    }
    scalaDisableModal.value.isOpen = false
  } catch (err) {
    console.error('Failed to disable Scala environment:', err)
    scalaDisableModal.value.error = err?.message || String(err)
  } finally {
    scalaDisableModal.value.isLoading = false
  }
}

onMounted(async () => {
  await loadSettingsAndState()
  await scanHost()

  if (typeof EventsOn === 'function') {
    EventsOn('plugins:python:updated', (state) => {
      if (state && state.configured) {
        isConfigured.value = true
        pythonEnv.value = state
        packages.value = state.packages || []
      } else {
        isConfigured.value = false
        packages.value = []
        pythonEnv.value = {
          version: '',
          type: '',
          typeLabel: '',
          envName: '',
          executablePath: '',
          envPrefix: '',
        }
      }
    })
    EventsOn('plugins:scala:updated', (state) => {
      if (state && state.configured) {
        isScalaConfigured.value = true
        scalaEnv.value = state
      } else {
        isScalaConfigured.value = false
        scalaEnv.value = {
          version: '',
          sbtVersion: '',
          installDir: '',
          executablePath: '',
          sbtPath: '',
          targetSpark: '',
        }
      }
    })
    EventsOn('settings:updated', (settings) => {
      if (settings && settings.rootVolumePath) {
        rootVolumeDir.value = settings.rootVolumePath
        form.value.newVenvLocation = `${settings.rootVolumePath}/python/custom-venv`
      }
    })
  }
})
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
