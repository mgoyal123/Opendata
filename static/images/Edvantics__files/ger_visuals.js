var data = document.getElementById("data").getAttribute("data-name");
data = JSON.parse(data);

var avg_ger_data = data["avg_ger_data"];
var college_data = data["college_data"];
// console.log(data);
var state_ger_chart = dc.barChart("#chart-state-ger");
var college_by_specilisation_chart = dc.pieChart("#chart-top-college");
drawCharts(avg_ger_data, college_data);

function drawCharts(avg_ger_data, college_data){
  var ndx = crossfilter(avg_ger_data),
  stateDimension  = ndx.dimension(function(d) {return d.name;}),
  gerGroup = stateDimension.group().reduceSum(function(d) {return d.ger;});

  state_ger_chart
   .width(680)
   .height(300) 
   .x(d3.scale.ordinal())
   .xUnits(dc.units.ordinal)
   .brushOn(false)
   .yAxisLabel("-------- GER % --------")
   .xAxisLabel("-------- States --------")
   .renderLabel(true)
   .margins({top: 10, right: 50, bottom: 100, left: 40})
   .elasticY(true)
   .elasticX(true)
   .dimension(stateDimension)
   .group(gerGroup)
   .gap(8);

   state_ger_chart.filter = function() {};

   state_ger_chart.ordinalColors(['#1ABB9C']);
   state_ger_chart.ordering(function(d) { return +d.value });


  var ndx1 = crossfilter(college_data),
    specilisationDimension  = ndx1.dimension(function(d) {return d.speciality;}),
    typeCountGroup = specilisationDimension.group().reduceSum(function(d) {return d.count;});

    college_by_specilisation_chart
      .width(300)
      .height(300)
      .slicesCap(5)  
      .innerRadius(45)
      .externalLabels(50)
      .externalRadiusPadding(55)
      .legend(dc.legend().x(0).y(0).gap(10))
      .renderLabel(false)
      .dimension(specilisationDimension)
      .group(typeCountGroup);

    college_by_specilisation_chart.ordinalColors(['#3498DB', '#9B59B6', '#1ABB9C', '#9CC2CB','#34495E','#1b8085'])
    college_by_specilisation_chart.filter = function() {};

 
  dc.renderAll();
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
