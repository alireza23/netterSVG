const textArray = [];
const lineArray = [];
const linesByPoint = [];
const polylineArray = [];
const pathArray = [];
var groupCounter = 0
//-========================================START=====================================
$(document).ready(function () {
  //! creates a rectangle and prepends it to svg. this rect is used when user clicks
  //!On empty space and wants to clear out the screen
  createBackgroundRect();
  //! var def!
  const svg = document.getElementById("Layer_1");
  const texts = document.querySelectorAll(".st11");
  const lines = document.querySelectorAll("line");
  const polylines = document.querySelectorAll("polyline");
  const paths = document.querySelectorAll("path");
  //! get all texts with st11 class (these are texts that user should be able to click on)
  setupText(texts);
  //! fix multiline texts and group them as one
  fixMultiLineTexts(texts);
  //!makes all lines in svg clickable
  makesLinesClickable(svg);
  //! setup lines
  setupLines(lines);
  //! get interconnectedLinesByLines
  interConnectedlinesByLines();
  setupPolyLines(polylines);
  setupPaths(paths);
});

//-=================================== functions START ==================================

//*function to create fake thick lines that user can click on it
function makesLinesClickable(svg) {
  //makes lines clickable
  const lines = document.querySelectorAll("line");
  let i = 0;
  lines.forEach((line) => {
    let id = i;
    $(line).attr("dataID", `line${id}`);
    $(line).attr("lineGroup", `group${groupCounter}`);
    groupCounter++;
    //! get x1 y1 x2 y2 of each line and send out as aprams for creating fake lines
    //! these fake lines are thicker and used to grab when user wants to correct errors!
    createAndAppendFakeLines(
      line.x1.baseVal.value,
      line.y1.baseVal.value,
      line.x2.baseVal.value,
      line.y2.baseVal.value,
      id
    );
    i++;
  });

  // //make polyline clickable
  const polylines = document.querySelectorAll("polyline");

  polylines.forEach((polyline) => {
    let id = i;
    $(polyline).attr("dataID", `line${id}`);
    $(polyline).attr("lineGroup", `group${groupCounter}`);
    groupCounter++;
    //! get x1 y1 x2 y2 of each line and send out as aprams for creating fake lines
    //! these fake lines are thicker and used to grab when user wants to correct errors!
    const points = polyline.getAttribute("points");
    const seperatedPoints = splitPointsToSeperatedPoints(points);
    const polyLineConvertedToLines = convertPointsToLines(seperatedPoints);
    for (let j = 0; j < polyLineConvertedToLines.length; j++) {
      createAndAppendFakeLines(
        polyLineConvertedToLines[j].x1,
        polyLineConvertedToLines[j].y1,
        polyLineConvertedToLines[j].x2,
        polyLineConvertedToLines[j].y2,
        id
      );
    }
    i++;
  });
}

//sub=================================================================================

//*this function get 4 number and creates a fakeline and gives it an id and class
function createAndAppendFakeLines(x1, y1, x2, y2, id) {
  let newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  newLine.setAttribute("dataID", `Line${id}`);
  newLine.setAttribute("class", `fakeLine`);
  newLine.setAttribute("x1", x1);
  newLine.setAttribute("y1", y1);
  newLine.setAttribute("x2", x2);
  newLine.setAttribute("y2", y2);
  newLine.setAttribute("stroke", "white");
  newLine.setAttribute("stroke-width", "5");
  newLine.setAttribute("stroke-opacity", ".5");
  $("svg").append(newLine);
  $(newLine).click(function (e) {
    //? here you can add some action when user clicks on fakeLines
  });
}

//sub=====================================================================================

//*function to create backGround Rect
function createBackgroundRect() {
  let rec = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rec.id = "backgroundRect";
  rec.width = "630px";
  rec.height = "810px";
  rec.style.left = "0px";
  rec.style.top = "0px";
  rec.style.fill = "#ffffff";
  rec.style.position = "relative";
  let elem = document.getElementById("Layer_1");
  elem.prepend(rec);
}

//sub==================================================================================

//* setups basics for texts and put each text info linke x.y,width and ... in textArray
function setupText(texts) {
  let i = 0;
  texts.forEach((text) => {
    const bbox = text.getBBox();
    const width = bbox.width;
    const innerText = $(text).text();
    const matrix = text.transform.animVal[0].matrix;
    const x = matrix.e;
    const y = matrix.f;
    textArray.push({ x, y, width, xPlus: x + width, text, innerText });
    $(text).attr("dataWidth", width);
    $(text).attr("data", "");
    $(text).attr("dataX", x);
    $(text).attr("dataY", y);
    $(text).attr("id", `textID${i}`);
    i++;
  });
}

//sub==================================================================================

