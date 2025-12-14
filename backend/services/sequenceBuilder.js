import fs from 'fs';

export default function buildSequnce(tempPath, count){
    const files = fs.readdirSync(tempPath);
    const content =   files.map(val => ("file " + val + " " +"\n").repeat(count)).join('');
    return content;
}
