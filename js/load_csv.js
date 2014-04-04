d3.csv("drivebc_events_hist_2012.csv", function (error, data) {
  if (error) throw error;
  // alert(data);

  // get column names from first row
  var attributes = Object.keys(data[0]);

  // possibly for use for filtering specific values of a categorical attribute
  function getUnique(attribute) {
    var uniques = [];
    for (var i = 0; i < data.length; i++) {
      uniques.push(data[i][attribute]);
    };

    // get unique attribute values (for selects)
    return $.unique(attribute);
  }

  $.getScript("js/draw_histogram.js", function() {
    draw_histogram(data);
    selectField("#select-category", ["All events", "type", "trafficpattern", "district"]);
    selectField("#select-timescale", ["Time of Day"]);
  })
});