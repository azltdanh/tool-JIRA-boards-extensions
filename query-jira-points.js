var LANES = {
    TODO: 6378,
    BLOCKED: 7298,
    PROGRESS: 6379,
    REVIEW: 9916,
    FAILED: 7299,
    TESTING: 7300,
    ACCEPTANCE: 7301,
    DONE: 6380
};
var calcSum = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
var getLanePoints = colId =>
    $(`[data-column-id="${colId}"] .ghx-estimate`).text().split('').filter(p => parseInt(p));
var sprintPoints = [];
Object.keys(LANES).forEach(colName => {
    var points = getLanePoints(LANES[colName]);
    var sum = (points.length ? points : [0]).reduce(calcSum);
    sprintPoints.push(sum);
    console.log(`${colName} ${points.length} tickets ${sum} pts [${points}]`);
});
console.log(`(commit: 55, planned: 59, actual: ${sprintPoints.reduce(calcSum)}, acceptance: ${sprintPoints[sprintPoints.length - 2]}, done: ${sprintPoints[sprintPoints.length - 1]})`)

