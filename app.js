const textArray = [];
const lineArray = [];
const linesByPoint = [];
const polylineArray = [];
const pathArray = [];
let groupCounter = 0;
let toBeConnected = [];
let toBeConnectedWithoutAnyCommonPoint = [];
let linesMatches = [];
let polylineMatches = [];
//! leader means line/polyline
let bothLeaderAndTextAreUnique = [];
let remainings = [];

//-========================================START=====================================ANCHOR start
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

  //!makes all lines in svg clickable
  makesLinesClickable(svg);
  //! setup lines
  setupLines(lines);
  //! get interconnectedLinesByLines
  interConnectedlinesByLines();
  //interconnected lines and polylines -> handled in plolylines, lines and pathes handeld in pathes? 
  setupPolyLines(polylines);
  setupPaths(paths);
  toBeConnected = _.uniqWith(toBeConnected, _.isEqual);
  //console.log(toBeConnected);
  makeLineGroups();
  //! get all texts with st11 class (these are texts that user should be able to click on)
  setupText(texts);
  //!
  //! fix multiline texts and group them as one
  fixMultiLineTexts(texts);
});

//-=================================== functions START ==================================

//*function to create fake thick lines that user can click on it
function makesLinesClickable(svg) {
  //!makes lines clickable
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

  //!make polyline clickable
  const polylines = document.querySelectorAll("polyline");
//? can I make i = 0 here and give dataId polyline${id} instead of line${id}?
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
    const height = bbox.height;
    const innerText = $(text).text();
    const matrix = text.transform.animVal[0].matrix;
    const x = matrix.e;
    const y = matrix.f;
    const mText = { x, y, width, xPlus: x + width, text, innerText };
    textArray.push(mText);
    $(text).attr("id", `text${i}`);
    $(text).attr("dataX", x);
    $(text).attr("dataY", y);
    $(text).attr("dataWidth", width);
    $(text).attr("dataHeight", height);
    $(text).attr("data", "");

    //!search for matching lines
    searchForMatchingLine(mText, i);
    searchForMatchingPolyline(mText, i);
    i++;
  });

  //! here we have all possible line/polyline and text maching according to conditions we declared!
  //!so we look for those that has no conflict and seperate them from other as bothleaderAndTextUnique and put others
  //! in remainings array
  searchForUniqueLeader();
  //! now both bothLeaderAndTextAreUnique array and remainings are ready for use!
  //? hamdle bothLeaderAndTextAreUnique() --> create handleUniques()
  remainings = removeDuplicatesFromRemainings();
  remainings = trimRemainings();
  //! now we have an array of lines and polylines that each one is linked to one or more text,
  //! if it is one text we dont have much troble but we should decide here the best match for each line
  chooseTheBestMatch();
}
//sub================================================================================
function chooseTheBestMatch() {
  const texts = document.querySelectorAll(".st11");
  const lines = document.querySelectorAll("line");
  const polylines = document.querySelectorAll("polyline");

  console.log(remainings);
  for (let i = 0; i < remainings.length; i++) {
    if (remainings[i].hasOwnProperty("line")) {
      //? thie method works for text and line but not working for polyline!
      //? for polyline we should get polyline with its id or somethig else
      //? dont change polyline numbering its used in line grouping!
      const lineNumber = remainings[i].line;
 
      let min = 100000000; //a very big number!
      let winnerText = "";
      for (let j = 0; j < remainings[i].texts.length; j++) {
        const textNumber = remainings[i].texts[j];
        
        //console.log({line, text})
        minDistance = calculateMinDistance(lineNumber, textNumber);
       // console.log({minDistance})
        if (minDistance < min) {
          winnerText = textNumber;
          min = minDistance
        }
      }
      console.log({lineNumber, winnerText})
    } else {
      //this is polyline
      const polylineNumber = remainings[i].polyline;
      let min = 100000000; //a very big number!
      let winnerText = "";
      for (let j = 0; j < remainings[i].texts.length; j++) {
        const textNumber = remainings[i].texts[j];
        
        //console.log({line, text})
        minDistance = calculateMinDistance(polylineNumber, textNumber);
       // console.log({minDistance})
        if (minDistance < min) {
          winnerText = textNumber;
          min = minDistance
        }
      }
      console.log({polylineNumber, winnerText})
      
    }
  }

  //! this is an internal function! dont move it
  function calculateMinDistance(lineNumber, textNumber) {
    const line = $(lines[lineNumber]);
    const text = $(texts[textNumber]);
    lineX1 = parseFloat($(line).attr("x1"))
    lineX2 = parseFloat( $(line).attr("x2"))
    lineY1 = parseFloat($(line).attr("y1"))
    lineY2 = parseFloat($(line).attr("y2"))
    textX =  parseFloat($(text).attr("dataX"))
    textY = parseFloat( $(text).attr("dataY"))
    textXPLUS =  textX + parseFloat($(text).attr("dataWidth"))
    textYPLUS =  textY - parseFloat($(text).attr("dataWidth"))
    const d1 = Math.abs(lineY1 - textY) + Math.abs(lineX1 - textX)
    const d2 = Math.abs(lineY1 - textYPLUS) + Math.abs(lineX1 - textX)
    const d3 = Math.abs(lineY1 - textY) + Math.abs(lineX1 - textXPLUS)
    const d4 = Math.abs(lineY1 - textYPLUS) + Math.abs(lineX1 - textXPLUS)
    const d5 = Math.abs(lineY2 - textY) + Math.abs(lineX2 - textX)
    const d6 = Math.abs(lineY2 - textYPLUS) + Math.abs(lineX2 - textX)
    const d7 = Math.abs(lineY2 - textY) + Math.abs(lineX2 - textXPLUS)
    const d8 = Math.abs(lineY2 - textYPLUS) + Math.abs(lineX2 - textXPLUS)
    const min = Math.min(d1,d2,d3,d4,d5,d6,d7,d8)
    //console.log(min)

    return min
  }
}
//sub================================================================================
function trimRemainings() {
  //! now each line in remainig array is mentioned more than once and in each object it has different text signed to it
  //! we want line to be mentioned only once and collect all texts related to it
  const collect = [];
  for (let i = 0; i < remainings.length; i++) {
    if (remainings[i][0].hasOwnProperty("line")) {
      const line = remainings[i][0].line;
      const texts = [];
      for (let j = 0; j < remainings[i].length; j++) {
        const text = remainings[i][j].text;
        texts.push(text);
      }
      const newObj = { line, texts };
      collect.push(newObj);
    } else {
      //this is polyline
      const polyline = remainings[i][0].polyline;
      const texts = [];
      for (let j = 0; j < remainings[i].length; j++) {
        const text = remainings[i][j].text;
        texts.push(text);
      }
      const newObj = { polyline, texts };
      collect.push(newObj);
    }
  }
  return collect;
}

