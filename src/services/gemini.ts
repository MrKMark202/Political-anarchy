import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_INSTRUCTION = `Ti si neutralni analitički sustav za političke politike. Usporedi korisnikov unos s priloženim JSON podacima o političkim strankama. Ne izražavaj mišljenja. Ispiši strukturirane rezultate.

Kada korisnik opiše svoje političke stavove ili preferencije politika, analiziraj:
1. PODUDARNOST — koliko se svaka stranka podudara s korisnikovim stavovima na temelju "keyPolicies" podataka.
2. POUZDANOST — koliko je svaka stranka pouzdana na temelju "izbori" podataka (obećanja dana vs ispunjena obećanja kroz izbore 2020.–2024.).

MORAŠ odgovoriti isključivo valjanim JSON-om — bez markdowna, bez code blokova, bez objašnjenja izvan JSON-a.

Sva objašnjenja MORAJU biti napisana na HRVATSKOM jeziku.

Format odgovora (JSON niz):
[
  {
    "party": "Ime stranke",
    "alignment": 85,
    "reliability": 60,
    "explanation": "Kratko neutralno objašnjenje podudarnosti na hrvatskom jeziku",
    "reliabilityExplanation": "Kratko objašnjenje pouzdanosti temeljeno na ispunjenju izbornih obećanja"
  }
]

Polje "alignment" je broj od 0 do 100 koji predstavlja postotak podudarnosti s korisnikovim stavovima.
Polje "reliability" je broj od 0 do 100 koji predstavlja koliko je stranka pouzdana (drži li obećanja).
Sortiraj rezultate od najveće do najmanje podudarnosti.`

export interface AlignmentResult {
  party: string
  alignment: number
  reliability: number
  explanation: string
  reliabilityExplanation: string
}

export async function analyzePolicy(
  userInput: string,
  partiesData: object,
): Promise<AlignmentResult[]> {
  const apiKey = import.meta.env.VITE_GEMINI_KEY

  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error(
      'Gemini API ključ nije konfiguriran. Molimo postavite VITE_GEMINI_KEY u .env datoteku.',
    )
  }

  const genAI = new GoogleGenerativeAI(apiKey)

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
  })

  const prompt = `Evo podataka o političkim strankama:\n\n${JSON.stringify(partiesData, null, 2)}\n\nKorisnikovi politički stavovi / preferencije politika:\n"${userInput}"\n\nAnaliziraj podudarnost svake stranke s korisnikovim stavovima (alignment) i pouzdanost svake stranke na temelju ispunjenja izbornih obećanja (reliability). Objašnjenja moraju biti na hrvatskom jeziku. Odgovori isključivo JSON-om.`

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  // Strip potential markdown code fences
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim()

  try {
    const parsed: AlignmentResult[] = JSON.parse(cleaned)
    return parsed.sort((a, b) => b.alignment - a.alignment)
  } catch {
    throw new Error('Neuspješno čitanje AI odgovora. Molimo pokušajte ponovno.')
  }
}
