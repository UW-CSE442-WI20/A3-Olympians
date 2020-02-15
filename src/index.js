///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// DATA INITIALIZATION
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

const d3 = require("d3");
const _ = require("underscore");
const timeslider = require("./timeslider");
const medalslider = require("./medalslider");
const olympicamountslider = require("./olympicamountslider");
const generateAthleteChart = require("./athletechart");
const autocomplete = require("./search");

var {
  outerWidth,
  outerHeight,
  margin,
  innerWidth,
  innerHeight,
  circleRadius,
  xColumn,
  yColumn,
  colorColumn,
  startYear,
  endYear,

  minOrder,
  maxOrder,

  medalCounts,
  medalRange,
  olympicAmountCounts,
  olympicAmountRange,
  selectedValues,
  peopleNames,
  // data structures to be loaded in

  // make the Name the key
  entriesByName,
  // make the NOC the key
  entriesByNOC,
  // make the Start Year the key then Name the secondary key
  entriesByStartThenName,
  // lists all NOCs
  NOCs,

  xScale,
  yScale,
  colorScale,
  // get the svg
  svg,
  smallsvg,
  // for plotting points
  xValue,

  // axes
  xAxis,
  yAxis,

  // add axis groups to svg
  xAxisGroup,
  yAxisGroup,

  // define clipping path so that drawing stays within the chart
  // while using the timeslider
  clippath,

  // add group for the visualization
  chart
} = require('./globals');

const {redraw, redrawWithAnimation} = require( './canvas');

const csvFile = require('../data/olympic_overall.csv');

const NOCtoCountry = [];

NOCtoCountry.push(
  {key:"ANZ", value:"Australasia"},
  {key:"ARG", value:"Argentina"},
  {key:"AUS", value:"Australia"},
  {key:"AUT", value:"Austria"},
  {key:"BEL", value:"Belgium"},
  {key:"BLR", value:"Belarus"},
  {key:"BRA", value:"Brazil"},
  {key:"BUL", value:"Bulgaria"},
  {key:"CAN", value:"Canada"},
  {key:"CHN", value:"China"},
  {key:"CRC", value:"Costa Rica"},
  {key:"CRO", value:"Croatia"},
  {key:"CUB", value:"Cuba"},
  {key:"DEN", value:"Denmark"},
  {key:"ESP", value:"Spain"},
  {key:"EUN", value:"Unified Team"},
  {key:"FIN", value:"Finland"},
  {key:"FRA", value:"France"},
  {key:"GBR", value:"Great Britain"},
  {key:"GER", value:"Germany"},
  {key:"GRE", value:"Greece"},
  {key:"HUN", value:"Hungary"},
  {key:"IRL", value:"Ireland"},
  {key:"ITA", value:"Italy"},
  {key:"JPN", value:"Japan"},
  {key:"KAZ", value:"Kazakhstan"},
  {key:"KGZ", value:"Kyrgyzstan"},
  {key:"KOR", value:"South Korea"},
  {key:"LTU", value:"Lithuania"},
  {key:"MEX", value:"Mexico"},
  {key:"NED", value:"Netherlands"},
  {key:"NOR", value:"Norway"},
  {key:"NZL", value:"New Zealand"},
  {key:"PHI", value:"Philippines"},
  {key:"POL", value:"Poland"},
  {key:"ROU", value:"Romania"},
  {key:"RSA", value:"South Africa"},
  {key:"RUS", value:"Russia"},
  {key:"SCG", value:"Serbia and Montenegro"},
  {key:"SGP", value:"Singapore"},
  {key:"SLO", value:"Slovenia"},
  {key:"SRB", value:"Serbia"},
  {key:"SUI", value:"Switzerland"},
  {key:"SUR", value:"Suriname"},
  {key:"SVK", value:"Slovakia"},
  {key:"SWE", value:"Sweden"},
  {key:"TCH", value:"Czechoslovakia"},
  {key:"TTO", value:"Trinidad and Tobago"},
  {key:"TUN", value:"Tunisia"},
  {key:"UKR", value:"Ukraine"},
  {key:"URS", value:"Soviet Union"},
  {key:"USA", value:"United States"},
  {key:"VEN", value:"Venezuela"},
  {key:"YUG", value:"Yugoslavia"},
  {key:"ZIM", value:"Zimbabwe"}
);

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// Helper functions
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

