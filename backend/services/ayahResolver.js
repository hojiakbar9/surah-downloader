import dotenv from 'dotenv'

dotenv.config();

const url = process.env.BASE_AUDIO_URL + '/Minshawy_Murattal_128kbps';
const audioFormat = process.env.AUDIO_FORMAT;

export default function resolveAyah(surahNumber, ayahNumber){
    let surahNumberThreeDigit =  surahNumber.toString().padStart(3, '0');
    let ayahNumberThreeDigit =  ayahNumber.toString().padStart(3, '0');


    return `${url}/${surahNumberThreeDigit}${ayahNumberThreeDigit}.${audioFormat}`;
}