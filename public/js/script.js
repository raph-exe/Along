var socket = io();

let songInput = document.querySelector('.songInput');
let audio;

const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});

const typeAnimate = (text) => {
    songInput.placeholder = '';
    let array = text.split('')
    let i = 0;

    for (const letter of array) {
        setTimeout(() => {
            songInput.placeholder += letter;
        }, 100 * i);
        i++;
    }
};

const typeAnimate2 = (text) => {
    songInput.value = '';
    let array = text.split('')
    let i = 0;

    for (const letter of array) {
        setTimeout(() => {
            songInput.value += letter;
        }, 100 * i);
        i++;
    }
};

let ExampleSongs = [
    'Faded', 'Believer', 'Stay',
    'Havana', 'Closer', 'Mood',
    'Happier', 'Senorita', 'Be Alright',
    'No Lie', 'Baby', 'Counting Stars',
    'Radioactive', 'Payphone', 'Bailando',
    'Despacito', 'Perfect', 'Gasolina',
    'Mi Gente', 'Bad Dream', 'Dynamite'
];

let ExampleIndex = 0;

setInterval(() => {
    typeAnimate(ExampleSongs[ExampleIndex])
    ExampleIndex++;
    if (ExampleIndex == ExampleSongs.length) ExampleIndex = 0;
}, 3000)

songInput.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        socket.emit('play', songInput.value)
    }
});

socket.on('prepare', (songName) => {
    songInput.setAttribute('readonly', '')
    typeAnimate2(songName);
    Toast.fire({
        title: 'Loading song...',
        icon: 'info'
    });
})

socket.on('play', (mp3file, timeSong) => {
    if (audio) {
        audio.pause();
    }
    let blob = new Blob([mp3file], { type: 'audio/mp3' });
    let url = URL.createObjectURL(blob);
    audio = new Audio(url);
    audio.play();
    if (timeSong) {
        audio.currentTime = timeSong
    } else {
        socket.emit('update', audio.currentTime)
    }
    Toast.fire({
        title: 'Song loaded!',
        icon: 'success'
    });
    audio.addEventListener('ended', (e) => {
        songInput.removeAttribute('readonly')
        songInput.value = '';
        socket.emit('ended')
        Toast.fire({
            title: 'Song ended!',
            icon: 'info'
        });
    })
})