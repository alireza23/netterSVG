function calculateMinDistance(x1, x2,y1,y2, textX, textY, textWidth, textHeight) {

    lineX1 = x1
    lineX2 = x2
    lineY1 = y1
    lineY2 = y2
    textX = textX
    textY = textY
    textXPLUS = textX + textWidth
    textYPLUS = textY - textHeight
    const d1 = Math.abs(lineY1 - textY) + Math.abs(lineX1 - textX);
    const d2 = Math.abs(lineY1 - textYPLUS) + Math.abs(lineX1 - textX);
    const d3 = Math.abs(lineY1 - textY) + Math.abs(lineX1 - textXPLUS);
    const d4 = Math.abs(lineY1 - textYPLUS) + Math.abs(lineX1 - textXPLUS);
    const d5 = Math.abs(lineY2 - textY) + Math.abs(lineX2 - textX);
    const d6 = Math.abs(lineY2 - textYPLUS) + Math.abs(lineX2 - textX);
    const d7 = Math.abs(lineY2 - textY) + Math.abs(lineX2 - textXPLUS);
    const d8 = Math.abs(lineY2 - textYPLUS) + Math.abs(lineX2 - textXPLUS);
    const min = Math.min(d1, d2, d3, d4, d5, d6, d7, d8);
    // console.log({d1, d2, d3, d4, d5, d6, d7, d8})
    console.log({min})

    return min;
  }

  var d = calculateMinDistance(66.35, 75.6, 709.69, 528.69, 64.18409729003906,718.3759765625, 59.734375, 9.96875)