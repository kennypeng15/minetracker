import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import axiosRetry from "axios-retry";
import { Scatter, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart } from 'recharts';
import moment from 'moment'
import CustomTooltip from "./CustomTooltip";
import StatDisplay from "./StatDisplay";
import LinearRegression from "./LinearRegression";
import MovingAverage from "./MovingAverage";
import Header from "./Header";
import Footer from "./Footer";
import "./App.css"

export default function App() {
  const [dataList, setDataList] = useState([]);
  const [difficulty, setDifficulty] = useState("expert");
  const [solvedOnly, setSolvedOnly] = useState(true);
  const [minSolvedPercent, setMinSolvedPercent] = useState("100");
  const [minBoard3bv, setMinBoard3bv] = useState("0");
  const [minEfficiency, setMinEfficiency] = useState("0");
  const [graphYAxis, setGraphYAxis] = useState("time")
  const [useEstimatedTime, setUseEstimatedTime] = useState(true);
  const [regressionVisible, setRegressionVisible] = useState(true);
  const [movingAverageVisible, setMovingAverageVisible] = useState(true);
  const [movingAverageWindow, setMovingAverageWindow] = useState(10);
  const [latestDataTimestamp, setLatestDataTimestamp] = useState("not available yet");

  // retry axios requests if they fail
  // helpful to avoid not having any data on first page load.
  axiosRetry(axios, { retries: 3 });

  // use useEffect to dynamically construct a query string and obtain
  // relevant data any time a specified state variable changes
  useEffect(() => {
    // build the query string
    // defaults for the text inputs prevent everything breaking when no input
    let dataQueryUrl = "https://kennypeng15.pythonanywhere.com/data?";
    dataQueryUrl += ("difficulty=" + difficulty);
    dataQueryUrl = dataQueryUrl + "&solved=" + solvedOnly;
    dataQueryUrl = dataQueryUrl + "&solved_percent_threshold=" + (minSolvedPercent.length > 0 ? minSolvedPercent : "100");
    dataQueryUrl = dataQueryUrl + "&3bv_threshold=" + (minBoard3bv.length > 0 ? minBoard3bv : "0");
    dataQueryUrl = dataQueryUrl + "&efficiency_threshold=" + (minEfficiency.length > 0 ? minEfficiency : "0");

    // define an async function for data retrieval here so it plays nice with useEffect()
    // [see https://stackoverflow.com/questions/53332321/react-hook-warnings-for-async-function-in-useeffect-useeffect-function-must-ret]
    // note that we explicitly await for the first request to finish before proceeding with the second.
    const getAndSetGameDataAndTimestamp = async () => {
      const gameData = (await axios.get(dataQueryUrl)).data;
      gameData.forEach(d => {
        d.epochValue = moment(d["game-timestamp"]).valueOf(); // date -> epoch
        // use "effectiveTime" since we can technically have "Time" or "Estimated Time"
        d.effectiveTime = d["board-solved"]
          ? d["elapsed-time"]
          : useEstimatedTime
            ? d["estimated-time"]
            : d["elapsed-time"];
      });
      setDataList(gameData);

      const timestampData = (await axios.get("https://kennypeng15.pythonanywhere.com/latest-timestamp")).data;
      setLatestDataTimestamp(timestampData["latest-timestamp"]);
    }

    try {
      getAndSetGameDataAndTimestamp();
    }
    catch (err) {
      if (err.response) {
        // non-2xx status code
        alert("Request for data failed - status code did not indicate success: " + err.response.data + ", " + err.response.status);
      }
      else if (err.request) {
        // request made, no response received
        alert("Request for data failed - no response was received: " + err.request)
      }
      else {
        // something else went wrong
        alert("Request for data failed: " + err.message)
      }
      setDataList([]);
    }
  }, [difficulty, solvedOnly, minSolvedPercent, minBoard3bv, minEfficiency, useEstimatedTime])
  // see https://react.dev/reference/react/useEffect#examples-dependencies
  
  // TODO: maybe could have some kind of state to indicate if something is loading.
    // loading is initially true, then false after query executes, can have a loading spinner, ...
  // can maybe have a const that's something like "is there any data"
    // if there's none, don't show the empty graph or the empty stat container or anything - just show the filters

  // swag https://stackoverflow.com/questions/57302715/how-to-get-input-field-value-on-button-click-in-react
  const minSolvedPercentRef = useRef(null);
  const minBoard3bvRef = useRef(null);
  const minEfficiencyRef = useRef(null);
  const movingAverageWindowRef = useRef(null);

  // calculate linear regression for line of best fit
  // we try and optimize somewhat here - if state indicates the regression won't be visible, don't even calculate it
  const lineOfBestFitData = regressionVisible ? LinearRegression(dataList) : [];
  const movingAverageData = movingAverageVisible ? MovingAverage(dataList, movingAverageWindow) : [];

  return (
    <>
      <Header/>
      <hr/>
      <div className="latest-timestamp">
        <p>
          Date of latest available game data: {latestDataTimestamp}
        </p>
      </div>
      <div className="filter-selector">
        <div className="filter">
          Difficulty:
          <p>
            <label>
              <input type="radio" name="radio1" defaultChecked={true} onChange={() => setDifficulty("expert")} /> Expert
            </label>
          </p>
          <p>
            <label>
              <input type="radio" name="radio1" onChange={() => setDifficulty("intermediate")} /> Intermediate
            </label>
          </p>
          <p>
            <label>
              <input type="radio" name="radio1" onChange={() => setDifficulty("beginner")} /> Beginner
            </label>
          </p>
        </div>
        <div className="filter">
          Solved only?
          <p>
            <label>
              <input type="radio" name="radio2" value={true} defaultChecked={true} onChange={() => setSolvedOnly(true)} /> Yes
            </label>
          </p>
          <p>
            <label>
              <input type="radio" name="radio2" value={false} onChange={() => setSolvedOnly(false)} /> No
            </label>
          </p>
        </div>
        {!solvedOnly && <div className="filter">
          Min. solved %: (current: {minSolvedPercent}%)
          <p>
            <input name="textInput1" defaultValue={minSolvedPercent} ref={minSolvedPercentRef} />
            <button onClick={() => {
              if (parseInt(minSolvedPercentRef.current.value) && parseInt(minSolvedPercentRef.current.value) >= 50) {
                setMinSolvedPercent(minSolvedPercentRef.current.value.trim())
              }
              else {
                alert("Invalid filter input: solved percentage must be a number greater than or equal to 50.")
              }
            }}>
              Go!
            </button>
          </p>
        </div>}
        <div className="filter">
          Min. board 3BV: (current: {minBoard3bv})
          <p>
            <input name="textInput2" defaultValue="0" ref={minBoard3bvRef} />
            <button onClick={() => {
              // parseInt is falsey for 0, so we need a separate check
              if (minBoard3bvRef.current.value.trim() === "0" || (parseInt(minBoard3bvRef.current.value) && parseInt(minBoard3bvRef.current.value) >= 0)) {
                setMinBoard3bv(minBoard3bvRef.current.value.trim())
              }
              else {
                alert("Invalid filter input: minimum board 3bv must be a number greater than or equal to 0.")
              }
            }}>
              Go!
            </button>
          </p>
        </div>
        <div className="filter">
          Min. efficiency: (current: {minEfficiency})
          <p>
            <input name="textInput3" defaultValue="0" ref={minEfficiencyRef} />
            <button onClick={() => {
              if (minEfficiencyRef.current.value.trim() === "0" || (parseInt(minEfficiencyRef.current.value) && parseInt(minEfficiencyRef.current.value) >= 0)) {
                setMinEfficiency(minEfficiencyRef.current.value.trim())
              }
              else {
                alert("Invalid filter input: minimum efficiency must be a number greater than or equal to 0.")
              }
            }}>
              Go!
            </button>
          </p>
        </div>
      </div>

      <ResponsiveContainer width="98%" height={700}>
        <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid />
          {graphYAxis === "time" && <YAxis type="number" dataKey="effectiveTime" name="Time" unit="s" domain={['auto', 'auto']} />}
          {graphYAxis === "3bvps" && <YAxis type="number" dataKey="game-3bvps" name="3BV p/ second" domain={['auto', 'auto']} />}
          {graphYAxis === "efficiency" && <YAxis type="number" dataKey="efficiency" name="Efficiency" domain={['auto', 'auto']} />}
          <XAxis type="number" dataKey="epochValue" name="Unix Date" tickFormatter={(unixTime) => moment(unixTime).format('MM/DD/YY')} interval={0} domain={['auto', 'auto']} tickCount={8} padding={{ left: 35, right: 35 }} />
          <Scatter name="Line of Best Fit" data={lineOfBestFitData} fill="#c4c3c3" shape={{}} line={{ strokeWidth: 1.5 }} hide={!regressionVisible} legendType={regressionVisible ? "circle" : "none"} />
          <Scatter name="Minesweeper Games (Wins)" data={dataList.filter(d => d["board-solved"])} fill="#1ba843" shape={"circle"} onClick={d => window.open("https://minesweeper.online/game/" + d["game-id"], "_blank")} />
          <Scatter name="Minesweeper Games (Losses)" data={dataList.filter(d => !d["board-solved"])} fill="#eb904b" shape={"cross"} hide={solvedOnly} legendType={solvedOnly ? "none" : "circle"} />
          <Scatter name={"Moving Average (" + movingAverageWindow + ")"} data={movingAverageData} fill="#bb4beb" shape={{}} line={{ strokeWidth: 1 }} hide={!movingAverageVisible} legendType={movingAverageVisible ? "circle" : "none"} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={CustomTooltip} />
          {<Legend />}
        </ScatterChart>
      </ResponsiveContainer>
      <div className="graph-view-options">
        <div>
          Y-Axis view variable:
          <p>
            <label>
              <input type="radio" name="radio3" defaultChecked={true} onChange={() => setGraphYAxis("time")} /> Time
            </label>
          </p>
          <p>
            <label>
              <input type="radio" name="radio3" onChange={() => setGraphYAxis("3bvps")} /> 3BV / second
            </label>
          </p>
          <p>
            <label>
              <input type="radio" name="radio3" onChange={() => setGraphYAxis("efficiency")} /> Efficiency
            </label>
          </p>
        </div>
        {!solvedOnly && dataList.some(d => !d["Board Solved"]) && <div>
          For unsolved games, use:
          <p>
            <label>
              <input type="radio" name="radio4" defaultChecked={true} onChange={() => setUseEstimatedTime(true)} /> Estimated Time
            </label>
          </p>
          <p>
            <label>
              <input type="radio" name="radio4" onChange={() => setUseEstimatedTime(false)} /> Elapsed Time
            </label>
          </p>
        </div>}
        <div>
          Display line of best fit?
          <p>
            <label>
              <input type="radio" name="radio5" defaultChecked={true} onChange={() => setRegressionVisible(true)} /> Yes
            </label>
          </p>
          <p>
            <label>
              <input type="radio" name="radio5" onChange={() => setRegressionVisible(false)} /> No
            </label>
          </p>
        </div>
        <div>
          Display moving average?
          <p>
            <label>
              <input type="radio" name="radio6" defaultChecked={true} onChange={() => setMovingAverageVisible(true)} /> Yes
            </label>
          </p>
          <p>
            <label>
              <input type="radio" name="radio6" onChange={() => setMovingAverageVisible(false)} /> No
            </label>
          </p>
        </div>
        {movingAverageVisible && <div>
          Moving average window size: (current: {movingAverageWindow})
          <p>
            <input name="textInput4" defaultValue={movingAverageWindow} ref={movingAverageWindowRef} />
            <button onClick={() => {
              if (parseInt(movingAverageWindowRef.current.value) && parseInt(movingAverageWindowRef.current.value) >= 1) {
                setMovingAverageWindow(parseInt(movingAverageWindowRef.current.value.trim()))
              }
              else {
                alert("Invalid input: moving average window must be a number greater than or equal to 1.")
              }
            }}>
              Go!
            </button>
          </p>
        </div>}
      </div>
      <hr />
      <div className="multi-stat-container">
        <div>
          {dataList.some(d => d["board-solved"]) && <StatDisplay dataList={dataList.filter(d => d["board-solved"])} />}
        </div>
        <div>
          {!solvedOnly && dataList.some(d => !d["board-solved"]) && <StatDisplay dataList={dataList.filter(d => !d["board-solved"])} />}
        </div>
        <div>
          {!solvedOnly && dataList.some(d => !d["board-solved"]) && <StatDisplay dataList={dataList} />}
        </div>
      </div>
      <hr/>
      <Footer/>
    </>
  );
}

// backlog
// componentize what you can, to make this file smaller: https://react.dev/learn/importing-and-exporting-components
// dark mode ?
// qol: toggle to clear all filters?
// rename to be more consistent (i.e., this-casing vs thisCasing)
// make it look pretty, if you want
// routing - have a homepage with links to a writeup and the graph, ...
// can probably use react-router-dom or whatever idk need to look it up more

// componentization sketch: