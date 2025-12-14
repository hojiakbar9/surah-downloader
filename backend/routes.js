const generateAudioBodySchema ={
    type: 'object',
    required : ['surahNumber', 'startAyah', 'endAyah', 'repeatCount'],
    properties: {
        surahNumber : {type: 'integer', minimum: 1},
        startAyah : {type: 'integer'},
        endAyah: {type: 'integer'},
        repeatCount :{type:'integer'}
    }
}

const schema = {
    body : generateAudioBodySchema
}

async function routes (fastify, options) {
    fastify.post('api/generate-audio', {schema}, async (request, body) =>{
        //generate audio
    })
}

//ESM
export default routes;
