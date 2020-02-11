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
    // data.forEach(function(item) { if (containsYear(groupData, item.Year) === undefined) oldgroupData.push(new Object(
    //     { key: item.Year, values:
    //             [
    //                 {grpName:'Bronze', grpValue:getMedalCount('Bronze', item.Year)},
    //                 {grpName:'Silver', grpValue:getMedalCount('Silver', item.Year)},
    //                 {grpName:'Gold', grpValue:getMedalCount('Gold', item.Year)}
    //             ]
    //     }))});

    // var medalsRepresented = []; // one entry for each year

    data.forEach(function(item) {
        var bronze = getMedalCount('Bronze', item.Year);
        var silver = getMedalCount('Silver', item.Year);
        var gold = getMedalCount('Gold', item.Year);
        var yearMedals = [];
        // bronze > 0 ? yearMedals.push({mdlName:'Bronze',represented:true}) : yearMedals.push({mdlName:'Bronze',represented:false});
        // silver > 0 ? yearMedals.push({mdlName:'Silver',represented:true}) : yearMedals.push({mdlName:'Silver',represented:true});
        // gold > 0 ? yearMedals.push({mdlName:'Gold',represented:true}) : yearMedals.push({mdlName:'Gold',represented:true});
        // medalsRepresented.push({year:item.Year, values:yearMedals})

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

    console.log("group data: ", groupData);

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
        bottom: 30
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

    const xSmallScale = d3.scaleTime().domain([(+data[0].Start - 4), (+data[0].End + 4)]).range([smallMargin["left"], innerSmallWidth]);
    const ySmallScale = d3.scaleLinear().domain([10, 0]).range([smallMargin["bottom"], innerSmallHeight]);

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
    const ySmallAxisGroup = smallsvg.append("g")
        .attr("class", "axis y")
        .attr("transform", "translate(" + smallMargin["left"] + ",0)")
        .call(ySmallAxis);

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
            return -2;
        } else if (medalType === 'Silver') {
            return 0;
        } else {
            return 2;
        }
    }
    // var cxOffset = (medalType, year) => {
    //     console.log("medals represented:", medalsRepresented)
    //     if (medalsRepresented[0].represented && medalsRepresented[1].represented && medalsRepresented[2].represented) {
    //       if (medalType === 'Bronze') {
    //         return -2;
    //       } else if (medalType === 'Silver') {
    //         return 0;
    //       } else {
    //         return 2;
    //       }
    //     }
    //     if (!medalsRepresented.year. [year].values[0].represented) {
    //       if (medalsRepresented[1].represented && medalsRepresented[2].represented) {
    //         if (medalType === 'Silver') {
    //           return -1;
    //         } else if (medalType === 'Gold') {
    //           return 1;
    //         }
    //       } else {
    //         // either only silver or only gold
    //         console.log("only silver or only gold")
    //         return 0;
    //       }
    //     }
    //     if (!medalsRepresented[1].represented && medalsRepresented[2].represented) {
    //       if (medalType === 'Bronze') {
    //         return -1;
    //       } else if (medalType === 'Gold') {
    //         return 1;
    //       }
    //     }
    //     // only bronze
    //     console.log("only bronze")
    //     return 0;
    // }

    slice.selectAll("circle")
        .data(function(d) { console.log("d values: ", d.values); return d.values; })
        .enter().append("circle")
        .style("fill", function(d) { console.log("d grpName: ", d.grpName); return color(d.grpName) })
        .attr("cx", function(d) { console.log("cx: ", cxOffset(d.grpName) * x1.bandwidth()); return cxOffset(d.grpName) * x1.bandwidth(); })
        .attr("cy", function(d) { console.log("d grpValue: ", d.grpValue); return ySmallScale(d.grpValue - 1.5) })
        .attr("r", 20);

    // now add titles to the axes
    smallsvg.append("text")
        .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + (smallMargin["left"] / 2) + "," + (smallHeight / 2) + ")rotate(-90)") // text is drawn off the screen top left, move down and out and rotate
        .text("Number of Medals Won");

    smallsvg.append("text")
        .attr("text-anchor", "middle") // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + (smallWidth / 2) + "," + (smallHeight) + ")") // centre below axis
        .text("Year Competed");

    data.forEach(function(d) {
        console.log(d.Name + " -- " + d.Year + ", " + d.Medal + ", " + d.Event);
    });
}