// function to set up the nested data structures
function initializeDataStructures(data) {
  // convert each value to its appropriate data type
  data.forEach(function(d) {
    d.ID = +d.ID;
    d.Age = +d.Age;
    d.Year = +d.Year;
    d.Order = +d.Order;
  });

  // make the name the key
  entriesByName = d3.nest()
    .key(function(d) {
      return d.Name;
    })
    .entries(data);

  // make the NOC the key
  entriesByNOC = d3.nest()
    .key(function(d) {
      return d.NOC;
    })
    .entries(data);

  // make the Start Year the key then Name the secondary key
  entriesByStartThenName = d3.nest()
    .key(function(d) {
      return d.Start;
    })
    .key(function(d) {
      return d.Name;
    })
    .entries(data);


  // get only rows with medal
  const medalsOnly = _.filter(data, function(item) {
    return item.Medal.length > 0;
  });
  // count all the medals for each person
  medalCounts = _.countBy(medalsOnly, function(item) {
    return item.Name;
  });


  const uniqueYears = _.uniq(data, function(item) {
    return item.Name + " " + item.Year;
  })

  olympicAmountCounts = _.countBy(uniqueYears, function(item) {
    return item.Name;
  })
}


function setupNOCFiltering(data) {
  NOCtoCountry.forEach(function(item) {
    NOCs.push(item.value + " (" + item.key + ")");
  })

  var select = document.getElementById("select-NOC");
  for (var index in NOCs) {
    select.options[select.options.length] = new Option(NOCs[index], index);
  }

  document.getElementById('select-NOC').addEventListener('change', function() {
    var activities = document.getElementById('select-NOC');
    var selectedOptions = activities.selectedOptions || [].filter.call(activities.options, option => option.selected);
    selectedValues = [].map.call(selectedOptions, option => option.value);

    // want all to fade and only the ones that remain to stay
    chart.selectAll("line")
      .transition()
      .style("opacity", 0)
      .remove();

    chart.selectAll("circle")
      .transition()
      .delay(200)
      .duration(1000)
      .ease(d3.easeQuadIn)
      .attr("cx", function(d) {
        // return xScale(d[xColumn]);
        return xScale((maxOrder + minOrder) / 2);
      })
      .attr("cy", function(d) {
        return yScale(d[yColumn]);
      })
      .attr("r", circleRadius)
      .attr("fill", "grey")
      .on("end",function() { // on end of transition...
				    d3.select(this)
				    	.transition() // second transition
							.delay(750) // second delay
              .duration(1000)
              .style("opacity", 0)
				});

    maxOrder = -Number.MAX_VALUE;
    minOrder = Number.MAX_VALUE;

    for (var i = 0; i < selectedValues.length; i++) {
      var athleteMinOrder = _.min(entriesByNOC[selectedValues[i]].values, function(item) {
        return item.Order;
      });
      var athleteMaxOrder = _.max(entriesByNOC[selectedValues[i]].values, function(item) {
        return item.Order;
      });

      if (athleteMaxOrder.Order > maxOrder) {
        maxOrder = athleteMaxOrder.Order;
      }

      if (athleteMinOrder.Order < minOrder) {
        minOrder = athleteMinOrder.Order;
      }
    }

    for (var i = 0; i < selectedValues.length; i++) {
      redrawWithAnimation(svg, smallsvg, chart, filterAll(entriesByNOC[selectedValues[i]]),
         entriesByName, xScale, yScale, colorScale, xAxis, xAxisGroup, xColumn, yColumn, colorColumn, circleRadius, minOrder, maxOrder);
    }
  });
}

