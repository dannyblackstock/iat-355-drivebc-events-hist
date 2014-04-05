d3.csv("drivebc_events_hist_2012.csv", function (error, data) {
  if (error) throw error;
  // alert(data);

  $.getScript("js/draw_histogram.js", function() {
    
  });
});