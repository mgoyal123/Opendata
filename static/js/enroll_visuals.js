var alldata = document.getElementById("data").getAttribute("data-name");
alldata = JSON.parse(alldata);
var top_states = alldata['top_states'];
var bottom_states = alldata['bottom_states'];
var data = alldata["enrolment_data"];
var PG_data = [];
var UG_data = [];

for(var i in data) {
  if(data[i]["level"] == "Post Graduate"){
    PG_data.push(data[i]);
  }
  if(data[i]["level"] == "Under Graduate") {
    UG_data.push(data[i]);
  }
}

var ug_discipline_chart = dc.rowChart("#chart-top-ug");
var pg_discipline_chart = dc.rowChart("#chart-top-pg");

tabulate(top_states, ['State', 'Average Enrolment', 'Pupil Teacher Ratio'],'#chart-top-enrolment'); 
tabulate(bottom_states, ['State', 'Average Enrolment', 'Pupil Teacher Ratio'],'#chart-bottom-enrolment');
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

  $("#viz").html('');
  var visualization = d3plus.viz()
    .container("#viz")  // container DIV to hold the visualization
    .data(data)  // data to use with the visualization
    .type("tree_map")   // visualization type
    .id("level")         // key for which our data is unique on
    .size("enrollment_count")      // sizing of blocks  
    .color(function(d){
      if (d.level == "Under Graduate"){
        return '#1ABB9C';
      }
      else if(d.level == "Post Graduate"){
        return '#3498DB';
      }
      else if(d.level == "Diploma"){
        return '#9B59B6';
      }
      else if(d.level == "PG Diploma"){
        return '#b0aac0';
      }
      else if(d.level == "Integrated"){
        return '#34495E';
      }
      else if(d.level == "Certificate"){
        return '#1b8085';
      }
      else if(d.level == "Ph.D."){
        return '#d6cbd3';
      }
      else if(d.level == "M.Phil.") {
        return '#bdcebe';
      }
    })
    .draw()             // finally, draw the visualization!


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
  ug_discipline_chart.ordinalColors(['#1ABB9C','#a2b9bc','#3498DB', '#9B59B6', '#9CC2CB','#34495E','#1b8085','#d6cbd3','#bdcebe','#c4b7a6','#b0aac0']);

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
  pg_discipline_chart.ordinalColors(['#1ABB9C','#a2b9bc','#3498DB', '#9B59B6', '#9CC2CB','#34495E','#1b8085','#d6cbd3','#bdcebe','#c4b7a6','#b0aac0']);

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


function tabulate(data, columns, chart_id) {
  var table = d3.select(chart_id)
  var thead = table.append('thead')
  var tbody = table.append('tbody');

    // append the header row
  thead.append('tr')
    .selectAll('th')
    .data(columns).enter()
    .append('th')
      .text(function (column) { return column; });

    // create a row for each object in the data
  var rows = tbody.selectAll('tr')
    .data(data)
    .enter()
    .append('tr');

    // create a cell in each row for each column
  var cells = rows.selectAll('td')
    .data(function (row) {
      return columns.map(function (column) {
        return {column: column, value: row[column]};
      });
    })
    .enter()
    .append('td')
      .text(function (d) { return d.value; });

  return table;
}
