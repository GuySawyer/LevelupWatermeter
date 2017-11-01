import React, { Component } from 'react';
import * as firebase from 'firebase';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import DailyGraph from './components/DailyGraph';
import WeeklyGraph from './components/WeeklyGraph';

import logo from './logo.svg';

import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

var config = {
    apiKey: "AIzaSyCnv_pELyujogedfQEq79uz8Ah0tXBQxrA",
    authDomain: "iot-levelup.firebaseapp.com",
    databaseURL: "https://iot-levelup.firebaseio.com",
    projectId: "iot-levelup",
    storageBucket: "iot-levelup.appspot.com",
    messagingSenderId: "407197410503"
  };

firebase.initializeApp(config);
const dbRef = firebase.database().ref("Things/Thing-4");



class App extends Component {
constructor(props){
  super(props);

  this.state = {
    dailyValues: null,
    weeklyValues: null,
    date: moment(),
    dateOld: null,
    dailyTotal: "0 ml",
    peakItem: {usage: 0, usageFormatted : "0.0ml", time: "00h00"},
    usageAverage: "0 ml"
  }

  this.changeDate = this.changeDate.bind(this);
  this.setDailyValues();
  this.setWeeklyValues();
}

componentDidUpdate() {
  if (this.state.date !== this.state.dateOld) {
    this.setDailyValues();
    this.setWeeklyValues();
    this.setState({dateOld: this.state.date})
  
  }
}

changeDate(date) {
  this.setState({
    date: date
  });
}

setDailyValues() {
  var selectedDate = new Date(this.state.date.year(), this.state.date.month(), this.state.date.date(), 0, 0, 0, 0);
  var selectedDateDeprecated = new Date(this.state.date.year(), this.state.date.month(), this.state.date.date(), 2, 0, 0, 0);
  dbRef.orderByKey().startAt(selectedDate.getTime().toString()).endAt(selectedDateDeprecated.getTime().toString()).on("value", snapshot => {
    
    var tempModel = [];
    var total = 0;
    var peakItem = {usage: 0, usageFormatted : "0.0ml", time: "00h00"};
    var positiveReadingCount = 0;
    
    snapshot.forEach(entry => {
      entry.forEach(item => {

        var time = new Date(item.child('timestamp').val());
        var usage = Math.round(item.child("data").val()*100)/100;

        total += usage;

        if (usage > peakItem.usage)
          peakItem = {
            usage : usage,
            usageFormatted: (Math.round(usage * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ml", 
            time: ((time.getHours() + "").length === 1? "0": "") + time.getHours() + "h" + (time.getMinutes() < 10? "0": "") + time.getMinutes()
          };

        if (usage !== 0)
          positiveReadingCount++;

        tempModel.push({
          timestamp: time,
          usage: usage
        })
      });

    })      
    var formattedTotal = (Math.round(total * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ml";
    var formattedAvg = (Math.round(total/positiveReadingCount * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ml" ;

    tempModel.sort((x, y) => {
      return x.timestamp.getTime() - y.timestamp.getTime();
    })
    
    this.setState({dailyValues: tempModel, dailyTotal: formattedTotal, peakItem: peakItem, usageAverage: formattedAvg});
  })
}

setWeeklyValues() {
  var selectedDate = new Date(this.state.date.year(), this.state.date.month(), this.state.date.date(), 0, 0, 0, 0);

  while (selectedDate.getDay() !== 1) {
    selectedDate.setDate(selectedDate.getDate() - 1);
  }

  var weeklyValues = [];

  for (var i = 0; i < 7; i++) {
    weeklyValues[i] = { date: new Date(selectedDate.getTime()), total: 0 };
    selectedDate.setDate(selectedDate.getDate() + 1);
  }

  var count = 0

  dbRef.orderByKey().startAt(weeklyValues[0].date.getTime() + "").limitToFirst(7).once("value", snapshot => {
    snapshot.forEach(day => {
      day.forEach(item => {
        weeklyValues[count].total += item.child("data").val();
      })
      weeklyValues[count].total = Math.round(weeklyValues[count].total*100)/100
      count++;
    })
    this.setState({weeklyValues: weeklyValues});
  })

}


  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Aliens Water Sensor</h2>
          <DatePicker
            dateFormat="DD/MM/YYYY"
            className="date-picker"
            selected={this.state.date}
            onChange={this.changeDate}
          />
        </div>
        <div> 
          {this.state.dailyValues !== null ? (this.state.dailyValues.length !==0 ? <DailyGraph data={this.state.dailyValues} date={this.state.date}/>: <h1>No Data For {this.state.date.format("DD/MM/YYYY")}</h1>) : <h1>Loading ...</h1>}
          <div className="stat-row">
            <div className="col-1">
              <h1>Daily Total</h1>
              <label>{this.state.dailyTotal}</label>
            </div>
            <div className="col-2">
              <h1>Daily Peak Time</h1>
              <label>{this.state.peakItem.time}</label><br/>
              <label>{this.state.peakItem.usageFormatted}</label>
            </div>
            <div className="col-3">
              <h1>Daily 10 Minute Average</h1>
              <label>{this.state.usageAverage}</label>
            </div>
          </div>
          {this.state.weeklyValues !== null ? <WeeklyGraph data={this.state.weeklyValues} /> : <h1>Loading ...</h1>}          
        </div>
      </div>
    );
  }
}

export default App;
