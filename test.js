

//@collapse
$(document).ready(function () {
  var counter = 0;
      const textArray = [];
      const lineArray = [];
      const pathArray = [];
      var polylineArray = [];
      var linesByPoint = [];
      var polylineByPoints = [];
      const linesAndPairings = [];
      var finals = [];
  //_*****************************************************
  //! this starts
  const text = document.querySelectorAll("text");
  let i = 0;
  text.forEach(function (text) {
    const bbox = text.getBBox();
    var width = bbox.width;
    let matrix =
      document.getElementsByTagName("text")[i].transform.animVal[0].matrix;
    let x = matrix.e;
    let y = matrix.f;
    textArray.push({ x, y, width, xPlus: x + width, width, text });
    $(text).attr("dataWidth", width);
    $(text).attr("data", "");
    $(text).attr("dataX", x);
    $(text).attr("dataY", y);
    i++;
  });
//********************************************
//fix multiline text
var myText = document.querySelectorAll(".st11");
i = 0;
var prevX = -100
var prevY = -100
var prevClass = 0
myText.forEach(function (text) {
var y = $(text).attr("dataY")
var x = $(text).attr("dataX")
// console.log({x,y})
// console.log(text)
if(x == prevX && (y - prevY < 9.5)){
    $(text).attr("dataClass" , `class${prevClass}`)
}else{
    prevClass++
    $(text).attr("dataClass" , `class${prevClass}`)
}
prevX = x
prevY = y



i++;
})

  //**************************************************
  const line = document.querySelectorAll("line");
  i = 0;
  line.forEach(function (line) {
    let x1 = parseFloat(line.getAttribute("x1"));
    let x2 = parseFloat(line.getAttribute("x2"));
    let y1 = parseFloat(line.getAttribute("y1"));
    let y2 = parseFloat(line.getAttribute("y2"));
    linesByPoint.push({ point1: { x1, y1 }, point2: { x2, y2 } });
    var lineSlope = (y2 - y1) / (x2 - x1);
    if (lineSlope == "Infinity") {
      lineSlope = 100000;
    }
    if (lineSlope == "-Infinity") {
      lineSlope = -100000;
    }
    //
    //const angle = (anchor, point) => Math.atan2(anchor.y - point.y, anchor.x - point.x) * 180 / Math.PI + 180;
    // angle in degrees, from example, same data
    angleDeg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI; // 45
    var absoluteDegree = Math.abs(angleDeg);

    //
    $(line).attr("slope", lineSlope);
    lineArray.push({
      x1,
      y1,
      x2,
      y2,
      pairings: [],
      pairingsExtended: [],
      lineSlope,
      absoluteDegree,
      angleDeg,
      lineNUmber: i,
    });
    i++;
  });
  //for getting interconnected lines
  for (let i = 0; i < lineArray.length; i++) {
    var x3;
    var x4;
    var y3;
    var y4;
    // console.log(lineArray)
    var lineNum1 = lineArray[i].lineNUmber;
    var x1 = lineArray[i].x1;
    var x2 = lineArray[i].x2;
    var y1 = lineArray[i].y1;
    var y2 = lineArray[i].y2;
    for (let j = 0; j < lineArray.length; j++) {
      var lineNum2 = lineArray[j].lineNUmber;
      x3 = lineArray[j].x1;
      x4 = lineArray[j].x2;
      y3 = lineArray[j].y1;
      y4 = lineArray[j].y2;
     
      if (intersects(x1, y1, x2, y2, x3, y3, x4, y4)) {
        //this gives the interconnected lines (line by line)
       // console.log({ lineNum1, lineNum2 });
      }
    }
  }


//console.log('Hi ali '+intersects(486.38,508.32,514.63,516.82, 514.63, 516.82, 516.88, 505.32))
  // returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
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
  // console.log(linesByPoint)
  //***************************************************
  const polyline = document.querySelectorAll("polyline");
  i = 0;
  polyline.forEach(function (polyline) {
    let points = polyline.getAttribute("points");
    var pointsArray = points.split(" ");
    if (pointsArray[pointsArray.length - 1] == "") pointsArray.pop();
    var newPointsArray = [];
    for (let i = 0; i < pointsArray.length; i++) {
      var splitedPoints = pointsArray[i].split(",");
      newPointsArray.push([splitedPoints]);
    }
    convertPointsToLines(newPointsArray, i);
    //console.log(newPointsArray)
    polylineArray.push({ points });
    i++;
  });

  function convertPointsToLines(newPointsArray, polylineNum) {
    for (let i = 0; i < newPointsArray.length - 1; i++) {
    //   console.log("here");
    //   console.log(newPointsArray[i]);
      //   console.log(newPointsArray[i + 1]);

      var line = {
        x1: newPointsArray[i][0][0],
        y1: newPointsArray[i][0][1],
        x2: newPointsArray[i + 1][0][0],
        y2: newPointsArray[i + 1][0][1],
      };
      //console.log(line);
      var x1 = parseFloat(newPointsArray[i][0][0]);
      var y1 = parseFloat(newPointsArray[i][0][1]);
      var x2 = parseFloat(newPointsArray[i + 1][0][0]);
      var y2 = parseFloat(newPointsArray[i + 1][0][1]);
      for (let j = 0; j < lineArray.length; j++) {
        var lineNum = lineArray[j].lineNUmber;
        x3 = lineArray[j].x1;
        x4 = lineArray[j].x2;
        y3 = lineArray[j].y1;
        y4 = lineArray[j].y2;
        if(x1 == x3 && y1 == y3|| x1 == x4 && y1 == y4 || x2 == x3 && y2 == y3 || x2 == x4 && y2 == y4){
          //this gives the interconnected lines and polyline with matching  direct point

    // 		console.log("intersect")
    // 		console.log({ polylineNum, lineNum });
    // 		console.log({x1:x1, y1:y1, x2:x2, y2:y2, x3:x3, y3:y3, x4:x4, y4:y4});
       }
        if (intersects(x1, y1, x2, y2, x3, y3, x4, y4)) {
          //this gives the interconnected lines and polyline without matching any direct point

        //   console.log("intersect")
        //   console.log({x1:x1, y1:y1, x2:x2, y2:y2, x3:x3, y3:y3, x4:x4, y4:y4});
        //   console.log({ polylineNum, lineNum });
        }
      }
    }
  }
  //*****************************************************
  const path = document.querySelectorAll("path");
  i = 0;
  isPointInsidePath(379.13, 173.32)
  //this checks if any given point is inside a path or not
  function isPointInsidePath(pointX, pointY){
      var svg = document.getElementById("Layer_1")
      let point = svg.createSVGPoint();
      point.x = pointX
      point.y = pointY
      path.forEach(function (path) {
         // console.log(path)
        if (path.isPointInStroke(point)||path.isPointInFill(point)){
            //console.log("inside")
        }else{
            //console.log("not inside")
        }
        i++; })
  }
  i = 0;
  path.forEach(function (path) {

    let d = path.getAttribute("d");
    pathArray.push({ d });
    i++;
  });
  //***************************************************
  i = 0;
  text.forEach(function (text) {
    searchForMatchingLine(textArray[i], i);
    searchForMatchingPoliLine(textArray[i], i)
    i++;
  });

  //!choose the best match
  chooseTheBestMatch(lineArray);
  // chooseTheBestMatch(lineArray)
  //   chooseTheBestMatch(lineArray)
  //
  var xx2 = (xx = document.querySelectorAll("text"));
  for (let i = 0; i < xx2.length; i++) {
    var linesInText = [];
    var regex = /line(.*?) /g;
    var string = text[i].outerHTML;

    string.replace(regex, function (match, line) {
      linesInText.push(line);
    });
    //console.log(linesInText)
    if (linesInText.length > 1) {
      // console.log(text[i])
    }
  }
  function searchForMatchingLine(text, positionOfTextArray) {
    checkForMatchingY(text, positionOfTextArray);
  }
  function searchForMatchingPoliLine(text, positionOfTextArray) {
    checkForMatchingY_PolyLineVersion(text, positionOfTextArray);
  }
  function checkForMatchingY_PolyLineVersion(text, positionOfTextArray){
   
    for (var i = 0; i < polylineArray.length; i++) {
    var pointsArray = polylineArray[i].points.split(" ");
    if (pointsArray[pointsArray.length - 1] == "") pointsArray.pop();
console.log(pointsArray)
var line1 = {x1: pointsArray[0].replace(/,(.*?)$/g, ''), y1: pointsArray[0].replace(/^(.*?),/g, ''), x2: pointsArray[1].replace(/,(.*?)$/g, ''), y2: pointsArray[1].replace(/^(.*?),/g, '')}
var line2 = {x1: pointsArray[pointsArray.length -2].replace(/,(.*?)$/g, ''), y1: pointsArray[pointsArray.length -2].replace(/^(.*?),/g, ''), x2: pointsArray[pointsArray.length -1].replace(/,(.*?)$/g, ''), y2: pointsArray[pointsArray.length -1].replace(/^(.*?),/g, '')}

//first for line1
if (line1.y1 < text.y + 12 && line1.y1 > text.y - 12) {
//checkForMatchingX1(text, line1, positionOfTextArray, i);
} 
if (line1.y2 < text.y + 12 && line1.y2 > text.y - 12) {
//checkForMatchingX2(text, line1, positionOfTextArray, i);
}
//the for line2
if (line2.y1 < text.y + 12 && line2.y1 > text.y - 12) {
//checkForMatchingX1(text, line2, positionOfTextArray, i);
} 
if (line2.y2 < text.y + 12 && line2.y2 > text.y - 12) {
//checkForMatchingX2(text, line2, positionOfTextArray, i);
}

    }
  }
  function checkForMatchingY(text, positionOfTextArray) {
    for (var i = 0; i < lineArray.length; i++) {
      var line = lineArray[i];
      // console.log({ text, line });
      if (line.y1 < text.y + 12 && line.y1 > text.y - 12) {
        checkForMatchingX1(text, line, positionOfTextArray, i);
        // console.log("match");
        //console.log({counter, "positionOfTextArray": positionOfTextArray, "positionofLineArray": i, text, line});
        counter++;
      }
      if (line.y2 < text.y + 12 && line.y2 > text.y - 12) {
        checkForMatchingX2(text, line, positionOfTextArray, i);
        counter++;
        // if(positionOfTextArray ==30){
        // 	console.log({counter, "positionOfTextArray": positionOfTextArray, "positionofLineArray": i, text, line});
        // }
        //console.log(text);
        // console.log({ "text.y": text.y, "line.y2": line.y2 });
      }
    }
  }
  function checkForMatchingX1(
    text,
    line,
    positionOfTextArray,
    positionOfLineArray
  ) {
    // console.log({text, line});
    if (line.x1 < text.x + 10 && line.x1 > text.x - 10) {
      //console.log({lineY1: line.y1, tetxY: text.y, lineX1: line.x1, textX: text.x})

      //   var xx = document.querySelectorAll("text");
      //   $(xx[positionOfTextArray]).remove();
      //   var yy = document.querySelectorAll("line");
      //   $(yy[positionOfLineArray]).remove();

      doIt(text, line, positionOfTextArray, positionOfLineArray);
    }
    if (line.x1 < text.xPlus + 10 && line.x1 > text.xPlus - 10) {
      //console.log({lineY1: line.y1, tetxY: text.y, lineX1: line.x1, textXplys: text.xPlus})
      //   var xx = document.querySelectorAll("text");
      //   $(xx[positionOfTextArray]).remove();
      //   var yy = document.querySelectorAll("line");
      //   $(yy[positionOfLineArray]).remove();
      doIt(text, line, positionOfTextArray, positionOfLineArray);
    }
  }
  function checkForMatchingX2(
    text,
    line,
    positionOfTextArray,
    positionOfLineArray
  ) {
    //console.log("match with Y2");

    if (line.x2 < text.x + 10 && line.x2 > text.x - 10) {
      //console.log({lineY2: line.y2, tetxY: text.y, lineX2: line.x2, textX: text.x})
      //   var xx = document.querySelectorAll("text");
      //   $(xx[positionOfTextArray]).remove();
      //   var yy = document.querySelectorAll("line");
      //   $(yy[positionOfLineArray]).remove();

      doIt(text, line, positionOfTextArray, positionOfLineArray);
    }
    if (line.x2 < text.xPlus + 10 && line.x2 > text.xPlus - 10) {
      //  console.log(textArray[positionOfTextArray].text);
      //console.log({lineY2: line.y2, tetxY: text.y, lineX2: line.x2, textXPlus: text.xPlus})
      //   var xx = document.querySelectorAll("text");
      //   $(xx[positionOfTextArray]).remove();
      //   var yy = document.querySelectorAll("line");
      //   $(yy[positionOfLineArray]).remove();

      doIt(text, line, positionOfTextArray, positionOfLineArray);
    }
  }

  //*****************************

  i = 0;
  polyline.forEach(function (polyline) {
    var numPoints = 0;
    let points = polyline.getAttribute("points");
    //	console.log(points)
    for (var i = 0; i < points.length; i++) {
      if (points[i] == " ") {
        numPoints++;
      }
    }
    //console.log(numPoints)
    var newPoints = [];
    var remaning = points;

    for (let i = 0; i < numPoints; i++) {
      var extract = points.replace(/ (.*?)$/, "");
      points = points.replace(/^(.*?) (=?)/g, "");
      //	console.log(extract)
      var x = extract.replace(/\,(.*?)$/, "");
      var y = extract.replace(/^(.*?),/, "");
      newPoints.push({ point: { x, y } });
    }
    polylineByPoints.push(newPoints);

    //console.log(linesByPoint)

    i++;
  });
  //   console.log(polylineByPoints)
  //   console.log(linesByPoint)
  for (let i = 0; i < polylineByPoints.length; i++) {
    for (let j = 0; j < polylineByPoints[i].length; j++) {
      //console.log(polylineByPoints[i][j].point.x)

      for (k = 0; k < linesByPoint.length; k++) {
        //console.log(linesByPoint[k])
        if (
          (polylineByPoints[i][j].point.x == linesByPoint[k].point1.x1 &&
            polylineByPoints[i][j].point.y == linesByPoint[k].point1.y1) ||
          (polylineByPoints[i][j].point.x == linesByPoint[k].point2.x1 &&
            polylineByPoints[i][j].point.y == linesByPoint[k].point2.y1)
        ) {
          //console.log("match")
        }
      }
    }
  }

  ////
  function doIt(text, line, positionOfTextArray, positionOfLineArray) {
    var xx = document.querySelectorAll("text");
    var currentData = $(xx[positionOfTextArray]).attr("data");
    $(xx[positionOfTextArray]).attr(
      "data",
      `${currentData} + text${positionOfTextArray}-line${positionOfLineArray} `
    );
    $(xx[positionOfTextArray]).attr(
      "dataText",
      `text${positionOfTextArray}`
    );
    var yy = document.querySelectorAll("line");
    //var currentLineData = $(yy[positionOfLineArray]).attr("data") + ""
    $(yy[positionOfLineArray]).attr(
      "data",
      `text${positionOfTextArray}-line${positionOfLineArray}`
    );
    $(yy[positionOfLineArray]).attr(
      "dataLine",
      `line${positionOfLineArray}`
    );
    var x = parseFloat($(xx[positionOfTextArray]).attr("dataX"));
    var y = parseFloat($(xx[positionOfTextArray]).attr("dataY"));
    var width = parseFloat($(xx[positionOfTextArray]).attr("dataWidth"));
    var xPlus = x + width;
    //console.log(typeof(x))
    lineArray[positionOfLineArray].pairings.push(positionOfTextArray);
    lineArray[positionOfLineArray].pairingsExtended.push({
      text: positionOfTextArray,
      x,
      y,
      width,
      xPlus,
    });

    //console.log(`text${positionOfTextArray}-line${positionOfLineArray}`);
  }
  function chooseTheBestMatch(lineArray) {
    var text = document.querySelectorAll("text");
    //console.log(lineArray)
    var line = document.querySelectorAll("line");
    for (let i = 0; i < lineArray.length; i++) {
      // console.log(line[i])
      if (lineArray[i].pairings.length == 1) {
        //here is no conflict and each line has a text owner!
        //console.log({line: i, text:lineArray[i].pairings[0]})
        finals.push({
          line: i,
          text: lineArray[i].pairings[0],
          alternativs: [lineArray[i].pairings[0]],
        });
      }
      /*  if (lineArray[i].pairings.length > 1) {
    // console.log(lineArray[i].pairings.length)

      //this is used for combining multiLine texts




      var y1 = $(text[lineArray[i].pairings[0]]).attr("dataY");
      var y2 = $(text[lineArray[i].pairings[1]]).attr("dataY");
      var y3 = $(text[lineArray[i].pairings[2]]).attr("dataY");
      var y4 = $(text[lineArray[i].pairings[3]]).attr("dataY");
      var y5 = $(text[lineArray[i].pairings[4]]).attr("dataY");

      //console.log(lineArray[i].pairings)
      var text1 = text[lineArray[i].pairings[0]].outerHTML;
      var text2 = text[lineArray[i].pairings[1]].outerHTML;
      //console.log(`${text1}, ${text2}`)
      //console.log({"line": lineArray[i], text1, text2})
      //if one of these text has only one line match
      //and the other one has one shared line and one extra. give the extra to second text
      // var numLines1 = (text1.match(/line/g) || []).length;
      // var numLines2 = (text2.match(/line/g) || []).length;

      var linesInText1 = [];
      var linesInText2 = [];
      var regex = /line(.*?) /g;
      text1.replace(regex, function (match, line) {
        linesInText1.push(line);
      });
      text2.replace(regex, function (match, line) {
        linesInText2.push(line);
      });

    //   console.log(linesInText1)
    //   console.log(linesInText2)
      if (linesInText1.length != linesInText2.length) {
        if (linesInText1.length > linesInText2.length) {

          var diff = linesInText1.filter((e) => !linesInText2.includes(e));
          //var same = linesInText1.filter(e => linesInText2.includes(e))
          //console.log(diff)
          // for (let i = 0; i < diff.length; i++) {
          // 	console.log(diff[i])

          // }

          var dataText = $(text[lineArray[i].pairings[0]]).attr("dataText");
          $(text[lineArray[i].pairings[0]]).attr(
            "data",
            ` + ${dataText}-line${diff}`
          );
          var newPairing = parseInt(dataText.replace(/text/g, ""));
          lineArray[i].pairings = [newPairing];
        } else {
          var diff = linesInText2.filter((e) => !linesInText1.includes(e));
          //console.log(diff)

          // for (let i = 0; i < diff.length; i++) {
          // 	console.log(diff[i])

          // }
          var dataText = $(text[lineArray[i].pairings[1]]).attr("dataText");
          $(text[lineArray[i].pairings[1]]).attr(
            "data",
            ` + ${dataText}-line${diff}`
          );
          var newPairing = parseInt(dataText.replace(/text/g, ""));
          lineArray[i].pairings = [newPairing];
        }
      }

      // if(y3-y2>9.5){
      // 	console.log(lineArray[i].pairings)
      // }
      // if(y4-y3>9.5){
      // 	console.log(lineArray[i].pairings)
      // }if(y5-y4>9.5){
      // 	console.log(lineArray[i].pairings)
      // }
    }*/
    }
    // console.log(finals)
    for (let i = 0; i < lineArray.length; i++) {
      if (lineArray[i].pairings.length > 1) {
        //console.log(i)
        for (let j = 0; j < lineArray[i].pairings.length; j++) {
          for (let k = 0; k < finals.length; k++) {
            if (lineArray[i].pairings[j] == finals[k].text) {
              lineArray[i].pairings.splice(j, 1);
              if (lineArray[i].pairings.length == 1) {
                var newArr = [lineArray[i].pairings[0], finals[k].text];
                finals.push({
                  line: i,
                  text: lineArray[i].pairings[0],
                  alternativs: newArr,
                });
              }
            }
          }
        }
        //console.log(lineArray[i].pairings)
      }
    }
   // console.log(finals);

    //still has conflict
    for (let i = 0; i < lineArray.length; i++) {
      if (lineArray[i].pairings.length > 1) {
        //here we should decide which text is closer to the line
        //console.log(lineArray[i]);
        getClosestText(lineArray[i], i);
      }
    }
    var newFinArray = Array.from(
      finals.reduce(
        (m, { line, alternativs }) =>
          alternativs.reduce(
            (n, alternativs) =>
              n.set(alternativs, [...(n.get(alternativs) || []), line]),
            m
          ),
        new Map()
      ),
      ([alternativs, line]) => ({ alternativs, line })
    );

    //console.log(newFinArray);
    //remove unnessery attributes and clean the work
    var finText = document.querySelectorAll("text");
    var finLine = document.querySelectorAll("line");

    for (let i = 0; i < finals.length; i++) {
      $(finText[finals[i].text]).attr("magic-line", finals[i].line);
      $(finLine[finals[i].line]).attr("magic-text", finals[i].text);

      $(finText[finals[i].text]).attr("magic-text", finals[i].text);
      $(finLine[finals[i].line]).attr("magic-line", finals[i].line);
    }
    for (let i = 0; i < newFinArray.length; i++) {
      $(finText[newFinArray[i].alternativs]).attr(
        "magic-line-alternate",
        newFinArray[i].line
      );
    }
$("#Layer_1 > g:nth-child(32) > g > g > image").on("click", function(){
$(".st11").css("opacity", "1");
})
$("#backgroundRect").on("click", function(){
$(".st11").css("opacity", "1");
})
    $(".st11").on("click", function () {
        // $("text[dataX]").hide()
        console.log($(this).attr("magic-line-alternate"))
        var thisDataClass = $(this).attr("dataClass")
        
      $(".st11").css("opacity", ".2");
      $(this).css("opacity", "1").attr("id", "selected");
      $(`text[dataClass = ${thisDataClass}]`).css("opacity", "1")
      var dataLine = $(this).attr("magic-line");
      $(line).css("opacity", ".2");
      $(line[dataLine]).css("opacity", "1");
      // //seting background effect not working!
      // var ctx = document.getElementById("Layer_1")
      // var textElement = ctx.getElementById("selected")
      // var svgRect = textElement.getBBox()
      // //alert(svgRect.x)
      // var rect = document.createElementNS("hhtp://www.w3.org/2000/svg", "rect");
      // rect.setAttribute("x", 200)
      // rect.setAttribute("hiAli", "aleyk ali")
      // rect.setAttribute("y", 200)
      // rect.setAttribute("width", 50)
      // rect.setAttribute("height", 80)
      // rect.setAttribute("fill", "yellow")
      // ctx.insertBefore(rect, textElement)
      // console.log(dataLine)
    });
    function getClosestText(line, lineNum) {
      var totalDistance = [];
      var reamins = [];
      for (let i = 0; i < line.pairingsExtended.length; i++) {
        reamins.push(line.pairingsExtended[i].text);
        var text = line.pairingsExtended[i];
        var textY = text.y;
        var lineY1 = line.y1;
        var lineY2 = line.y2;
        var lineX1 = line.x1;
        var lineX2 = line.x2;
        var verticalDistance1 = Math.abs(lineY1 - textY);
        var verticalDistance2 = Math.abs(lineY2 - textY);
        var textX = text.x;
        var textXPLus = text.xPlus;
        var horisontalDistance1 = Math.min(
          Math.abs(lineX1 - textX),
          Math.abs(lineX1 - textXPLus)
        );
        var horisontalDistance2 = Math.min(
          Math.abs(lineX2 - textX),
          Math.abs(lineX2 - textXPLus)
        );

        var minDistance = Math.min(
          verticalDistance1 + horisontalDistance1,
          verticalDistance2 + horisontalDistance2
        );
        totalDistance.push(minDistance);
      }
      var min = Math.min.apply(Math, totalDistance);

      finals.push({
        line: lineNum,
        text: line.pairingsExtended[totalDistance.indexOf(min)].text,
        alternativs: reamins,
      });

      //console.log({totalDistance, min, index: totalDistance.indexOf(min)})
    }

 
  }
})
