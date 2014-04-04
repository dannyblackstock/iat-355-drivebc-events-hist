function selectField (id, options) {
  var select = d3.select(id);

  select.selectAll("option")
      .data(options)
    .enter().append("option")
      .text(String);

  // default option -- always first element 
  // http://stackoverflow.com/questions/13097923/how-can-i-use-d3-or-just-javascript-to-set-a-form-option-as-being-selected
  select.selectAll("option")
      .each(function(d) {
        if (d == options[0]) {
          return d3.select(this).attr("selected", "selected");
        }
      });

  // determines field to update the histogram
  select.on("change", function() {
    if (id == "#select-category") {
      // TODO: call function to update the graph
    } else {
      // TODO: call function to update the graph
    }
    console.log("You selected: " + this.value);
  });
}