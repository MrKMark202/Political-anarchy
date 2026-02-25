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
        <label class="block text-xs tracking-[0.2em] uppercase text-slate mb-4 font-medium">
          Unos stavova
        </label>
        <div class="flex items-end gap-6">
          <div class="flex-1">
            <input
              v-model="userInput"
              type="text"
              placeholder="Opišite svoje političke stavove ili preferencije politika..."
              class="w-full bg-transparent border-0 border-b border-black text-lg py-3 px-0 placeholder-slate-light/50 focus:border-slate transition-colors"
              :disabled="isLoading"
            />
          </div>
          <button
            type="submit"
            :disabled="isLoading || !userInput.trim()"
            class="border border-black px-8 py-3 text-xs tracking-[0.2em] uppercase font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            {{ isLoading ? 'ANALIZIRAM...' : 'ANALIZIRAJ' }}
          </button>
        </div>
      </form>
    </section>

    <!-- Loading -->
    <section v-if="isLoading" class="max-w-[1200px] mx-auto px-8 pb-16">
      <div class="border-t border-black pt-8">
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 bg-black animate-pulse"></div>
          <span class="text-xs tracking-[0.2em] uppercase text-slate"
            >Obrađujem analizu podudarnosti</span
          >
        </div>
      </div>
    </section>

    <!-- Error -->
    <section v-if="errorMessage" class="max-w-[1200px] mx-auto px-8 pb-8">
      <div class="border-t border-black pt-6">
        <p class="text-xs tracking-wide text-slate">
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

      <!-- Table Header -->
      <div class="grid grid-cols-12 gap-4 border-b border-black pb-3 mb-0">
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
        class="grid grid-cols-12 gap-4 border-b border-border-light py-5 hover:bg-bg-hover transition-colors"
      >
        <!-- Rank -->
        <div class="col-span-1">
          <span class="text-2xl font-bold text-slate-light/40">{{
            String(index + 1).padStart(2, '0')
          }}</span>
        </div>

        <!-- Party -->
        <div class="col-span-2">
          <div class="text-sm font-bold tracking-wide">{{ item.party }}</div>
        </div>

        <!-- Alignment -->
        <div class="col-span-2">
          <div class="flex flex-col gap-2">
            <span class="text-2xl font-bold"
              >{{ item.alignment }}<span class="text-sm text-slate-light">%</span></span
            >
            <span class="text-[10px] tracking-[0.2em] uppercase text-slate-light">{{
              getAlignmentLabel(item.alignment)
            }}</span>
            <!-- Bar -->
            <div class="w-full h-[2px] bg-border-light">
              <div
                class="h-full bg-black transition-all duration-700 ease-out"
                :style="{ width: item.alignment + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Reliability -->
        <div class="col-span-2">
          <div class="flex flex-col gap-2">
            <span class="text-2xl font-bold"
              >{{ item.reliability }}<span class="text-sm text-slate-light">%</span></span
            >
            <span class="text-[10px] tracking-[0.2em] uppercase text-slate-light">{{
              getAlignmentLabel(item.reliability)
            }}</span>
            <!-- Bar -->
            <div class="w-full h-[2px] bg-border-light">
              <div
                class="h-full bg-slate-light transition-all duration-700 ease-out"
                :style="{ width: item.reliability + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Explanation -->
        <div class="col-span-5">
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
