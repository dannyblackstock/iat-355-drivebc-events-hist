function initialize() {

  var mapOptions = {
    center: new google.maps.LatLng(55.1552967,-126.5117003),
    zoom: 5
  };

  var map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);

  d3.csv("drivebc_events_hist_2012.csv", function (error, data) {
    if (error) throw error;

    console.log(data[0]);

    var flightPlanCoordinates = [
      new google.maps.LatLng(data[0]["head_latitude"], data[0]["head_longitude"]),
      new google.maps.LatLng(data[0]["tail_latitude"], data[0]["tail_longitude"]),
    ];

    var flightPath = new google.maps.Polyline({
      path: flightPlanCoordinates,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    flightPath.setMap(map);
  });
}

google.maps.event.addDomListener(window, 'load', initialize);