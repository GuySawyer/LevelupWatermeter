var Gpio = require('onoff').Gpio;

// --–-------------------------------------------- Water Sensor Input

var calibrationFactor = 4.5;
var time;
var pulseCount = 0;
var flowRate = 0;
var flowMilliLitres = 0;
var totalMilliLitres = 0;
var capturedData = {
    timestamp: null,
    data: 0
};
var requestLoop;

console.log("Starting Pi!");
var waterInput = new Gpio(26, 'in', 'rising');

waterInput.watch(function (err, value) {
    if (err){
        console.log("Shit went wrong yo! ", err);
        return
    }
    if(value === 1)
        pulseCount++;
});

var timingLoop = setInterval(x => {
    var now = new Date();

    console.log("Current Time: " + now);
    
    if (now.getMinutes() % 10 === 0){
        console.log("Starting Read loop.");
        requestLoop = setInterval(y => {readData();}, 600000 );
        clearInterval(timingLoop);
    } else 
        console.log("Halting read input.");

}, 60000)

var readData = function () {
    flowRate = pulseCount / calibrationFactor;
    flowMilliLitres = (flowRate / 60) * 1000;
    totalMilliLitres += flowMilliLitres;

    console.log("Millileters - " + flowMilliLitres);
    
    updateValues({
        timestamp: Date.now(),
        data: flowMilliLitres
    });
    
    pulseCount = 0;
}

var dataPackageHasValues = function() {
    var hasData = false;
    capturedData.data.forEach(function(value) {
        if (value !== 0)
            hasData = true;
    }, this);
    return hasData;
}

// --–-------------------------------------------- Firebase connection

var firebase = require('firebase');

var config = {
    apiKey: "AIzaSyCnv_pELyujogedfQEq79uz8Ah0tXBQxrA",
    authDomain: "iot-levelup.firebaseapp.com",
    databaseURL: "https://iot-levelup.firebaseio.com",
    projectId: "iot-levelup",
    storageBucket: "iot-levelup.appspot.com",
    messagingSenderId: "407197410503"
  };

firebase.initializeApp(config);

var updateValues = function( data ){
    var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0);
    console.log("Pushing data ... - " + today.getTime());
    firebase.database().ref('Things/Thing-4/' + today.getTime()).push(data, function(err) {
        if (err)
            console.log("Shit went wrong yo! ", err.message);
        else
            console.log("Succesfully pushed data - " + today.getTime());
    })
}
