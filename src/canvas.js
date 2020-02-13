const d3 = require("d3");
const _ = require("underscore");

import {
  generateAthleteChart
} from './athletechart';

// function to draw lines and points given inputData
// with opacity animation included
export function redraw(svg, chart, inputData, entriesByName, xScale, yScale, colorScale, xAxis, xAxisGroup, xColumn, yColumn, colorColumn, circleRadius, minOrder, maxOrder) {
  if (typeof inputData !== 'undefined') {

    // update the X-axis
    xScale.domain([minOrder, maxOrder]);
    xAxisGroup.transition().call(xAxis);

    var line = chart.append("g").selectAll("line").data(inputData.values)
      .enter()
      .append("line")
      .style("opacity", 0)
      .style("stroke", function(d) {
        return colorScale(d[colorColumn]);
      })
      .style("stroke-width", 1)
      .attr("id", function(d) {
        return "l" + d.NOC;
      })
      .attr("class", function(d) {
        return "l" + d.Name;
      })
      .attr("x1", function(d) {
        return xScale(d[xColumn]);
      })
      .attr("y1", function(d) {
        return yScale(d["Start"]);
      })
      .attr("x2", function(d) {
        return xScale(d[xColumn]);
      })
      .attr("y2", function(d) {
        return yScale(d["End"]);
      })

    line.transition()
      .delay(200)
      .style("opacity", 1.0)
      .duration(500);

    var circle = chart.append("g").selectAll('circle').data(inputData.values)
      .enter()
      .append('circle')
      .style("opacity", 0)
      .attr("id", function(d) {
        return "c" + d.NOC;
      })
      .attr("class", function(d) {
        return "c" + d.Name.substr(0, d.Name.indexOf(" "));
      })
      .attr("cx", function(d) {
        return xScale(d[xColumn]);
      })
      .attr("cy", function(d) {
        return yScale(d[yColumn]);
      })
      .attr("r", circleRadius)
      .attr("fill", function(d) {
        return colorScale(d[colorColumn]);
      })
      .attr("label", function(d) {
        return d.Name
      })

    circle.transition()
      .delay(200)
      .style("opacity", 1.0)
      .duration(500);

    circle.on("mouseover", function(d) {
        // circle gets bigger
        d3.select(this)
          .transition()
          .attr("r", circleRadius + 3)
          .attr("fill", "orange");
        //Get this circle's x/y values, then augment for the tooltip
        var xPosition = parseFloat(d3.select(this).attr("cx"));
        var yPosition = parseFloat(d3.select(this).attr("cy"));

        //Create the tooltip label
        svg.append("text")
          .attr("id", "tooltip")
          .attr("x", () => {
              if (xPosition < innerWidth / 4) {
                return xPosition;
              } else return xPosition - d.Name.length * 10;
            })
            .attr("y", () => {
                if (yPosition > innerHeight / 10) {
                  return yPosition;
                } else return yPosition + 20;
              })
          .attr("text-anchor", "center")
          .attr("font-family", "sans-serif")
          .attr("font-size", "11px")
          .attr("font-weight", "bold")
          .attr("fill", "black")
          .style("pointer-events", "none")
          .text(d.Name);

        // get the data for the selected athlete
        var athleteData = _.find(d3.values(entriesByName), function(item) {
          return item.key === d.Name;
        });
        generateAthleteChart(athleteData.values);
      })
      .on("mouseout", function() {
        // back to small circles
        d3.select(this)
          .transition()
          .attr("r", circleRadius)
          .attr("fill", function(d) {
            return colorScale(d[colorColumn]);
          });
        // Remove the tooltip
        d3.select("#tooltip").remove();
      })
      .on("click", function(d) {
        // get the data for the selected athlete
        var athleteData = _.find(d3.values(entriesByName), function(item) {
          return item.key === d.Name;
        });
      });
  }
}

