import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import axiosRetry from "axios-retry";
import moment from 'moment'
import ClipLoader from "react-spinners/ClipLoader";
import Header from "./Header/Header";
import Graph from "./Graph/Graph";
import StatisticsContainer from "./StatisticsContainer/StatisticsContainer";
import Footer from "./Footer/Footer";
import "./App.css"

export default function App() {
  const [dataList, setDataList] = useState([]);
  const [difficulty, setDifficulty] = useState("expert");
  const [solvedOnly, setSolvedOnly] = useState(true);
  const [minSolvedPercent, setMinSolvedPercent] = useState("100");
  const [minBoard3bv, setMinBoard3bv] = useState("0");
  const [minEfficiency, setMinEfficiency] = useState("0");
  const [latestDataTimestamp, setLatestDataTimestamp] = useState("not available yet");
  const [loading, setLoading] = useState(true);

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
      // if we want the loading spinner only on first load, comment out the below.
      // setLoading(true);
      const gameData = (await axios.get(dataQueryUrl)).data;
      gameData.forEach(d => {
        d.epochValue = moment(d["game-timestamp"]).valueOf(); // date -> epoch
        // use "effectiveTime" since we can technically have "Time" or "Estimated Time"
        d.effectiveTime = d["board-solved"]
          ? d["elapsed-time"]
          : d["estimated-time"];
      });
      setDataList(gameData);

      const timestampData = (await axios.get("https://kennypeng15.pythonanywhere.com/latest-timestamp")).data;
      setLatestDataTimestamp(timestampData["latest-timestamp"]);
      // this could be moved after the first set as well, if we want it displayed for slightly less time.
      setLoading(false);
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
  }, [difficulty, solvedOnly, minSolvedPercent, minBoard3bv, minEfficiency])
  // see https://react.dev/reference/react/useEffect#examples-dependencies

  // swag https://stackoverflow.com/questions/57302715/how-to-get-input-field-value-on-button-click-in-react
  const minSolvedPercentRef = useRef(null);
  const minBoard3bvRef = useRef(null);
  const minEfficiencyRef = useRef(null);

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
              <input type="radio" name="difficultySelectorRadio" defaultChecked={true} onChange={() => setDifficulty("expert")} /> Expert
            </label>
          </p>
          <p>
            <label>
              <input type="radio" name="difficultySelectorRadio" onChange={() => setDifficulty("intermediate")} /> Intermediate
            </label>
          </p>
          <p>
            <label>
              <input type="radio" name="difficultySelectorRadio" onChange={() => setDifficulty("beginner")} /> Beginner
            </label>
          </p>
        </div>
        <div className="filter">
          Solved only?
          <p>
            <label>
              <input type="radio" name="solvedOnlyRadio" value={true} defaultChecked={true} onChange={() => setSolvedOnly(true)} /> Yes
            </label>
          </p>
          <p>
            <label>
              <input type="radio" name="solvedOnlyRadio" value={false} onChange={() => setSolvedOnly(false)} /> No
            </label>
          </p>
        </div>
        {!solvedOnly && <div className="filter">
          Min. solved %: (current: {minSolvedPercent}%)
          <p>
            <input name="minSolvedPercentInput" defaultValue={minSolvedPercent} ref={minSolvedPercentRef} />
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
            <input name="minBoard3bvInput" defaultValue="0" ref={minBoard3bvRef} />
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
            <input name="minEfficiencyInput" defaultValue="0" ref={minEfficiencyRef} />
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
      {loading && <div className="spinner">
        <ClipLoader
          size={100}
          color={"#4287f5"}
          loading={loading}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>}
      {!loading && dataList.length === 0 && <div className="no-data-message">
        <h2>
          No data available for the selected filters.
        </h2>
      </div>}
      {!loading && dataList.length > 0 && <Graph dataList={dataList}/>}
      {!loading && dataList.length > 0 && <hr/>}
      {!loading && dataList.length > 0 && <StatisticsContainer dataList={dataList}/>}
      <hr/>
      <Footer/>
    </>
  );
}

// backlog
// dark mode ?
// qol: toggle to clear all filters?
// rename to be more consistent (i.e., this-casing vs thisCasing)
// make it look pretty, if you want
// routing - have a homepage with links to a writeup and the graph, ...
// can probably use react-router-dom or whatever idk need to look it up more