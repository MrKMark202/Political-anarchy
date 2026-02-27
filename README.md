# Politička Anarhija (Political-anarchy)

**Politička Anarhija** je moderan, digitalni alat dizajniran za povećanje transparentnosti i odgovornosti u hrvatskom političkom prostoru. Aplikacija omogućuje građanima da na temelju svojih stavova pronađu političke stranke koje najbolje zastupaju njihove interese, istovremeno analizirajući povijesnu pouzdanost tih stranaka u ispunjavanju predizbornih obećanja.

---

## 🚀 Zašto nam je potrebna ova aplikacija?

U svijetu zasićenom informacijama i često nejasnim političkim obećanjima, građanima je sve teže donijeti informiranu odluku. **Politička Anarhija** rješava ovaj problem kroz:

1.  **Objektivnu Analizu**: Korištenjem napredne umjetne inteligencije (AI), aplikacija neutralno uspoređuje korisničke preferencije s programima stranaka.
2.  **Praćenje Odgovornosti**: Fokusiramo se ne samo na ono što stranke *obećavaju*, već i na ono što su *ispunile* u prošlosti (Indeks pouzdanosti).
3.  **Vizualizaciju Podataka**: Regionalna karta omogućuje uvid u političke trendove i utjecaj županija na državnu politiku.

---

## ✨ Ključne Funkcionalnosti

### 1. AI Usklađivanje Politika (Policy Matcher)
Unesite svoje stavove o ekonomiji, socijalnim pitanjima, ekologiji ili bilo kojoj drugoj temi. Sustav koristi **Google Gemini AI** kako bi:
*   Izračunao postotak **podudarnosti** (Alignment) s ključnim hrvatskim strankama.
*   Analizirao **pouzdanost** (Reliability) stranke na temelju povijesnih podataka (izbori 2020.-2024.).
*   Pružio detaljno objašnjenje za svaku analizu na hrvatskom jeziku.

### 2. Regionalna Karta (Regional Map)
Interaktivna karta Hrvatske koja prikazuje:
*   Dominantne političke opcije po županijama.
*   Ključne regionalne aktivnosti i povijesne trendove od 2000. godine.
*   **Indeks utjecaja na Sabor** za svaku regiju.

---

## 🛠️ Tehnološki Stog

Projekt je izgrađen na modernim tehnologijama za maksimalne performanse i skalabilnost:

*   **Frontend**: [Vue 3](https://vuejs.org/) (Composition API) + [TypeScript](https://www.typescriptlang.org/)
*   **Build alat**: [Vite](https://vite.dev/)
*   **AI Integracija**: [Google Generative AI](https://ai.google.dev/) (Gemini API)
*   **Kartografija**: [MapLibre GL](https://maplibre.org/)
*   **Stilizacija**: [Tailwind CSS](https://tailwindcss.com/)
*   **State Management**: [Pinia](https://pinia.vuejs.org/)

---

## 💻 Postavljanje Projekta

### Preduvjeti
*   [Node.js](https://nodejs.org/) (preporučena verzija sukladna `package.json`)
*   Gemini API ključ ([nabavite ga ovdje](https://aistudio.google.com/app/apikey))

### Instalacija
1. Klonirajte repozitorij.
2. Instalirajte ovisnosti:
   ```sh
   npm install
   ```
3. Kreirajte `.env` datoteku u korijenu projekta i dodajte svoj API ključ:
   ```env
   VITE_GEMINI_KEY=vaš_gemini_api_ključ
   ```

### Razvojni poslužitelj
Pokrenite lokalni poslužitelj s automatskim osvježavanjem:
```sh
npm run dev
```

### Produkcijska izgradnja
Za provjeru tipova i generiranje optimiziranih datoteka za produkciju:
```sh
npm run build
```

### Testiranje
Pokrenite unit testove koristeći [Vitest](https://vitest.dev/):
```sh
npm run test:unit
```

---

## ⚖️ Licenca i Odricanje od odgovornosti
Ova aplikacija služi isključivo u informativne svrhe. Analize generira AI sustav na temelju dostupnih podataka i ne predstavljaju nužno apsolutnu istinu. Koristite dobivene informacije kao jedan od alata za vlastito istraživanje.
