///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// INDIVIDUAL ATHLETE'S MEDAL CHART
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

const d3 = require("d3");
const _ = require("underscore");

// function to generate individual athlete chart
// as a bar chart of medals over time
export function generateAthleteChart(data) {

    const containsYear = (groups, year) => {
        return _.find(d3.values(groups), function(item) {
            return item.key === year;
        });
    }

    const getMedalCount = (medal, year) => {
        var numMedals = 0;
        data.forEach(function(item) {
            if (item.Medal === medal && item.Year === year) numMedals++;
        });
        return numMedals;
    }

    const groupData = [];

    data.forEach(function(item) {
        var bronze = getMedalCount('Bronze', item.Year);
        var silver = getMedalCount('Silver', item.Year);
        var gold = getMedalCount('Gold', item.Year);

        if (containsYear(groupData, item.Year) === undefined) {
            var medalMap = [];
            for (let i = 1; i <= bronze; i++) {
                medalMap.push({grpName:'Bronze', grpValue:i});
            }
            for (let i = 1; i <= silver; i++) {
                medalMap.push({grpName:'Silver', grpValue:i});
            }
            for (let i = 1; i <= gold; i++) {
                medalMap.push({grpName:'Gold', grpValue:i});
            }

            groupData.push(new Object(
                { key: item.Year, values: medalMap
                }))}});

    var smallsvg = d3.select("#small-chart");

    // ideally want to have the medals shrink to 0, update axes and redraw everything
    smallsvg.selectAll("g").transition(); //.delay(5000);
    smallsvg.selectAll("g").remove();
    smallsvg.selectAll("text").remove();
    smallsvg.selectAll("g").transition(); //.delay(5000);

    var smallWidth = 500;
    var smallHeight = 400;

    var smallMargin = {
        left: 60,
        top: 30,
        right: 30,
        bottom: 60
    };

    var innerSmallWidth = smallWidth - smallMargin.left - smallMargin.right;
    var innerSmallHeight = smallHeight - smallMargin.top - smallMargin.bottom;

    var x = d3.scaleLinear().rangeRound([0, smallWidth], 0.5);
    var y = d3.scaleLinear().rangeRound([smallHeight, 0]);

    x.domain(data.map(function(d) {
        return d.year;
    }));
    y.domain([0, d3.max(groupData, function(key) {
        return d3.max(key.values, function(d) {
            return d.grpValue;
        });
    })]);

    const getXDomain = () =>
    {
        var domain = [];
        for (let i = +data[0].Start - 4; i <= +data[0].End + 4; i += 4) {
            domain.push(i);
        }
        return domain;
    }

    // const xSmallScale = d3.scaleTime().domain([(+data[0].Start - 4), (+data[0].End + 4)]).range([smallMargin.left, innerSmallWidth]);
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
    // .tickSize(-innerSmallWidth);

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
    // const ySmallAxisGroup = smallsvg.append("g")
    //     .attr("class", "axis y")
    //     .attr("transform", "translate(" + smallMargin["left"] + ",0)")
    //     .call(ySmallAxis);

    var x1 = d3.scaleBand();
    var medalTypes = groupData[0].values.map(function(d) {
        return d.grpName;
    });
    x1.domain(medalTypes).rangeRound([0, 30]); //x.bandwidth()]) ;

    var slice = smallsvg.selectAll(".slice")
        .data(groupData)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) {
            return "translate(" + xSmallScale(d.key) + ",0)";
        });

    // var color = d3.scaleOrdinal()
    //     .range(["#CD7F32","#C0C0C0","#D4AF37"]);

    var color = medalType => {
        if (medalType === 'Bronze') return "#CD7F32";
        else if (medalType === 'Silver') return "#C0C0C0";
        else return "#D4AF37";
    }

    // CHANGE RECT TO STACKED CIRCLES
    // slice.selectAll("rect")
    //     .data(function(d) { return d.values; })
    //     .enter().append("rect")
    //     .attr("width", x1.bandwidth())
    //     .style("fill", function(d) { return color(d.grpName) })
    //     .attr("x", function(d) { return x1(d.grpName) - (1.5 * x1.bandwidth()); })
    //     .attr("y", function(d) { return ySmallScale(d.grpValue) })
    //     .attr("height", function(d) {return innerSmallHeight - ySmallScale(d.grpValue); });

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
        .data(function(d) { return d.values; })
        .enter().append("circle")
        .style("fill", function(d) { return color(d.grpName) })
        .attr("cx", function(d) { return cxOffset(d.grpName) * xSmallScale.bandwidth(); })
        .attr("cy", function(d) { return ySmallScale(d.grpValue - 1.5) - 30 })
        .attr("r", 10);

    // now add titles to the axes
    smallsvg.append("text")
        .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + smallMargin.left + "," + (smallHeight / 2) + ")rotate(-90)") // text is drawn off the screen top left, move down and out and rotate
        .text("Medals Won");

    smallsvg.append("text")
        .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + (smallWidth / 2) + "," + (smallHeight - smallMargin.bottom / 10) + ")") // centre below axis
        .text("Year Competed");
}
