var width = 700,
  height = 600,
  centered;

// mercator type map projection
var projection = d3.geo.mercator()
  .scale((width + 4050) / Math.PI)
  .translate([width + 3000, height + 1425])
  .precision(0.1);

var path = d3.geo.path()
   .projection(projection);

var svg = d3.select("#map-svg").append("svg")
  .attr("width", width)
  .attr("height", height);

var g = svg.append("g");

// using random 4000 rows for testing
d3.csv("drivebc_events_hist_2012_4000.csv", function (data) {

  // load somewhat minified bc map GeoJSON file
  d3.json("bc_districts_danny_min.json", function(error, json) {
    // console.log(json);

    // create a path for each feature
    g.append("g")
      .attr("id", "regions")
      .selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "region")
      .on("mousemove", function(d) {
        //show tooltip at center
        var xPosition = d3.event.pageX;
        var yPosition = d3.event.pageY;

        var tooltipString = d["properties"]["NAME_2"];

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
      })
      .on("click", clicked);

    // draw affected routes
    // append route lines div to the group so it can be scaled too
    g.append("g")
      .attr("id", "routes")
      // .classed("hidden", true)
      .selectAll("line")
      .data(data)
      .enter()
      .append("line")
      .attr("class", function(d) {
        var rString = "route";
        if (d["severity"] == "Major") {
          rString = rString + " major";
        }
        return rString;
      })
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
      .attr("localupdatetime", function(d) {
        return d["localupdatetime"];
      })
      // show tooltip
      .on("mousemove", function(d) {
        //Get this bar's x/y values, then augment for the tooltip
        var xPosition = d3.event.pageX;
        var yPosition = d3.event.pageY;
        // console.log(d);

        var tooltipString = "<p><b>District:</b> " + d["district"] + "</p>" +
             "<p><b>Severity:</b> " + d["severity"] + "</p>"  +
              "<p><b>Cause:</b> " + d["cause"] + "</p>" +
              "<p><b>Date:</b> " + d["localupdatetime"] + "</p>" +
              "<p><b>Message:</b> " + d["advisorymessage"] + "</p>" +
              "<p><b>State:</b> " + d["state"] + "</p>";

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

    // checkbox to show or hide only major severity incidents
    var severeCheckbox = d3.select("#show-severe-only")
      .on("click", function(d) {
        opacity = this.checked ? 0 : 1;
        var routeLines = d3.selectAll("#routes line");
        routeLines.filter(function(d) {
          if (d["severity"]=="Major") {
            // console.log(d["severity"]);
            return false;
          }
          else {
            return true;
          }
        }).style("opacity", opacity);
      });
});

// function for zooming into selected regions
function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  // show the routes when zoomed in (centered on a region)
  // g.select("#routes")
  //   .classed("hidden", !centered);

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}