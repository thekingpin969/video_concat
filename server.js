import express from "express";
import cors from 'cors'
import dotenv from "dotenv";
dotenv.config({ path: './.env' });
import { PassThrough } from 'stream'
import ffmpeg from 'fluent-ffmpeg'

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }))

app.post('/merge', async (req, res) => {
    const { videoUrls } = req.body;

    if (!Array.isArray(videoUrls) || videoUrls.length < 2) {
        return res.status(400).json({ error: 'Provide at least two video URLs.' });
    }

    const outputStream = new PassThrough();

    const command = ffmpeg();

    videoUrls.forEach(url => {
        command.input(url);
    });

    command
        .on('start', cmd => console.log('FFmpeg started:', cmd))
        .on('error', err => {
            console.error('FFmpeg error:', err);
            outputStream.destroy();
            res.status(500).send('Failed to process video.');
        })
        .on('end', () => {
            console.log('✓ Video concatenation finished.');
        })
        .outputFormat('mp4')
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
            '-preset veryfast',
            '-movflags frag_keyframe+empty_moov' // Makes MP4 streamable
        ])
        .pipe(outputStream, { end: true });

    res.setHeader('Content-Type', 'video/mp4');
    outputStream.pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));