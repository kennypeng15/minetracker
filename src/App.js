import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import axiosRetry from "axios-retry";
import moment from 'moment'
import ClipLoader from "react-spinners/ClipLoader";
import Toggle from 'react-toggle'
import "react-toggle/style.css"
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
  const [earliestDate, setEarliestDate] = useState("")
  const [latestDate, setLatestDate] = useState("")
  const [latestDataTimestamp, setLatestDataTimestamp] = useState("not available yet");
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
    if (earliestDate !== "") {
      dataQueryUrl = dataQueryUrl + "&earliest_date=" + earliestDate;
    }
    if (latestDate !== "") {
      dataQueryUrl = dataQueryUrl + "&latest_date=" + latestDate;
    }

    // define an async function for data retrieval here so it plays nice with useEffect()
    // [see https://stackoverflow.com/questions/53332321/react-hook-warnings-for-async-function-in-useeffect-useeffect-function-must-ret]
    // note that we explicitly await for the first request to finish before proceeding with the second.
    const getAndSetGameDataAndTimestamp = async () => {
      // if we want the loading spinner only on first load, comment out the below.
      // setLoading(true);
      try {
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
      }
      // this could be moved after the first set as well, if we want it displayed for slightly less time.
      setLoading(false);
    }

    getAndSetGameDataAndTimestamp();
  }, [difficulty, solvedOnly, minSolvedPercent, minBoard3bv, minEfficiency, earliestDate, latestDate])
  // see https://react.dev/reference/react/useEffect#examples-dependencies

  // swag https://stackoverflow.com/questions/57302715/how-to-get-input-field-value-on-button-click-in-react
  const minSolvedPercentRef = useRef(null);
  const minBoard3bvRef = useRef(null);
  const minEfficiencyRef = useRef(null);
  const earliestDateRef = useRef(null);
  const latestDateRef = useRef(null);

  return (
    <>
      <div className={darkMode ? "app-wrapper-dark" : "app-wrapper"}>
        <Header />
        <div className="latest-timestamp">
          <p>
            Date of latest available game data: {latestDataTimestamp}
          </p>
        </div>
        <hr />
        <div className="filter-container">
          <div className="filter">
            <div className={darkMode ? "filter-title-dark" : "filter-title"}>
              Difficulty:
            </div>
            <div className="filter-radio">
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
          </div>
          <div className="filter">
            <div className={darkMode ? "filter-title-dark" : "filter-title"}>
              Solved only?
            </div>
            <div className="filter-radio">
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
          </div>
          {!solvedOnly && <div className="filter">
            <div className={darkMode ? "filter-title-dark" : "filter-title"}>
              Min. solved %: (current: {minSolvedPercent}%)
            </div>
            <div className="filter-input">
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
            </div>
          </div>}
          <div className="filter">
            <div className={darkMode ? "filter-title-dark" : "filter-title"}>
              Min. board 3BV: (current: {minBoard3bv})
            </div>
            <div className="filter-input">
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
            </div>
          </div>
          <div className="filter">
            <div className={darkMode ? "filter-title-dark" : "filter-title"}>
              Min. efficiency: (current: {minEfficiency})
            </div>
            <div className="filter-input">
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
            </div>
          </div>
          {solvedOnly && <div className="spacer"/>}
          <div className="filter">
            <div className={darkMode ? "filter-title-dark" : "filter-title"}>
              Earliest date (YYYY-MM-DD; current: {earliestDate === "" ? "N/A" : earliestDate}):
            </div>
            <div className="filter-input">
              <input name="earliestDateInput" defaultValue="" ref={earliestDateRef} />
              <button onClick={() => {
                if (moment(earliestDateRef.current.value.trim(), "YYYY-MM-DD", true).isValid()) {
                  setEarliestDate(earliestDateRef.current.value.trim())
                }
                else {
                  alert("Invalid filter input: earliest date must be a valid date in the format YYYY-MM-DD.")
                }
              }}>
                Go!
              </button>
              <button onClick={() => {
                setEarliestDate("");
                earliestDateRef.current.value = "";
              }}>
                Reset
              </button>
            </div>
          </div>
          <div className="filter">
            <div className={darkMode ? "filter-title-dark" : "filter-title"}>
              Latest date (YYYY-MM-DD; current: {latestDate === "" ? "N/A" : latestDate}):
            </div>
            <div className="filter-input">
              <input name="latestDateInput" defaultValue="" ref={latestDateRef} />
              <button onClick={() => {
                if (moment(latestDateRef.current.value.trim(), "YYYY-MM-DD", true).isValid()) {
                  setLatestDate(latestDateRef.current.value.trim())
                }
                else {
                  alert("Invalid filter input: latest date must be a valid date in the format YYYY-MM-DD.")
                }
              }}>
                Go!
              </button>
              <button onClick={() => {
                setLatestDate("");
                latestDateRef.current.value = "";
              }}>
                Reset
              </button>
            </div>
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
        {!loading && dataList.length > 0 && <Graph dataList={dataList} darkMode={darkMode} />}
        {!loading && dataList.length > 0 && <StatisticsContainer dataList={dataList} darkMode={darkMode} />}
        {!solvedOnly && <div className="solved-only-disclaimer">
          Note: for unsolved games, the estimated time is used for all displays and calculations.
        </div>}
        <hr />
        <Footer />
        <div className="toggle-wrapper">
          <Toggle
            defaultChecked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className='custom-toggle-colors'
            icons={{
              checked: <div style={{paddingTop: "4px"}} role="img" aria-label="sun">🌙</div>,
              unchecked: <div style={{paddingTop: "4px"}} role="img" aria-label="sun">☀️</div>,
            }}
            aria-label="Dark mode toggle" />
        </div>
      </div>
    </>
  );
}

// backlog
// qol: toggle to clear all filters?
// rename to be more consistent (i.e., this-casing vs thisCasing)
// consolidate shared css into a common css file ?
// routing - have a homepage with links to a writeup and the graph, ...
// can probably use react-router-dom or whatever idk need to look it up more