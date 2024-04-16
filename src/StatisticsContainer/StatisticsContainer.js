import "./StatisticsContainer.css";
import StatDisplay from "./StatDisplay";

export default function StatisticsContainer({ dataList, darkMode }) {
  return (
    <>
      <div className="statistics-container">
        {dataList.some((d) => d["board-solved"]) && (
          <div className="stat-tile">
            <StatDisplay
              dataList={dataList.filter((d) => d["board-solved"])}
              darkMode={darkMode}
            />
          </div>
        )}
        {dataList.some((d) => !d["board-solved"]) && (
          <div className="stat-tile">
            <StatDisplay
              dataList={dataList.filter((d) => !d["board-solved"])}
              darkMode={darkMode}
            />
          </div>
        )}
        {dataList.some((d) => !d["board-solved"]) && (
          <div className="stat-tile">
            <StatDisplay dataList={dataList} darkMode={darkMode} />
          </div>
        )}
      </div>
    </>
  );
}
