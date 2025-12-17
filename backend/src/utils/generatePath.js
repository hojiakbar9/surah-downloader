import path from 'path';
import fs from 'fs';

export default function generateUniqueJobPath() {
    const uniqueJobId = Math.random().toString(36).slice(2, 11);
    const dir = path.join('tmp', 'mushaf-jobs', uniqueJobId); 

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return dir;
}
