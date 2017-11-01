import React from 'react';
import { Tooltip, XAxis, YAxis, BarChart, Bar, Legend } from 'recharts';

import "./style.css";



export default class DailyGraph extends React.Component {
  constructor(props){
    super(props)
    
    this.state = {
      width: window.innerWidth
    }

    this.updateDimensions = this.updateDimensions.bind(this);
  }

  updateDimensions() {
    this.setState({width: window.innerWidth});
  }
  componentWillMount() {
      this.updateDimensions();
  }
  componentDidMount() {
      window.addEventListener("resize", this.updateDimensions);
  }
  componentWillUnmount() {
      window.removeEventListener("resize", this.updateDimensions);
  }

  render() {
    var graphData = this.props.data.map(item => {
      var formattedTime = ((item.timestamp.getHours() + "").length === 1? "0": "") + item.timestamp.getHours() + ":" + (item.timestamp.getMinutes() < 10? "0": "") + item.timestamp.getMinutes();
      return {timestamp: formattedTime, usage: item.usage}      
    })
    
    return (
      <div className="container">
          <h1>Daily Reading for {this.props.date.format("ddd, DD/MM/YYYY")}</h1>
        <BarChart width={this.state.width} height={400} data={graphData}
                  margin={{top: 5, right: 90, left: 50, bottom: 5}}>
            <Bar name=" Water usage in Millileters" dataKey="usage" fill="#4ED1FC" />
            <XAxis dataKey="timestamp"/>
            <YAxis />
            <Legend verticalAlign="top" height={36} />
            <Tooltip/>
        </BarChart>
      </div>
    );
  }
}