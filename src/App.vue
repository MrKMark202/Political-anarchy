<script setup lang="ts">
import { ref } from 'vue'
import PolicyMatcher from './components/PolicyMatcher.vue'
import RegionalMap from './components/RegionalMap.vue'

const currentView = ref<'matcher' | 'map'>('matcher')
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-black">
    <div class="max-w-[1400px] mx-auto">
      <!-- Navigation Tabs -->
      <div class="flex justify-center border-b border-border-light">
        <div class="flex gap-12">
          <button 
            @click="currentView = 'matcher'"
            :class="[
              'px-4 py-6 text-xs tracking-[0.2em] uppercase font-bold transition-all duration-200 border-b-2',
              currentView === 'matcher' ? 'border-black text-black' : 'border-transparent text-slate-light hover:text-black'
            ]"
          >
            Usklađivanje Politika
          </button>
          <button 
            @click="currentView = 'map'"
            :class="[
              'px-4 py-6 text-xs tracking-[0.2em] uppercase font-bold transition-all duration-200 border-b-2',
              currentView === 'map' ? 'border-black text-black' : 'border-transparent text-slate-light hover:text-black'
            ]"
          >
            Regionalna Karta
          </button>
        </div>
      </div>

      <!-- Content Views -->
      <main class="py-8">
        <Transition mode="out-in">
          <div v-if="currentView === 'matcher'" key="matcher">
            <PolicyMatcher />
          </div>
          <div v-else key="map" class="px-4 md:px-8">
            <RegionalMap />
          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>

<style>
.v-enter-active,
.v-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.v-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
