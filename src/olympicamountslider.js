///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// CAREER SLIDER
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
const d3 = require("d3");

module.exports =
function olympicamountslider(min, max) {
    var myrange = [min, max + 1];
    
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
    const g = d3.select("#olympicAmountSlider svg")
        .append('g')
        .attr('transform', "translate(90,0)");

    // draw background lines
    g.append('g').selectAll('line')
        .data(d3.range(myrange[0], myrange[1] + 1))
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
        .extent([[0, 0], [width, height]])
        .on('brush', function () {
            var s = d3.event.selection;
            var svg = d3.select('svg');
            svg.node().value = s.map(d => Math.round(x.invert(d)));
            
            // update and move labels
            labelL.attr('x', s[0])
                .text(svg.node().value[0]);
            labelR.attr('x', s[1])
                .text(svg.node().value[1]);
            // move brush handles
            handle
                .attr("display", null)
                .attr("transform", function (d, i) {
                    return "translate(" + [s[i], -height / 4] + ")";
                });  // CHANGE HANDLE POSITION HERE
            svg.node().dispatchEvent(new CustomEvent("input"));
        })
        .on('end', () => {
            // update view
            // view should only be updated after brushing is over
            let event = new Event("change");
            olympicAmountEventHandler.dispatchEvent(event);
        });

    // append brush to g
    var gBrush = g.append("g")
        .attr("class", "brush")
        .call(brush);

    // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
    var brushResizePath = function (d) {
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
        .each(function (d) {
            d.type = "selection";
        })
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

    var getRange = function () {
        var range = d3.brushSelection(gBrush.node()).map(d => Math.round(x.invert(d)));
        return range;
    }
    
    return {getRange: getRange}
}