//sub================================================================================
function removeDuplicatesFromRemainings() {
  //! these loops remove duplicates!
  var collect = [];

  for (let i = 0; i < remainings.length; i++) {
    if (remainings[i].hasOwnProperty("line")) {
      var line = remainings[i].line;

      var linePairings = remainings.filter((obj) => {
        return obj.line == line;
      });

      if (_.isEqual(collect[collect.length - 1], linePairings)) {
      } else {
        collect.push(linePairings);
      }
    } else if (remainings[i].hasOwnProperty("polyline")) {
      var polyline = remainings[i].polyline;

      var polylinePairings = remainings.filter((obj) => {
        return obj.polyline == polyline;
      });

      //? should decide here which text wins this polyline
      if (_.isEqual(collect[collect.length - 1], polylinePairings)) {
      } else {
        collect.push(polylinePairings);
      }
    }
  }
  return collect;
}
//sub=================================================================================

function searchForUniqueLeader() {
  linesMatches = _.orderBy(_.orderBy(linesMatches, "line"), "text");
  polylineMatches = _.uniqWith(
    _.orderBy(_.orderBy(polylineMatches, "polyline"), "text"),
    _.isEqual
  );

  for (let i = 0; i < polylineMatches.length; i++) {
    var polyline = polylineMatches[i].polyline;
    //!this text is from polylineMatches
    var text = polylineMatches[i].text;

    var checkPolyline = polylineMatches.filter((obj) => {
      return obj.polyline == polyline;
    });
    var checkText = polylineMatches.filter((obj) => {
      return obj.text == text;
    });
    var checkline;
    for (let j = 0; j < linesMatches.length; j++) {
      checkline = linesMatches.filter((obj) => {
        return obj.text == text;
      });
    }

    if (
      checkPolyline.length == 1 &&
      checkText.length == 1 &&
      checkline.length == 0
    ) {
      bothLeaderAndTextAreUnique.push({ polyline, text });
    } else {
      remainings.push({ polyline, text });
    }
  }

  for (let i = 0; i < linesMatches.length; i++) {
    var line = linesMatches[i].line;
    //!this text is from linematch
    var text = linesMatches[i].text;

    var checkLine = linesMatches.filter((obj) => {
      return obj.line == line;
    });
    var checkText = linesMatches.filter((obj) => {
      return obj.text == text;
    });
    var checkPolyline;
    for (let j = 0; j < polylineMatches.length; j++) {
      checkPolyline = polylineMatches.filter((obj) => {
        return obj.text == text;
      });
    }

    if (
      checkLine.length == 1 &&
      checkText.length == 1 &&
      checkPolyline.length == 0
    ) {
      bothLeaderAndTextAreUnique.push({ line, text });
    } else {
      remainings.push({ line, text });
    }
  }
  remainings = _.orderBy(remainings, "line");
}

