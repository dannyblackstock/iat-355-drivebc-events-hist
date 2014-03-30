var width = document.getElementById('map-canvas').offsetWidth,
	height = document.getElementById('map-canvas').offsetHeight;

// var projection = d3.geo.mercator()
// 	.scale((width+1)/2/Math.PI)
// 	.translate([width/2, height/2])
// 	.precision(.1)
// ;

// var path = d3.geo.path()
// 	.projection(projection)
// ;

var div = d3.select("#map-canvas").append("svg")
	.attr("width", width)
	.attr("height", height);

var mapOptions = {
      zoom: 5,
      center: new google.maps.LatLng(55.1552967,-126.5117003),
      // mapTypeId: google.maps.MapTypeId.TERRAIN,
      minZoom: 2
    };

var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

var svg, overlay;

d3.json("bc_districts_min.min.geojson", function(error, json) {
    var regions = json.features;

	// console.log(regions);
	
	// svg.append("g")
	// 	.attr("class", "tracts")
	// 	.selectAll("path")
	// 		.data(json.features)
	// 	.enter().append("path")
	// 		.attr("d", path)
	// 		.attr("fill-opacity", 0.5)
	// 		.attr("fill", "#85C3C0")
	// 		.attr("stroke", "#222")
	// ;
 
    overlay = new google.maps.OverlayView();
    overlay.onAdd = function() {
        // create an SVG over top of it. 
        svg = d3.select(overlay.getPanes().overlayLayer)
            .append('div')
                .attr('id','d3map')
                .style('width', width + 'px')
                .style('height', height + 'px')
            .append('svg')
                .attr('width', width)
                .attr('height', height);
            
        svg.append('g')
            .attr('id','regions')
            .selectAll('path')
                .data(regions)
              .enter().append('path')
                .attr('class','region');
        
        overlay.draw = redraw;
        google.maps.event.addListener(map, 'bounds_changed', redraw);
        google.maps.event.addListener(map, 'center_changed', redraw);
    };
    overlay.setMap(map);

	 
	function redraw() {
	    
	    var bounds = map.getBounds(),
	        ne = bounds.getNorthEast(),
	        sw = bounds.getSouthWest(),
	        projection = d3.geo.mercator()
	            .rotate([-bounds.getCenter().lng(),0])
	            .translate([0,0])
	            .center([0,0])
	            .scale(1),
	        path = d3.geo.path()
	            .projection(projection);
	            
	    var p1 = projection([ne.lng(),ne.lat()]),
	        p2 = projection([sw.lng(),sw.lat()]);
	    
	    svg.select('#regions').attr('transform', 
	        'scale(' + 
	        	width / (p1[0] - p2[0]) + ',' +
	        	height/ (p2[1] - p1[1]) + ')' +
	        'translate(' +
	        	(-p2[0]) + ',' +
	        	(-p1[1]) + ')'
	    );

	    svg.selectAll('path').attr('d', path);
	}


	// var nodeList = document.getElementsByClassName('.region'),
 //    	paths = [].slice.call(nodeList);
 //    for (var i = paths.length - 1; i >= 0; i--) {
 //   		paths[i].attr("d", function(j, val) { return val + " Z"; });
 //   	};	

});

// d3.select(self.frameElement).style("height", height + "px");