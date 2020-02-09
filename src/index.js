///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// DATA INITIALIZATION
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

const d3 = require("d3");
const _ = require("underscore");
import { slider } from './timeslider'

var outerWidth = 1200;
var outerHeight = 800;
var margin = {
  left: 60,
  top: 30,
  right: 30,
  bottom: 30
};
var innerWidth = outerWidth - margin.left - margin.right;
var innerHeight = outerHeight - margin.top - margin.bottom;
var circleRadius = 3;
var xColumn = "ID";
var yColumn = "Year";
var colorColumn = "NOC"; // color of circles based on athlete NOC
var startYear = 1896;
var endYear = 2016;
var currentNOCs = [];

const csvFile = require('../olympic_overall.csv');

var medalCounts;
var maxMedals;
var selectedValues;
// data structures to be loaded in

// make the Name the key
var entriesByName;
// make the NOC the key
var entriesByNOC;
// make the Start Year the key then Name the secondary key
var entriesByStartThenName;
// lists all NOCs
var NOCs = [];


///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// HTML SETUP
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////


//const xScale = d3.scaleLinear().domain([0, 135000]).range([margin["left"], innerWidth]);
const xScale = d3.scalePoint().range([margin["left"], innerWidth]);
const yScale = d3.scaleTime().domain([startYear, 2016]).range([margin["bottom"], innerHeight]);
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// get the svg
var svg = d3.select('svg');
// axes

// for plotting points
const xValue = d => d.ID;

//var xAxis = d3.axisBottom(xScale);
var xAxis = d3.axisBottom(xScale)
  .tickPadding(30);
//.tickSize(-innerHeight);
var yAxis = d3.axisLeft(yScale)
  .tickValues([1896, 1900, 1904, 1908, 1912, 1916, 1920, 1924, 1928, 1932,
    1936, 1940, 1944, 1948, 1952, 1956, 1960, 1964, 1968, 1972, 1976, 1980,
    1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012, 2016
  ])
  .tickFormat(d3.format("Y")) // d3.format("d") // gets rid of commas in the dates
  .tickSize(-innerWidth);

// add axis groups to svg
var xAxisGroup = svg.append("g")
  .attr("class", "axis x")
  .attr("transform", "translate(0," + innerHeight + ")")
  .call(xAxis);
var yAxisGroup = svg.append("g")
  .attr("class", "axis y")
  .attr("transform", "translate(" + margin["left"] + ",0)")
  .call(yAxis);

// group for the visualization
var chart = svg.append("g")
  .attr("class", "chart")
  .attr("transform", "translate(10,0)");


///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// Helper functions
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

