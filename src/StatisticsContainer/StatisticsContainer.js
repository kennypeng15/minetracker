import "./StatisticsContainer.css";
import StatDisplay from "./StatDisplay";

export default function StatisticsContainer({ dataList }) {
    return (
        <>
            <div className="statistics-container">
                {dataList.some(d => d["board-solved"]) && <div className="stat-tile">
                    <StatDisplay dataList={dataList.filter(d => d["board-solved"])} />
                </div>}
                {dataList.some(d => !d["board-solved"]) && <div className="stat-tile">
                    <StatDisplay dataList={dataList.filter(d => !d["board-solved"])} />
                </div>}
                {dataList.some(d => !d["board-solved"]) && <div className="stat-tile">
                    <StatDisplay dataList={dataList} />
                </div>}
            </div>
        </>
    )
}