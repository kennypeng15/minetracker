import "./StatisticsContainer.css";
import StatDisplay from "./StatDisplay";

export default function StatisticsContainer({ dataList }) {
    return (
        <>
            <div className="statistics-container">
                <div className="stat-tile">
                    {dataList.some(d => d["board-solved"]) && <StatDisplay dataList={dataList.filter(d => d["board-solved"])} />}
                </div>
                <div className="stat-tile">
                    {dataList.some(d => !d["board-solved"]) && <StatDisplay dataList={dataList.filter(d => !d["board-solved"])} />}
                </div>
                <div className="stat-tile">
                    {dataList.some(d => !d["board-solved"]) && <StatDisplay dataList={dataList} />}
                </div>
            </div>
        </>
    )
}