// function to draw lines and points given inputData
// will animate points by pulling them all to the center
// and pushing them back out to their new, evenly spaced
// positions
// Note: currently does not support .exit() functionality
export function redrawWithAnimation(svg, chart, inputData, entriesByName, xScale, yScale, colorScale, xAxis, xAxisGroup, xColumn, yColumn, colorColumn, circleRadius, minOrder, maxOrder) {
  if (typeof inputData !== 'undefined') {

    // update the X-axis
    xScale.domain([minOrder, maxOrder]);
    xAxisGroup.transition().call(xAxis);

    var line = chart.append("g").selectAll("line").data(inputData.values)
      .enter()
      .append("line")
      .attr("id", function(d) {
        return "l" + d.NOC
      })
      .attr("class", function(d) {
        return "l" + d.Name.substr(0, d.Name.indexOf(" "));;
      })
      .style("opacity", 0)
      .style("stroke", function(d) {
        return colorScale(d[colorColumn]);
      })
      .style("stroke-width", 1)
      .attr("x1", function(d) {
        return xScale(d[xColumn]);
      })
      .attr("y1", function(d) {
        return yScale(d["Start"]);
      })
      .attr("x2", function(d) {
        return xScale(d[xColumn]);
      })
      .attr("y2", function(d) {
        return yScale(d["End"]);
      });

      line.transition()
      .delay(3500)
      .ease(d3.easeLinear)
      .duration(1250)
      .style("opacity", 1.0)

    var circle = chart.append("g").selectAll('circle').data(inputData.values)
      .enter()
      .append('circle')
      .style("opacity", 0)
      .attr("id", function(d) {
        return "c" + d.NOC;
      })
      .attr("class", function(d) {
        return "c" + d.Name;
      })
      .attr("cx", function(d) {
        // return xScale(d[xColumn]);
        return xScale((maxOrder + minOrder) / 2);
      })
      .attr("cy", function(d) {
        return yScale(d[yColumn]);
      })
      .attr("r", circleRadius)
      .attr("fill", "grey")
      .attr("label", function(d) {
        return d.Name
      })

    circle.transition()
      .delay(1000)
      .duration(1000)
      .style("opacity", 1.0)
      .attr("cx", function(d) {
        // return xScale(d[xColumn]);
        return xScale((maxOrder + minOrder) / 2);
      })
      .attr("cy", function(d) {
        return yScale(d[yColumn]);
      })
      .attr("r", circleRadius)
      .attr("fill", "grey")
      .attr("label", function(d) {
        return d.Name
      })

    circle.transition()
      .delay(1500)
      .duration(2000)
      .ease(d3.easeQuadIn)
      .attr("cx", function(d) {
        return xScale(d[xColumn]);
      })
      .attr("cy", function(d) {
        return yScale(d[yColumn]);
      })
      .attr("fill", function(d) {
        return colorScale(d[colorColumn]);
      })

    circle.on("mouseover", function(d) {
        // circle gets bigger
        d3.select(this)
          .transition()
          .attr("r", circleRadius + 3)
          .attr("fill", "orange");
        //Get this circle's x/y values, then augment for the tooltip
        var xPosition = parseFloat(d3.select(this).attr("cx"));
        var yPosition = parseFloat(d3.select(this).attr("cy"));

        //Create the tooltip label
        svg.append("text")
          .attr("id", "tooltip")
          .attr("x", () => {
              if (xPosition < innerWidth / 4) {
                return xPosition;
              } else return xPosition - d.Name.length * 10;
            })
          .attr("y", () => {
            if (yPosition > innerHeight / 10) {
              return yPosition;
            } else return yPosition + 20;
          })
          .attr("text-anchor", "center")
          .attr("font-family", "sans-serif")
          .attr("font-size", "11px")
          .attr("font-weight", "bold")
          .attr("fill", "black")
          .style("pointer-events", "none")
          .text(d.Name);

        // get the data for the selected athlete
        var athleteData = _.find(d3.values(entriesByName), function(item) {
          return item.key === d.Name;
        });
        generateAthleteChart(athleteData.values);
      })
      .on("mouseout", function() {
        // back to small circles
        d3.select(this)
          .transition()
          .attr("r", circleRadius)
          .attr("fill", function(d) {
            return colorScale(d[colorColumn]);
          });
        // Remove the tooltip
        d3.select("#tooltip").remove();
      })
      .on("click", function(d) {
        // get the data for the selected athlete
        var athleteData = _.find(d3.values(entriesByName), function(item) {
          return item.key === d.Name;
        });
      });
  }
}
