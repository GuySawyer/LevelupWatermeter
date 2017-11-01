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


    firebase.database().ref('Things/Thing-5/' + Math.round(Math.random()*50000)).push({on: true}, function(err) {
        if (err) {
            console.log("Shit went wrong yo! ", err.message);
        } else {
            console.log("Success!!!");
        }
    })
