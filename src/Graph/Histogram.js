import React, { useState } from "react";
import {
  BarChart,
  Bar,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import HistogramData from "./HistogramData";
import "./Graph.css";

export default function Histogram({ dataList, darkMode, graphYAxis }) {
  // experimental features!
  const [showExperimentalFeatures, setShowExperimentalFeatures] = useState(false);
  // const [histogramDisplayVisible, setHistogramDisplayVisible] = useState(false);
  // const [excludeOutliers, setExcludeOutliers] = useState(false);
  // show IQR?
  
  // for the histogram displays:
  // we need a separate Bar Chart for each view mode (time, 3bvps, efficiency),
  // as the x-axis will be different and thus cannot be shared.
  const histogramData = HistogramData(dataList);

  return (
    <>
      <div className="graph-view-options-container">
        <div className="graph-view-option">
          <div
            className={
              darkMode
                ? "graph-view-option-title-dark"
                : "graph-view-option-title"
            }
          >
            Enable experimental features?
          </div>
          <div className="graph-view-option-radio">
            <p>
              <label>
                <input
                  type="radio"
                  name="experimentalFeatureToggleRadio"
                  onChange={() => setShowExperimentalFeatures(true)}
                />{" "}
                Yes
              </label>
            </p>
            <p>
              <label>
                <input
                  type="radio"
                  name="experimentalFeatureToggleRadio"
                  onChange={() => setShowExperimentalFeatures(false)}
                  defaultChecked={true}
                />{" "}
                No
              </label>
            </p>
          </div>
        </div>
        {showExperimentalFeatures ? 
          <div
            className={
              darkMode
                ? "graph-view-option-title-dark"
                : "graph-view-option-title"
            }
          >
            Show IQR and outliers?
          </div>
          :
          <div className="spacer"></div> 
        }
        {showExperimentalFeatures ? 
          <div
            className={
              darkMode
                ? "graph-view-option-title-dark"
                : "graph-view-option-title"
            }
          >
            Show mean and median?
          </div>
          :
          <div className="spacer"></div> 
        }
        {showExperimentalFeatures ? 
          <div
            className={
              darkMode
                ? "graph-view-option-title-dark"
                : "graph-view-option-title"
            }
          >
            Percentage / percentile view?
          </div>
          :
          <div className="spacer"></div> 
        }
      </div>
      {showExperimentalFeatures && (graphYAxis === "time") && <div className="graph-wrapper">
        <ResponsiveContainer width="98%" height={500}>
          <BarChart
            data={histogramData[0]}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="frequency" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div> /* need to adjust stroke colors depending on dark mode. */}
      {showExperimentalFeatures && (graphYAxis === "3bvps") && <div className="graph-wrapper">
        <ResponsiveContainer width="98%" height={500}>
          <BarChart
            data={histogramData[1]}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="frequency" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div> /* need to adjust stroke colors depending on dark mode. */}
      {showExperimentalFeatures && (graphYAxis === "efficiency") && <div className="graph-wrapper">
        <ResponsiveContainer width="98%" height={500}>
          <BarChart
            data={histogramData[2]}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="frequency" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div> /* need to adjust stroke colors depending on dark mode. */}
    </>
  );
}
