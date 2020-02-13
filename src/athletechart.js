///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// INDIVIDUAL ATHLETE'S MEDAL CHART
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

const d3 = require("d3");
const _ = require("underscore");

// function to generate individual athlete chart
// as a bar chart of medals over time

module.exports =
function generateAthleteChart(data, smallsvg) {

    const containsYear = (groups, year) => {
        return _.find(d3.values(groups), function (item) {
            return item.key === year;
        });
    }

    const getMedalCount = (year, medal) => {
        var numMedals = 0;
        data.forEach(function (item) {
            if (item.Medal === medal && item.Year === year) numMedals++;
        });
        return numMedals;
    }

    const groupData = [];

    const getEvents = (year, medal) => {
        var events = [];
        data.forEach(function (item) {
            if (item.Year === year && item.Medal === medal) {
                events.push(item.Swim_Event);
            }
        })
        return events;
    }

    data.forEach(function (item) {
        var bronze = getMedalCount(item.Year, 'Bronze');
        var silver = getMedalCount(item.Year, 'Silver');
        var gold = getMedalCount(item.Year, 'Gold');

        var bronzeEvents = getEvents(item.Year, 'Bronze');
        var silverEvents = getEvents(item.Year, 'Silver');
        var goldEvents = getEvents(item.Year, 'Gold');

        if (containsYear(groupData, item.Year) === undefined) {
            var medalMap = [];
            for (let i = 1; i <= bronze; i++) {
                medalMap.push({grpName: 'Bronze', grpValue: i, grpEvent: bronzeEvents[i - 1]});
            }
            for (let i = 1; i <= silver; i++) {
                medalMap.push({grpName: 'Silver', grpValue: i, grpEvent: silverEvents[i - 1]});
            }
            for (let i = 1; i <= gold; i++) {
                medalMap.push({grpName: 'Gold', grpValue: i, grpEvent: goldEvents[i - 1]});
            }

            groupData.push(new Object(
                {
                    key: item.Year, values: medalMap
                }))
        }
    });

    smallsvg.selectAll("g").transition();
    smallsvg.selectAll("g").remove();
    smallsvg.selectAll("text").remove();
    smallsvg.selectAll("g").transition();

    var smallWidth = 420;
    var smallHeight = 400;

    var smallMargin = {
        left: 30,
        top: 30,
        right: 30,
        bottom: 60
    };

    var innerSmallWidth = smallWidth - smallMargin.left - smallMargin.right;
    var innerSmallHeight = smallHeight - smallMargin.top - smallMargin.bottom;

    var x = d3.scaleLinear().rangeRound([0, smallWidth], 0.5);
    var y = d3.scaleLinear().rangeRound([smallHeight, 0]);

    x.domain(data.map(function (d) {
        return d.year;
    }));
    y.domain([0, d3.max(groupData, function (key) {
        return d3.max(key.values, function (d) {
            return d.grpValue;
        });
    })]);

    const getXDomain = () => {
        var domain = [];
        for (let i = +data[0].Start - 4; i <= +data[0].End + 4; i += 4) {
            domain.push(i);
        }
        return domain;
    }

    const xSmallScale = d3.scaleBand().domain(getXDomain()).range([smallMargin.left, innerSmallWidth]);
    const ySmallScale = d3.scaleLinear().domain([10, 0]).range([smallMargin.bottom, innerSmallHeight]);

    const getTickValues = (startTick, endTick) => {
        var values = [];
        for (var i = startTick; i <= endTick; i += 4) {
            values.push(i)
        }
        return values;
    }

    const xSmallAxis = d3.axisBottom(xSmallScale)
        .tickPadding(30)
        .tickValues(getTickValues(+data[0].Start, +data[0].End))
        .tickFormat(d3.format("Y"))
    const ySmallAxis = d3.axisLeft(ySmallScale)

    // add title: athlete name and country
    smallsvg.append("text")
        .attr("x", smallWidth / 2)
        .attr("y", smallHeight - innerSmallHeight - 1.3 * smallMargin["top"])
        .style("text-anchor", "middle")
        .text(data[0].Name + "  (" + data[0].NOC + ")");

    // add axis groups to smallsvg
    const xSmallAxisGroup = smallsvg.append("g")
        .attr("class", "axis x")
        .attr("transform", "translate(0," + innerSmallHeight + ")")
        .call(xSmallAxis);

    var x1 = d3.scaleBand();
    var medalTypes = groupData[0].values.map(function (d) {
        return d.grpName;
    });
    x1.domain(medalTypes).rangeRound([0, 30]);

    var slice = smallsvg.selectAll(".slice")
        .data(groupData)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function (d) {
            return "translate(" + xSmallScale(d.key) + ",0)";
        });

    var color = medalType => {
        if (medalType === 'Bronze') return "#CD7F32";
        else if (medalType === 'Silver') return "#C0C0C0";
        else return "#D4AF37";
    }

    var cxOffset = medalType => {
        if (medalType === 'Bronze') {
            return 0.3;
        } else if (medalType === 'Silver') {
            return 0.5;
        } else {
            return 0.7;
        }
    }

    slice.selectAll("circle")
        .data(function (d) {
            return d.values;
        })
        .enter().append("circle")
        .style("fill", function (d) {
            return color(d.grpName)
        })
        .attr("cx", function (d) {
            return cxOffset(d.grpName) * xSmallScale.bandwidth();
        })
        .attr("cy", function (d) {
            return ySmallScale(d.grpValue - 1.5) - 30
        })
        .attr("r", 10)
        .on("mouseover", function (d) {//Get this circle's x/y values, then augment for the tooltip
            //Create the tooltip label
            smallsvg.append("text")
                .attr("id", "swimming-event")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + (smallWidth / 2) + "," + (innerSmallHeight / 3) + ")")
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-weight", "bold")
                .attr("fill", "black")
                .style("pointer-events", "none")
                .text(d.grpEvent.substring(9));
        })
        .on("mouseout", function () {// Remove the tooltip
            d3.select("#swimming-event").remove();
        });

    // now add titles to the axes
    smallsvg.append("text")
        .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + smallMargin.left + "," + (smallHeight / 2) + ")rotate(-90)") // text is drawn off the screen top left, move down and out and rotate
        .text("Medals Won");

    smallsvg.append("text")
        .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + (smallWidth / 2) + "," + (smallHeight - smallMargin.bottom / 5) + ")") // centre below axis
        .text("Year Competed");

    console.log("athlete chart here", data);
}
