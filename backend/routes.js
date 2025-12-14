import downloadAyahs from "./services/downloader.js"
import generatePaths from "./utils/generatePath.js"
import buildSequence from "./services/sequenceBuilder.js"
import writeFile from "./utils/fileWriter.js"
const generateAudioBodySchema ={
    type: 'object',
    required : ['surahNumber', 'startAyah', 'endAyah', 'repeatCount'],
    properties: {
        surahNumber : {type: 'integer', minimum: 1, maximum: 114},
        startAyah : {type: 'integer', minimum: 1},
        endAyah: {type: 'integer', minimum: 1},
        repeatCount :{type:'integer', minimum: 1, maximum: 5}
    }
}

const schema = {
    body : generateAudioBodySchema
}

async function routes (fastify, options) {
    fastify.post('/api/generate-audio', {schema, preValidation:(request, reply, done) =>{
        const {startAyah, endAyah} = request.body

        if(startAyah >=endAyah){
            reply.code(400).send({
                error:'Validation Error',
                message: 'startAyah must be less than endAyah'
            })
            return
        }
        done();
    }}, async (request, reply) =>{
        const {surahNumber, startAyah, endAyah, repeatCount} = request.body;
        const jobPath = generatePaths();
        
        downloadAyahs(surahNumber, startAyah, endAyah, jobPath)
            .then(()=>{
                const content = buildSequence(jobPath, repeatCount);
                writeFile(jobPath, content);
            });
    
    })
}

export default routes;
