const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const axios = require('axios');
const youtube = require('youtube-search-without-api-key');
const yt = require("yt-converter");
const fs = require('fs');
const path = require('path')

let Current = false;
let CurrentVal;
let CurrentTime = 0;
let CurrentInterval;

app.use(express.static('public'));

io.on('connection', async (socket) => {
    await console.log('[✅] A user connected!')
    await console.log('');
    if (Current) {
        await socket.emit('prepare', Current);
        setTimeout(async () => {
            await socket.emit('play', CurrentVal, CurrentTime);
        }, 3000)
    }
    socket.on('play', async (song) => {
        await axios.get(`https://api.popcat.xyz/itunes?q=${song}`).then(async res => {
            Current = res.data.name;
            await io.emit('prepare', res.data.name);
            await console.log('[✅] Loading - ' + Current)
            let videos = await youtube.search(`${res.data.name} ${res.data.artist}`);
            let video = videos[0];
            let url = video.snippet.url;
            await yt.convertAudio({
                url,
                itag: 140,
                directoryDownload: __dirname,
                title: 'audio'
            }, () => { }, async () => {
                let mp3file = await fs.readFileSync(__dirname + '\\audio.mp3');
                CurrentVal = await mp3file;
                await io.emit('play', mp3file);
                CurrentInterval = setInterval(() => {
                    CurrentTime++;
                }, 1000)
                await console.log('[✅] Now Playing - ' + Current)
                await fs.unlinkSync(__dirname + '\\audio.mp3');
            })
        })
    })
    socket.on('ended', () => {
        Current = false;
        CurrentVal = '';
        clearInterval(CurrentInterval);
        CurrentTime = 0;
    });
    socket.on('update', (ctime) => {
        CurrentTime = ctime;
    })
    socket.on('disconnect' , () => {
        console.log('[✅] A user disconnected!')
        console.log('');
    })
})

server.listen(80, () => {
    console.log('[✅] Server listening at: http://localhost');
    console.log('');
})