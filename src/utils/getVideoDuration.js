// src/utils/getVideoDuration.js

import ffmpeg from "fluent-ffmpeg";

// 👇 Set this path to your real ffprobe.exe location
ffmpeg.setFfprobePath("C:/ffmpeg-7.1.1-essentials_build/bin/ffprobe.exe");

export const getVideoDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const durationInSeconds = metadata.format.duration;
      resolve(Math.floor(durationInSeconds));
    });
  });
};
