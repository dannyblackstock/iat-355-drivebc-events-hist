var width = 1160,
  height = 600;

// using first 100 rows for testing
d3.csv("drivebc_events_hist_2012_100.csv", function (data) {

  // load bc map GeoJSON file
  d3.json("bc_districts_danny_min.json", function(error, json) {
    console.log(json);

    var svg = d3.select("#map-svg").append("svg")
      .attr("width", width)
      .attr("height", height);

    var projection = d3.geo.mercator()
      .scale((width + 4000) / Math.PI)
      .translate([width + 3000, height + 1575])
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
      .style("stroke", "#000000");

    // draw affected routes
    svg.selectAll("line")
      .data(data)
      .enter()
      .append("line")
      .attr("x1", function(d) {
        return projection([d["head_longitude"], d["head_latitude"]])[0];
      })
      .attr("x2", function(d) {
        return projection([d["tail_longitude"], d["tail_latitude"]])[0];
      })
      .attr("y1", function(d) {
        return projection([d["head_longitude"], d["head_latitude"]])[1];
      })
      .attr("y2", function(d) {
        return projection([d["tail_longitude"], d["tail_latitude"]])[1];
      })
      .style("stroke-width", "2px")
      .style("stroke", "#ff0000")
      .on("mouseover", function(d) {
        //Get this bar's x/y values, then augment for the tooltip
        var xPosition = d3.mouse(this)[0];
        var yPosition = d3.mouse(this)[1];
        // console.log(d);

        var tooltipString = "<p><b>District:</b> " + d["district"] + "</p>" +
             "<p><b>Severity:</b> " + d["severity"] + "</p>"  +
              "<p><b>Cause:</b> " + d["cause"] + "</p>";

        //Update the tooltip position and value
        d3.select("#tooltip")
          .style("left", xPosition + 10 + "px")
          .style("top", yPosition + "px")
          .select("#tooltip-value")
          .html(tooltipString);

        //Show the tooltip
        d3.select("#tooltip").classed("hidden", false);
      })
      .on("mouseout", function() {
        //Hide the tooltip
        d3.select("#tooltip").classed("hidden", true);
      });
    });
});