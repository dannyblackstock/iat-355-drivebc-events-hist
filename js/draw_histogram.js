d3.csv("drivebc_events_hist_2012.csv", function (error, dataset) {
  // id,cause,district,state,severity,localupdatetime,advisorymessage,isbidirectional,trafficpattern,head_latitude,head_longitude,tail_latitude,tail_longitude,route,type
  var attributes = Object.keys(dataset[0]); // get column names from first row

  var margin = {top: 10, right: 30, bottom: 30, left: 30},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var svg = d3.select("#histogram-canvas").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  selectField("#select-timescale", ["24 hours"]);
  selectField("#select-category", ["All events", "type", "trafficpattern", "district"]);
  // selectField("#select-category-values", ["All events", getUnique("type"), getUnique("trafficpattern"), getUnique("district")]);
  draw_histogram(null, null);
  
  function draw_histogram(timescale, category) { 
    // http://bl.ocks.org/mbostock/3048450
    var values = []; // values to be put into bins
    // var timeDateFormat = d3.time.format("%x %_H:%M"); // 01/31/2012 0:30
    // var timeFormat = d3.time.format("%_H:%M"); // 0:30
    // var dateFormat = d3.time.format("%x"); // 01/31/2012

    switch (category) {
      case "type":
        // add to times where type is (selectedindropdown)
        for (var i = 0; i < dataset.length; i++) {
          if (dataset[i][""] == d3.select("#select-category-values")) { // datum matches all types in multiselect
            var time = timeToDecimal(dataset[i]["localupdatetime"].substring(10));
            values.push(time);
          }
        }
        break;
      case "trafficpattern":
        // execute code block 2
        break;
      case "district":
        // execute code block 2
        break;
      default: // All events
        for (var i = 0; i < dataset.length; i++) {
          var time = timeToDecimal(dataset[i]["localupdatetime"].substring(10));
          // time = timeFormat.parse(time);
          values.push(time);
        }
    }

    function timeToDecimal(t) {
      var arr = t.split(':');
      return parseFloat(parseInt(arr[0], 10) + '.' + parseInt((arr[1]/6)*10, 10));
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
        .domain([0, d3.max(data, function(d) { return d.y; })])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

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

        draw_histogram(null, this.value);
      } else if (id == "#select-timescale") {
        draw_histogram(this.value, null);
      }
      console.log("You selected: " + this.value);
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
});