d3.csv("drivebc_events_hist_2012.csv", function (error, dataset) {
  // id,cause,district,state,severity,localupdatetime,advisorymessage,isbidirectional,trafficpattern,head_latitude,head_longitude,tail_latitude,tail_longitude,route,type
  // var attributes = Object.keys(dataset[0]); // get column names from first row

  var margin = {top: 10, right: 30, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var svg = d3.select("#histogram-canvas").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var timescaleOptions = ["Time of day", "Day of week", "Monthly"],
      categoryOptions = ["All events", "type", "trafficpattern", "district"];

  selectField("#select-timescale", timescaleOptions);
  selectField("#select-category", categoryOptions);
  d3.select("#select-category-values").on("change", function() {
    cleanUp();
    draw_histogram($("#select-timescale").val(), $("#select-category").val(), $(this).val());
    console.log($(this).val());
  });

  draw_histogram("Time of day", "All events");


  function draw_histogram(timescale, category, narrowCat) {
    // http://bl.ocks.org/mbostock/3048450
    var values = []; // values to be put into bins
    var xRange, yRange;

    // console.log(category);
    // Adds only what is in the category to the data.
    switch (category) {
      case "All events":
        for (var i = 0; i < dataset.length; i++) {
          values.push(setTimescale(i, timescale));
        }
        break;
      default:
        var options = getUnique(category);
        for (var i = 0; i < dataset.length; i++) {
          if ($.inArray(dataset[i][category], options)) {
            values.push(setTimescale(i, timescale));
          }
        }
    }

    if (narrowCat) { // a particular narrowed filter is selected
      values = [];
      for (var i = 0; i < dataset.length; i++) {
        for (var j = 0; j < narrowCat.length; j++) {
          if (dataset[i][category] == narrowCat[j]) {//(!$.inArray(dataset[i][category], narrowCat[j])) {
            values.push(setTimescale(i, timescale));
          }
        }
      }
    }

    // update total number of items
    d3.select("#total-value")
      .html(values.length);

    // A formatter for counts.
    var formatCount = d3.format(",.0f");

    var x = d3.scale.linear()
        .domain([0, xRange])
        .range([0, width]);

    // Generate a histogram using twenty uniformly-spaced bins.
    var data = d3.layout.histogram()
        .bins(x.ticks(24))
        (values);

    var y = d3.scale.linear()
        .domain([0, yRange])// d3.max(data, function(d) { return d.y; })])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var bar = svg.selectAll(".bar")
        .data(data)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(data[0].dx) - 1)
        .attr("height", function(d) { return height - y(d.y); })
        .on("mouseover", function(d) {

          // select lines where time attribute matches
          //change stroke
          var routeLines = d3.selectAll("#routes line");
          var timescale = $("#select-timescale").val();
          var matchTime = d[0];

          routeLines.filter(function(d) {
            var routeLinesTime="";
            if (timescale === "Day of week") {
              routeLinesTime = new Date(d["localupdatetime"]).getDay();
            }
            else if (timescale === "Monthly") {
              routeLinesTime = new Date(d["localupdatetime"]).getMonth();
            }
            else if (timescale === "Time of day") {
              routeLinesTime = new Date(d["localupdatetime"]).getHours();
            }
            if (matchTime === routeLinesTime) {
              return true;
            }
            else {
              return false;
            }
          }).style({'stroke': 'blue', 'stroke-width': 3});
        })
        .on("mouseout", function() {
          d3.selectAll("#routes line").style({'stroke': null, 'stroke-width': null});
        });

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

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0, 0)")
        .call(yAxis);

    function setTimescale (i, timescale) {
      var time;
      switch (timescale) {
        case "Day of week":
          time = new Date(dataset[i]["localupdatetime"]).getDay();
          xRange = 7;
          yRange = 80000;
          break;
        case "Monthly":
          time = new Date(dataset[i]["localupdatetime"]).getMonth();
          xRange = 12;
          yRange = 40000;
          break;
        default: // "Time of day" as default
          time = new Date(dataset[i]["localupdatetime"]).getHours();
          xRange = 24;
          yRange = 20000;
      }
      return time;
    }
  }

  function selectField (id, options) {
    var select = d3.select(id);

    select.selectAll("option")
        .data(options)
      .enter().append("option")
        .text(String);

    // default option -- always first element // http://stackoverflow.com/questions/13097923/how-can-i-use-d3-or-just-javascript-to-set-a-form-option-as-being-selected
    select.selectAll("option")
      .each(function(d) {
        if (d == options[0]) {
          return d3.select(this).attr("selected", "selected");
        }
      });

    // determines field to update the histogram
    select.on("change", function() {
      if (id == "#select-category") {
        var multiSelect = d3.select("#select-category-values");

        multiSelect.selectAll("option").remove();
        multiSelect.selectAll("option")
            .data(getUnique(this.value))
          .enter().append("option")
            .text(String);
        multiSelect.selectAll("option").property('selected', true);

        cleanUp();
        // console.log("You selected: " + this.value);
        draw_histogram($("#select-timescale").val(), this.value);
      } else if (id == "#select-timescale") {
        cleanUp();
        draw_histogram(this.value, $("#select-category").val());
      }
    });
  }

  function getUnique(attribute) { // filtering specific values of a categorical attribute
    var uniques = [];

    for (var i = 0; i < dataset.length; i++) {
      uniques.push(dataset[i][attribute]);
    }
    uniques = uniques.filter(function(elem, pos, self) { // http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
      return self.indexOf(elem) == pos;
    });

    return uniques.sort(); // get unique attribute values (for filters)
  }


  function cleanUp() {
    svg.selectAll(".bar").remove();
    svg.selectAll(".x.axis").remove();
    svg.selectAll(".y.axis").remove();
  }
});