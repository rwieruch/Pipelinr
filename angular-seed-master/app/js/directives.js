'use strict';

/* Directives */

angular.module('myApp.directives', ['d3']).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  .directive('pipelinrDashboard', ['d3Service', '$window', 'DataProcessing', '$timeout', function(d3Service, $window, DataProcessing, $timeout) { // Use timeout as callback that everything is rendered
    return {
      restrict: 'EA',
      scope: {
      	pipeline: '=',
      	date: '='
      },
      templateUrl: 'partials/dashboard.html?31',
      link: function(scope, ele, attrs) {
        d3Service.d3().then(function(d3) {
        	console.log("pipelinrDashboard");

        	// Lokal variables
  		    var color_lines = d3.scale.ordinal()
					  .range(["#16a085", "#2980b9", "#27ae60", "#8e44ad", "#f39c12", "#d35400", "#c0392b"]);

		      // Global variables via configuration object
    			var tip = d3.select("body").append("div")
						.attr("class", "tip")
						.style("opacity", 0);

          var string_color = d3.scale.ordinal()
		        .domain(["warning","error"])
		        .range(["#f1c40f", "#e74c3c"]);

					scope.configuration = {
						parseDate: d3.time.format('%d %m %Y, %H:%M:%S:%L').parse,
						height: {scatterplot: 50, linechart: 100, context: 25, legend: 25},
						width: {graph: 760},
						margin: {left: 50, top: 30, bottom: 40, right: 50},
						tip: tip,
						string_color: string_color,
						xs: [],
						xAxes: [],
						main_lines: [],
						main_areas: [],
						brush: {},
						x_context: {},
						xAxis_context: {},
						logFilter: [{ key: "warning", value: true }, { key: "error", value: true }],
						path: {},
						pie: {},
						arc: {}
					};

					scope.$watch('pipeline', function(newVals, oldVals) {
		        if (scope.pipeline) {
			        	// Wait until everything is rendered
	  	          $timeout(function() {
	  	          	// Colorize line graphs
							   	d3.selectAll(".area").attr("fill",function(d,i){return d3.rgb(color_lines(i)).brighter(3);});
		    	    		d3.selectAll(".line").attr("stroke",function(d,i){return color_lines(i);});
		    	    		d3.selectAll(".circle").style("fill", function (d) { return string_color(d.level);});

    	    		    scope.hoverValue = function(value) {
										d3.select("#Id_"+value._id).transition().duration(200).attr("r", "12");
							    }

    	    		    scope.hoverOutValue = function(value) {
										d3.select("#Id_"+value._id).transition().duration(200).attr("r", "5");
							    }

							    scope.clickValue = function(value) {

							    }
	              });
					  		return scope.renderDashboard(newVals);
		        }
					}, true);

					// Initialize scopes for children
					scope.renderDashboard = function(pipeline) {
						console.log("renderDashboard");

						// Init different dataset types followed by initialization of child directives
						scope.intdatasets = DataProcessing.getIntDatasets(pipeline);
						scope.stringdatasets = DataProcessing.getStringDatasets(pipeline);

						// Render context as overview for brushing + linking + zooming + panning
						scope.renderContext();
						scope.renderLegend();

						// Watch for new datum and update scope.intdatasets|stringdatasets
						scope.$watch('date', function(newVals, oldVals) {
			        if(scope.date) {
			        	console.log("Update in dashboard");	
			        	scope.renderDatumUpdate(newVals);
			        }
		      	}, true);
					};

					scope.renderDatumUpdate = function(data) {
	        	var dataset_to_update = window._.find(scope.pipeline.datasets, function(dataset) { return dataset._id == data.value._dataset });
	        	dataset_to_update.values.push(data.value);
		        if(dataset_to_update.type == "string") {

	            // Append new focus circle
	            d3.select(".focus.scatter").select('g').selectAll('circle')
	              .data(dataset_to_update.values)
	              .enter().append("circle")
	              .attr("clip-path", "url(#clip)")
	              .attr('class', 'circle')
	              .style("fill", function (d) { return scope.configuration.string_color(d.level);})
	              .attr("cx", function(d) { return scope.configuration.xs[dataset_to_update._id](scope.configuration.parseDate(d.timestamp)); })
	              .attr("cy", function(d) { return scope.configuration.margin.top; })
	              .attr("r", 5)
    			      .on("mouseover", function(d) {      
						    	scope.configuration.tip.transition().duration(200).style("opacity", .9);      
						    	scope.configuration.tip.html(d.value); 
			    				// Transformation relative to the page body
				        	var matrix = this.getScreenCTM().translate(+this.getAttribute("cx"),+this.getAttribute("cy"));
		            	scope.configuration.tip.style("left", (window.pageXOffset + matrix.e) + "px").style("top", (window.pageYOffset + matrix.f + 30) + "px");
					  		})                  
					  		.on("mouseout", function(d) {       
					    		scope.configuration.tip.transition().duration(500).style("opacity", 0);   
				    		});

	            // Append new context circle
	            d3.select(".context").select('g').selectAll("circle")
	             .data(dataset_to_update.values).enter()
	             .append("circle")
	             .attr('class', 'circle')
	             .style("fill", function (d) { return scope.configuration.string_color(d.level);})
	             .attr("r", 3)
	             .attr("cy", function (d) { return scope.configuration.height.context/2; });

	            // Keep filter
	            for(var i in scope.configuration.logFilter) {
	              if(!scope.configuration.logFilter[i].value)
	                d3.selectAll("g").selectAll("circle")
	                  .filter(function(d) { return d.level === scope.configuration.logFilter[i].key; })
	                  .attr("display", "none");
	            }
	        	}

        		// Update context
        		scope.configuration.x_context.domain(d3.extent(dataset_to_update.values, function(d) { return scope.configuration.parseDate(d.timestamp); }));

		        // Move context circles
		        d3.select(".context").selectAll("circle")
		          .data(scope.stringdatasets[0].values)
		          .attr("cx", function(d) {
		               return scope.configuration.x_context(scope.configuration.parseDate(d.timestamp));
		          })
		          .attr("cy", function(d) {
		               return scope.configuration.height.context/2; 
		          });

        		// Update context axis
        		d3.select(".context").select(".x.axis2").call(scope.configuration.xAxis_context);

        		// Keep brushed, update everything
        		brushed();
					}

					scope.renderContext = function() {
		        var x_context = d3.time.scale().range([0, scope.configuration.width.graph]),
		            y2 = d3.scale.linear().range([scope.configuration.height.context, 0]);

		        var xAxis_context = d3.svg.axis().scale(x_context).orient("bottom").tickSize(-5, 0, 0),
		            yAxis2 = d3.svg.axis().scale(y2).orient("left");

            scope.configuration.xAxis_context = xAxis_context;

		        x_context.domain(d3.extent(scope.stringdatasets[0].values.map(function(d) { return scope.configuration.parseDate(d.timestamp); })));
		        y2.domain(scope.stringdatasets[0].values);

            scope.configuration.x_context = x_context;

		        scope.configuration.brush = d3.svg.brush()
		            .x(x_context)
		            .on("brush", brushed)
                .on("brushstart", brushstart)
						    .on("brushend", brushend);

		        d3.select("#context-container").selectAll("*").remove(); // Clear old elemnts. (for update, otherwise there would be multiple elements)
		       	var context = d3.select("#context-container").append("svg")
		            .attr("class", "context")
  					    .attr("width", scope.configuration.width.graph + scope.configuration.margin.left)
					    	.attr("height", scope.configuration.height.context + scope.configuration.margin.top)
			    			.append("g")
								.attr("transform", "translate(" + scope.configuration.margin.left + ",0)");

		        context.selectAll('circle')
		          .data(scope.stringdatasets[0].values)
		          .enter().append("circle")
		          .attr("clip-path", "url(#clip)")
		          .attr('class', 'circle')
		          .style("fill", function (d) { return scope.configuration.string_color(d.level);})
		          .attr("cx", function (d) { return x_context(scope.configuration.parseDate(d.timestamp)); })
		          .attr("cy", function (d) { return scope.configuration.height.context/2; })
		          .attr("r", function(d){ return 3;});

		        context.append("g")
		            .attr("class", "x axis2")
		            .attr("transform", "translate(0," + scope.configuration.height.context + ")")
		            .call(xAxis_context);

		        context.append("g")
		            .attr("class", "x brush")
		            .call(scope.configuration.brush)
		          .selectAll("rect")
		            .attr("y", -6)
		            .attr("height", scope.configuration.height.context + 7);
          }

					scope.renderLegend = function() {

		        d3.select("#legend-container").selectAll("*").remove(); // Clear old elemnts. (for update, otherwise there would be multiple elements)
		       	var legendContainer = d3.select("#legend-container").append("svg")
		            .attr("class", "legend")
  					    .attr("width", scope.configuration.width.graph + scope.configuration.margin.left)
					    	.attr("height", scope.configuration.height.legend)
			    			.append("g")
								.attr("transform", "translate(" + scope.configuration.margin.left + ",0)");

		        var legend = legendContainer.selectAll(".legend")
		            .data(scope.configuration.string_color.domain())
		          .enter().append("g")
		            .attr("class", "legend")
		            .attr("transform", function(d, i) { return "translate(" + i * 100 + ",0)"; });

		        legend.append("rect")
		            .attr("class", "rect-border")
		            .attr("value", function(d) { return d })
		        	.attr("x", 0)
		            .attr("width", 18)
		            .attr("height", 18)
		            .style("fill", scope.configuration.string_color);

		        legend.append("text")
		            .attr("x", 24)
		            .attr("y", 9)
		            .attr("dy", ".35em")
		            .text(function(d) { return d});    

		        // Filter
		        d3.selectAll(".rect-border").on("click", function() {

		          // Retrieve filter key
		          var level = d3.select(this).attr("value");
		          for(var i in scope.configuration.logFilter) {
		            if(scope.configuration.logFilter[i].key == level) {
		              scope.configuration.logFilter[i].value ? scope.configuration.logFilter[i].value = false: scope.configuration.logFilter[i].value = true; 
		              var display = scope.configuration.logFilter[i].value ? "inline" : "none";
		              var fill = scope.configuration.logFilter[i].value ? string_color(level) : "#FFF";

				          // Filter table
									d3.select(".dashboard-table").selectAll(".selected").each( function(){
										var tableLevel = d3.select(this).select('.table-level').html();
										var timestamp = d3.select(this).select('.table-timestamp').html();
										if(tableLevel === level) {
											if(scope.configuration.logFilter[i].value)
												d3.select(this).style("display", "table-row");
											else
												d3.select(this).style("display", "none");
										}
									});
		            }
		          }

		          // Set rect fill
		          d3.select("[value='" + level + "']").style("fill", fill);

		          // Filter circles
		          d3.selectAll("g").selectAll("circle")
		            .filter(function(d) { return d.level === level; })
		            .attr("display", display);

		        });
					}

	        function change() {
	        	data = [{count: 1}, {count: 5}, {count: 1}];
				    path = path.data(pie(data)); // compute the new angles
				    path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
				  }

				  function computeDonutData(data) {
						var computed_data = [{count: 0}, {count: 0}, {count: 0}];
						for (var i = data.length; --i >= 0;) {
							if(data[i].value >= 65)
								computed_data[0].count++;
						  if(data[i].value < 65 && data[i].value > 35)
						  	computed_data[1].count++;
						  if(data[i].value <= 35)
						  	computed_data[2].count++;
						}
				  	return computed_data;
				  }	

					function arcTween(a) {
					  var i = d3.interpolate(this._current, a);
					  this._current = i(0);
					  return function(t) {
					    return scope.configuration.arc(i(t));
					  };
					}

					function brushstart() {
				    d3.select(".context").classed("selecting", true);
					}

					function brushed() {

					}

					function brushend() {
					  d3.select(".context").classed("selecting", !d3.event.target.empty());

						var extent = scope.configuration.brush.extent();
      			var data = computeDonutData(scope.intdatasets[0].values.filter(function(d) { return extent[0] <= scope.configuration.parseDate(d.timestamp) && scope.configuration.parseDate(d.timestamp) <= extent[1] }) );

      			var path = scope.configuration.path.data(scope.configuration.pie(data));
      			path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
					}

      		function brushed() {
			    	var extent = scope.configuration.brush.extent();
						d3.select(".context").selectAll('circle').classed("selected", function(d) { return extent[0] <= scope.configuration.parseDate(d.timestamp) && scope.configuration.parseDate(d.timestamp) <= extent[1]; });

						// Table update
						d3.select(".dashboard-table").selectAll("tr").each( function(d, i){
							var timestamp = d3.select(this).select('.table-timestamp').html();
							if(extent[0] <= scope.configuration.parseDate(timestamp) && scope.configuration.parseDate(timestamp) <= extent[1]) {
								d3.select(this).classed("selected", true).style("display", "table-row");
							} else {
								d3.select(this).classed("selected", false).style("display", "none");
							}
						});

				    // Scatterplot update
				    scope.configuration.xs[scope.stringdatasets[0]._id].domain(scope.configuration.brush.empty() ? scope.configuration.x_context.domain() : scope.configuration.brush.extent());

				    d3.select(".focus.scatter").selectAll("g").selectAll("circle") // Move circles
				      .data(scope.stringdatasets[0].values)
				      .attr("cx",function(d){ return scope.configuration.xs[scope.stringdatasets[0]._id](scope.configuration.parseDate(d.timestamp));})
				      .attr("cy", function(d){ return scope.configuration.margin.top;});

				    d3.select(".focus.scatter").select(".x.axis").call(scope.configuration.xAxes[scope.stringdatasets[0]._id]); // Move axis

				    // Line charts update
				    for(var i in scope.configuration.main_lines) { // i = dataset._id
				      scope.configuration.xs[i].domain(scope.configuration.brush.empty() ? scope.configuration.x_context.domain() : scope.configuration.brush.extent());
				      d3.select(".focus_"+i).select(".area").attr("d", scope.configuration.main_areas[i]);
				      d3.select(".focus_"+i).select(".line").attr("d", scope.configuration.main_lines[i]);
				      d3.select(".focus_"+i).select(".x.axis").call(scope.configuration.xAxes[i]);
				    }
          }

      	});

      }
    };
  }])
  .directive('pipelinrPointGraph', ['d3Service', '$window', function(d3Service, $window) {
    return {
      restrict: 'EA',
      replace: true,
      link: function(scope, ele, attrs) {
        d3Service.d3().then(function(d3) {
        	console.log("pipelinrPointGraph");
					console.log(scope.dataset);

					if(scope.dataset.values.length < 2) return; // Do not draw for no values

					var x_log = d3.time.scale().range([0, scope.configuration.width.graph]),
		    		y_log = d3.scale.linear().range([scope.configuration.height.scatterplot, 0]);

					// Axis
					var xAxis_log = d3.svg.axis().scale(x_log).orient("bottom").tickSize(-5, 0, 0),
			    	yAxis_log = d3.svg.axis().scale(y_log).orient("left");

					x_log.domain(d3.extent(scope.dataset.values.map(function(d) { return scope.configuration.parseDate(d.timestamp); })));
					y_log.domain([0, d3.max(scope.dataset.values, function(d) { return d.value; })]);

        	scope.configuration.xAxes[scope.dataset._id] = xAxis_log;
	        scope.configuration.xs[scope.dataset._id] = x_log;

					var scatterplot = d3.select(ele[0]).append("svg")
					    .attr("class", "focus scatter")
					    .attr("width", scope.configuration.width.graph + scope.configuration.margin.left)
					    .attr("height", scope.configuration.height.scatterplot + scope.configuration.margin.top)
			    		.append("g")
							.attr("transform", "translate(" + scope.configuration.margin.left + ",0)");

					scatterplot.append("g")
					    .attr("class", "x axis")
					    .attr("transform", "translate(0," + scope.configuration.height.scatterplot + ")")
					    .call(xAxis_log);

					scatterplot.selectAll('circle')
					  .data(scope.dataset.values)
					  .enter().append("circle")
					  .attr("clip-path", "url(#clip)")
					  .attr('class', 'circle')
					  .attr("id", function (d){ return "Id_"+d._id; })
					  .attr("cx", function (d) { return x_log(scope.configuration.parseDate(d.timestamp)); })
					  .attr("cy", function (d) { return scope.configuration.margin.top; })
					  .attr("r", function(d){ return 5;})
			      .on("mouseover", function(d) {      
				    	scope.configuration.tip.transition().duration(200).style("opacity", .9);      
				    	scope.configuration.tip.html(d.value); 
	    				// Transformation relative to the page body
		        	var matrix = this.getScreenCTM().translate(+this.getAttribute("cx"),+this.getAttribute("cy"));
            	scope.configuration.tip.style("left", (window.pageXOffset + matrix.e) + "px").style("top", (window.pageYOffset + matrix.f + 30) + "px");
			  		})                  
			  		.on("mouseout", function(d) {       
			    		scope.configuration.tip.transition().duration(500).style("opacity", 0);   
		    		});

	        scatterplot.append("text")
				    .attr("class", "x label")
				    .attr("text-anchor", "end")
				    .attr("x", 0)
				    .attr("y", - 35)
				    .attr('transform', 'rotate(-90)')
				    .text(scope.dataset.key);
        });
      }
    };
  }])
  .directive('pipelinrLineGraph', ['d3Service', '$window', function(d3Service, $window) {
    return {
      restrict: 'EA',
      replace: true,
      link: function(scope, ele, attrs) {
        d3Service.d3().then(function(d3) {
        	console.log("pipelinrLineGraph");
					console.log(scope.dataset);

					if(scope.dataset.values.length < 2) return; // Do not draw for no values

        	// Create axes
	        var x = d3.time.scale().range([0, scope.configuration.width.graph]),
            y = d3.scale.linear().range([scope.configuration.height.linechart, 0]);

        	var xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(-5, 0, 0),
            yAxis = d3.svg.axis().scale(y).orient("left").ticks(5).tickSize(-scope.configuration.width.graph, 0, 0).tickPadding(5);

        	x.domain(d3.extent(scope.dataset.values.map(function(d) { return scope.configuration.parseDate(d.timestamp); })));
       	 	y.domain([0, d3.max(scope.dataset.values, function(d) { return parseInt(d.value); })]);

	        // Save domains and axes for later
	        scope.configuration.xAxes[scope.dataset._id] = xAxis;
	        scope.configuration.xs[scope.dataset._id] = x;

	        // Create charts
					var main_line = d3.svg.line()
						.interpolate("linear")
						.x(function(d) { return x(scope.configuration.parseDate(d.timestamp)); })
						.y(function(d) { return y(d.value); });

					scope.configuration.main_lines[scope.dataset._id] = main_line;

					var main_area = d3.svg.area()
						.interpolate("linear")
						.x(function(d) { return x(scope.configuration.parseDate(d.timestamp)); })
						.y0(scope.configuration.height.linechart)
						.y1(function(d) { return y(d.value); });

					scope.configuration.main_areas[scope.dataset._id] = main_area;

					var focus = d3.select(ele[0]).append("svg")
					    .attr("class", "focus_"+scope.dataset._id)
					    .attr("width", scope.configuration.width.graph + scope.configuration.margin.left)
					    .attr("height", scope.configuration.height.linechart + scope.configuration.margin.bottom)
			    		.append("g")
							.attr("transform", "translate(" + scope.configuration.margin.left + "," + scope.configuration.margin.top/2 + ")");

					focus.append("defs").append("clipPath")
				    .attr("id", "clip")
				  .append("rect")
				    .attr("width", scope.configuration.width.graph)
				    .attr("height", scope.configuration.height.linechart);

					focus.append("path")
					    .datum(scope.dataset.values)
					    .attr("class", "line")
					    .attr("d", main_line);

	  			focus.append("path")
				    .datum(scope.dataset.values)
				    .attr("class", "area")
				    .attr("d", main_area);

					focus.append("g")
					    .attr("class", "x axis")
					    .attr("transform", "translate(0," + scope.configuration.height.linechart + ")")
					    .call(xAxis);

					focus.append("g")
					    .attr("class", "y axis")
					    .call(yAxis);

	        focus.append("text")
				    .attr("class", "x label")
				    .attr("text-anchor", "end")
				    .attr("x", 0)
				    .attr("y", - 35)
				    .attr('transform', 'rotate(-90)')
				    .text(scope.dataset.key);
    		});
    	}
  	};
  }])
  .directive('pipelinrDonut', ['d3Service', '$window', function(d3Service, $window) {
    return {
      restrict: 'EA',
      link: function(scope, ele, attrs) {
        d3Service.d3().then(function(d3) {
        	console.log("pipelinrDonut");
					console.log(scope.dataset);

					if(scope.dataset.values.length < 2) return; // Do not draw for no values

					var data = computeDonutData(scope.dataset.values);

					var width = 200,
					    height = 120,
					    radius = Math.min(width, height) / 2;

					var donut_color = d3.scale.ordinal()
			        .domain(["high","mid","low"])
					    .range(["#D24D57", "#F5D76E", "#87D37C"]);

					scope.configuration.pie = d3.layout.pie()
					    .value(function(d) { return d.count; })
					    .sort(null);

					scope.configuration.arc = d3.svg.arc()
					    .outerRadius(radius - 0)
					    .innerRadius(radius - 30);

					var svg = d3.select(ele[0]).append("svg")
					    .attr("width", width)
					    .attr("height", height)
					  .append("g")
					    .attr("transform", "translate(" + height / 2 + "," + height / 2 + ")");

					var legend = svg.append("g")
				      .attr("class", "legend")
				      .attr("width", 50)
				      .attr("height", 100)
				      .attr("transform", "translate(" + ((height / 2)+20) + "," + -height / 2 + ")")
				    .selectAll("g")
				      .data(donut_color.domain())
				    .enter().append("g")
				      .attr("transform", function(d, i) { return "translate(0," + i * 30 + ")"; });

	        legend.append("rect")
	            .attr("class", "rect-border")
	            .attr("width", 18)
	            .attr("height", 18)
	            .style("fill", donut_color);

	        legend.append("text")
	            .attr("x", 24)
	            .attr("y", 9)
	            .attr("dy", ".35em")
	            .text(function(d) { return d}); 

			    scope.configuration.path = svg.datum(data).selectAll("path")
			      .data(scope.configuration.pie)
			    .enter().append("path")
			      .attr("fill", function(d, i) { return donut_color(i); })
			      .attr("d", scope.configuration.arc)
			      .each(function(d) { this._current = d; }); // store the initial angles
 
				  function computeDonutData(data) {
						var computed_data = [{count: 0}, {count: 0}, {count: 0}];
						for (var i = data.length; --i >= 0;) {
							if(data[i].value >= 80)
								computed_data[0].count++;
						  else if(data[i].value < 80 && data[i].value > 20)
						  	data[1].count++;
						  else if(data[i].value <= 20)
						  	computed_data[2].count++;
						}
				  	return computed_data;
				  }

				  // Store the displayed angles in _current.
					// Then, interpolate from _current to the new angles.
					// During the transition, _current is updated in-place by d3.interpolate.
					function arcTween(a) {
					  var i = d3.interpolate(this._current, a);
					  this._current = i(0);
					  return function(t) {
					    return arc(i(t));
					  };
					}
    	});
  	}
  }
}]);
