var width = 1160,
  height = 1160;

d3.csv("drivebc_events_hist_2012_100.csv", function (data) {

  // load bc map GeoJSON file
  d3.json("bc_districts_danny_min.json", function(error, json) {
    console.log(json);

    var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

    var projection = d3.geo.mercator()
      .scale((width + 5420) / Math.PI)
      .translate([width + 4000, height + 1625])
      .precision(0.1);

    var path = d3.geo.path()
       .projection(projection);

    // create a path for each feature
    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", "#77aaff")
      .style("stroke", "#ffffff");
  });

});