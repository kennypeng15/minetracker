export default function MovingAverage(dataList, windowSize) {
    var returnDataList = [];
    // return empty arr if can't calculate an MA at all
    if (windowSize > dataList.length || windowSize < 1) {
        return returnDataList;
    }

    var currentTimeWindow = 0;
    var currentEffWindow = 0;
    var current3bvpsWindow = 0;

    var i = 0;
    while (i < windowSize) {
        currentTimeWindow += dataList[i]["effectiveTime"];
        currentEffWindow += dataList[i]["efficiency"];
        current3bvpsWindow += dataList[i]["game-3bvps"]
        i += 1;
    }

    returnDataList.push(
        {
            epochValue: dataList[i - 1]["epochValue"],
            effectiveTime: currentTimeWindow / windowSize,
            efficiency: currentEffWindow / windowSize,
            "game-3bvps": current3bvpsWindow / windowSize
        }
    )

    while (i < dataList.length) {
        currentTimeWindow = currentTimeWindow + dataList[i]["effectiveTime"] - dataList[i - windowSize]["effectiveTime"];
        currentEffWindow = currentEffWindow + dataList[i]["efficiency"] - dataList[i - windowSize]["efficiency"];
        current3bvpsWindow = current3bvpsWindow + dataList[i]["game-3bvps"] - dataList[i - windowSize]["game-3bvps"];

        returnDataList.push(
            {
                epochValue: dataList[i]["epochValue"],
                effectiveTime: currentTimeWindow / windowSize,
                efficiency: currentEffWindow / windowSize,
                "game-3bvps": current3bvpsWindow / windowSize
            }
        )

        i += 1;
    }

    return returnDataList;
}