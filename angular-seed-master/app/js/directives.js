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
      templateUrl: 'partials/dashboard.html',
      link: function(scope, ele, attrs) {
        d3Service.d3().then(function(d3) {
        	console.log("pipelinrDashboard");

        	// Lokal variables
  		    var color_lines = d3.scale.ordinal()
					  .range(["#16a085", "#27ae60" , "#2980b9", "#8e44ad", "#f39c12", "#d35400", "#c0392b"]);

			    var color_areas = d3.scale.ordinal()
					  .range(["#1abc9c", "#2ecc71" , "#3498db", "#9b59b6", "#f1c40f", "#e67e22", "#e74c3c"]);

		      // Global variables via configuration object
    			var tip = d3.select("body").append("div")
						.attr("class", "tip")
						.style("opacity", 0);

          var logColor = d3.scale.ordinal()
		        .domain(["warning","error"])
		        .range(["#f1c40f", "#e74c3c"]);

					scope.configuration = {
						parseDate: d3.time.format('%d %m %Y, %H:%M:%S:%L').parse,
						height: {scatterplot: 50, linechart: 100, context: 25, legend: 250},
						width: {graph: 800, legend: 200},
						margin: {left: 50, top: 30, bottom: 40, right: 50},
						tip: tip,
						logColor: logColor,
						xs: [],
						xAxes: [],
						main_lines: [],
						main_areas: [],
						x_log: {},
						xAxis_log: {},
						brush: {},
						x2: {}
					};

					var rendered = false;
					scope.$watch('pipeline', function(newVals, oldVals) {
		        if (scope.pipeline) {
		        	if(!rendered) { // Render only one time
			        	// Wait until everything is rendered
	  	          $timeout(function() {
	  	          	// Colorize line graphs
							   	d3.selectAll(".area").attr("fill",function(d,i){return color_areas(i);});
		    	    		d3.selectAll(".line").attr("stroke",function(d,i){return color_lines(i);});
		    	    		d3.selectAll(".circle").style("fill", function (d) { return logColor(d.level);});
	              });
	              rendered = true;
					  		return scope.renderDashboard(newVals);
					  	}
		        }
					}, true);

					// Initialize scopes for children
					scope.renderDashboard = function(pipeline) {
						console.log("renderDashboard");

						// Init different dataset types followed by initialization of child directives
						scope.intdatasets = DataProcessing.getIntDatasets(pipeline);
						scope.stringdatasets = DataProcessing.getStringDatasets(pipeline);

						// Context as overview for brushing + zooming + panning
						scope.renderContext();

						// Watch for new datum and update scope.intdatasets|stringdatasets
						scope.$watch('date', function(newVals, oldVals) {
			        if(scope.date) {
			        	console.log("Update in dashboard");	
			        	var dataset_to_update = window._.find(scope.pipeline.datasets, function(dataset) { return dataset._id == newVals.value._dataset });
			        	/*var dataset_to_update = null;
			        	if(general_dataset_to_update.type == "int") {
									dataset_to_update = window._.find(scope.intdatasets, function(dataset) { return dataset._id == newVals.value._dataset });
			        	} else if(general_dataset_to_update.type == "string") {
									dataset_to_update = window._.find(scope.stringdatasets, function(dataset) { return dataset._id == newVals.value._dataset });
			        	}*/
			        	dataset_to_update.values.push(newVals.value);
			        	console.log(scope.pipeline);

			        	//scope.renderDatumUpdate();
			        }
		      	}, true);
					};

					//scope.renderDatumUpdate = function()

					scope.renderContext = function(stringdataset) {
		        var x2 = d3.time.scale().range([0, scope.configuration.width.graph]),
		            y2 = d3.scale.linear().range([scope.configuration.height.context, 0]);

		        var xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
		            yAxis2 = d3.svg.axis().scale(y2).orient("left");

		        x2.domain(d3.extent(scope.stringdatasets[0].values.map(function(d) { return scope.configuration.parseDate(d.timestamp); })));
		        y2.domain(scope.stringdatasets[0].values);

            scope.configuration.x2 = x2;

		        scope.configuration.brush = d3.svg.brush()
		            .x(x2)
		            .on("brush", brushed);

		       	//var context = d3.select(ele[0]).append("svg")
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
		          .style("fill", function (d) { return scope.configuration.logColor(d.level);})
		          .attr("cx", function (d) { return x2(scope.configuration.parseDate(d.timestamp)); })
		          .attr("cy", function (d) { return scope.configuration.height.context/2; })
		          .attr("r", function(d){ return 3;});

		        context.append("g")
		            .attr("class", "x axis2")
		            .attr("transform", "translate(0," + scope.configuration.height.context + ")")
		            .call(xAxis2);

		        context.append("g")
		            .attr("class", "x brush")
		            .call(scope.configuration.brush)
		          .selectAll("rect")
		            .attr("y", -6)
		            .attr("height", scope.configuration.height.context + 7);
          }

      		function brushed() {
				    // Scatterplot update
				    scope.configuration.x_log.domain(scope.configuration.brush.empty() ? scope.configuration.x2.domain() : scope.configuration.brush.extent());

				    // Move circles
				    d3.select(".focus.scatter").selectAll("circle")
				      .data(scope.stringdatasets[0].values)
				      .attr("cx",function(d){ return scope.configuration.x_log(scope.configuration.parseDate(d.timestamp));})
				      .attr("cy", function(d){ return scope.configuration.margin.top;});

				    // Move axis
				    d3.select(".focus.scatter").select(".x.axis").call(scope.configuration.xAxis_log);

				    // Line charts update
				    for(var i in scope.configuration.main_lines) { // i = dataset._id
				      scope.configuration.xs[i].domain(scope.configuration.brush.empty() ? scope.configuration.x2.domain() : scope.configuration.brush.extent());
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

					var x_log = d3.time.scale().range([0, scope.configuration.width.graph]),
		    		y_log = d3.scale.linear().range([scope.configuration.height.scatterplot, 0]);

	    		scope.configuration.x_log = x_log;

					// Axis
					var xAxis_log = d3.svg.axis().scale(x_log).orient("bottom"),
			    	yAxis_log = d3.svg.axis().scale(y_log).orient("left");

		    	scope.configuration.xAxis_log = xAxis_log;

					x_log.domain(d3.extent(scope.dataset.values.map(function(d) { return scope.configuration.parseDate(d.timestamp); })));
					y_log.domain([0, d3.max(scope.dataset.values, function(d) { return d.value; })]);

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

					// Watch for updated dataset in parent directive
					/*var rendered = false;
					scope.$watch('dataset', function(newVals, oldVals) {
		        if (scope.dataset) {
		        	if(rendered) { // Register update after render
		        		console.log("Update in pipelinrPointGraph");

		            // Append new focus circle
		            d3.select(".focus.scatter").selectAll('circle')
		              .data(scope.dataset.values)
		              .enter().append("circle")
		              //.attr("clip-path", "url(#clip)")
		              .attr('class', 'circle')
		              .style("fill", function (d) { return scope.configuration.logColor(d.level);})
		              .attr("cx", function(d) { return x_log(scope.configuration.parseDate(d.timestamp)); })
		              .attr("cy", function(d) { return scope.configuration.margin.top; })
		              .attr("r", 5)
		              .on("mouseover", scope.configuration.tip.show)
		              .on("mouseout", scope.configuration.tip.hide);

        		    // Move circles
						    d3.select(".focus.scatter").selectAll("circle")
						      .data(scope.dataset.values)
						      .attr("cx",function(d){ return x_log(scope.configuration.parseDate(d.timestamp));})
						      .attr("cy", function(d){ return scope.configuration.margin.top;});

						    // Update axis
						    x_log.domain(d3.extent(scope.dataset.values.map(function(d) { return scope.configuration.parseDate(d.timestamp); })));
						    d3.select(".focus.scatter").select(".x.axis").call(xAxis_log);

					  		//return scope.renderDashboard(newVals);
					  	}
					  	rendered = true;
				  	}
					}, true);*/

        });
      }
    };
  }])
  .directive('pipelinrLineGraph', ['d3Service', '$window', function(d3Service, $window) {
    return {
      restrict: 'EA',
      replace: true,
      /*scope: {
      	dataset: '=',
      	configuration: '='
      },*/
      link: function(scope, ele, attrs) {
        d3Service.d3().then(function(d3) {
        	console.log("pipelinrLineGraph");
					console.log(scope.dataset);

        	// Create axes
	        var x = d3.time.scale().range([0, scope.configuration.width.graph]),
            y = d3.scale.linear().range([scope.configuration.height.linechart, 0]);

        	var xAxis = d3.svg.axis().scale(x).orient("bottom"),
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

					// Watch for updated dataset in parent directive
					/*var rendered = false;
					scope.$watch('dataset', function(newVals, oldVals) {
		        if (scope.dataset) {
		        	if(rendered) { // Register update after render
		        		console.log("Update in pipelinrLineGraph");

		        		// Update graph
      		      d3.select(".focus_"+scope.dataset._id).select(".area").attr("d", main_area);
		      			d3.select(".focus_"+scope.dataset._id).select(".line").attr("d", main_line);

		      			// Update axis
								x.domain(d3.extent(scope.dataset.values.map(function(d) { return scope.configuration.parseDate(d.timestamp); })));
								d3.select(".focus_"+scope.dataset._id).select(".x.axis").call(xAxis);
					  	}
					  	rendered = true;
				  	}
					}, true);*/

    		});
    	}
  	};
  }])
  .directive('d3Timeline', ['d3Service', '$window', function(d3Service, $window) {
    return {
      restrict: 'EA',
      scope: {
      	date: '=',
        data: '=',
        newdata: '='
      },
      link: function(scope, ele, attrs) {
        d3Service.d3().then(function(d3) {

        var logColor = d3.scale.ordinal()
	        .domain(["warning","error"])
	        .range(["#f1c40f", "#e74c3c"]);

	    var xAxes = [];
	    var yAxes = [];
	    var xs = [];
	    var ys = [];
	    var main_lines = [];
	    var main_areas = [];

	    var context;
	    var scatterplot;
	    var xAxis2, yAxis2;

        var height = {scatterplot: 50, linechart: 100, context: 25, legend: 250},
        	width = {graph: 800, legend: 200},
        	margin = {left: 50, top: 30, bottom: 40, right: 50};

	    // TODO: change this to global settings object
	    var settings = {};
	    settings.logFilter = new Array();
	    settings.logFilter.push({ key: "warning", value: true }, { key: "error", value: true });

	    //var color = d3.scale.category20();
	    var color_lines = d3.scale.ordinal()
			  .domain([0, 1, 2, 3, 4, 5, 6, 7])
			  .range(["#16a085", "#27ae60" , "#2980b9", "#8e44ad", "#f39c12", "#d35400", "#c0392b"]);

	    var color_areas = d3.scale.ordinal()
			  .domain([0, 1, 2, 3, 4, 5, 6, 7])
			  .range(["#1abc9c", "#2ecc71" , "#3498db", "#9b59b6", "#f1c40f", "#e67e22", "#e74c3c"]);

        //var legendWidth = 200; // Additional legend width

        var parseDate = d3.time.format('%d %m %Y, %H:%M:%S:%L').parse;

       	var svg;

        var x_log, y_log, xAxis_log, yAxis_log;
        var brush;

        var x2, y2;

        var tip;

        var transitionDuration = 1000;

        var allData;
    	var string_dataset;

    	var int_datasets = []; // TODO: Use this later to hold datasets
    	var string_datasets = []; // TODO: Use this later to hold datasets

        var rendered = false;

        // Initialize update
		scope.$watch('data', function(newVals, oldVals) {
	        if (scope.data) {
				if(!rendered) { // Render only one time
				  	if(!angular.isUndefined(newVals)) {
				  		rendered = true;
				  		return scope.render(newVals);
				  	}
				}
	        }
		}, true);

		// Single date update
		scope.$watch('date', function(newVals, oldVals) {
	        if (scope.date) {
				if(rendered)
					return scope.renderUpdate(newVals);
			}
		}, true);

		// New request update
		scope.$watch('newdata', function(newVals, oldVals) {
	        if (scope.newdata) {
				if(rendered)
					return scope.renderNew(newVals);
			}
		}, true);

		// Render for new request
		scope.renderNew = function(newdata) {
			allData = newdata;

		    // Get log data from datasets
		    for(var i in allData.datasets) {
		      if(allData.datasets[i].type == "string") {
		        string_dataset = allData.datasets[i];
		        allData.datasets.splice(i,1);
		      }
		  	}

        // Update scatterplot and context 
        x2.domain(d3.extent(string_dataset.values, function(d) { return parseDate(d.timestamp); }));
        x_log.domain(brush.empty() ? x2.domain() : brush.extent());

			updateScatterplotCircles(string_dataset);
            updateContextCircles(string_dataset);

	        svg.select(".x.axis2").transition().duration(transitionDuration).call(xAxis2);
		    d3.select(".focus").select(".x.axis").transition().duration(transitionDuration).call(xAxis_log);

            // Keep filter
            for(var i in settings.logFilter) {
              if(!settings.logFilter[i].value)
                svg.selectAll("circle")
                  .filter(function(d) { return d.level === settings.logFilter[i].key; })
                  .attr("display", "none");
            }

		    // Line charts update

		    for(var i in main_lines) {
		      // New data
		      xs[i].domain(brush.empty() ? x2.domain() : brush.extent());
		      d3.select(".focus_"+i).select(".area").transition().duration(transitionDuration).attr("d", main_areas[i]);
		      d3.select(".focus_"+i).select(".line").transition().duration(transitionDuration).attr("d", main_lines[i]);
		      d3.select(".focus_"+i).select(".x.axis").transition().duration(transitionDuration).call(xAxes[i]);
		    }

		    rearrangeGraphs();
		}

		function updateScatterplotCircles(string_dataset) {
            // Select context circles and rebind data
            var circle = scatterplot.selectAll("circle")
             .data(string_dataset.values); 

         	// Enter new circles
            circle.enter().append("circle") 
             .attr('class', 'circle')
             .attr("clip-path", "url(#clip)")
             .attr('class', 'circle')
             .attr("r", 5)
             .on("mouseover", tip.show)
             .on("mouseout",tip.hide)

 	        // Remove dispensable circles
            circle.exit().remove(); 

   	        // Move new circles and set new data
	        circle.transition().duration(transitionDuration)
		      .attr("cx",function(d){ return x_log(parseDate(d.timestamp));})
		      .attr("cy", function(d){ return margin.top;})
              .style("fill", function (d) { return logColor(d.level);});
		}

		function updateContextCircles(string_dataset) {
            // Select context circles and rebind data
            var circle = context.selectAll("circle")
              .data(string_dataset.values);

            // Enter new circles
            circle.enter().append("circle") 
             .attr('class', 'circle')
             .attr("r", 3);

   	        // Remove dispensable circles
            circle.exit().remove(); 

  	        // Move new circles and set new data
	        circle.transition().duration(transitionDuration)
	          .attr("cx", function(d) {
	               return x2(parseDate(d.timestamp));
	          })
	          .attr("cy", function(d) {
	               return height.context/2; 
	          })
              .style("fill", function (d) { return logColor(d.level);});
		}

		// Update for single date object
		scope.renderUpdate = function(date) {
	        console.log(date);
	        var current_dataset = null;
	        if(date.type == "string") {

	            // Push new value in dataset
                current_dataset = string_dataset;
	            current_dataset.values.push({ timestamp: date.timestamp, value: date.value, level: date.level});    

	            // Append new focus circle
	            d3.select(".focus.scatter").selectAll('circle')
	              .data(current_dataset.values)
	              .enter().append("circle")
	              .attr("clip-path", "url(#clip)")
	              .attr('class', 'circle')
	              .style("fill", function (d) { return logColor(d.level);})
	              .attr("cx", function(d) { return x_log(parseDate(d.timestamp)); })
	              .attr("cy", function(d) { return margin.top; })
	              .attr("r", 5)
	              .on("mouseover", tip.show)
	              .on("mouseout",tip.hide);

	            // Append new context circle
	            context.selectAll("circle")
	             .data(current_dataset.values).enter()
	             .append("circle")
	             .attr('class', 'circle')
	             .style("fill", function (d) { return logColor(d.level);})
	             .attr("r", 3)
	             .attr("cy", function (d) { return height.context/2; });

	            // Keep filter
	            for(var i in settings.logFilter) {
	              if(!settings.logFilter[i].value)
	                svg.selectAll("circle")
	                  .filter(function(d) { return d.level === settings.logFilter[i].key; })
	                  .attr("display", "none");
	            }
	        } else {
	          // Find according dataset
	          console.log(date.key);

	          for(var i in allData.datasets) {
	            if(allData.datasets[i].key == date.key) {
	              // Push new value in dataset
	              allData.datasets[i].values.push({ timestamp: date.timestamp, value: date.value});
	              current_dataset = allData.datasets[i];
	            }
	          }
	        } 
	        // Update context
	        x2.domain(d3.extent(current_dataset.values, function(d) { return parseDate(d.timestamp); }));

	        // Move context circles
	        context.selectAll("circle")
	          .data(string_dataset.values)
	          .attr("cx", function(d) {
	               return x2(parseDate(d.timestamp));
	          })
	          .attr("cy", function(d) {
	               return height.context/2; 
	          });

	        // Update context axis
	        svg.select(".x.axis2").call(xAxis2);

	        // Keep brushed, update everything
	        brushed();
		}

		// Initial render
        scope.render = function(data) {
	      if (!data) return;

	      allData = data;
	   	  console.log(allData.datasets);

		  // Get log data from datasets
		  for(var i in allData.datasets) {
		    if(allData.datasets[i].type == "string") {
		      string_dataset = allData.datasets[i];
		      //delete allData.datasets[i];
		      //allData.datasets.length--;
		      allData.datasets.splice(i,1);
		    }
		  }

		  createSVGContainer(allData.datasets);
  		  createLogScatterplot(string_dataset);
  	      for(var i in allData.datasets) {
		    createLineChart(allData.datasets[i], i, string_dataset);
	      }
  	      // Give every area a different color
	    d3.selectAll(".area").attr("fill",function(d,i){return color_areas(i);});
	    	    d3.selectAll(".line").attr("stroke",function(d,i){return color_lines(i);});
		  
		  createContext(allData.datasets, string_dataset);
		  createSettingContainer();

		  function createSVGContainer(datasets) {
		  	// Tooltip for later use
			tip = d3.select("body").append("div")
				.attr("class", "tip")
				.style("opacity", 0);

			// Draw boundary box for everything
			svg = d3.select(ele[0]).append("svg")
					    .attr("transform", "translate(" + margin.left + "," + 0 + ")")
            	.attr("width", width.graph + margin.right)
            	.attr("height", height.scatterplot + (height.linechart * datasets.length + margin.top * datasets.length) + height.context + margin.top + margin.bottom);

	        // Clip on edges
	        svg.append("defs").append("clipPath")
	            .attr("id", "clip")
	          .append("rect")
	            .attr("width", width.graph)
	            .attr("height", height.scatterplot + (height.linechart * datasets.length + margin.top * datasets.length) + height.context + margin.top);
		  }

  		  function createLogScatterplot(string_dataset) {
  		  	console.log(string_dataset);

			x_log = d3.time.scale().range([0, width.graph]),
		    	y_log = d3.scale.linear().range([height.scatterplot, 0]);

			// Axis
			xAxis_log = d3.svg.axis().scale(x_log).orient("bottom"),
			    yAxis_log = d3.svg.axis().scale(y_log).orient("left");

			x_log.domain(d3.extent(string_dataset.values.map(function(d) { return parseDate(d.timestamp); })));
			y_log.domain([0, d3.max(string_dataset.values, function(d) { return d.value; })]);

			scatterplot = svg.append("g")
			    .attr("class", "focus scatter")
			    .attr("transform", "translate(" + margin.left + "," + 0 + ")");

			scatterplot.append("g")
			    .attr("class", "x axis")
			    .attr("transform", "translate(0," + height.scatterplot + ")")
			    .call(xAxis_log);

			scatterplot.selectAll('circle')
			  .data(string_dataset.values)
			  .enter().append("circle")
			  .attr("clip-path", "url(#clip)")
			  .attr('class', 'circle')
			  .style("fill", function (d) { return logColor(d.level);})
			  .attr("cx", function (d) { return x_log(parseDate(d.timestamp)); })
			  .attr("cy", function (d) { return margin.top; })
			  .attr("r", function(d){ return 5;})
		      .on("mouseover", function(d) {      
			    tip.transition().duration(200).style("opacity", .9);      
			    tip.html(d.value); 

	    		// Transformation relative to the page body
		        var matrix = this.getScreenCTM().translate(+this.getAttribute("cx"),+this.getAttribute("cy"));
	            tip.style("left", (window.pageXOffset + matrix.e) + "px").style("top", (window.pageYOffset + matrix.f + 30) + "px");
			  })                  
			  .on("mouseout", function(d) {       
			    tip.transition().duration(500).style("opacity", 0);   
		    });

        scatterplot.append("text")
			    .attr("class", "label")
			    .attr("x", 0)
			    .attr("y", 15)
			    .text(string_dataset.key);
		  }

          function createLineChart(dataset, i, string_dataset) {
          	// Create axes
	        var x = d3.time.scale().range([0, width.graph]),
	            y = d3.scale.linear().range([height.linechart, 0]);

	        var xAxis = d3.svg.axis().scale(x).orient("bottom"),
	            yAxis = d3.svg.axis().scale(y).orient("left").ticks(5).tickSize(-width.graph, 0, 0).tickPadding(5);

	            console.log(dataset.values);

	        //x.domain(d3.extent(data.datasets[0].values.map(function(d) { return parseDate(d.timestamp); })));
	        x.domain(d3.extent(dataset.values.map(function(d) { return parseDate(d.timestamp); })));
	        y.domain([0, d3.max(dataset.values, function(d) { return parseInt(d.value); })]);

	        // Save domains and axes for later
	        //xAxes.push(xAxis);
	        //yAxes.push(yAxis);
	        //xs.push(x);
	        //ys.push(y);

	        xAxes[dataset.key] = xAxis;
	        yAxes[dataset.key] = yAxis;
	        xs[dataset.key] = x;
	        ys[dataset.key] = y;

	        // Create charts
			var main_line = d3.svg.line()
				.interpolate("linear")
				.x(function(d) { return x(parseDate(d.timestamp)); })
				.y(function(d) { return y(d.value); });

			main_lines[dataset.key] = main_line;

			var main_area = d3.svg.area()
				.interpolate("linear")
				.x(function(d) { return x(parseDate(d.timestamp)); })
				.y0(height.linechart)
				.y1(function(d) { return y(d.value); });

				main_areas[dataset.key] = main_area;

			var focus = svg.append("g")
			    .attr("class", "focus_" + dataset.key)
			    .attr("transform", "translate(" + margin.left + "," + (margin.top + height.scatterplot + (height.linechart * i + margin.top * i)) + ")");

			focus.append("path")
			    .datum(dataset.values)
			    .attr("class", "line")
			    .attr("d", main_line);

  			focus.append("path")
			    .datum(dataset.values)
			    .attr("class", "area")
			    .attr("d", main_area);

			focus.append("g")
			    .attr("class", "x axis")
			    .attr("transform", "translate(0," + height.linechart + ")")
			    .call(xAxis);

			focus.append("g")
			    //.attr("class", "y axis")
			    .attr("class", "y "+i+ " axis")
			    .call(yAxis);

        focus.append("text")
			    .attr("class", "x label")
			    .attr("text-anchor", "end")
			    .attr("x", 0)
			    .attr("y", - 35)
			    .attr('transform', 'rotate(-90)')
			    .text(dataset.key);
			  }

	      function createContext(datasets, string_dataset) {

	        x2 = d3.time.scale().range([0, width.graph]),
	            y2 = d3.scale.linear().range([height.context, 0]);

	        xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
	            yAxis2 = d3.svg.axis().scale(ys[xs.length-1]).orient("left");

	        x2.domain(xs[datasets[0].key].domain());
	        y2.domain(ys[datasets[0].key].domain());

	        brush = d3.svg.brush()
	            .x(x2)
	            .on("brush", brushed);

	        // Context line
	        var context_line = d3.svg.line()
	            .interpolate("linear")
	            .x(function(d) { return x2(parseDate(d.timestamp)); })
	            .y(function(d) { return y2(d.value); });

	        context = svg.append("g")
	            .attr("class", "context")
	            .attr("transform", "translate(" + margin.left + "," + (margin.top + height.scatterplot + (height.linechart * datasets.length + margin.top * datasets.length)) + ")");

	        context.selectAll('circle')
	          .data(string_dataset.values)
	          .enter().append("circle")
	          .attr("clip-path", "url(#clip)")
	          .attr('class', 'circle')
	          .style("fill", function (d) { return logColor(d.level);})
	          .attr("cx", function (d) { return x2(parseDate(d.timestamp)); })
	          .attr("cy", function (d) { return height.context/2; })
	          .attr("r", function(d){ return 3;});

	        context.append("g")
	            .attr("class", "x axis2")
	            .attr("transform", "translate(0," + height.context + ")")
	            .call(xAxis2);

	        context.append("g")
	            .attr("class", "x brush")
	            .call(brush)
	          .selectAll("rect")
	            .attr("y", -6)
	            .attr("height", height.context + 7);
	      }
	  	}

	  	function createSettingContainer() {
	        // Setting container
	  		var settingSvg = d3.select("#setting-container").append("svg")
	            .attr("width", width.legend)
	            .attr("height", height.legend);

	        // Draw legend
	       	var legendContainer = settingSvg.append("g").attr("class", "legend_container");

	        var legend = legendContainer.selectAll(".legend")
	            .data(logColor.domain())
	          .enter().append("g")
	            .attr("class", "legend")
	            .attr("transform", function(d, i) { return "translate(0," + i * 25 + ")"; });

	        legend.append("rect")
	            .attr("class", "filter_button")
	            .attr("value", function(d) { return d })
	        	.attr("x", 0)
	            .attr("width", 18)
	            .attr("height", 18)
	            .style("fill", logColor);

	        legend.append("text")
	            .attr("x", 24)
	            .attr("y", 9)
	            .attr("dy", ".35em")
	            //.style("text-anchor", "end")
	            .text(function(d) { return d})      

	        // Filter
	        d3.selectAll(".filter_button").on("click", function() {

	          // Retrieve filter key
	          var level = d3.select(this).attr("value");
	          for(var i in settings.logFilter) {
	            if(settings.logFilter[i].key == level) {
	              settings.logFilter[i].value ? settings.logFilter[i].value = false: settings.logFilter[i].value = true; 
	              var display = settings.logFilter[i].value ? "inline" : "none";
	              var fill = settings.logFilter[i].value ? logColor(level) : "#FFF";
	            }
	          }

	          // Set rect fill
	          d3.select("[value='" + level + "']").style("fill", fill);

	          // Filter circles
	          svg.selectAll("circle")
	            .filter(function(d) { return d.level === level; })
	            .attr("display", display);
	        });
	  	}

	  	// Helper functions

		function brushed() {
		    // Scatterplot update
		    x_log.domain(brush.empty() ? x2.domain() : brush.extent());

		    // Move circles
		    d3.select(".focus.scatter").selectAll("circle")
		      .data(string_dataset.values)
		      .attr("cx",function(d){ return x_log(parseDate(d.timestamp));})
		      .attr("cy", function(d){ return margin.top;});

		    d3.select(".focus").select(".x.axis").call(xAxis_log);

		    // Line charts update
		    for(var i in main_lines) {
		      xs[i].domain(brush.empty() ? x2.domain() : brush.extent());
		      d3.select(".focus_"+i).select(".area").attr("d", main_areas[i]);
		      d3.select(".focus_"+i).select(".line").attr("d", main_lines[i]);
		      d3.select(".focus_"+i).select(".x.axis").call(xAxes[i]);
		    }
		}

		function rearrangeGraphs(){
	        // Translate and visibility attributes for line graphs
		    var move = 0;
		    for(var i in main_lines) {
	  		  for(var j in allData.datasets) {
			   	if(allData.datasets[j].key == i) {
			   		if(allData.datasets[j].values.length == 0) {
				      d3.select(".focus_"+i).transition().duration(transitionDuration).style("opacity", 0).transition().duration(transitionDuration);
			  		}
			  		else {
		  			  d3.select(".focus_"+i).transition().duration(transitionDuration).style("opacity", 1).attr("transform", "translate(" + margin.left + "," + (margin.top + height.scatterplot + (height.linechart * move + margin.top * move)) + ")");
		  			  move++;
			  		}
			   	}
			  }
		    }

		    // Translate context
		    var translateBack = 0;
		    for(var j in allData.datasets) {
	   		  if(allData.datasets[j].values.length == 0) {
	   				translateBack++;
	   		  }
		    }
		    d3.select(".context").transition().duration(transitionDuration).attr("transform", "translate(" + margin.left + "," + (margin.top + height.scatterplot + (height.linechart * (allData.datasets.length-translateBack) + margin.top * (allData.datasets.length-translateBack))) + ")");
		}

    });
  }};
}]);