// function that returns the dataset with only the rows
// containing the people with at least nMedals medals
// parameters: data - the full dataset,
// medalCounts - count of all the medals for each person
// minMedals - current min number of medals
// maxMedals - current max number of medals
function filterByMedal(data, medalCounts, minMedals, maxMedals) {
  if (typeof data === 'undefined') {
    return undefined;
  }
  let currMedals = [];
  for (var person in medalCounts) {
    if (medalCounts[person] >= minMedals && medalCounts[person] <= maxMedals) {
      currMedals.push(person);
    }
  }
  let currPeople = _.filter(data.values, (item) => {
    const hasEnoughMedals = _.indexOf(currMedals, item.Name) >= 0;
    if (hasEnoughMedals) {
      peopleNames.push(item.Name);
    } else {
        d3.selectAll(".c" + item.Name.substr(0, item.Name.indexOf(" ")))
          .transition()
          .style("opacity", 0)
          .duration(2000)
          .remove();
        d3.selectAll(".l" + item.Name.substr(0, item.Name.indexOf(" ")))
          .transition()
          .style("opacity", 0)
          .duration(2000)
          .remove();
    }
    return hasEnoughMedals;
  });
  uniquePeopleNames = _.uniq(peopleNames, false);
  peopleNames.length = uniquePeopleNames.length;
  for (let i = 0; i < uniquePeopleNames.length; i++) {
    peopleNames[i] = uniquePeopleNames[i];
  }
  currPeople = d3.nest()
    .key(function() {
      return data.key;
    })
    .entries(currPeople);
  return currPeople[0];
}

// initialize the medalslider
function initializeMedalSlider() {
  var myMedalSlider = medalslider(1, 28);
  d3.select('#medalsEventHandler')
    .on('change', function() {
      // get min and max medal medal counts
      medalRange = myMedalSlider.getRange();
      // redraw data within range selection
      peopleNames.length = 0;
      if (typeof selectedValues !== 'undefined') {
        for (let i = 0; i < selectedValues.length; i++) {
          redraw(svg, smallsvg, chart, filterAll(entriesByNOC[selectedValues[i]]),
             entriesByName, xScale, yScale, colorScale, xAxis, xAxisGroup, xColumn, yColumn, colorColumn, circleRadius, minOrder, maxOrder);
        }
      }
    });
}

// initialize the olympicslider
function initializeOlympicAmountSlider() {
  var myOlympicAmountSlider = olympicamountslider(1, 5);
  d3.select('#olympicAmountEventHandler')
    .on('change', function() {
      // get min and max participation counts
      olympicAmountRange = myOlympicAmountSlider.getRange();
      // redraw data within range selection
      peopleNames.length = 0;
      if (typeof selectedValues !== 'undefined') {
        for (let i = 0; i < selectedValues.length; i++) {
          redraw(svg, smallsvg, chart, filterAll(entriesByNOC[selectedValues[i]]),
             entriesByName, xScale, yScale, colorScale, xAxis, xAxisGroup, xColumn, yColumn, colorColumn, circleRadius, minOrder, maxOrder);
        }
      }
    });
}

function filterAll (data) {
  var medalsFiltered = filterByMedal(data, medalCounts, medalRange[0], medalRange[1]);
  var filterMedalsAndAmount = filterByMedal(medalsFiltered, olympicAmountCounts, olympicAmountRange[0], olympicAmountRange[1]);
  return filterMedalsAndAmount;
}

// initialize the timeslider
function initializeTimeSlider() {
  var mySlider = timeslider(1896, 2016);
  // Initial start and end years
  updateTimeSlider([1896, 2016]);
  // when the input range changes, update the start and end years
  d3.select('#timeEventHandler').on('change', function() {
    updateTimeSlider(mySlider.getRange());
  });
}

// update the chart elements based on the timeslider
// update the elements
function updateTimeSlider(range) {
  startYear = range[0];
  endYear = range[1];
  // update the Y-axis
  yScale.domain([startYear, endYear]);
  yAxisGroup.transition().call(yAxis);

  // update lines
  var l = chart.selectAll("line")
    .transition()
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
  // update circles
  var c = chart.selectAll("circle")
    .transition()
    .attr("cx", function(d) {
      return xScale(d[xColumn]);
    })
    .attr("cy", function(d) {
      return yScale(d[yColumn]);
    });
}


// function to place all setup done for filtering options
function initializeOptions(data) {
  setupNOCFiltering(data);
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////


d3.csv(csvFile).then(function(data) {
  // create the nested data structures
  initializeDataStructures(data);
  // initialize timeSlider
  initializeTimeSlider();
  // initialize medalSlider
  initializeMedalSlider();
 // initialize olympicSlider
  initializeOlympicAmountSlider();
  // initialize/create all the dropdowns/filters that will be shown in the view
  initializeOptions(data);
  autocomplete(document.getElementById("searchbar"), peopleNames);

});
