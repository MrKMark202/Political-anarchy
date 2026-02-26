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
  <div class="flex flex-col lg:flex-row w-full min-h-[80vh] bg-white border border-black overflow-hidden shadow-sm">
    <!-- Map Section -->
    <div class="relative w-full lg:w-2/3 h-[50vh] lg:h-[80vh] border-b lg:border-b-0 lg:border-r border-black shrink-0">
      <div ref="mapContainer" class="w-full h-full focus:outline-none"></div>

    <!-- Header Overlay -->
    <div class="absolute top-4 left-4 lg:top-8 lg:left-8 z-10 bg-white border border-black p-4 lg:p-6 pointer-events-none">
      <h2 class="text-xl lg:text-2xl font-black tracking-tighter text-black uppercase mb-1">Regionalni Podaci</h2>
      <p class="text-[8px] lg:text-[10px] tracking-[0.2em] uppercase font-bold text-slate-light">Izvještaj po županijama</p>
    </div>

    <!-- Legend -->
    <div class="absolute bottom-4 right-4 lg:bottom-8 lg:right-8 z-10 bg-white border border-black p-4 lg:p-6 max-w-[200px] lg:max-w-xs pointer-events-none">
      <h3 class="text-[8px] lg:text-[10px] text-black font-black mb-3 lg:mb-4 uppercase tracking-[0.2em]">Politička Legenda</h3>
      <div class="grid grid-cols-1 gap-2.5">
        <div v-for="party in [
          { name: 'HDZ i partneri', color: '#004277' },
          { name: 'SDP i partneri', color: '#ED1C24' },
          { name: 'Možemo! i SDP', color: '#99C121' },
          { name: 'IDS i partneri', color: '#00A14B' },
          { name: 'NPS i partneri', color: '#F39200' }
        ]" :key="party.name" class="flex items-center gap-3">
          <div :style="{ backgroundColor: party.color }" class="w-2.5 h-2.5 shrink-0 border border-black/10"></div>
          <span class="text-black text-[9px] font-bold uppercase tracking-wider">{{ party.name }}</span>
        </div>
      </div>
    </div>
    </div> <!-- Close map relative container -->

    <!-- Info Panel Section -->
    <div class="w-full lg:w-1/3 min-h-[40vh] lg:h-[80vh] bg-white overflow-y-auto p-6 lg:p-10 flex flex-col relative z-20">
      <div v-if="hoveredCounty" class="fade-in pb-4 lg:pb-8">
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-3">
            <div :style="{ backgroundColor: hoveredCounty.color }" class="w-1.5 h-10 border border-black/10 shrink-0"></div>
            <h4 class="text-2xl lg:text-3xl font-black text-black uppercase tracking-tighter leading-none">{{ hoveredCounty.name }}</h4>
          </div>
          <div class="flex items-baseline gap-2 mt-4 border-b border-black pb-4">
            <span class="text-[9px] text-slate-light uppercase font-bold tracking-[0.2em]">Dominantna stranka:</span>
            <span class="text-sm font-black text-black uppercase">{{ hoveredCounty.dominantParty }}</span>
          </div>
        </div>

        <div class="space-y-8">
          <div>
            <div class="text-[10px] text-black font-black uppercase tracking-[0.2em] mb-4">Ključne Aktivnosti</div>
            <div class="space-y-3">
              <template v-if="hoveredCounty.activities">
                <div 
                  v-for="activity in (typeof hoveredCounty.activities === 'string' ? JSON.parse(hoveredCounty.activities) : hoveredCounty.activities)" 
                  :key="activity" 
                  class="flex items-start gap-3"
                >
                  <div class="w-1.5 h-1.5 bg-black mt-1.5 shrink-0 rounded-none"></div>
                  <span class="text-xs font-bold text-slate uppercase leading-snug">{{ activity }}</span>
                </div>
              </template>
            </div>
          </div>

          <div v-if="hoveredCounty.historicalTrends" class="border-t border-border-light pt-6">
            <div class="text-[10px] text-black font-black uppercase tracking-[0.2em] mb-3">Povijesni Trend (2000-2024)</div>
            <p class="text-xs text-slate-light leading-relaxed font-medium mt-2">{{ hoveredCounty.historicalTrends }}</p>
          </div>
          
          <div v-if="hoveredCounty.prominentHistoricalParties" class="border-t border-border-light pt-6">
             <div class="text-[10px] text-black font-black uppercase tracking-[0.2em] mb-4">Istaknute Povijesne Stranke</div>
             <div class="flex flex-wrap gap-2">
                <span v-for="party in (typeof hoveredCounty.prominentHistoricalParties === 'string' ? JSON.parse(hoveredCounty.prominentHistoricalParties) : hoveredCounty.prominentHistoricalParties)" :key="party" class="text-[9px] font-bold tracking-widest uppercase border-2 border-border-light px-2.5 py-1 text-slate bg-bg-light hover:border-black transition-colors cursor-default">
                   {{party}}
                </span>
             </div>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-black">
          <div class="flex justify-between items-center mb-3">
            <span class="text-[9px] text-black uppercase font-black tracking-[0.2em]">Indeks Utjecaja na Sabor</span>
            <span class="text-sm font-black text-black">{{ hoveredCounty.influenceScore || 0 }}%</span>
          </div>
          <div class="w-full h-1 bg-border-light">
            <div :style="{ width: `${Number(hoveredCounty.influenceScore) || 0}%`, backgroundColor: '#000000' }" class="h-full transition-all duration-1000 ease-out"></div>
          </div>
        </div>
      </div>
      <div v-else class="m-auto text-center opacity-40">
        <div class="w-8 h-8 border-[3px] border-black mx-auto mb-6 transform rotate-45"></div>
        <p class="text-[10px] uppercase font-black tracking-[0.3em] text-black">Odaberite regiju</p>
        <p class="text-[9px] uppercase font-bold tracking-widest text-slate-light mt-3 max-w-[220px] mx-auto leading-relaxed">Pozicionirajte kursor iznad županije na karti za prikaz detalja</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure map covers its container */
:deep(.maplibregl-canvas) {
  outline: none !important;
}

.fade-in {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
