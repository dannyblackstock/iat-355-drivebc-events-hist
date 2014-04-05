var width = 1160,
  height = 600;

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
      .style("stroke", "#ffffff");

    for(var i=0, len=data.length-1; i<len; i++){
    // (note: loop until length - 1 since we're getting the next
    //  item with i+1)
        routes=[];
        routes.push({
            type: "LineString",
            coordinates: [
                [ data[i]["head_longitude"] , data[i]["head_latitude"] ],
                [ data[i]["tail_longitude"] , data[i]["tail_latitude"] ]
            ]
        });
        svg.append("line")
          .datum(routes)
          .attr("class", "route")
          .attr("d", path)
          .attr("x1", function() {
            return projection(routes[0]["coordinates"][0])[0];
          })
          .attr("x2", function() {
            return projection(routes[0]["coordinates"][1])[0];
          })
          .attr("y1", function() {
            return projection(routes[0]["coordinates"][0])[1];
          })
          .attr("y2", function() {
            return projection(routes[0]["coordinates"][1])[1];
          });
    }

    // draw affected routes
    // svg.selectAll("line")
    //   .data(data)
    //   .enter()
    //   .append("line")
    //   .attr("x1", function(d) {
    //     return projection(d["head_latitude"])[0]/7;
    //   })
    //   .attr("x2", function(d) {
    //     return projection(d["tail_latitude"])[0]/7;
    //   })
    //   .attr("y1", function(d) {
    //     return projection(d["head_latitude"])[1]/7;
    //   })
    //   .attr("y2", function(d) {
    //     return projection(d["tail_latitude"])[1]/7;
    //   })
    //   .style("stroke-width", "2px")
    //   .style("stroke", "#ff0000");
    });
});