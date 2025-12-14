import fs from 'fs';

function buildSequnce(tempPath, count){
    const files = fs.readdirSync(tempPath);
    return  files.map(val => ("file " + val + " " +"\n").repeat(count)).join('');
}
