<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import countiesGeoJson from '../assets/data/croatia_counties.json';
import politicalData from '../assets/data/regional_political_data.json';

const mapContainer = ref<HTMLElement | null>(null);
const map = shallowRef<maplibregl.Map | null>(null);
const hoveredCounty = ref<any>(null);
const tooltipPos = ref({ x: 0, y: 0 });

onMounted(() => {
  if (!mapContainer.value) return;

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        'osm': {
          type: 'raster',
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap Contributors'
        }
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm',
          paint: {
            'raster-opacity': 0.15,
            'raster-saturation': -1
          }
        }
      ]
    },
    center: [16.5, 44.5], // Center of Croatia
    zoom: 6.5,
    maxBounds: [[12.5, 42.0], [20.0, 47.0]] // Restrict view to Croatia
  });

  map.value.on('load', () => {
    if (!map.value) return;

    // Join GeoJSON properties with political data
    const enhancedFeatures = (countiesGeoJson as any).features.map((feature: any) => {
      const countyInfo = politicalData.find(d => d.id === feature.properties.id);
      return {
        ...feature,
        id: feature.properties.id, // Ensure id is at the top level for setFeatureState
        properties: {
          ...feature.properties,
          ...countyInfo
        }
      };
    });

    map.value.addSource('croatia-counties', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: enhancedFeatures
      }
    });

    // Fill layer
    map.value.addLayer({
      id: 'counties-fill',
      type: 'fill',
      source: 'croatia-counties',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.9,
          0.4
        ]
      }
    });

    // Outline layer
    map.value.addLayer({
      id: 'counties-outline',
      type: 'line',
      source: 'croatia-counties',
      paint: {
        'line-color': '#000000',
        'line-width': 0.5
      }
    });

    // Mouse interactions
    let hoveredStateId: string | number | null = null;

    map.value.on('mousemove', 'counties-fill', (e) => {
      const features = e.features;
      if (features && features.length > 0) {
        const feature = features[0];
        if (!feature) return;

        if (hoveredStateId !== null) {
          map.value?.setFeatureState(
            { source: 'croatia-counties', id: hoveredStateId },
            { hover: false }
          );
        }
        
        hoveredStateId = feature.id || feature.properties?.id;
        if (hoveredStateId !== null) {
          map.value?.setFeatureState(
            { source: 'croatia-counties', id: hoveredStateId },
            { hover: true }
          );
        }

        hoveredCounty.value = feature.properties;
        tooltipPos.value = { x: e.point.x, y: e.point.y };
      }
    });

    map.value.on('mouseleave', 'counties-fill', () => {
      if (hoveredStateId !== null) {
        map.value?.setFeatureState(
          { source: 'croatia-counties', id: hoveredStateId },
          { hover: false }
        );
      }
      hoveredStateId = null;
      hoveredCounty.value = null;
    });
  });
});
</script>

<template>
  <div class="relative w-full h-[80vh] bg-white overflow-hidden border border-black">
    <div ref="mapContainer" class="w-full h-full"></div>

    <!-- Header Overlay -->
    <div class="absolute top-8 left-8 z-10 bg-white border border-black p-6">
      <h2 class="text-2xl font-black tracking-tighter text-black uppercase mb-1">Regionalni Podaci</h2>
      <p class="text-[10px] tracking-[0.2em] uppercase font-bold text-slate-light">Izvještaj po županijama</p>
    </div>

    <!-- Legend -->
    <div class="absolute bottom-8 right-8 z-10 bg-white border border-black p-6 max-w-sm">
      <h3 class="text-[10px] text-black font-black mb-4 uppercase tracking-[0.2em]">Politička Legenda (Sabor 2024)</h3>
      <div class="space-y-3">
        <div v-for="party in [
          { name: 'HDZ i partneri', color: '#004277' },
          { name: 'SDP i partneri', color: '#ED1C24' },
          { name: 'Možemo! i SDP', color: '#99C121' },
          { name: 'IDS i partneri', color: '#00A14B' },
          { name: 'NPS i partneri', color: '#F39200' }
        ]" :key="party.name" class="flex items-center gap-4">
          <div :style="{ backgroundColor: party.color }" class="w-3 h-3 shrink-0"></div>
          <span class="text-black text-[10px] font-bold uppercase tracking-wider">{{ party.name }}</span>
        </div>
      </div>
    </div>

    <!-- Tooltip (Institutional) -->
    <div 
      v-if="hoveredCounty" 
      class="fixed pointer-events-none z-50 bg-white border-2 border-black p-6 transition-all duration-75"
      :style="{ left: `${tooltipPos.x + 20}px`, top: `${tooltipPos.y + 20}px` }"
    >
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-2">
          <div :style="{ backgroundColor: hoveredCounty.color }" class="w-1.5 h-8"></div>
          <h4 class="text-xl font-black text-black uppercase tracking-tighter leading-none">{{ hoveredCounty.name }}</h4>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-[9px] text-slate-light uppercase font-bold tracking-[0.2em]">Dominantna:</span>
          <span class="text-xs font-black text-black uppercase">{{ hoveredCounty.dominantParty }}</span>
        </div>
      </div>

      <div class="space-y-2">
        <div class="text-[9px] text-black font-black uppercase tracking-[0.2em] mb-3 border-b border-black pb-2">KLJUČNE AKTIVNOSTI</div>
        <template v-if="hoveredCounty.activities">
          <div 
            v-for="activity in (typeof hoveredCounty.activities === 'string' ? JSON.parse(hoveredCounty.activities) : hoveredCounty.activities)" 
            :key="activity" 
            class="flex items-start gap-3"
          >
            <div class="w-1 h-1 bg-black mt-1.5"></div>
            <span class="text-[10px] font-bold text-black uppercase leading-snug">{{ activity }}</span>
          </div>
        </template>
      </div>

      <div class="mt-6 pt-4 border-t border-black flex justify-between items-center gap-6">
        <span class="text-[9px] text-black uppercase font-black tracking-[0.2em]">Indeks Utjecaja</span>
        <div class="flex items-center gap-4">
          <div class="w-24 h-2 bg-border-light">
            <div :style="{ width: `${hoveredCounty.influenceScore}%`, backgroundColor: '#000000' }" class="h-full"></div>
          </div>
          <span class="text-[11px] font-black text-black">{{ hoveredCounty.influenceScore }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure map covers its container */
:deep(.maplibregl-canvas) {
  outline: none !important;
}

/* Custom fade animations */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
