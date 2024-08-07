import React, { useRef, useState } from "react";
import {
  Scatter,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Dot,
} from "recharts";
import moment from "moment";
import CustomTooltip from "./CustomTooltip";
import Histogram from "./Histogram";
import LinearRegression from "./LinearRegression";
import MovingAverage from "./MovingAverage";
import "./Graph.css";

export default function Graph({ dataList, darkMode }) {
  const [graphYAxis, setGraphYAxis] = useState("time");
  const [regressionVisible, setRegressionVisible] = useState(true);
  const [movingAverageVisible, setMovingAverageVisible] = useState(true);
  const [movingAverageWindow, setMovingAverageWindow] = useState(10);

  const movingAverageWindowRef = useRef(null);

  // calculate linear regression (line of best fit) and moving average
  // we try and optimize somewhat here - if state indicates the regression won't be visible, don't even calculate it
  const lineOfBestFitData = regressionVisible ? LinearRegression(dataList) : [];
  const movingAverageData = movingAverageVisible
    ? MovingAverage(dataList, movingAverageWindow)
    : [];

  const solvedOnly = dataList.every((d) => d["board-solved"]);

  // dot rendering function for "hidden" tooltips, i.e., when we want tooltips
  // to be available, but we don't actually want to see the points on the graph
  // for sake of visual clarity.
  // the key here is to set fillOpacity = 0 --> transparently draws a circle
  function RenderDot({ cx, cy }) {
    return <Dot cx={cx} cy={cy} r={3} fill={"#ffffff"} fillOpacity={0} />;
  }

  return (
    <>
      <div className="graph-wrapper">
        <ResponsiveContainer width="98%" height={700}>
          <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={darkMode ? "#7d7d7d" : "#d1d1d1"} />
            {graphYAxis === "time" && (
              <YAxis
                type="number"
                dataKey="effectiveTime"
                name="Time"
                unit="s"
                domain={["auto", "auto"]}
                stroke={darkMode ? "#e0e0e0" : "#6e6e6e"}
              />
            )}
            {graphYAxis === "3bvps" && (
              <YAxis
                type="number"
                dataKey="game-3bvps"
                name="3BV p/ second"
                domain={["auto", "auto"]}
                stroke={darkMode ? "#e0e0e0" : "#6e6e6e"}
              />
            )}
            {graphYAxis === "efficiency" && (
              <YAxis
                type="number"
                dataKey="efficiency"
                name="Efficiency"
                domain={["auto", "auto"]}
                stroke={darkMode ? "#e0e0e0" : "#6e6e6e"}
              />
            )}
            <XAxis
              type="number"
              dataKey="epochValue"
              name="Unix Date"
              tickFormatter={(unixTime) =>
                moment(unixTime).format("YYYY-MM-DD")
              }
              interval={0}
              domain={["auto", "auto"]}
              tickCount={8}
              padding={{ left: 35, right: 35 }}
              stroke={darkMode ? "#e0e0e0" : "#6e6e6e"}
            />
            <Scatter
              name="Line of Best Fit"
              data={lineOfBestFitData}
              fill="#46e7f2"
              shape={RenderDot}
              line={{ strokeWidth: 1.5 }}
              hide={!regressionVisible}
              legendType={regressionVisible ? "circle" : "none"}
            />
            <Scatter
              name="Minesweeper Games (Wins)"
              data={dataList.filter((d) => d["board-solved"])}
              fill="#1ba843"
              shape={"circle"}
              onClick={(d) =>
                window.open(
                  "https://minesweeper.online/game/" + d["game-id"],
                  "_blank"
                )
              }
            />
            <Scatter
              name="Minesweeper Games (Losses)"
              data={dataList.filter((d) => !d["board-solved"])}
              fill="#faa141"
              shape={"cross"}
              hide={solvedOnly}
              legendType={solvedOnly ? "none" : "circle"}
            />
            <Scatter
              name={"Moving Average (" + movingAverageWindow + ")"}
              data={movingAverageData}
              fill="#f244ef"
              shape={RenderDot}
              line={{ strokeWidth: 1 }}
              hide={!movingAverageVisible}
              legendType={movingAverageVisible ? "circle" : "none"}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={CustomTooltip}
            />
            <Legend />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="graph-view-options-container">
        <div className="graph-view-option">
          <div
            className={
              darkMode
                ? "graph-view-option-title-dark"
                : "graph-view-option-title"
            }
          >
            Y-Axis view variable:
          </div>
          <div className="graph-view-option-radio">
            <p>
              <label>
                <input
                  type="radio"
                  name="yAxisSelectorRadio"
                  defaultChecked={true}
                  onChange={() => setGraphYAxis("time")}
                />{" "}
                Time
              </label>
            </p>
            <p>
              <label>
                <input
                  type="radio"
                  name="yAxisSelectorRadio"
                  onChange={() => setGraphYAxis("3bvps")}
                />{" "}
                3BV / second
              </label>
            </p>
            <p>
              <label>
                <input
                  type="radio"
                  name="yAxisSelectorRadio"
                  onChange={() => setGraphYAxis("efficiency")}
                />{" "}
                Efficiency
              </label>
            </p>
          </div>
        </div>
        <div className="graph-view-option">
          <div
            className={
              darkMode
                ? "graph-view-option-title-dark"
                : "graph-view-option-title"
            }
          >
            Display line of best fit?
          </div>
          <div className="graph-view-option-radio">
            <p>
              <label>
                <input
                  type="radio"
                  name="displayLineOfBestFitRadio"
                  defaultChecked={true}
                  onChange={() => setRegressionVisible(true)}
                />{" "}
                Yes
              </label>
            </p>
            <p>
              <label>
                <input
                  type="radio"
                  name="displayLineOfBestFitRadio"
                  onChange={() => setRegressionVisible(false)}
                />{" "}
                No
              </label>
            </p>
          </div>
        </div>
        <div className="graph-view-option">
          <div
            className={
              darkMode
                ? "graph-view-option-title-dark"
                : "graph-view-option-title"
            }
          >
            Display moving average?
          </div>
          <div className="graph-view-option-radio">
            <p>
              <label>
                <input
                  type="radio"
                  name="displayMovingAverageRadio"
                  defaultChecked={true}
                  onChange={() => setMovingAverageVisible(true)}
                />{" "}
                Yes
              </label>
            </p>
            <p>
              <label>
                <input
                  type="radio"
                  name="displayMovingAverageRadio"
                  onChange={() => setMovingAverageVisible(false)}
                />{" "}
                No
              </label>
            </p>
          </div>
        </div>
        {movingAverageVisible && (
          <div className="graph-view-option">
            <div
              className={
                darkMode
                  ? "graph-view-option-title-dark"
                  : "graph-view-option-title"
              }
            >
              Moving average window size: (current: {movingAverageWindow})
            </div>
            <div className="graph-view-option-input">
              <input
                name="textInput4"
                defaultValue={movingAverageWindow}
                ref={movingAverageWindowRef}
              />
              <button
                onClick={() => {
                  if (
                    parseInt(movingAverageWindowRef.current.value) &&
                    parseInt(movingAverageWindowRef.current.value) >= 1
                  ) {
                    setMovingAverageWindow(
                      parseInt(movingAverageWindowRef.current.value.trim())
                    );
                  } else {
                    alert(
                      "Invalid input: moving average window must be a number greater than or equal to 1."
                    );
                  }
                }}
              >
                Go!
              </button>
            </div>
          </div>
        )}
      </div>
      <Histogram dataList={dataList} darkMode={darkMode} graphYAxis={graphYAxis} />
    </>
  );
}
