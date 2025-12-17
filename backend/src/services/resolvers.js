import dotenv from "dotenv";
import path from "path";

dotenv.config();

const BASE_URL = process.env.BASE_AUDIO_URL || "https://everyayah.com/data";
const AUDIO_FORMAT = process.env.AUDIO_FORMAT || "mp3";

const fullUrl = `${BASE_URL}/Minshawy_Murattal_128kbps`;

function resolveAyah(surahNumber, ayahNumber) {
  const surahPadded = surahNumber.toString().padStart(3, "0");
  const ayahPadded = ayahNumber.toString().padStart(3, "0");

  return `${fullUrl}/${surahPadded}${ayahPadded}.${AUDIO_FORMAT}`;
}

function resolvePath(jobPath, surahNumber, ayahNumber) {
  const surahPadded = surahNumber.toString().padStart(3, "0");
  const ayahPadded = ayahNumber.toString().padStart(3, "0");

  const fileName = `${surahPadded}_${ayahPadded}.${AUDIO_FORMAT}`;

  return path.join(jobPath, fileName);
}

export { resolveAyah, resolvePath };
