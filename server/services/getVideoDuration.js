import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';
import path from 'path';

async function getVideoDuration(videoPath) {
    if (!videoPath || typeof videoPath !== 'string') {
        throw new Error('Invalid video path provided');
    }
    try {
        const info = await ffprobe(videoPath, { path: ffprobeStatic.path });

        if (!info.streams || info.streams.length === 0){
            throw new Error('No video streams found');
        }

        const duration = info.streams[0].duration;

        if (duration === undefined || duration === null || isNaN(duration)){
            throw new Error('Duração não disponível par ao vídeo');
        }

        return Math.floor(duration); // em segundos

    } catch(error){
        console.log('Erro ao obter duração do vídeo: ', error);
        throw new Error(`Falha ao obter duração do vídeo: ${error.message}`);
    }
}

export default getVideoDuration;