// function to draw lines and points given inputData
// Note: currently does not support .exit() functionality
function redraw(inputData) {
  // chart.selectAll("line").remove();
  // chart.selectAll("circle").remove();
  console.log("redrawing:", inputData);
  if (typeof inputData !== 'undefined') {
    chart.append("g").selectAll("line").data(inputData.values)
      .enter()
      .append("line")
      .attr("id", "l" + inputData.key)
      .style("stroke", function (d) {
        return colorScale(d[colorColumn]);
      })
      .style("stroke-width", 1)
      .attr("x1", function (d) {
        return xScale(d[xColumn]);
      })
      .attr("y1", function (d) {
        return yScale(d["Start"]);
      })
      .attr("x2", function (d) {
        return xScale(d[xColumn]);
      })
      .attr("y2", function (d) {
        return yScale(d["End"]);
      });
    chart.append("g").selectAll('circle').data(inputData.values)
      .enter()
      .append('circle')
      .attr("id", "c" + inputData.key)
      .attr("cx", function (d) {
        return xScale(d[xColumn]);
      })
      .attr("cy", function (d) {
        return yScale(d[yColumn]);
      })
      .attr("r", circleRadius)
      .attr("fill", function (d) {
        return colorScale(d[colorColumn]);
      })
      .attr("label", function (d) {
        return d.Name
      })
      //.attr(circleAttrs)
      .on("mouseover", function (d) {
        // circle gets bigger
        d3.select(this)
          .transition()
          .attr("r", circleRadius + 3)
          .attr("fill", "orange");
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
      .on("mouseout", function () {
        // back to small circles
        d3.select(this)
          .transition()
          .attr("r", circleRadius)
          .attr("fill", function(d) {
            return colorScale(d[colorColumn]);
          });
        //Remove the tooltip
        d3.select("#tooltip").remove();
      })
      .on("click", function (d) {
        // get the data for the selected athlete
        console.log(Object.values(d3.values(entriesByName)));
        var athleteData = _.find(d3.values(entriesByName), function (item) {
          // console.log("key: " + item.key);
          // console.log("searching for: " + d.Name);
          return item.key === d.Name;
        });
        console.log("result: " + athleteData.values);
  
        athleteData.values.forEach(function (element) {
          console.log(element);
        });
  
      });
  }
}

// function to set up the nested data structures
function initializeDataStructures(data) {
  console.log(data);
  // convert each value to its appropriate data type
  data.forEach(function (d) {
    d.ID = +d.ID;
    d.Age = +d.Age;
    d.Year = +d.Year;
  });

  // make the name the key
  entriesByName = d3.nest()
    .key(function (d) {
      return d.Name;
    })
    .entries(data);

  // make the NOC the key
  entriesByNOC = d3.nest()
    .key(function (d) {
      return d.NOC;
    })
    .entries(data);

  // make the Start Year the key then Name the secondary key
  entriesByStartThenName = d3.nest()
    .key(function (d) {
      return d.Start;
    })
    .key(function (d) {
      return d.Name;
    })
    .entries(data);


  // get only rows with medal
  const medalsOnly = _.filter(data, function (item) {
    return item.Medal.length > 0;
  });
  // count all the medals for each person
  medalCounts = _.countBy(medalsOnly, function (item) {
    return item.Name;
  });

  // find the maximum number of medals someone has
  maxMedals = _.max(medalCounts, function (item) {
    return item;
  });
}


function setupNOCFiltering(data) {

  for (var key in entriesByNOC) {
    if (!(entriesByNOC[key] in NOCs)) {
      NOCs.push(entriesByNOC[key].key);
    }
  }

  var select = document.getElementById("select-NOC");
  for (var index in NOCs) {
    select.options[select.options.length] = new Option(NOCs[index], index);
  }

  document.getElementById('select-NOC').addEventListener('change', function() {
    var activities = document.getElementById('select-NOC');
    var selectedOptions = activities.selectedOptions || [].filter.call(activities.options, option => option.selected);
    selectedValues = [].map.call(selectedOptions, option => option.value);
    var medals = document.getElementById('numMedals').value;

    //saving this stuff
    if (selectedValues.length > currentNOCs.length) {
      // we added a value so the current NOCs have to be updated
      var intersect = _.difference(selectedValues, currentNOCs);
      currentNOCs.push(intersect[0]);
      redraw(filterByMedal(entriesByNOC[intersect[0]], medalCounts, medals));
    } else if (selectedValues.length == currentNOCs.length) {
      removeData(entriesByNOC[currentNOCs[0]].key);
      redraw(filterByMedal(entriesByNOC[this.value], medalCounts, medals));
      currentNOCs = [];
      currentNOCs.push(this.value);
    } else {
      // we removed a value so current NOCs have to be updated
      var intersect = _.difference(currentNOCs, selectedValues);
      currentNOCs.pop(intersect[0]);
      removeData(entriesByNOC[intersect[0]].key);
    }

    // update the current dots that we're displaying
    console.log('You selected: ', this.value);
  });
}

// lets us remove the circles and lines that we don't need
function removeData(value) {
  svg.selectAll("#c" + value).remove();
  svg.selectAll("#l" + value).remove();
}

// function to setup Medal Filtering
function setupMedalFiltering(data) {
  // populate dropdown with range of medals
  var medalsDD = document.getElementById("numMedals");
  for (let i = 1; i <= maxMedals; i++) {
    medalsDD.options[medalsDD.options.length] = new Option(i, i);
  }

  d3.select("#numMedals")
    .on("input", function () {
      let currNOCObjects = [];
      for (let i = 0; i < selectedValues.length; i++) {
        currNOCObjects.push(entriesByNOC[selectedValues[i]]);
        removeData(entriesByNOC[selectedValues[i]].key);
      }
      for (let j = 0; j < currNOCObjects.length; j++) {
        redraw(filterByMedal(currNOCObjects[j], medalCounts, this.value));
      }
    });
}

// function that returns the dataset with only the rows
// containing the people with more than nMedals medals
// parameters: data - the full dataset,
// medalCounts - count of all the medals for each person
// nMedals - current number of medals
function filterByMedal(data, medalCounts, nMedals) {
  let currMedals = [];
  for (var person in medalCounts) {
    if (medalCounts[person] >= nMedals) {
      currMedals.push(person);
    }
  }
  let currPeople = _.filter(data.values, (item) => {
    return _.indexOf(currMedals, item.Name) >= 0;
  });
  currPeople = d3.nest()
    .key(function () {
      return data.key;
    })
    .entries(currPeople);
  return currPeople[0];
}

// update the elements
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
    .attr("x1", function (d) { return xScale(d[xColumn]); })
    .attr("y1", function (d) { return yScale(d["Start"]); })
    .attr("x2", function (d) { return xScale(d[xColumn]); })
    .attr("y2", function (d) { return yScale(d["End"]); });
  // update circles
  var c = chart.selectAll("circle")
    .transition()
    .attr("cx", function (d) { return xScale(d[xColumn]); })
    .attr("cy", function (d) { return yScale(d[yColumn]); });
}


// function to place all setup done for filtering options
function initializeOptions(data) {

  console.log(entriesByName);
  console.log(entriesByStartThenName);
  console.log(entriesByNOC);

  // Bin: For now, setupMedalFiltering has to be called before setupNOCFiltering
  // due to dependencies.
  // TODO: Bin fix this
  setupMedalFiltering(data);

  setupNOCFiltering(data);
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////


d3.csv(csvFile).then(function (data) {
  // create the nested data structures
  initializeDataStructures(data);
  xScale.domain(data.map(xValue));
  // initialize/create all the dropdowns/filters that will be shown in the view
  initializeOptions(data);
});


// RENDER THE TIME SLIDER
var mySlider = slider(1896, 2016);

// when the input range changes update the start and end years
d3.select('#eventHandler').on('change', function () {
  console.log("changed");
  updateTimeSlider(mySlider.getRange());
});

// Initial start and end years
updateTimeSlider([1896, 2016]);
