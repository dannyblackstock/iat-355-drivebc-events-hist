d3.csv("drivebc_events_hist_2012.csv", function (error, dataset) {
  // id,cause,district,state,severity,localupdatetime,advisorymessage,isbidirectional,trafficpattern,head_latitude,head_longitude,tail_latitude,tail_longitude,route,type
  var attributes = Object.keys(dataset[0]); // get column names from first row

  var margin = {top: 10, right: 30, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var svg = d3.select("#histogram-canvas").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  draw_histogram(null, null);
  selectField("#select-timescale", ["24 hours"]);
  selectField("#select-category", ["All events", "type", "trafficpattern", "district"]);
  
  d3.select("#select-category-values").on("change", function() {
    cleanUp();
    draw_histogram(null, $("#select-category").val(), $(this).val());
  });

  function draw_histogram(timescale, category, narrowCat) { 
    // http://bl.ocks.org/mbostock/3048450
    var values = []; // values to be put into bins
    // var timeDateFormat = d3.time.format("%x %_H:%M"); // 01/31/2012 0:30
    // var timeFormat = d3.time.format("%_H:%M"); // 0:30
    // var dateFormat = d3.time.format("%x"); // 01/31/2012

    // Adds only what is in the category to the data.
    if (category == "All events" || category == null) {
      for (var i = 0; i < dataset.length; i++) {
        var time = timeToDecimal(dataset[i]["localupdatetime"].substring(10));
        // time = timeFormat.parse(time);
        values.push(time);
      }
    } else if (narrowCat) {
      for (var i = 0; i < dataset.length; i++) {
        if ($.inArray(dataset[i][category], narrowCat)) {
          var time = timeToDecimal(dataset[i]["localupdatetime"].substring(10));
          values.push(time);
        }
      }
    } else {
      var options = getUnique(category);
      for (var i = 0; i < dataset.length; i++) {
        if ($.inArray(dataset[i][category], options)) {
          var time = timeToDecimal(dataset[i]["localupdatetime"].substring(10));
          values.push(time);
        }
      }
    }


    // A formatter for counts.
    var formatCount = d3.format(",.0f");

    var x = d3.scale.linear()
        .domain([0, 24])
        .range([0, width]);

    // Generate a histogram using twenty uniformly-spaced bins.
    var data = d3.layout.histogram()
        .bins(x.ticks(24))
        (values);

    var y = d3.scale.linear()
        .domain([0, 20000])//d3.max(data, function(d) { return d.y; })])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    // var svg = d3.select("#histogram-canvas").append("svg")
    //     .attr("width", width + margin.left + margin.right)
    //     .attr("height", height + margin.top + margin.bottom)
    //   .append("g")
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0, 0)")
        .call(yAxis);
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
        draw_histogram(null, this.value);
      } else if (id == "#select-timescale") {
        cleanUp();
        draw_histogram(this.value, null);
      }
      // console.log("You selected: " + this.value);
    });
  }

  function getUnique(attribute) { // filtering specific values of a categorical attribute
    var uniques = [];

    for (var i = 0; i < dataset.length; i++) {
      uniques.push(dataset[i][attribute]);
    }
    uniques = uniques.filter(function(elem, pos, self) { // http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
      return self.indexOf(elem) == pos;
    })

    return uniques.sort(); // get unique attribute values (for filters)
  }

  function timeToDecimal(t) {
    var arr = t.split(':');
    return parseFloat(parseInt(arr[0], 10) + '.' + parseInt((arr[1]/6)*10, 10));
  }

  function cleanUp() {
    svg.selectAll(".bar").remove();
    svg.selectAll(".x.axis").remove();
    svg.selectAll(".y.axis").remove();
  }
});