//sub==================================================================================
function searchForMatchingLine(text, textNum) {
  checkForMatchingY(text, textNum);
}
function searchForMatchingPolyline(text, textNum) {
  checkForMatchingYPolylineVersion(text, textNum);
}

//sub================================================================================
function checkForMatchingYPolylineVersion(text, textNum) {
  for (let i = 0; i < polylineArray.length; i++) {
    for (let j = 0; j < polylineArray[i].polyLineConvertedToLines.length; j++) {
      var line = polylineArray[i].polyLineConvertedToLines[j];
      var lineNum = polylineArray[i].polyLineNum;

      if (line.y1 < text.y + 12 && line.y1 > text.y - 12) {
        //! now we have some line that matches vertically with our text
        //! we should compare their X!
        // console.log("match")
        checkForMatchingX1PolyLineVersion(text, line, textNum, i);
        //console.log("match");
      }
      if (line.y2 < text.y + 12 && line.y2 > text.y - 12) {
        checkForMatchingX2PolyLineVersion(text, line, textNum, i);
        // console.log("match");
      }
    }
  }
}
//sub==================================================================================
function checkForMatchingX1PolyLineVersion(text, line, textNum, lineNum) {
  if (line.x1 < text.x + 10 && line.x1 > text.x - 10) {
    polylineMatches.push({ polyline: lineNum, text: textNum });
  }
  if (line.x1 < text.xPlus + 10 && line.x1 > text.xPlus - 10) {
    polylineMatches.push({ polyline: lineNum, text: textNum });
  }
}

function checkForMatchingX2PolyLineVersion(text, line, textNum, lineNum) {
  if (line.x2 < text.x + 10 && line.x2 > text.x - 10) {
    polylineMatches.push({ polyline: lineNum, text: textNum });
  }
  if (line.x2 < text.xPlus + 10 && line.x2 > text.xPlus - 10) {
    polylineMatches.push({ polyline: lineNum, text: textNum });
  }
}
//sub =================================================================================
//! we have text and all text info here, we want to examine all lines y parameter,
//! to find which line y is near enough to text y
function checkForMatchingY(text, textNum) {
  //!here we compare text and "lines"
  for (var i = 0; i < lineArray.length; i++) {
    var line = lineArray[i];
    if (line.y1 < text.y + 12 && line.y1 > text.y - 12) {
      //! now we have some line that matches vertically with our text
      //! we should compare their X!
      checkForMatchingX1(text, line, textNum, i);
      //console.log("match");
    }
    if (line.y2 < text.y + 12 && line.y2 > text.y - 12) {
      checkForMatchingX2(text, line, textNum, i);
      //console.log("match");
    }
  }
}

//sub==================================================================================

function checkForMatchingX1(text, line, textNum, lineNum) {
  if (line.x1 < text.x + 10 && line.x1 > text.x - 10) {
    linesMatches.push({ line: lineNum, text: textNum });
  }
  if (line.x1 < text.xPlus + 10 && line.x1 > text.xPlus - 10) {
    linesMatches.push({ line: lineNum, text: textNum });
  }
}
function checkForMatchingX2(text, line, textNum, lineNum) {
  if (line.x2 < text.x + 10 && line.x2 > text.x - 10) {
    linesMatches.push({ line: lineNum, text: textNum });
  }
  if (line.x2 < text.xPlus + 10 && line.x2 > text.xPlus - 10) {
    linesMatches.push({ line: lineNum, text: textNum });
  }
}

//sub==================================================================================

