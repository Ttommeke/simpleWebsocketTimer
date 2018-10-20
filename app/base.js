let isPlaying = false
let secondsPerSecond = 1;
let currentSeconds = 0;
let currentMinutes = 0;

let minutesElement = document.getElementById('minutes');
let secondsElement = document.getElementById('seconds');
let playButtonElement = document.getElementById('playButton');
let pauseButtonElement = document.getElementById('pauseButton');
let currentSpeedElement = document.getElementById('currentSpeed');

let displayTime = function(minutes, seconds) {
    if (minutes < 10) {
        minutesElement.innerHTML = "0" + minutes;
    } else {
        minutesElement.innerHTML = minutes;
    }

    if (seconds < 10) {
        secondsElement.innerHTML = "0" + seconds;
    } else {
        secondsElement.innerHTML = seconds;
    }
}

let socket = io();
socket.on('connect', function(){});
socket.on('updateTime', function(data){
    currentSeconds = data.seconds;
    currentMinutes = data.minutes;

    displayTime(data.minutes, data.seconds);
});
socket.on('updateState', function(data){
    currentSeconds = data.seconds;
    currentMinutes = data.minutes;

    displayTime(data.minutes, data.seconds);
    isPlaying = data.isPlaying;
    secondsPerSecond = data.secondsPerSecond;

    if (currentSpeedElement != null) {
        currentSpeedElement.innerHTML = secondsPerSecond;
    }
});
socket.on('disconnect', function(){});

let play = function() {
    socket.emit("play", {});
};

let pause = function() {
    socket.emit("pause", {});
};

let setSecondsPerSecond = function(secondsPerSecond) {
    socket.emit("setsecondspersecond", { secondsPerSecond: secondsPerSecond });
};

let addTime = function(minutes, seconds) {
    let newSeconds = currentSeconds + seconds;
    let newMinutes = currentMinutes + minutes;

    if (newSeconds > 60) {
        newMinutes += newSeconds%60;
        newSeconds = newSeconds - 60*newSeconds%60;
    }

    socket.emit("settime", { minutes: newMinutes, seconds: newSeconds });
};

let resetToZero = function() {
    socket.emit("pause", { });
    socket.emit("settime", { minutes: 0, seconds: 0 });
};
