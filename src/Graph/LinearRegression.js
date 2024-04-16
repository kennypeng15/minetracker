export default function LinearRegression(dataList) {
  // modified from SO question 6195335/linear-regression-in-javascript
  // calcuate for time as the y-axis variable (x-axis is always epoch value)
  var lr = {};
  var n = dataList.length;
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var sum_yy = 0;

  for (var i = 0; i < dataList.length; i++) {
    var cur_x = dataList[i].epochValue;
    var cur_y = dataList[i]["effectiveTime"];

    sum_x += cur_x;
    sum_y += cur_y;
    sum_xy += cur_x * cur_y;
    sum_xx += cur_x * cur_x;
    sum_yy += cur_y * cur_y;
  }

  lr["timeSlope"] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
  lr["timeIntercept"] = (sum_y - lr["timeSlope"] * sum_x) / n;
  lr["timeR2"] = Math.pow(
    (n * sum_xy - sum_x * sum_y) /
      Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)),
    2
  );

  // calculate for 3bvps as the y-axis
  sum_y = 0;
  sum_xy = 0;
  sum_yy = 0;

  for (i = 0; i < dataList.length; i++) {
    cur_x = dataList[i].epochValue;
    cur_y = dataList[i]["game-3bvps"];

    sum_y += cur_y;
    sum_xy += cur_x * cur_y;
    sum_yy += cur_y * cur_y;
  }

  lr["3bvpsSlope"] =
    (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
  lr["3bvpsIntercept"] = (sum_y - lr["3bvpsSlope"] * sum_x) / n;
  lr["3bvpsR2"] = Math.pow(
    (n * sum_xy - sum_x * sum_y) /
      Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)),
    2
  );

  // calculate for efficiency as the y-axis
  sum_y = 0;
  sum_xy = 0;
  sum_yy = 0;

  for (i = 0; i < dataList.length; i++) {
    cur_x = dataList[i].epochValue;
    cur_y = dataList[i]["efficiency"];

    sum_y += cur_y;
    sum_xy += cur_x * cur_y;
    sum_yy += cur_y * cur_y;
  }

  lr["efficiencySlope"] =
    (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
  lr["efficiencyIntercept"] = (sum_y - lr["efficiencySlope"] * sum_x) / n;
  lr["efficiencyR2"] = Math.pow(
    (n * sum_xy - sum_x * sum_y) /
      Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)),
    2
  );

  // dataKeys are "effectiveTime, "game-3bvps", and "efficiency"
  const sorted = dataList.sort((a, b) => a.epochValue - b.epochValue);
  const minPoint = dataList.length > 0 ? sorted[0].epochValue - 500000000 : 0; // - 1000000000
  const maxPoint =
    dataList.length > 0
      ? sorted[dataList.length - 1].epochValue + 500000000
      : 0;
  const lineOfBestFitData = [
    {
      epochValue: minPoint,
      effectiveTime: minPoint * lr["timeSlope"] + lr["timeIntercept"],
      efficiency: minPoint * lr["efficiencySlope"] + lr["efficiencyIntercept"],
      "game-3bvps": minPoint * lr["3bvpsSlope"] + lr["3bvpsIntercept"],
    },
    {
      epochValue: maxPoint,
      effectiveTime: maxPoint * lr["timeSlope"] + lr["timeIntercept"],
      efficiency: maxPoint * lr["efficiencySlope"] + lr["efficiencyIntercept"],
      "game-3bvps": maxPoint * lr["3bvpsSlope"] + lr["3bvpsIntercept"],
    },
  ];

  return lineOfBestFitData;
}
