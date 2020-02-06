const d3 = require("d3");
const _ = require("underscore");
//const timeSlider = require("./timeslider.js");
import {slider} from './timeslider';

var outerWidth = 1200;
var outerHeight = 800;
var margin = { left: 60, top: 10, right: 30, bottom: 30 };
var innerWidth = outerWidth - margin.left - margin.right;
var innerHeight = outerHeight - margin.top - margin.bottom;
var circleRadius = 3;
var xColumn = "ID";
var yColumn = "Year";
var colorColumn = "NOC"; // color of circles based on athlete NOC
var startYear = 1896;
var endYear = 2016;

//const xScale = d3.scaleLinear().domain([0, 135000]).range([margin["left"], innerWidth]);
const xScale = d3.scalePoint().range([margin["left"], innerWidth]);
const yScale = d3.scaleTime().domain([startYear, endYear]).range([margin["bottom"], innerHeight]);
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// get the svg
var svg = d3.select('svg');
// axes

// for plotting points
const xValue = d => d.ID;

var xAxis = d3.axisBottom(xScale)
              .tickPadding(30);
              //.tickSize(-innerHeight);
var yAxis = d3.axisLeft(yScale)
              .tickValues([1896, 1900, 1904, 1908, 1912, 1916, 1920, 1924, 1928, 1932,
                1936, 1940, 1944, 1948, 1952, 1956, 1960, 1964, 1968, 1972, 1976, 1980,
                1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016])
              .tickFormat(d3.format("Y"))  // d3.format("d") // gets rid of commas in the dates
              .tickSize(-innerWidth);

// add axis groups to svg
var xAxisGroup = svg.append("g")
                    .attr("class", "axis x")
                    .attr("transform", "translate(0," + innerHeight + ")")
                    .call(xAxis);
var yAxisGroup = svg.append("g")
                    .attr("class", "axis y")
                    .attr("transform", "translate(" + margin["left"] + ",0)")
                    //.attr("height", innerHeight)
                    .call(yAxis);

// group for the visualization
var chart = svg.append("g")
               .attr("class", "chart")
               .attr("transform", "translate(10,0)");

// Load in the data
const csvFile = require('../olympic_overall.csv');

d3.csv(csvFile).then(function(data) {
  var dataset = data;
  // convert each value to its appropriate data type
  data.forEach(function(d) {
    d.ID = +d.ID;
    d.Age = +d.Age;
    d.Year = +d.Year;
  });

  // make the name the key
  var entriesByName = d3.nest()
    .key(function(d) { return d.Name; })
    .entries(data);

  // make the start year the key then name the secondary key
  var entriesByStartThenName = d3.nest()
    .key(function(d) { return d.Start; })
    .key(function(d) { return d.Name; })
    .entries(data);

  xScale.domain(data.map(xValue));

  // console.log(entriesByName);
  // console.log(entriesByStartThenName);

  // Render the lines
  chart.selectAll("line").data(data)
    .enter()
    .append("line")
    .style("stroke", function(d) { return colorScale(d[colorColumn]); })
    .style("stroke-width", 1)
    .attr("x1", function(d) { return xScale(d[xColumn]); })
    .attr("y1", function(d) { return yScale(d["Start"]); })
    .attr("x2", function(d) { return xScale(d[xColumn]); })
    .attr("y2", function(d) { return yScale(d["End"]); });
  // Render the data
  // Sets circles attributes
 // var circleAttrs = {
 //     cx: function(d) { return xScale(d[xColumn]);},
 //     cy: function(d) { return xScale(d[yColumn]); },
 //     r: circleRadius,
 //     fill: function(d) { return colorScale(d[colorColumn]); },
 //     label: function(d) { return d.Name }
 // };
  chart.selectAll('circle').data(data)
    .enter()
    .append('circle')
    .attr("cx", function(d) { return xScale(d[xColumn]); })
    .attr("cy", function(d) { return yScale(d[yColumn]); })
    .attr("r", circleRadius)
    .attr("fill", function(d) { return colorScale(d[colorColumn]); })
    .attr("label", function(d) { return d.Name })
    //.attr(circleAttrs)
    .on("mouseover", function(d) {
      // circle gets bigger
      d3.select(this)
        .transition()
        .attr("r", circleRadius + 3);
        //.attr("fill", "orange");
      //Get this circle's x/y values, then augment for the tooltip
			var xPosition = parseFloat(d3.select(this).attr("cx"));
			var yPosition = parseFloat(d3.select(this).attr("cy"));
      console.log("x: " + xPosition + " y: " + yPosition);
			//Create the tooltip label
			svg.append("text")
			   .attr("id", "tooltip")
			   .attr("x", xPosition)
				 .attr("y", yPosition)
				 .attr("text-anchor", "right")
				 .attr("font-family", "sans-serif")
				 .attr("font-size", "11px")
				 .attr("font-weight", "bold")
				 .attr("fill", "black")
         .style("pointer-events", "none")
				 .text(d.Name);
    })
    .on("mouseout", function() {
      // back to small circles
      d3.select(this)
        .transition()
        .attr("r", circleRadius);
        //.attr("fill", function(d) { return colorScale(d[colorColumn]); });
      //Remove the tooltip
      d3.select("#tooltip").remove();
    })
    .on("click", function(d) {
      // get the data for the selected athlete
      console.log(Object.values(d3.values(entriesByName)));
      var athleteData = _.find(d3.values(entriesByName), function(item) {
      // console.log("key: " + item.key);
      // console.log("searching for: " + d.Name);
      return item.key === d.Name;
    });
console.log("result: " + athleteData.values);

athleteData.values.forEach(function(element) {
   console.log(element);
});

		});
});

// RENDER THE TIME SLIDER
var mySlider = slider(1896, 2016);

// when the input range changes update the start and end years
d3.select('#eventHandler').on('change', function() {
  console.log("changed");
  updateTimeSlider(mySlider.getRange());
});

// Initial start and end years
updateTimeSlider([1896, 2016]);

// update the chart elements
function updateTimeSlider(range) {
  startYear = range[0];
  endYear = range[1];
  // update the Y-axis
  yScale.domain([startYear, endYear]);
  console.log("start: " + startYear);
  console.log("end: " + endYear);
  yAxisGroup.transition().call(yAxis);

  // update lines
  var l = chart.selectAll("line")
               .transition()
               .attr("x1", function(d) { return xScale(d[xColumn]); })
               .attr("y1", function(d) { return yScale(d["Start"]); })
               .attr("x2", function(d) { return xScale(d[xColumn]); })
               .attr("y2", function(d) { return yScale(d["End"]); });
  // update circles
  var c = chart.selectAll("circle")
               .transition()
               .attr("cx", function(d) { return xScale(d[xColumn]); })
               .attr("cy", function(d) { return yScale(d[yColumn]); });
  }