function fixMultiLineTexts(texts) {
  i = 0;
  var prevX = -100;
  var prevY = -100;
  var prevClass = 0;
  texts.forEach(function (text) {
    var y = $(text).attr("dataY");
    var x = $(text).attr("dataX");
    if (x == prevX && y - prevY < 9.5) {
      $(text).attr("dataClass", `class${prevClass}`);
    } else {
      prevClass++;
      $(text).attr("dataClass", `class${prevClass}`);
    }
    prevX = x;
    prevY = y;

    i++;
  });
}

//sub==================================================================================

function getLineSlopeAndDegree(y2, y1, x2, x1) {
  let lineSlope = (y2 - y1) / (x2 - x1);
  if (lineSlope == "Infinity") {
    lineSlope = 100000;
  }
  if (lineSlope == "-Infinity") {
    lineSlope = -100000;
  }

  angleDeg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const absoluteDegree = Math.abs(angleDeg);
  return lineSlope;
}

//sub==================================================================================
function setupLines(lines) {
  i = 0;
  lines.forEach(function (line) {
    let x1 = parseFloat(line.getAttribute("x1"));
    let x2 = parseFloat(line.getAttribute("x2"));
    let y1 = parseFloat(line.getAttribute("y1"));
    let y2 = parseFloat(line.getAttribute("y2"));
    //? what is purpose of this? maybe we can use lineArray instead!
    linesByPoint.push({ point1: { x1, y1 }, point2: { x2, y2 } });
    //? maybe sable later
    //? const lineSlope = getLineSlopeAndDegree(y2, y1, x2, x1);
    //? $(line).attr("slope", lineSlope);
    lineArray.push({
      point1: { x1, y1 },
      point2: { x2, y2 },
      x1,
      y1,
      x2,
      y2,
      pairings: [],
      //? pairingsExtended: [],
      lineNUmber: i,
    });
    i++;
  });
}

//sub=================================================================================
function interConnectedlinesByLines() {
  for (let i = 0; i < lineArray.length; i++) {
    const lineNum1 = lineArray[i].lineNUmber;
    const x1 = lineArray[i].x1;
    const x2 = lineArray[i].x2;
    const y1 = lineArray[i].y1;
    const y2 = lineArray[i].y2;
    let x3;
    let x4;
    let y3;
    let y4;

    for (let j = 0; j < lineArray.length; j++) {
      const lineNum2 = lineArray[j].lineNUmber;
      x3 = lineArray[j].x1;
      x4 = lineArray[j].x2;
      y3 = lineArray[j].y1;
      y4 = lineArray[j].y2;

      if (intersects(x1, y1, x2, y2, x3, y3, x4, y4)) {
        //!this gives the interconnected lines (line by line)
        //console.log({ lineNum1, lineNum2 });
        $(`line[dataID = line${lineNum1}]`).attr("lineGroup", groupCounter);
        $(`line[dataID = line${lineNum2}]`).attr("lineGroup", groupCounter);
        groupCounter++;
      }
    }
  }
}

//sub===============================================================================
//! returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function intersects(a, b, c, d, p, q, r, s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  }
}

//sub================================================================================

function setupPolyLines(polyline) {
  i = 0;
  polyline.forEach(function (polyline) {
    const points = polyline.getAttribute("points");
    //polylineArray.push({ points });
    const seperatedPoints = splitPointsToSeperatedPoints(points);
    const polyLineConvertedToLines = convertPointsToLines(seperatedPoints);
    polylineArray.push({ polyLineConvertedToLines, polyLineNum: i });
    //? should we check for intersected polyline with polyline or path by path and ...?
    interConnectedlinesByPolyLines(polyLineConvertedToLines, i);
    i++;
  });
}

//sub===============================================================================

function splitPointsToSeperatedPoints(points) {
  let pointsArray = points.split(" ");
  if (pointsArray[pointsArray.length - 1] == "") pointsArray.pop();
  var seperatedPoints = [];
  for (let i = 0; i < pointsArray.length; i++) {
    var splitedPoints = pointsArray[i].split(",");
    seperatedPoints.push([splitedPoints]);
  }
  return seperatedPoints;
}

//sub===============================================================================
function convertPointsToLines(points) {
  const polyLineConvertedToLines = [];
  for (let i = 0; i < points.length - 1; i++) {
    var line = {
      x1: points[i][0][0],
      y1: points[i][0][1],
      x2: points[i + 1][0][0],
      y2: points[i + 1][0][1],
    };
    polyLineConvertedToLines.push(line);
  }
  return polyLineConvertedToLines;
}

//sub================================================================================

