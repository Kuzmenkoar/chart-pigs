import React, { Component } from "react";
import wildPigData from "./wild-pig-data.json";
import "./App.css";
import { Grid, Fab, Slider } from "@material-ui/core";
import PlayArrow from "@material-ui/icons/PlayArrow";
import Pause from "@material-ui/icons/Pause";
import { insertUrlParam } from "./utils";

import {
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LabelList
} from "recharts";

const colorMap = {
  0: "#c5ddff",
  1: "#90b6ff"
};

const YEAR = 'year'
const PAUSED = 'paused'

const pigData = wildPigData["PIG POPULATIONS"];

const uniqYears = new Set(pigData.map(el => el.year));
const yearSelection = Array.from(uniqYears);

const getYearData = year => pigData.filter(el => el.year === year);

const TIME_STEP = 2000;

const searchParams = new URLSearchParams(window.location.search);
const paused = searchParams.get(PAUSED) === "true";
const queryYear = searchParams.get(YEAR);
const year = queryYear ? Number(queryYear) : yearSelection[0];

class App extends Component {
  state = {
    data: getYearData(year),
    paused,
    year
  };

  timerId = null;

  handleClick = () => {
    this.setState(prevState => {
      const nextPaused = !prevState.paused;

      insertUrlParam(PAUSED, String(nextPaused));

      if (nextPaused) {
        this.stopTimer();
      } else {
        this.startTimer();
      }

      return {
        paused: nextPaused
      };
    });
  };

  componentDidMount() {
    if (!this.state.paused) {
      this.startTimer();
    }
  }

  startTimer = () => {
    this.timerId = setTimeout(() => {
      this.setState(prevState => {
        const nextIndex =
          yearSelection.findIndex(el => el === prevState.year) + 1;
        const nextYear =
          yearSelection.length > nextIndex
            ? yearSelection[nextIndex]
            : yearSelection[0];

        insertUrlParam(YEAR, nextYear);

        return {
          data: getYearData(nextYear),
          year: nextYear
        };
      });
      this.startTimer();
    }, TIME_STEP);
  };

  stopTimer = () => {
    clearTimeout(this.timerId);
  };

  render() {
    return (
      <Grid
        container
        spacing={0}
        align="center"
        justify="center"
        direction="column"
        style={{ minHeight: "100vh" }}
      >
        <Grid container align="center" justify="center" direction="column">
          <Grid item>
            <BarChart width={800} height={400} data={this.state.data}>
              <XAxis dataKey="island" />
              <YAxis yAxisId="pigPopulation" />
              <Tooltip />
              <CartesianGrid vertical={false} />
              <Bar yAxisId="pigPopulation" dataKey="pigPopulation">
                <LabelList fill="#000" />
                {this.state.data.map((entry, index) => (
                  <Cell key={entry.island} fill={colorMap[index % 2]} />
                ))}
              </Bar>
            </BarChart>
          </Grid>
          <Grid container spacing={4} alignItems="flex-end" justify="center">
            <Grid item>
              <Fab color="primary" aria-label="add" onClick={this.handleClick}>
                {this.state.paused ? <PlayArrow /> : <Pause />}
              </Fab>
            </Grid>
            <Grid item xs={6} align="center">
              <Slider
                value={this.state.year}
                disabled
                aria-labelledby="discrete-slider"
                valueLabelDisplay="on"
                step={1}
                marks
                min={yearSelection[0]}
                max={yearSelection[yearSelection.length - 1]}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default App;
