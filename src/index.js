var d3 = require("d3");

var outerWidth = 800;
var outerHeight = 800;
var margin = { left: 60, top: 30, right: 30, bottom: 30 };
var innerWidth = outerWidth - margin.left - margin.right;
var innerHeight = outerHeight - margin.top - margin.bottom;
var circleRadius = 5;
var xColumn = "ID";
var yColumn = "Year";
var colorColumn = "ID"; // color of circles based on athlete ID

const xScale = d3.scaleLinear().domain([0, 50]).range([margin["left"], innerWidth]);
const yScale = d3.scaleTime().domain([1896, 2016]).range([innerHeight, margin["bottom"]]);
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// get the svg
var svg = d3.select('svg');
// axes
var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale)
              .tickValues([1896, 1900, 1904, 1908, 1912, 1916, 1920, 1924, 1928, 1932,
                1936, 1940, 1944, 1948, 1952, 1956, 1960, 1964, 1968, 1972, 1976, 1980,
                1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016])
              .tickFormat(d3.format("Y"));  // d3.format("d") // gets rid of commas in the dates

// add axis groups to svg
svg.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + innerHeight + ")")
  .call(xAxis);
svg.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(" + margin["left"] + ",0)")
  .call(yAxis);

// Load in the data
const csvFile = require('./athlete_events_subset.csv');

d3.csv(csvFile).then(function(data) {
  console.log(data);
  // Render the data
  svg.selectAll('circle').data(data)
    .enter()
    .append('circle')
    .attr("cx", function(d) { return xScale(d.ID); })
    .attr("cy", function(d) { return yScale(d.Year); })
    .attr("r", circleRadius)
    .attr("fill", function(d) { return colorScale(d.ID); })
    .attr("label", function(d) { return d.Name });
});
