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
            const dir = path.dirname(outputPath);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
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

async function downloadAyahs(surahNumber, start, end){
    const allAyahs = Array.from({length: end-start+1}, (_, i) => start +i);
    const downloads = [];
    const uniqueJobId = Math.random().toString(36).slice(2, 11);
    allAyahs.forEach((currAyah, index, arr) =>{
      let url =  resolveAyah(surahNumber, currAyah);
       let path = resolvePath(uniqueJobId,surahNumber, currAyah);
       downloads.push(downloadAyah(url, path));
    });
    await Promise.all(downloads);
    console.log("All downloads completed.");
}