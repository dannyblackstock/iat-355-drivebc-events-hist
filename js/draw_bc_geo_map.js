// define path generator
var path = d3.geo.path();

// load bc map GeoJSON file
d3.json("bc_districts_danny_min.json", function(error, json) {
  console.log(json);

  var width = 1160,
    height = 1160;

  var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

  var projection = d3.geo.mercator()
    .scale((width + 12000) / 2 / Math.PI)
    .translate([width + 8000/ 2, height + 3250 / 2])
    .precision(0.1);

  var path = d3.geo.path()
     .projection(projection);

  // create a path for each feature
  svg.selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path);

});