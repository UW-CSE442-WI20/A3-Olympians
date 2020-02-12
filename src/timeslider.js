///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// TIME RANGE SLIDER
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

const d3 = require("d3");

export function timeslider(min, max) {
  var myrange = [min, max + 1];
  var slidervalues = [1896, 1900, 1904, 1908, 1912, 1916, 1920, 1924, 1928, 1932,
    1936, 1940, 1944, 1948, 1952, 1956, 1960, 1964, 1968, 1972, 1976, 1980,
    1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016];
  // set width and height of slider control
  var w = 400;
  var h = 300;
  var controlMargin = {top: 140, bottom: 145, left: 40, right: 40};
  // dimensions of slider bar
  var width = w - controlMargin.left - controlMargin.right;
  var height = h - controlMargin.top - controlMargin.bottom;
  // create x scale
  var x = d3.scaleLinear()
     .domain(myrange)  // data space
     .range([0, width]);  // display space

  // create translated g
  const g = d3.select("#timeSlider")
    .append('g')
    .attr('transform', "translate(90,0)");

  // draw background lines
  g.append('g').selectAll('line')
    .data(slidervalues) //d3.range(myrange[0], myrange[1]+1))
    .enter()
    .append('line')
    .attr('x1', d => x(d)).attr('x2', d => x(d))
    .attr('y1', 0).attr('y2', height)
    .style('stroke', '#ccc')

  // labels
  var labelL = g.append('text')
    .attr('id', 'labelleft')
    .attr('x', 0)
    .attr('y', height + 15)
    .text(myrange[0]);
  var labelR = g.append('text')
    .attr('id', 'labelright')
    .attr('x', 0)
    .attr('y', height + 15)
    .text(myrange[1]);

    // define brush
    var brush = d3.brushX()
      .extent([[0,0], [width, height]])
      .on('brush', function() {
        var s = d3.event.selection;
        var svg = d3.select('svg');
        var val = s.map(d => Math.round(x.invert(d)));
        svg.node().value = determineYear(val, slidervalues);
      // update and move labels
      labelL.attr('x', s[0])
        .text(svg.node().value[0]);
      labelR.attr('x', s[1])
        .text(svg.node().value[1]);
      // move brush handles
      handle
        .attr("display", null)
        .attr("transform", function(d, i) {
          return "translate(" + [ s[i], - height / 4] + ")"; });  // CHANGE HANDLE POSITION HERE
        // update view
        // if the view should only be updated after brushing is over,
        // move these two lines into the on('end') part below
        svg.node().dispatchEvent(new CustomEvent("input"));
        let event = new Event("change");
        eventHandler.dispatchEvent(event);
      })

    // append brush to g
    var gBrush = g.append("g")
        .attr("class", "brush")
        .call(brush);

    // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
    var brushResizePath = function(d) {
        var e = +(d.type == "e"),
            x = e ? 1 : -1,
            y = height / 2;
        return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) +
          "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) +
          "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
    };

    var handle = gBrush.selectAll(".handle--custom")
      .data([{type: "w"}, {type: "e"}])
      .enter().append("path")
      .attr("class", "handle--custom")
      .attr("transform", "translate(10,10)")
      .attr("stroke", "#00cdcf")
      .attr("stroke-width", 1.5)
      .attr("fill", "#00cdcf")
      .attr("cursor", "ew-resize")
      .attr("d", brushResizePath);  // the brush shape

    // override default behaviour - clicking outside of the selected area
    // will select a small piece there rather than deselecting everything
    // https://bl.ocks.org/mbostock/6498000
    gBrush.selectAll(".overlay")
      .each(function(d) { d.type = "selection"; })
      .on("mousedown touchstart", brushcentered);

    function brushcentered() {
    var dx = x(1) - x(0), // Use a fixed width when recentering.
    cx = d3.mouse(this)[0],
    x0 = cx - dx / 2,
    x1 = cx + dx / 2;
    d3.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
  }

    // select entire range
    gBrush.call(brush.move, myrange.map(x));

    var getRange = function() {
      var range = d3.brushSelection(gBrush.node()).map(d => Math.round(x.invert(d)));
      range = determineYear(range, slidervalues);
      //console.log("RANGE ", range);
      return range }

     return {getRange: getRange}
  }

//// HELPER FUNCTION
//// Round slider value to the nearest valid Olympic year
  function determineYear(val, slidervalues) {
    // get start year
    for (let i = 0; i < slidervalues.length; i++) {
      if (Math.abs(slidervalues[i] - val[0]) <= 3) {
        val[0] = slidervalues[i];
        break;
      }
    }
    // get end year
    for (let i = 0; i < slidervalues.length; i++) {
      if (Math.abs(slidervalues[i] - val[1]) <= 3) {

        val[1] = slidervalues[i];
        break;
      }
    }
    return val;
  }
