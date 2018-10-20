const express = require("express");
const bodyparser = require("body-parser");
const app = express();

let port = 5000;
app.use(bodyparser.urlencoded(
    {extended: false}
));

app.use(bodyparser.json());

app.use("/node_modules", express.static(__dirname + "/node_modules"));
app.use("/", express.static(__dirname + "/app"));

let httpServer = app.listen(process.env.PORT || port, function () {
    console.log("Timer server running at: http://localhost:" + port + "/");
});

//timer

let hunderdCounter = 100;
let secondsPerSecond = 1;

let isPlaying = false;

let minutes = 10;
let seconds = 0;

let countdownInterval = undefined;

let countdown = function () {
    hunderdCounter -= secondsPerSecond;

    if (hunderdCounter <= 0) {
        hunderdCounter = 100;
        seconds--;
        emitUpdateTime(minutes, seconds);
    }

    if (seconds < 0) {
        seconds = 59;
        minutes--;
        emitUpdateTime(minutes, seconds);
    }

    if ((minutes == 0 && seconds == 0) || minutes < 0) {
        pause();
        minutes = 0;
        seconds = 0;
        emitUpdateTime(minutes, seconds);
    }
};

let play = function() {
    if (countdownInterval == undefined) {
        countdownInterval = setInterval(countdown, 10);
        isPlaying = true;
    }
};

let pause = function() {
    if (countdownInterval !== undefined) {
        clearInterval(countdownInterval);
        countdownInterval = undefined;
        isPlaying = false;
    }
}

let io = require('socket.io')(httpServer);

let emitUpdateTime = function(minutes, seconds) {
    io.emit("updateTime", {
        "minutes": minutes,
        "seconds": seconds
    })
}

let emitUpdateSate = function(minutes, seconds, isPlaying, secondsPerSecond) {
    io.emit("updateState", {
        "minutes": minutes,
        "seconds": seconds,
        "isPlaying": isPlaying,
        "secondsPerSecond": secondsPerSecond
    })
};

io.on('connection', function(client){
    client.emit("updateState", {
        "minutes": minutes,
        "seconds": seconds,
        "isPlaying": isPlaying,
        "secondsPerSecond": secondsPerSecond
    });

    client.on('play', function(data){
        play();
        emitUpdateSate(minutes, seconds, isPlaying, secondsPerSecond);
    });
    client.on('pause', function(data){
        pause();
        emitUpdateSate(minutes, seconds, isPlaying, secondsPerSecond);
    });
    client.on('setsecondspersecond', function(data){
        secondsPerSecond = data.secondsPerSecond;
        emitUpdateSate(minutes, seconds, isPlaying, secondsPerSecond);
    });
    client.on('settime', function(data){
        minutes = data.minutes;
        seconds = data.seconds;

        if (minutes < 0 || seconds < 0) {
            minutes = 0;
            seconds = 0;
            pause();
        }

        emitUpdateSate(minutes, seconds, isPlaying, secondsPerSecond);
    });

    client.on('disconnect', function(){

    });
});
