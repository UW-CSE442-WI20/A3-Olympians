///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// GLOBAL VARIABLES
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
const d3 = require("d3");

export var outerWidth = 1000;
export var outerHeight = 800;
export var margin = {
  left: 60,
  top: 30,
  right: 30,
  bottom: 30
};
export var innerWidth = outerWidth - margin.left - margin.right;
export var innerHeight = outerHeight - margin.top - margin.bottom;
export var circleRadius = 5;
export var xColumn = "Order";
export var yColumn = "Year";
export var colorColumn = "NOC"; // color of circles based on athlete NOC
export var startYear = 1896;
export var endYear = 2016;

export var minOrder = 0;
export var maxOrder = 8760;

export var medalCounts;
export var medalRange = [1, 28]; // [minMedals, maxMedals]
export var olympicAmountCounts;
export var olympicAmountRange = [1, 6];
export var selectedValues = [];
export var peopleNames = [];
// data structures to be loaded in

// make the Name the key
export var entriesByName;
// make the NOC the key
export var entriesByNOC;
// make the Start Year the key then Name the secondary key
export var entriesByStartThenName;
// lists all NOCs
export var NOCs = [];


///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// HTML SETUP
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////


// const xScale = d3.scaleLinear().domain([minID, maxID]).range([margin["left"], innerWidth]);
export const xScale = d3.scaleLinear().domain([minOrder, maxOrder]).range([margin["left"], innerWidth]);

//const xScale = d3.scalePoint().range([margin["left"], innerWidth]);
export const yScale = d3.scaleTime().domain([startYear, endYear]).range([margin["bottom"], innerHeight]);
export const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// get the svg
export var svg = d3.select('svg');

// for plotting points
export const xValue = d => d.Order;

// axes
//var xAxis = d3.axisBottom(xScale);
export var xAxis = d3.axisBottom(xScale)
  .tickPadding(30)
  .tickSize(0);
export var yAxis = d3.axisLeft(yScale)
  .tickValues([1896, 1900, 1904, 1908, 1912, 1916, 1920, 1924, 1928, 1932,
    1936, 1940, 1944, 1948, 1952, 1956, 1960, 1964, 1968, 1972, 1976, 1980,
    1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016
  ])
  .tickFormat(d3.format("Y")) // gets rid of commas in the dates
  .tickSize(-innerWidth);

// add axis groups to svg
export var xAxisGroup = svg.append("g")
  .attr("class", "axis x")
  .attr("transform", "translate(0," + innerHeight + ")")
  .call(xAxis);
export var yAxisGroup = svg.append("g")
  .attr("class", "axis y")
  .attr("transform", "translate(" + margin["left"] + ",0)")
  .call(yAxis);

// define clipping path so that drawing stays within the chart
// while using the timeslider
export var clippath = svg.append("clipPath")
  .attr("id", "chart-clip")
  .append("rect")
  .attr("x", 0)
  .attr("y", margin["bottom"] - 6) // magic number :o
  .attr("width", outerWidth)
  .attr("height", yAxisGroup.node().getBBox().height); //innerHeight

// apply clipping path
svg.attr("clip-path", "url(#chart-clip)");

// add group for the visualization
export var chart = svg.append("g")
  .attr("class", "chart")
  .attr("transform", "translate(10,0)");
