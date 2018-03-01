var data = document.getElementById("data").getAttribute("data-name");
data = JSON.parse(data);
PG_data = []
UG_data = []

for(var i in data) {
  if(data[i]["level"] == "Post Graduate"){
    PG_data.push(data[i]);
  }
  if(data[i]["level"] == "Under Graduate") {
    UG_data.push(data[i]);
  }
}
// console.log(PG_data, UG_data);

var enrolment_by_level_chart = dc.barChart("#chart-enrolment-level");
var ug_discipline_chart = dc.rowChart("#chart-top-ug");
var pg_discipline_chart = dc.rowChart("#chart-top-pg");

drawCharts(data, UG_data, PG_data);


$('#statedata').change(function(){
  var state_wise_enrolment = [];
  var statewise_PG_data = [];
  var statewise_UG_data = [];
  var state = $(this).val();
  if(state == 'All India'){
    state_wise_enrolment = data;
    statewise_UG_data = UG_data;
    statewise_PG_data = PG_data;
  }
  else {
    for (var i in data){
      if(data[i]["name"] == state){
        state_wise_enrolment.push(data[i]);
      }
    }
    for (var i in PG_data) {
      if(PG_data[i]["name"] == state){
        statewise_PG_data.push(PG_data[i]);
      }
    }
    for (var i in UG_data) {
      if(UG_data[i]["name"] == state){
        statewise_UG_data.push(UG_data[i]);
      }
    }
  }
  drawCharts(state_wise_enrolment, statewise_UG_data, statewise_PG_data);
})


function drawCharts(data, UG_data, PG_data){
  var ndx = crossfilter(data),
  levelDimension  = ndx.dimension(function(d) {return d.level;}),
  levelCountGroup = levelDimension.group().reduceSum(function(d) {return d.enrollment_count;});
  var maxVal = levelCountGroup.top(1)[0].value;

  enrolment_by_level_chart
   .width(900)
   .height(400) 
   .x(d3.scale.ordinal())
   .xUnits(dc.units.ordinal)
   .brushOn(false)
   .yAxisLabel("Count")
   .xAxisLabel("Level")
   .margins({top: 10, right: 50, bottom: 80, left: 80 })
   .elasticY(true)
   .elasticX(true)
   .gap(30)
   .dimension(levelDimension)
   .group(levelCountGroup)
   .renderlet(function (chart) {
     chart.selectAll('g.x text')
        .attr('dx', '-30')
        .attr('transform', "translate(-15,0) rotate(-75)");
     });

  enrolment_by_level_chart.filter = function() {};
  enrolment_by_level_chart.ordering(function(d) { return -d.value });

  var ndx1 = crossfilter(UG_data),
  ugDisciplineDimension = ndx1.dimension( function(d) { return d.discipline_group_category; }),
  ugDisciplineGroup = ugDisciplineDimension.group().reduceSum( function(d) { return d.enrollment_count;});
  maxVal = ugDisciplineGroup.top(1)[0].value;

  ug_discipline_chart
    .width(450)
    .height(400)
    .dimension(ugDisciplineDimension)
    .group(ugDisciplineGroup)
    .margins({top: 0, right: 30, bottom: 45, left: 30 })
    .rowsCap(10)
    .elasticX(false)
    .x(d3.scale.log().clamp(true).domain([1, maxVal]).range([0,380]).nice())
    .xAxis().scale(ug_discipline_chart.x()).ticks(5, ",.0f").tickSize(5, 0);

  ug_discipline_chart.filter = function() {};
  ug_discipline_chart.ordering(function(d) { return -d.value });

  var ndx2 = crossfilter(PG_data),
  pgDisciplineDimension = ndx2.dimension( function(d) { return d.discipline_group_category; }),
  pgDisciplineGroup = pgDisciplineDimension.group().reduceSum( function(d) { return d.enrollment_count;});
  maxVal = pgDisciplineGroup.top(1)[0].value;

  pg_discipline_chart
    .width(450)
    .height(400)
    .dimension(pgDisciplineDimension)
    .group(pgDisciplineGroup)
    .rowsCap(10)
    .margins({top: 0, right: 30, bottom: 45, left: 30 })
    .elasticX(false)
    .x(d3.scale.log().clamp(true).domain([1, maxVal]).range([0,380]).nice())
    .xAxis().scale(pg_discipline_chart.x()).ticks(5, ",.0f").tickSize(5, 0);

  pg_discipline_chart.filter = function() {};
  pg_discipline_chart.ordering(function(d) { return -d.value });

  ug_discipline_chart.on("postRender", function(chart) {
    addXLabel(chart, "No of Enrolled Students");
    addYLabel(chart, "Discipline");
  });

  pg_discipline_chart.on("postRender", function(chart) {
    addXLabel(chart, "No of Enrolled Students");
    addYLabel(chart, "Discipline");
  });

  dc.renderAll();
}

// Functions to add x-label & y-label to Row Charts (Unsupported by dc.js)
var addXLabel = function(chartToUpdate, displayText) {
  var textSelection = chartToUpdate.svg()
              .append("text")
                .attr("class", "x-axis-label")
                .attr("text-anchor", "middle")
                .attr("x", chartToUpdate.width() / 2)
                .attr("y", chartToUpdate.height() - 10)
                .text(displayText);
};


var addYLabel = function(chartToUpdate, displayText) {
  var textSelection = chartToUpdate.svg()
              .append("text")
                .attr("class", "y-axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("x", -chartToUpdate.height() / 2)
                .attr("y", 10)
                .text(displayText);
};