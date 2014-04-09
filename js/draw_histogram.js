d3.csv("drivebc_events_hist_2012_4000.csv", function (error, dataset) {
  var margin = {top: 10, right: 30, bottom: 30, left: 50},
      width = 600 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var svg = d3.select("#histogram-canvas").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //add y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -53)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Number of Incidents");

  // Arrays hardcoded for determining which time periods & dimensions to use
  var timescaleOptions = ["Time of day", "Day of week", "Months of Year"],
      categoryOptions = ["All events", "type", "cause", "trafficpattern", "district"];

  selectField("#select-timescale", timescaleOptions);
  selectField("#select-category", categoryOptions);

  // Update histogram based on the selected values in Multi-select input
  d3.select("#select-category-values").on("change", function() {
    cleanUp();
    draw_histogram($("#select-timescale").val(), $("#select-category").val(), $(this).val());
    // console.log($(this).val()); // Returns an array of selected options
  });

  d3.select("#button-yscale").on("click", function() {
    if ($(this).val() == "Rescale to maximum value") {
      cleanUp();
      draw_histogram($("#select-timescale").val(), $("#select-category").val(), $("select-category-values").val());
      $(this).val("Reset scale to default");
    } else {
      cleanUp();
      draw_histogram($("#select-timescale").val(), $("#select-category").val(), $("select-category-values").val());
      $(this).val("Rescale to maximum value");
    }
  });

  draw_histogram("Time of day", "All events");

  function draw_histogram(timescale, category, narrowCat) {
    // Source: http://bl.ocks.org/mbostock/3048450
    var values = []; // pre-processed values to be put into bins
    var xRange, yRange; // range values for x and y scales

    // Adds only what is in the category to the data.
    switch (category) {
      case "All events": // push all records into values array
        for (var i = 0; i < dataset.length; i++) {
          values.push(setTimescale(i, timescale));
        }
        break;
      default: // push only whatever is in the category to the values array
        var options = getUnique(category);
        for (var i = 0; i < dataset.length; i++) {
          if ($.inArray(dataset[i][category], options)) {
            values.push(setTimescale(i, timescale));
          }
        }
    }

    if (narrowCat) { // an array of selected options
      values = [];
      for (var i = 0; i < dataset.length; i++) {
        for (var j = 0; j < narrowCat.length; j++) {
          if (dataset[i][category] == narrowCat[j]) { //(!$.inArray(dataset[i][category], narrowCat[j])) { // Loop through narrowCat to add every record with specific dimension value
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

    // Generate a histogram using uniformly-spaced bins.
    var data = d3.layout.histogram()
        .bins(x.ticks(xRange))
        (values);

    if ($("#button-yscale").val() == "Rescale to maximum value") {
      yRange = d3.max(data, function(d) { return d.y; });
      console.log(yRange);
    } else {
      setTimescale(0, timescale); // quick and dirty way to set yRange
      console.log(yRange);
    }

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
          var routeLines = d3.selectAll("#routes line").style("display", "none");
          var timescale = $("#select-timescale").val();
          var matchTime = d[0];

          routeLines.filter(function(d) {
            var routeLinesTime="";
            if (timescale === "Day of week") {
              routeLinesTime = new Date(d["localupdatetime"]).getDay();
            }
            else if (timescale === "Months of Year") {
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
          })
          .style({'display': null, 'stroke': 'blue', 'opacity': 0.4});
        })
        .on("mouseout", function() {
          d3.selectAll("#routes line").style({'display': null, 'stroke': null, 'opacity': null});
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

    // Function returns time as a formatted string according to whichever timescale is selected
    // Example: "01/01/2012 12:29" -> Date object .getHour() -> "12"
    function setTimescale (i, timescale) {
      var time;
      switch (timescale) {
        case "Day of week":
          time = new Date(dataset[i]["localupdatetime"]).getDay();
          xRange = 7;
          yRange = 700;
          break;
        case "Months of Year":
          time = new Date(dataset[i]["localupdatetime"]).getMonth();
          xRange = 12;
          yRange = 900;
          break;
        default: // "Time of day" as default
          time = new Date(dataset[i]["localupdatetime"]).getHours();
          xRange = 24;
          yRange = 450;
      }
      return time;
    }
  }

  // Reusable function that populates a dropdown menu with specified options
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

    // determines field to update the histogram -- kinda hardcoded
    select.on("change", function() {
      if (id == "#select-category") {
        // console.log("You selected: " + this.value);

        // multiSelect -- functionality that populates the Multi-select input every time the main category filter is changed
        var multiSelect = d3.select("#select-category-values");

        multiSelect.selectAll("option").remove();
        multiSelect.selectAll("option")
            .data(getUnique(this.value))
          .enter().append("option")
            .text(String);
        multiSelect.selectAll("option").property('selected', true); // Select all filters by default

        cleanUp(); // clear drawing for redraw
        draw_histogram($("#select-timescale").val(), this.value); // draw histogram with this newly selected category
      } else if (id == "#select-timescale") {
        cleanUp();
        draw_histogram(this.value, $("#select-category").val());  // draw histogram with this newly selected timescale
      }
    });
  }

  // Reusable function that returns an array of all unique values in a particular array (or all of one dimension's values in this context)
  // Example: ["A", "A", "B", "C"] -> ["A", "B", "C"]
  function getUnique(array) {
    var uniques = [];

    for (var i = 0; i < dataset.length; i++) {
      uniques.push(dataset[i][array]);
    }

    uniques = uniques.filter(function(elem, pos, self) { // http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
      return self.indexOf(elem) == pos;
    });

    return uniques.sort(); // get unique attribute values (for filters)
  }

  // Function that clears these svg elements in order to prep for another redraw
  function cleanUp() {
    svg.selectAll(".bar").remove();
    svg.selectAll(".x.axis").remove();
    svg.selectAll(".y.axis").remove();
  }
});