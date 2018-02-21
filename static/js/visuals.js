var all_univ_data = document.getElementById("data").getAttribute("data-name");
all_univ_data = JSON.parse(all_univ_data);

var univ_by_type_chart = dc.pieChart("#chart-univ-type");
var univ_by_speciality_chart = dc.barChart("#chart-univ-speciality");
drawUnivCharts(all_univ_data);

$('#statedata').change(function(){
  var univ_data = [];
  var state = $(this).val();
  if(state == 'All India'){
    univ_data = all_univ_data;
  }
  else {
    for (var i in all_univ_data){
      if(all_univ_data[i]["name"] == state){
        univ_data.push(all_univ_data[i]);
      }
    }
  }
  drawUnivCharts(univ_data);
})

function drawUnivCharts(data){
  var ndx = crossfilter(data),
  typeDimension  = ndx.dimension(function(d) {return d.type;}),
  typeCountGroup = typeDimension.group().reduceSum(function(d) {return d.count;}),
  specialityDimension = ndx.dimension(function(d) { return d.speciality;}),
  specialityCountGroup = specialityDimension.group().reduceSum(function(d) { return d.count;});

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

  var margin = {top: 30, right: 40, bottom: 50, left: 50};

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
   .gap(20)
   .dimension(specialityDimension)
   .group(specialityCountGroup)
   .renderlet(function (chart) {
     chart.selectAll('g.x text')
        .attr('dx', '-30')
        .attr('transform', "translate(-15,0) rotate(-75)");
     });

  dc.renderAll();
}