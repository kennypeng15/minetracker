import "./StatDisplay.css"

export default function StatDisplay({ dataList }) {
  const onlySolvedEntries = dataList.every(d => d["board-solved"]);
  const onlyUnsolvedEntries = dataList.every(d => !d["board-solved"]);

  const headerText = (onlySolvedEntries)
    ? ("Stats for " + dataList.length + " completed games:")
    : (onlyUnsolvedEntries)
      ? ("Stats for " + dataList.length + " incomplete games:")
      : ("Stats for " + dataList.length + " total (complete and incomplete) games:");

  // calculate stats
  // dataList should already be filtered when it's passed in as a param, so just use effectiveTime
  const avgTime = (dataList.reduce((acc, el) => acc + el.effectiveTime, 0) / dataList.length).toFixed(3);
  const bestTime = Math.min(...dataList.map(game => game.effectiveTime));
  const avg3bvps = (dataList.reduce((acc, el) => acc + el["game-3bvps"], 0) / dataList.length).toFixed(3);
  const best3bvps = Math.max(...dataList.map(game => game["game-3bvps"]));
  const avgEff = (dataList.reduce((acc, el) => acc + el["efficiency"], 0) / dataList.length).toFixed(3);
  const bestEff = Math.max(...dataList.map(game => game["efficiency"]));
  const avgClicks = (dataList.reduce((acc, el) => acc + el["total-clicks"], 0) / dataList.length).toFixed(3);
  const avgBoard3bv = (dataList.reduce((acc, el) => acc + el["board-3bv"], 0) / dataList.length).toFixed(3);

  return (
    <>
      <div className="stat-header">
        {headerText}
      </div>
      <div className="stat-grid-container">
        <div>
          Avg. time: {avgTime} s
        </div>
        <div>
          Best time: {bestTime} s
        </div>
        <div>
          Avg. 3BV/s: {avg3bvps}
        </div>
        <div>
          Best 3BV/s: {best3bvps}
        </div>
        <div>
          Avg. efficiency: {avgEff}%
        </div>
        <div>
          Best efficiency: {bestEff}%
        </div>
        <div>
          Avg. # clicks: {avgClicks}
        </div>
        <div>
          Avg. board 3BV: {avgBoard3bv}
        </div>
      </div>
    </>
  );
}