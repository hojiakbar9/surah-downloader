import axios from "axios";
import fs from 'fs';
import { resolveAyah, resolvePath } from "./resolvers.js";
import path from 'path'
async function fetchAudio(url) {
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    return response.data;
  } catch (err) {
    throw new Error(`Failed to fetch audio: ${err.message}`);
  }
}

function downloadAyah(url, outputPath){
    return new Promise(async (resolve, reject) =>{
        try{
            const stream = await fetchAudio(url);
            const writer = fs.createWriteStream(outputPath);

            stream.pipe(writer);

            stream.on("error", reject);
            writer.on("error", reject);
            writer.on("finish", resolve);
        }
        catch(err){
            reject(err);
        }
    });
}

export default async function downloadAyahs(surahNumber, start, end, jobPath){
    const allAyahs = Array.from({length: end-start+1}, (_, i) => start +i);
    const downloads = [];
    
    allAyahs.forEach((currAyah, index, arr) =>{
      let url =  resolveAyah(surahNumber, currAyah);
       let path = resolvePath(jobPath,surahNumber, currAyah);
       downloads.push(downloadAyah(url, path));
    });
    await Promise.all(downloads);
    console.log("All downloads completed.");
}