export default function HistogramData(dataList) {
    // considerations - 
    // if, in the `values` portion, we can actually push entire objects
    // from the `dataList` original object, we could probably get cool tooltips ...

    // could consider condensing the second for-loop for each display type
    // into one for loop over times at the end, for conciseness ...
    const times = dataList.map((data) => data["effectiveTime"]);
    const threeBVs = dataList.map((data) => data["game-3bvps"]);
    const efficiencies = dataList.map((data) => data["efficiency"]);

    // time calculation - increments of 1s
    const timeMin = Math.round(Math.min(...times));
    const timeMax = Math.round(Math.max(...times));
    let timeHistogramData = new Array(timeMax - timeMin + 1);
    for (let i = 0; i < timeHistogramData.length; i++) {
        timeHistogramData[i] = {
            name: (timeMin + i).toString() + " s",
            frequency: 0,
            values: []
        };
    }
    for (let i = 0; i < times.length; i++) {
        const index = Math.round(times[i]) - timeMin;
        timeHistogramData[index]["frequency"] += 1;
        timeHistogramData[index]["values"].push(times[i]);
    }

    // 3bvps calculation
    // we use increments of .1 3bvps, hence the rounding and multiplication by 10
    const threeBVMin = Math.min(...threeBVs);
    const threeBVMax = Math.max(...threeBVs);
    const threeBVLowerBound = Math.round(threeBVMin * 10);
    const threeBVUpperBound = Math.round(threeBVMax * 10);
    let threeBVHistogramData = new Array(threeBVUpperBound - threeBVLowerBound + 1);
    for (let i = 0; i < threeBVHistogramData.length; i++) {
        threeBVHistogramData[i] = {
            name: ((threeBVLowerBound + i) / 10).toString() + " 3bvp/s",
            frequency: 0,
            values: []
        };
    }
    for (let i = 0; i < threeBVs.length; i++) {
        const index = Math.round(threeBVs[i] * 10) - threeBVLowerBound;
        threeBVHistogramData[index]["frequency"] += 1;
        threeBVHistogramData[index]["values"].push(threeBVs[i]);
    }

    // efficiency calculation
    // use 1% increments
    const efficiencyMin = Math.min(...efficiencies);
    const efficiencyMax = Math.max(...efficiencies);
    let efficiencyHistogramData = new Array(efficiencyMax - efficiencyMin + 1);
    for (let i = 0; i < efficiencyHistogramData.length; i++) {
        efficiencyHistogramData[i] = {
            name: (efficiencyMin + i).toString() + " %",
            frequency: 0,
            values: []
        };
    }
    for (let i = 0; i < efficiencies.length; i++) {
        const index = efficiencies[i] - efficiencyMin;
        efficiencyHistogramData[index]["frequency"] += 1;
        efficiencyHistogramData[index]["values"].push(efficiencies[i]);
    }

    return [timeHistogramData, threeBVHistogramData, efficiencyHistogramData];
}