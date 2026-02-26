<script setup lang="ts">
import { ref } from 'vue'
import { analyzePolicy, type AlignmentResult } from '@/services/gemini'
import partiesData from '@/assets/data/parties.json'

const userInput = ref('')
const results = ref<AlignmentResult[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const hasSearched = ref(false)

async function handleSubmit() {
  const query = userInput.value.trim()
  if (!query) return

  isLoading.value = true
  errorMessage.value = ''
  results.value = []
  hasSearched.value = true

  try {
    results.value = await analyzePolicy(query, partiesData)
  } catch (err: any) {
    errorMessage.value = err.message || 'Došlo je do neočekivane pogreške.'
  } finally {
    isLoading.value = false
  }
}

function getAlignmentLabel(score: number): string {
  if (score >= 80) return 'VISOKA'
  if (score >= 50) return 'UMJERENA'
  if (score >= 25) return 'NISKA'
  return 'MINIMALNA'
}

const expandedParties = ref<Set<string>>(new Set())

function togglePartyDetails(partyName: string) {
  const newSet = new Set(expandedParties.value)
  if (newSet.has(partyName)) {
    newSet.delete(partyName)
  } else {
    newSet.add(partyName)
  }
  expandedParties.value = newSet
}

function getPartyDetails(partyName: string) {
  const nameMatch = partyName.toLowerCase()
  return partiesData.find(p => p.name.toLowerCase().includes(nameMatch) || nameMatch.includes(p.name.toLowerCase()))
}

function getPartyColor(partyName: string): string {
  const name = partyName.toUpperCase()
  if (name.includes('HDZ')) return '#004277'
  if (name.includes('SDP')) return '#ED1C24'
  if (name.includes('MOŽEMO')) return '#99C121'
  if (name.includes('IDS')) return '#00A14B'
  if (name.includes('NPS')) return '#F39200'
  if (name.includes('MOST')) return '#F68B1F'
  if (name.includes('DOMOVINSKI') || name.includes('DP')) return '#111111'
  if (name.includes('HSS')) return '#007A33'
  if (name.includes('HSLS')) return '#F2A900'
  return '#333333'
}
</script>

<template>
  <div class="min-h-screen bg-white text-black">
    <!-- Top bar -->
    <header class="border-b border-black">
      <div class="max-w-[1200px] mx-auto px-8 py-4 flex items-center justify-between">
        <span class="text-xs tracking-[0.3em] uppercase text-slate font-medium"
          >Sustav za političku analizu</span
        >
        <span class="text-xs text-slate-light">v1.0</span>
      </div>
    </header>

    <!-- Hero -->
    <section class="max-w-[1200px] mx-auto px-8 pt-24 pb-16">
      <h1 class="text-5xl md:text-7xl font-bold tracking-tight leading-none">
        ANALIZA<br />POLITIČKE<br />PODUDARNOSTI<span class="text-slate">.</span>
      </h1>
      <p class="mt-6 text-sm text-slate-light tracking-wide max-w-md leading-relaxed">
        Unesite svoje političke stavove ili preferencije politika u nastavku. Sustav će analizirati
        podudarnost s hrvatskim političkim strankama korištenjem strukturirane usporedbe podataka.
      </p>
    </section>

    <!-- Input -->
    <section class="max-w-[1200px] mx-auto px-8 pb-16">
      <form @submit.prevent="handleSubmit" class="relative">
        <label class="block text-[10px] tracking-[0.3em] uppercase text-black mb-6 font-bold">
          Unos stavova
        </label>
        <div class="flex flex-col md:flex-row items-stretch md:items-end gap-12">
          <div class="flex-1 border-b-2 border-black">
            <input
              v-model="userInput"
              type="text"
              placeholder="Opišite svoje političke stavove ili preferencije politika..."
              class="w-full bg-transparent border-0 text-xl py-4 px-0 placeholder-slate-light/40 focus:ring-0 transition-colors"
              :disabled="isLoading"
            />
          </div>
          <button
            type="submit"
            :disabled="isLoading || !userInput.trim()"
            class="bg-black text-white px-12 py-5 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-slate transition-colors disabled:bg-slate-light/50 disabled:cursor-not-allowed shrink-0"
          >
            {{ isLoading ? 'ANALIZIRAM...' : 'ANALIZIRAJ' }}
          </button>
        </div>
      </form>
    </section>

    <!-- Loading -->
    <section v-if="isLoading" class="max-w-[1200px] mx-auto px-8 pb-16">
      <div class="border-t-4 border-black pt-8">
        <div class="flex items-center gap-4">
          <div class="w-1.5 h-1.5 bg-black animate-pulse"></div>
          <span class="text-[10px] tracking-[0.3em] uppercase font-bold"
            >Obrađujem analizu podudarnosti</span
          >
        </div>
      </div>
    </section>

    <!-- Error -->
    <section v-if="errorMessage" class="max-w-[1200px] mx-auto px-8 pb-8">
      <div class="border-t border-black pt-6">
        <p class="text-[10px] tracking-widest text-black">
          <span class="font-bold">GREŠKA —</span> {{ errorMessage }}
        </p>
      </div>
    </section>

    <!-- Results -->
    <section v-if="results.length > 0" class="max-w-[1200px] mx-auto px-8 pb-24">
      <!-- Results header -->
      <div class="border-t border-black pt-8 pb-6">
        <div class="flex items-center justify-between">
          <span class="text-xs tracking-[0.3em] uppercase font-medium">Rezultati podudarnosti</span>
          <span class="text-xs text-slate-light">{{ results.length }} stranaka analizirano</span>
        </div>
      </div>

      <!-- Table Header (Hidden on Mobile) -->
      <div class="hidden md:grid grid-cols-12 gap-4 border-b border-black pb-3 mb-0">
        <div class="col-span-1 text-xs tracking-[0.15em] uppercase text-slate-light font-medium">
          #
        </div>
        <div class="col-span-2 text-xs tracking-[0.15em] uppercase text-slate-light font-medium">
          Stranka
        </div>
        <div class="col-span-2 text-xs tracking-[0.15em] uppercase text-slate-light font-medium">
          Podudarnost
        </div>
        <div class="col-span-2 text-xs tracking-[0.15em] uppercase text-slate-light font-medium">
          Pouzdanost
        </div>
        <div class="col-span-5 text-xs tracking-[0.15em] uppercase text-slate-light font-medium">
          Analiza
        </div>
      </div>

      <!-- Table Rows -->
      <div
        v-for="(item, index) in results"
        :key="item.party"
        class="border-b border-border-light py-5 hover:bg-bg-hover transition-colors"
      >
        <div class="flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-4">
        <!-- Rank -->
        <div class="md:col-span-1 hidden md:block">
          <span class="text-2xl font-bold text-slate-light/40">{{
            String(index + 1).padStart(2, '0')
          }}</span>
        </div>

        <!-- Header / Mobile Name -->
        <div class="md:hidden flex items-center justify-between border-b border-black/5 pb-3">
          <span class="text-xl font-bold text-slate-light/40">#{{ index + 1 }}</span>
          <div class="flex items-center">
            <div class="w-1.5 h-1.5 rounded-full mr-2" :style="{ backgroundColor: getPartyColor(item.party) }"></div>
            <div class="text-sm font-bold tracking-wide leading-tight">{{ item.party }}</div>
          </div>
        </div>

        <!-- Party (Desktop) -->
        <div class="md:col-span-2 hidden md:block">
          <div class="flex items-start">
            <div class="w-1 h-5 mt-0 mr-2 shrink-0" :style="{ backgroundColor: getPartyColor(item.party) }"></div>
            <div class="text-sm font-bold tracking-wide leading-tight">{{ item.party }}</div>
          </div>
        </div>

        <!-- Alignment -->
        <div class="md:col-span-2">
          <div class="flex flex-col gap-2">
            <div class="flex items-baseline gap-2 md:block">
              <span class="md:hidden text-[9px] uppercase tracking-widest text-slate-light mb-1">Podudarnost:</span>
              <span class="text-2xl font-bold"
                >{{ item.alignment }}<span class="text-sm text-slate-light">%</span></span
              >
            </div>
            <span class="text-[10px] tracking-[0.2em] uppercase text-slate-light">{{
              getAlignmentLabel(item.alignment)
            }}</span>
            <!-- Bar -->
            <div class="w-full h-[2px] bg-border-light mt-1">
              <div
                class="h-full bg-black transition-all duration-700 ease-out"
                :style="{ width: item.alignment + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Reliability -->
        <div class="md:col-span-2">
          <div class="flex flex-col gap-2">
            <div class="flex items-baseline gap-2 md:block">
              <span class="md:hidden text-[9px] uppercase tracking-widest text-slate-light mb-1">Pouzdanost:</span>
              <span class="text-2xl font-bold"
                >{{ item.reliability }}<span class="text-sm text-slate-light">%</span></span
              >
            </div>
            <span class="text-[10px] tracking-[0.2em] uppercase text-slate-light">{{
              getAlignmentLabel(item.reliability)
            }}</span>
            <!-- Bar -->
            <div class="w-full h-[2px] bg-border-light mt-1">
              <div
                class="h-full bg-slate-light transition-all duration-700 ease-out"
                :style="{ width: item.reliability + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Explanation -->
        <div class="md:col-span-5">
          <div class="flex flex-col gap-4">
            <div>
              <span
                class="text-[9px] tracking-[0.1em] uppercase text-slate-light font-bold block mb-1"
                >Analiza stavova:</span
              >
              <p class="text-sm text-slate leading-relaxed">{{ item.explanation }}</p>
            </div>
            <div v-if="item.reliabilityExplanation">
              <span
                class="text-[9px] tracking-[0.1em] uppercase text-slate-light font-bold block mb-1"
                >Povijesna pouzdanost:</span
              >
              <p class="text-sm text-slate leading-relaxed">{{ item.reliabilityExplanation }}</p>
            </div>
            
            <button 
              v-if="getPartyDetails(item.party)"
              @click="togglePartyDetails(item.party)"
              class="self-start mt-2 border-b border-black text-[9px] uppercase tracking-[0.2em] font-bold text-black pb-0.5 hover:text-slate-light hover:border-slate-light transition-colors"
            >
              {{ expandedParties.has(item.party) ? 'Zatvori povijest stranke' : 'Prikaži povijest stranke' }}
            </button>
          </div>
        </div>
        </div> <!-- End of grid row -->

        <!-- Expanded History -->
        <div 
          v-if="expandedParties.has(item.party) && getPartyDetails(item.party)" 
          class="mt-6 mb-2 pl-4 border-l-2 ml-1" 
          :style="{ borderColor: getPartyColor(item.party) }"
        >
          <div class="bg-[#fcfcfc] border border-border-light p-6">
            <div class="flex items-center gap-3 mb-6 border-b border-border-light pb-4">
               <span class="text-xs tracking-widest uppercase font-black">Izborna povijest: {{ getPartyDetails(item.party)?.name }}</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div v-for="izbor in getPartyDetails(item.party)?.izbori" :key="izbor.godina || 'unknown'" class="border-t border-black/10 pt-4">
                <div class="flex justify-between items-baseline mb-2">
                  <span class="text-sm font-black">{{izbor.godina}}.</span>
                  <span class="text-[9px] uppercase tracking-widest text-slate-light font-bold">{{izbor.tip}}</span>
                </div>
                <p class="text-[11px] font-bold mb-3 leading-snug">{{izbor.rezultat}}</p>
                <div class="mb-3">
                  <span class="text-[9px] uppercase tracking-wider text-slate-light block mb-1">Obećanja</span>
                  <ul class="list-none text-[10px] text-slate space-y-1">
                    <li v-for="ob in (izbor.obecanja || [])" :key="ob" class="flex gap-2 items-start"><span class="w-1 h-1 bg-black shrink-0 mt-1.5"></span><span>{{ ob }}</span></li>
                  </ul>
                </div>
                <div>
                  <span class="text-[9px] uppercase tracking-wider text-slate-light block mb-1">Ispunjeno</span>
                  <p class="text-[10px] text-slate leading-relaxed">{{izbor.ispunjeno}}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="pt-6 flex items-center justify-between">
        <span class="text-[10px] text-slate-light tracking-wide">
          Rezultate je generirao AI sustav za analizu politika. Samo u informativne svrhe.
        </span>
        <span class="text-[10px] text-slate-light tracking-wide">
          {{ new Date().toISOString().split('T')[0] }}
        </span>
      </div>
    </section>

    <!-- Empty state -->
    <section
      v-if="!isLoading && !errorMessage && results.length === 0 && !hasSearched"
      class="max-w-[1200px] mx-auto px-8 pb-24"
    >
      <div class="border-t border-border-light pt-12 text-center">
        <p class="text-xs text-slate-light tracking-[0.2em] uppercase">
          Unesite svoje političke preferencije za početak analize
        </p>
      </div>
    </section>

    <!-- Bottom bar -->
    <footer class="border-t border-black mt-auto">
      <div class="max-w-[1200px] mx-auto px-8 py-4 flex items-center justify-between">
        <span class="text-[10px] text-slate-light tracking-wide"
          >SUSTAV ZA ANALIZU POLITIČKE PODUDARNOSTI</span
        >
        <span class="text-[10px] text-slate-light tracking-wide"
          >© {{ new Date().getFullYear() }}</span
        >
      </div>
    </footer>
  </div>
</template>
