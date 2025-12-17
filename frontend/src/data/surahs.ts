// src/data/surahs.ts

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  totalAyahs: number;
}

export const surahs: Surah[] = [
  { number: 1, name: "Al-Fatihah", englishName: "The Opening", totalAyahs: 7 },
  { number: 2, name: "Al-Baqarah", englishName: "The Cow", totalAyahs: 286 },
  {
    number: 3,
    name: "Aal-E-Imran",
    englishName: "The Family of Imran",
    totalAyahs: 200,
  },
  { number: 4, name: "An-Nisa", englishName: "The Women", totalAyahs: 176 },
  {
    number: 5,
    name: "Al-Ma'idah",
    englishName: "The Table Spread",
    totalAyahs: 120,
  },
  { number: 6, name: "Al-An'am", englishName: "The Cattle", totalAyahs: 165 },
  { number: 36, name: "Ya-Sin", englishName: "Ya Sin", totalAyahs: 83 },
  {
    number: 67,
    name: "Al-Mulk",
    englishName: "The Sovereignty",
    totalAyahs: 30,
  },
  {
    number: 112,
    name: "Al-Ikhlas",
    englishName: "The Sincerity",
    totalAyahs: 4,
  },
  { number: 113, name: "Al-Falaq", englishName: "The Daybreak", totalAyahs: 5 },
  { number: 114, name: "An-Nas", englishName: "The Mankind", totalAyahs: 6 },
];

// Helper to find a surah by ID safely
export const getSurah = (number: number) =>
  surahs.find((s) => s.number === number);
