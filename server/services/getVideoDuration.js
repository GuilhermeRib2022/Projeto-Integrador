import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';
import path from 'path';

async function getVideoDuration(videoPath) {
  const info = await ffprobe(videoPath, { path: ffprobeStatic.path });
  const duration = info.streams[0].duration;
  return Math.floor(duration); // em segundos
}

export default getVideoDuration;