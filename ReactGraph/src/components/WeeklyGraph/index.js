import React from 'react';
import { Tooltip, XAxis, YAxis, BarChart, Bar, Legend } from 'recharts';

import "./style.css";

export default class WeeklyGraph extends React.Component {
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

  parseDate(date) {
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
  }

  render() {
    var graphData = this.props.data.map(item => {
      return { total: item.total, date: this.parseDate(item.date) }
    })
    return (
      <div className="container">
          <h1>Weekly Reading for {this.parseDate(this.props.data[0].date)} to {this.parseDate(this.props.data[6].date)}</h1>
        <BarChart width={this.state.width} height={400} data={graphData}
                  margin={{top: 5, right: 90, left: 50, bottom: 5}}>
            <Bar name=" Water usage in Millileters" dataKey="total" fill="#4ED1FC" />
            <XAxis dataKey="date"/>
            <YAxis />
            <Legend verticalAlign="top" height={36} />
            <Tooltip/>
        </BarChart>
      </div>
    );
  }
}
