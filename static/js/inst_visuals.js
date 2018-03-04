var data = document.getElementById("data").getAttribute("data-name");
data = JSON.parse(data);
var all_univ_data = data['university'];
var all_college_data = data['college'];
var top_states = data['top_states'];
var bottom_states = data['bottom_states'];


var univ_by_type_chart = dc.pieChart("#chart-univ-type");
var univ_by_speciality_chart = dc.barChart("#chart-univ-speciality");
var colg_by_type_chart = dc.pieChart("#chart-college-type");
var colg_by_speciality_chart = dc.barChart("#chart-college-speciality");


tabulate(top_states, ['State', 'No of colleges', 'Colleges per lakh population'],'#chart-top-college'); 
tabulate(bottom_states, ['State', 'No of colleges', 'Colleges per lakh population'],'#chart-bottom-college');
drawCharts(all_univ_data,all_college_data);

$('#statedata').change(function(){
  var univ_data = [];
  var college_data = [];
  var state = $(this).val();
  if(state == 'All India'){
    univ_data = all_univ_data;
    college_data = all_college_data;
  }
  else {
    for (var i in all_univ_data){
      if(all_univ_data[i]["name"] == state){
        univ_data.push(all_univ_data[i]);
      }
    }
    for (var i in all_college_data){
      if(all_college_data[i]["name"] == state){
        college_data.push(all_college_data[i]);
      }
    }
  }
  drawCharts(univ_data, college_data);
})

$('#reset').click(function(){
  dc.filterAll();
  dc.renderAll();
})

function remove_bins(source_group) { // (source_group, bins...}
    var bins = Array.prototype.slice.call(arguments, 1);
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return bins.indexOf(d.key) === -1;
            });
        }
    };
}



function drawCharts(univ_data,college_data){
  var ndx = crossfilter(univ_data),
  typeDimension  = ndx.dimension(function(d) {return d.type;}),
  typeCountGroup = typeDimension.group().reduceSum(function(d) {return d.count;}),
  univSpecialityDimension = ndx.dimension(function(d) { return d.speciality;}),
  univSpecialityCountGroup = univSpecialityDimension.group().reduceSum(function(d) {return d.count;});

  var filteredUnivGroup = remove_bins(univSpecialityCountGroup, "General");

  univ_by_type_chart
    .width(350)
    .height(400)
    .slicesCap(5)  
    .innerRadius(20)
    .externalLabels(50)
    .externalRadiusPadding(50)
    .legend(dc.legend().x(0).y(0).gap(5))
    .renderLabel(false)
    .dimension(typeDimension)
    .group(typeCountGroup);

  univ_by_type_chart.ordinalColors(['#3498DB', '#9B59B6', '#1ABB9C', '#9CC2CB','#34495E','#1b8085']);


  univ_by_speciality_chart
   .width(600)
   .height(400) 
   .x(d3.scale.ordinal())
   .xUnits(dc.units.ordinal)
   .brushOn(false)
   .yAxisLabel("-------- Count --------")
   .xAxisLabel("-------- Speciality --------")
   .renderLabel(true)
   .margins({top: 10, right: 50, bottom: 145, left: 40})
   .elasticY(true)
   .elasticX(true)
   .gap(20)
   .dimension(univSpecialityDimension)
   .group(filteredUnivGroup);

   univ_by_speciality_chart.ordinalColors(['#1ABB9C']);
   univ_by_speciality_chart.ordering(function(d) { return -d.value });
  // console.log(college_data);
  var ndx1 = crossfilter(college_data),
  managementDimension  = ndx1.dimension(function(d) {return d.management;}),
  countGroup = managementDimension.group().reduceSum(function(d) {return d.count;});
  colgSpecialityDimension = ndx1.dimension(function(d) { return d.speciality;}),
  colgSpecialityCountGroup = colgSpecialityDimension.group().reduceSum(function(d) { return d.count;});

  var filteredColgGroup = remove_bins(colgSpecialityCountGroup, "General");

  colg_by_type_chart
    .width(350)
    .height(400)
    // .slicesCap(6)  
    .innerRadius(20)
    .externalLabels(50)
    .externalRadiusPadding(50)
    // .margins({top: 10, right: 20, bottom: 30, left: 100})
    .legend(dc.legend().x(0).y(0).gap(5))
    .renderLabel(false)
    .dimension(managementDimension)
    .group(countGroup);

  colg_by_type_chart.ordinalColors(['#3498DB', '#9B59B6', '#1ABB9C', '#9CC2CB','#34495E','#1b8085']);

  colg_by_speciality_chart
   .width(600)
   .height(400)
   .x(d3.scale.ordinal())
   .xUnits(dc.units.ordinal)
   .brushOn(false)
   .yAxisLabel("-------- Count --------")
   .xAxisLabel("-------- Speciality --------")
   .margins({top: 10, right: 50, bottom: 130, left: 50})
   .elasticY(true)
   .elasticX(true)
   .dimension(colgSpecialityDimension)
   .group(filteredColgGroup);

   colg_by_speciality_chart.ordinalColors(['#1ABB9C']);
   colg_by_speciality_chart.ordering(function(d) { return -d.value });

  dc.renderAll();
}

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
