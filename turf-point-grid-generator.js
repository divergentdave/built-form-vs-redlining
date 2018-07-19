// this function was taken from turf and rewritten to be a generator rather than return a list
var turf = require("@turf/turf");
var distance = turf.distance;
var point = turf.point;

function * pointGridGen(bbox, cellSide, options) {
    var west = bbox[0];
    var south = bbox[1];
    var east = bbox[2];
    var north = bbox[3];

    var xFraction = cellSide / (distance([west, south], [east, south], options));
    var cellWidth = xFraction * (east - west);
    var yFraction = cellSide / (distance([west, south], [west, north], options));
    var cellHeight = yFraction * (north - south);

    var bboxWidth = (east - west);
    var bboxHeight = (north - south);
    var columns = Math.floor(bboxWidth / cellWidth);
    var rows = Math.floor(bboxHeight / cellHeight);
    // adjust origin of the grid
    var deltaX = (bboxWidth - columns * cellWidth) / 2;
    var deltaY = (bboxHeight - rows * cellHeight) / 2;

    var currentX = west + deltaX;
    while (currentX <= east) {
        var currentY = south + deltaY;
        while (currentY <= north) {
            var cellPt = point([currentX, currentY], {});
            yield cellPt;
            currentY += cellHeight;
        }
        currentX += cellWidth;
    }
}

module.exports = pointGridGen;