function fixMultiLineTexts(texts) {
  i = 0;
  var prevX = -100;
  var prevY = -100;
  var prevClass = -1;
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
//? not used yet!
// function getLineSlopeAndDegree(y2, y1, x2, x1) {
//   let lineSlope = (y2 - y1) / (x2 - x1);
//   if (lineSlope == "Infinity") {
//     lineSlope = 100000;
//   }
//   if (lineSlope == "-Infinity") {
//     lineSlope = -100000;
//   }

//   angleDeg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
//   const absoluteDegree = Math.abs(angleDeg);
//   return lineSlope;
// }

//sub==================================================================================
function setupLines(lines) {
  i = 0;
  lines.forEach(function (line) {
    let x1 = parseFloat(line.getAttribute("x1"));
    let x2 = parseFloat(line.getAttribute("x2"));
    let y1 = parseFloat(line.getAttribute("y1"));
    let y2 = parseFloat(line.getAttribute("y2"));
    //? what is purpose of this? maybe we can use lineArray instead!
    //linesByPoint.push({ point1: { x1, y1 }, point2: { x2, y2 } });
    //? maybe usable later
    //? const lineSlope = getLineSlopeAndDegree(y2, y1, x2, x1);
    //? $(line).attr("slope", lineSlope);
    lineArray.push({
      //point1: { x1, y1 },
      //point2: { x2, y2 },
      x1,
      y1,
      x2,
      y2,
      //pairings: [],
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
        //? what if 3 or more lines are intersecting each other?
        //? this leads to ERROR!
        // console.log({ lineNum1, lineNum2 });
        // $(`line[dataID = line${lineNum1}]`).attr("lineGroup", groupCounter);
        // $(`line[dataID = line${lineNum2}]`).attr("lineGroup", groupCounter);
        // groupCounter++;
        //! this makes sure there is no duplicate in toBeConnected array
        if (lineNum1 < lineNum2) {
          // toBeConnected.push({ line1: lineNum1, line2: lineNum2 });
          toBeConnected.push([
            { type: "line", num: lineNum1 },
            { type: "line", num: lineNum2 },
          ]);
        } else {
          toBeConnected.push([
            { type: "line", num: lineNum2 },
            { type: "line", num: lineNum1 },
          ]);
          // toBeConnected.push({ line1: lineNum2, line2: lineNum1 });
        }
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
    const seperatedPoints = splitPointsToSeperatedPoints(points);
    const polyLineConvertedToLines = convertPointsToLines(seperatedPoints);
    polylineArray.push({ polyLineConvertedToLines, polyLineNum: i });
    //? should we check for intersected polyline with polyline or path by path and ...?
    //! yes we should handele polyline by polyline intesection
    interConnectedpolylinesByPolyLines(polyLineConvertedToLines, i)
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
function interConnectedpolylinesByPolyLines(polylineLines, polylineNum){
  const polylines = document.querySelectorAll("polyline");
  //! we changed the dataGroup of polylines earlier in function makesLinesClickable
  //! so we should retrive the correct polyline number here
  polylineNum = parseInt(
    $(polylines[polylineNum]).attr("dataID").replace(/line/g, "")
  );

}
//sub================================================================================
function interConnectedlinesByPolyLines(polylineLines, polylineNum) {
  //? here we asume there is no intersect between polyline and anither polyline! be careful
  //! lines in this array of lines are collected lines of each polyline
  //! we want to check if any of them is intersected with actual lines in line array or not!
  const polylines = document.querySelectorAll("polyline");
  //! we changed the dataGroup of polylines earlier in function makesLinesClickable
  //! so we should retrive the correct polyline number here
  polylineNum = parseInt(
    $(polylines[polylineNum]).attr("dataID").replace(/line/g, "")
  );
  // console.log(polylineNum)
  for (let i = 0; i < polylineLines.length; i++) {
    var x1 = parseFloat(polylineLines[i].x1);
    var x2 = parseFloat(polylineLines[i].x2);
    var y1 = parseFloat(polylineLines[i].y1);
    var y2 = parseFloat(polylineLines[i].y2);

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
        // $(`polyline[dataID = line${polylineNum}]`).attr(
        //   "lineGroup",
        //   groupCounter
        // );
        // $(`line[dataID = line${lineNum}]`).attr("lineGroup", groupCounter);
        // console.log(groupCounter);
        // groupCounter++;
        // //console.log("intersect");
        // console.log({ polylineNum, lineNum });
        // 		console.log({x1:x1, y1:y1, x2:x2, y2:y2, x3:x3, y3:y3, x4:x4, y4:y4});
        toBeConnected.push([
          { type: "line", num: lineNum },
          { type: "polyline", num: polylineNum },
        ]);

        //toBeConnected.push({ line: lineNum, polyline: polylineNum });
      }
      if (intersects(x1, y1, x2, y2, x3, y3, x4, y4)) {
        //! this gives the interconnected lines and polyline without matching any direct point
        // $(`polyline[dataID = line${polylineNum}]`).attr(
        //   "lineGroup",
        //   groupCounter
        // );
        // $(`line[dataID = line${lineNum}]`).attr("lineGroup", groupCounter);
        // console.log(groupCounter);
        // groupCounter++;
        toBeConnected.push([
          { type: "line", num: lineNum },
          { type: "polyline", num: polylineNum },
        ]);

        //toBeConnected.push({ line: lineNum, polyline: polylineNum });
        // //console.log("intersect");
        // //   console.log({x1:x1, y1:y1, x2:x2, y2:y2, x3:x3, y3:y3, x4:x4, y4:y4});
        // console.log({ polylineNum, lineNum });
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
    checkPathforIntersectWithLines(path, i);
    checkPathforIntersectWithPolylinesLines(path, i);
    checkPathToPathIntersect(path, i);
    i++;
  });
}

//sub==================================================================================

//! check Path for Intersect With "Lines"
function checkPathforIntersectWithLines(path, pathNum) {
  for (let i = 0; i < lineArray.length; i++) {
    const x1 = lineArray[i].x1;
    const x2 = lineArray[i].x2; 
    const y1 = lineArray[i].y1;
    const y2 = lineArray[i].y2;

    isPointInsidePath(path, pathNum, i, x1, y1, "line");
    isPointInsidePath(path, pathNum, i, x2, y2, "line");
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

//sub=================================================================================
function checkPathToPathIntersect(path, pathNum) {
  //? here should recognize overlapping paths
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
      //toBeConnected.push({ line: lineOrPolylineNum, path: pathNum });
      toBeConnected.push([
        { type: "line", num: lineOrPolylineNum },
        { type: "path", num: pathNum },
      ]);
    } else if (type == "polyline") {
      //toBeConnected.push({ polyline: lineOrPolylineNum, path: pathNum });
      toBeConnected.push([
        { type: "polyline", num: lineOrPolylineNum },
        { type: "path", num: pathNum },
      ]);
    }
  }
}

//sub==================================================================================

function makeLineGroups() {
  //? this line is just for test
  toBeConnected
    .push
    //   [
    //   { type: "line", num: 11 },
    //   { type: "line", num: 13 },
    // ]
    ();
  handleSimpleConnectingElements();
  checkForCommonPoint();
}

//sub==================================================================================

function handleSimpleConnectingElements() {
  for (let i = 0; i < toBeConnected.length; i++) {
    const firstElementType = toBeConnected[i][0].type;
    const firstElementNum = toBeConnected[i][0].num;
    const secondElementType = toBeConnected[i][1].type;
    const secondElementNum = toBeConnected[i][1].num;
    groupCounter++;
    correctGroup(
      firstElementType,
      firstElementNum,
      secondElementType,
      secondElementNum
    );
  }
}

//sub==================================================================================

function checkForCommonPoint() {
  let mainCommon = [
    // [
    //   { type: "line", num: 46 },
    //   { type: "path", num: 22 },
    //   { type: "path", num: 33 },
    // ],
  ];

  for (let i = 0; i < toBeConnected.length; i++) {
    let common = [];
    let obj1 = toBeConnected[i][0];
    let obj2 = toBeConnected[i][1];

    //!this is for finding common elements
    for (let j = 0; j < toBeConnected.length; j++) {
      let obj3 = toBeConnected[j][0];
      let obj4 = toBeConnected[j][1];

      if (
        i != j &&
        (_.isEqual(obj1, obj3) ||
          _.isEqual(obj1, obj4) ||
          _.isEqual(obj2, obj3) ||
          _.isEqual(obj2, obj4))
      ) {
        common.push(obj1);
        common.push(obj2);
        common.push(obj3);
        common.push(obj4);
      }
    }
    common = _.orderBy(_.orderBy(_.uniqWith(common, _.isEqual), "num"), "type");
    if (common.length != 0) {
      mainCommon.push(common);
    }
  }
  mainCommon = _.uniqWith(mainCommon, _.isEqual);
  //! here we should do something for first level
  handleFirstStep(mainCommon);

  //? should send it to a function to insure it has not any common value between objects
  functionToChechMainCommonForCommon(mainCommon);
}

function handleFirstStep(mainCommon) {
  const lines = document.querySelectorAll("line");
  const polylines = document.querySelectorAll("polyline");
  const paths = document.querySelectorAll("path");
  for (let i = 0; i < mainCommon.length; i++) {
    // console.log(mainCommon)
    groupCounter++;
    for (let j = 0; j < mainCommon[i].length; j++) {
      //console.log(mainCommon[i][j]);
      const type = mainCommon[i][j].type;
      const num = mainCommon[i][j].num;

      switch (type) {
        case "line":
          $(lines[num]).attr("lineGroup", groupCounter);
          break;
        case "polyline":
          $(`polyline[dataID = line${num}]`).attr("lineGroup", groupCounter);
          break;
        case "path":
          $(paths[num]).attr("lineGroup", groupCounter);
          break;
        default:
          break;
      }
    }
  }
}

//sub==================================================================================

function functionToChechMainCommonForCommon(mainCommon) {
  let finalMainCommon = [];
  for (let i = 0; i < mainCommon.length; i++) {
    for (let j = 0; j < mainCommon[i].length; j++) {
      const obj1 = mainCommon[i][j];
      for (let k = 0; k < mainCommon.length; k++) {
        for (let m = 0; m < mainCommon[k].length; m++) {
          const obj2 = mainCommon[k][m];
          if (i != k && _.isEqual(obj1, obj2)) {
            //? here we should do something for level 2
            //console.log("match");
            for (let o = 0; o < mainCommon[i].length; o++) {
              finalMainCommon.push(mainCommon[i][o]);
            }
            for (let p = 0; p < mainCommon[k].length; p++) {
              finalMainCommon.push(mainCommon[k][p]);
            }
            //console.log(mainCommon[i])
            // console.log(mainCommon[k])
            //console.log({i,k})
          }
        }
      }
    }
  }
  finalMainCommon = _.orderBy(
    _.orderBy(_.uniqWith(finalMainCommon, _.isEqual), "num"),
    "type"
  );
  //console.log(finalMainCommon)
  handleSecondStep(finalMainCommon);
}

//sub==========================================================================

function handleSecondStep(finalMainCommon) {
  const lines = document.querySelectorAll("line");
  const polylines = document.querySelectorAll("polyline");
  const paths = document.querySelectorAll("path");
  groupCounter++;
  for (let i = 0; i < finalMainCommon.length; i++) {
    console.log(finalMainCommon[i]);
    const type = finalMainCommon[i].type;
    const num = finalMainCommon[i].num;
    console.log(type);
    switch (type) {
      case "line":
        $(lines[num]).attr("lineGroup", groupCounter);
        break;
      case "polyline":
        $(`polyline[dataID = line${num}]`).attr("lineGroup", groupCounter);
        break;
      case "path":
        $(paths[num]).attr("lineGroup", groupCounter);
        break;
      default:
        break;
    }
  }
}

//sub==========================================================================

function correctGroup(
  firstElementType,
  firstElementNum,
  secondElementType,
  secondElementNum
) {
  const lines = document.querySelectorAll("line");
  const polylines = document.querySelectorAll("polyline");
  const paths = document.querySelectorAll("path");

  switch (firstElementType) {
    case "line":
      // console.log("line");

      $(lines[firstElementNum]).attr("lineGroup", groupCounter);
      handleSecondElement(secondElementType, secondElementNum);
      break;
    case "polyline":
      $(`polyline[dataID = line${firstElementNum}]`).attr(
        "lineGroup",
        groupCounter
      );
      console.log("polyline");
      //console.log(firstElementNum);
      handleSecondElement(secondElementType, secondElementNum);

      break;
    case "path":
      $(paths[firstElementNum]).attr("lineGroup", groupCounter);
      // console.log("path");
      handleSecondElement(secondElementType, secondElementNum);

      break;

    default:
      break;
  }

  //sub==================================================================================

  function handleSecondElement(secondElementType, secondElementNum) {
    const lines = document.querySelectorAll("line");
    const polylines = document.querySelectorAll("polyline");
    const paths = document.querySelectorAll("path");
    switch (secondElementType) {
      case "line":
        $(lines[secondElementNum]).attr("lineGroup", groupCounter);
        // console.log("line");
        break;
      case "polyline":
        $(`polyline[dataID = line${secondElementNum}]`).attr(
          "lineGroup",
          groupCounter
        );

        // console.log("polyline");
        break;
      case "path":
        $(paths[secondElementNum]).attr("lineGroup", groupCounter);
        // console.log("path");

        break;

      default:
        break;
    }
  }
}
//-=================================== functions END ===================================
