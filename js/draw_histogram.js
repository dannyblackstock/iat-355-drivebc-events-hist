function draw_histogram(dataset) {
  // http://bl.ocks.org/mbostock/3048450
  var values = []; // gotta format the data before I pass into histogram, unlike the other vis's...?
  var timeDateFormat = d3.time.format("%x %_H:%M"); // 01/31/2012 0:30
  // var timeFormat = d3.time.format("%_H:%M"); // 0:30
  // var dateFormat = d3.time.format("%x"); // 01/31/2012
  for (var i = 0; i < dataset.length; i++) {
    var time = timeToDecimal(dataset[i]["localupdatetime"].substring(10));
    // time = timeFormat.parse(time);
    // if (i == 10) {
    //   console.log(dataset[i]);
    //   console.log(time);
    // }
    values.push(time);
  };

  function timeToDecimal(t) {
    var arr = t.split(':');
    return parseFloat(parseInt(arr[0], 10) + '.' + parseInt((arr[1]/6)*10, 10));
  }   

  // console.log(values); // index : time number

  // A formatter for counts.
  var formatCount = d3.format(",.0f");

  var margin = {top: 10, right: 30, bottom: 30, left: 30},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.scale.linear()
      .domain([0, 24])
      .range([0, width]);

  // Generate a histogram using twenty uniformly-spaced bins.
  var data = d3.layout.histogram()
      .bins(x.ticks(24))
      (values);

  var y = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d.y; })])
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var svg = d3.select("#histogram-canvas").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var bar = svg.selectAll(".bar")
      .data(data)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

  bar.append("rect")
      .attr("x", 1)
      .attr("width", x(data[0].dx) - 1)
      .attr("height", function(d) { return height - y(d.y); });

  bar.append("text")
      .attr("dy", ".75em")
      .attr("y", 6)
      .attr("x", x(data[0].dx) / 2)
      .attr("text-anchor", "middle")
      .text(function(d) { return formatCount(d.y); });

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

}