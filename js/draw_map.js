function initialize() {

  var mapOptions = {
    center: new google.maps.LatLng(55.1552967,-126.5117003),
    zoom: 5
  };

  var map = new google.maps.Map(d3.select("#map-canvas").node(),
      mapOptions);

  d3.csv("drivebc_events_hist_2012_subset.csv", function (error, data) {
    var overlay = new google.maps.OverlayView();

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {
      var layer = d3.select(this.getPanes().overlayLayer).append("div")
          .attr("class", "stations");

      // Draw each marker as a separate SVG element.
      // We could use a single SVG, but what size would it have?
      overlay.draw = function() {
        var projection = this.getProjection(),
            padding = 10;

        var marker = layer.selectAll("svg")
            .data(d3.values(data))
            .each(transform) // update existing markers
          .enter().append("svg:svg")
            .each(transform)
            .attr("class", "marker");

        // Add a circle.
        marker.append("svg:circle")
            .attr("r", 4.5)
            .attr("cx", padding)
            .attr("cy", padding);

        // Add a label.
        marker.append("svg:text")
            .attr("x", padding + 7)
            .attr("y", padding)
            .attr("dy", ".31em")
            .text(function(d) { return d["head_latitude"]; });

        function transform(d) {
          console.log(d);
          d = new google.maps.LatLng(d["head_latitude"], d["head_longitude"]);
          d = projection.fromLatLngToDivPixel(d);
          return d3.select(this)
              .style("left", (d.x - padding) + "px")
              .style("top", (d.y - padding) + "px");
        }
      };
    };

    // Bind our overlay to the map…
  overlay.setMap(map);
  });
}

google.maps.event.addDomListener(window, 'load', initialize);