function interConnectedlinesByPolyLines(lines, polylineNum) {
  //? here we asume there is no intersect between polyline and anither polyline! be careful
  //! lines in this array of lines are collected lines of each polyline
  //! we want to check if any of them is intersected with actual lines in line array or not!
  const polylines = document.querySelectorAll("polyline");
  //! we changed the dataGroup of polylines earlier in function makesLinesClickable
  //! so we should retrive the correct polyline number here
  polylineNum = parseInt(
    $(polylines[polylineNum]).attr("dataID").replace(/line/g, "")
  );
  console.log(polylineNum)
  for (let i = 0; i < lines.length; i++) {
    var x1 = parseFloat(lines[i].x1);
    var x2 = parseFloat(lines[i].x2);
    var y1 = parseFloat(lines[i].y1);
    var y2 = parseFloat(lines[i].y2);

    //! check intersect with line array
    //? the polyline num is bigger than lineNumber so we use polyline num here. there maybe conflict later
    //? so be careful
    for (let j = 0; j < lineArray.length; j++) {
      var lineNum = lineArray[j].lineNUmber;
      x3 = lineArray[j].x1;
      x4 = lineArray[j].x2;
      y3 = lineArray[j].y1;
      y4 = lineArray[j].y2;
      if (
        (x1 == x3 && y1 == y3) ||
        (x1 == x4 && y1 == y4) ||
        (x2 == x3 && y2 == y3) ||
        (x2 == x4 && y2 == y4)
      ) {
        //! this gives the interconnected lines and polyline with matching  direct point
        $(`polyline[dataID = line${polylineNum}]`).attr(
          "lineGroup",
          groupCounter
        );
        $(`line[dataID = line${lineNum}]`).attr("lineGroup", groupCounter);
        console.log(groupCounter);
        groupCounter++;
        //console.log("intersect");
        console.log({ polylineNum, lineNum });
        // 		console.log({x1:x1, y1:y1, x2:x2, y2:y2, x3:x3, y3:y3, x4:x4, y4:y4});
      }
      if (intersects(x1, y1, x2, y2, x3, y3, x4, y4)) {
        //! this gives the interconnected lines and polyline without matching any direct point
        $(`polyline[dataID = line${polylineNum}]`).attr(
          "lineGroup",
          groupCounter
        );
        $(`line[dataID = line${lineNum}]`).attr("lineGroup", groupCounter);
        console.log(groupCounter);
        groupCounter++;

        //console.log("intersect");
        //   console.log({x1:x1, y1:y1, x2:x2, y2:y2, x3:x3, y3:y3, x4:x4, y4:y4});
        console.log({ polylineNum, lineNum });
      }
    }
  }
}

//sub =================================================================================
function setupPaths(paths) {
  i = 0;
  paths.forEach(function (path) {
    let d = path.getAttribute("d");
    pathArray.push({ d });
    //! we here asign a dataID to paths
    const id = i;
    $(path).attr("dataID", `path${id}`);
    //! check for intersect
    //checkPathforIntersectWithLines(path, i);
    checkPathforIntersectWithPolylinesLines(path, i);
    i++;
  });
}

//sub==================================================================================

//! check Path for Intersect With "Lines"
function checkPathforIntersectWithLines(path, pathNum) {
  for (let i = 0; i < lineArray.length; i++) {
    const point1 = lineArray[i].point1;
    const point2 = lineArray[i].point2;

    isPointInsidePath(path, pathNum, i, point1.x1, point1.y1, "line");
    isPointInsidePath(path, pathNum, i, point2.x2, point2.y2, "line");
  }
}

//sub================================================================================

//! check Path for Intersect With "polyLines"
function checkPathforIntersectWithPolylinesLines(path, pathNum) {
  for (let i = 0; i < polylineArray.length; i++) {
    const polyLineNum = polylineArray[i].polyLineNum;

    for (let j = 0; j < polylineArray[i].polyLineConvertedToLines.length; j++) {
      const x1 = polylineArray[i].polyLineConvertedToLines[j].x1;
      const x2 = polylineArray[i].polyLineConvertedToLines[j].x2;
      const y1 = polylineArray[i].polyLineConvertedToLines[j].y1;
      const y2 = polylineArray[i].polyLineConvertedToLines[j].y2;
      isPointInsidePath(path, pathNum, polyLineNum, x1, y1, "polyline");
      isPointInsidePath(path, pathNum, polyLineNum, x2, y2, "polyline");
    }
  }
}
//sub==================================================================================

//!this checks if any given point is inside a path or not
function isPointInsidePath(
  path,
  pathNum,
  lineOrPolylineNum,
  pointX,
  pointY,
  type
) {
  const lines = document.querySelectorAll("line");
  const polylines = document.querySelectorAll("polyline");

  var svg = document.getElementById("Layer_1");
  let point = svg.createSVGPoint();
  point.x = pointX;
  point.y = pointY;

  if (path.isPointInStroke(point) || path.isPointInFill(point)) {
    //console.log("inside")
    //? here we should connect path and line or polyline
    if (type == "line") {

    } else if (type == "polyline") {

    }
  } else {
    //console.log("not inside")
  }
}

//-=================================== functions END ===================================
