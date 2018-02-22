var data = document.getElementById("data").getAttribute("data-name");
data = JSON.parse(data);
var all_univ_data = data['university'];
var all_college_data = data['college'];

// console.log(all_univ_data);
// console.log(all_college_data);

var univ_by_type_chart = dc.pieChart("#chart-univ-type");
var univ_by_speciality_chart = dc.barChart("#chart-univ-speciality");
var colg_by_type_chart = dc.pieChart("#chart-college-type");
var colg_by_speciality_chart = dc.barChart("#chart-college-speciality");
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

function drawCharts(univ_data,college_data){
  var ndx = crossfilter(univ_data),
  typeDimension  = ndx.dimension(function(d) {return d.type;}),
  typeCountGroup = typeDimension.group().reduceSum(function(d) {return d.count;}),
  univSpecialityDimension = ndx.dimension(function(d) { return d.speciality;}),
  univSpecialityCountGroup = univSpecialityDimension.group().reduceSum(function(d) { return d.count;});

  univ_by_type_chart
    .width(350)
    .height(400)
    // .slicesCap(6)  
    .innerRadius(20)
    .externalLabels(50)
    .externalRadiusPadding(50)
    // .margins({top: 10, right: 20, bottom: 30, left: 100})
    .legend(dc.legend().x(0).y(0).gap(5))
    .renderLabel(false)
    .dimension(typeDimension)
    .group(typeCountGroup);

  // var margin = {top: 30, right: 40, bottom: 50, left: 50};

  univ_by_speciality_chart
   .width(600)
   .height(400)
   .x(d3.scale.ordinal())
   .xUnits(dc.units.ordinal)
   .brushOn(false)
   .yAxisLabel("Count")
   .xAxisLabel("Universities By Speciality")
   .margins({top: 10, right: 50, bottom: 120, left: 40})
   .elasticY(true)
   .elasticX(true)
   .gap(20)
   .dimension(univSpecialityDimension)
   .group(univSpecialityCountGroup)
   .renderlet(function (chart) {
     chart.selectAll('g.x text')
        .attr('dx', '-30')
        .attr('transform', "translate(-15,0) rotate(-75)");
     });

  // console.log(college_data);
  var ndx1 = crossfilter(college_data),
  managementDimension  = ndx1.dimension(function(d) {return d.management;}),
  countGroup = managementDimension.group().reduceSum(function(d) {return d.count;});
  colgSpecialityDimension = ndx1.dimension(function(d) { return d.speciality;}),
  colgSpecialityCountGroup = colgSpecialityDimension.group().reduceSum(function(d) { return d.count;});

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

  colg_by_speciality_chart
   .width(600)
   .height(400)
   .x(d3.scale.ordinal())
   .xUnits(dc.units.ordinal)
   .brushOn(false)
   .yAxisLabel("Count")
   .xAxisLabel("Universities By Speciality")
   .margins({top: 10, right: 50, bottom: 120, left: 40})
   .elasticY(true)
   .elasticX(true)
   .dimension(colgSpecialityDimension)
   .group(colgSpecialityCountGroup)
   .renderlet(function (chart) {
     chart.selectAll('g.x text')
        .attr('dx', '-30')
        .attr('transform', "translate(-15,0) rotate(-75)");
     });

  dc.renderAll();
}