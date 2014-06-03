'use strict';

/* Directives */

angular.module('myApp.directives', ['d3']).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
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
	        .domain(["","warning","error"])
	        .range(["#FFF", "#FFFF00", "#FF0000"]);

	    var xAxes = new Array();
	    var yAxes = new Array();
	    var xs = new Array();
	    var ys = new Array();
	    var main_lines = new Array();

	    var context;
	    var scatterplot;
	    var xAxis2, yAxis2;

        var height = {scatterplot: 50, linechart: 180, context: 25, legend: 250},
        	width = {graph: 800, legend: 200},
        	margin = {left: 40, top: 30, bottom: 40};

	    // TODO: change this to global settings object
	    var settings = {};
	    settings.logFilter = new Array();
	    settings.logFilter.push({ key: "warning", value: true }, { key: "error", value: true });

	    var color = d3.scale.category20();

        //var legendWidth = 200; // Additional legend width

        var parseDate = d3.time.format('%d %m %Y, %H:%M:%S').parse;

       	var svg;

        var x_log, y_log, xAxis_log, yAxis_log;
        var brush;

        var x2, y2;

        var tip;

        var transitionDuration = 1000;

        var allData;
    	var string_dataset;

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
		/*scope.$watch('date', function(newVals, oldVals) {
	        if (scope.date) {
				if(rendered)
					return scope.renderUpdate(newVals);
			}
		}, true);*/

		// New request update
		scope.$watch('newdata', function(newVals, oldVals) {
	        if (scope.newdata) {
				if(rendered)
					return scope.renderNew(newVals);
			}
		}, true);

		scope.renderNew = function(newdata) {
			allData = newdata;

		    // Get log data from datasets
		    for(var i in allData.datasets) {
		      if(allData.datasets[i].type == "string") {
		        string_dataset = allData.datasets[i];
		        delete allData.datasets[i];
		        allData.datasets.length--;
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
		      xs[i].domain(brush.empty() ? x2.domain() : brush.extent());
		      d3.select(".focus"+i).select(".area").transition().duration(transitionDuration).attr("d", main_lines[i]);
		      d3.select(".focus"+i).select(".x.axis").transition().duration(transitionDuration).call(xAxes[i]);
		    }
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

		scope.renderUpdate = function(date) {
	        console.log(date);
	        if(date.type == "string") {

			    // Get log data from datasets
			    for(var i in allData.datasets) {
			      if(allData.datasets[i].type == "string") {
			         var current_dataset = allData.datasets[i];
			        //delete data.datasets[i];
			        //data.datasets.length--;
			      }
			    }

	            // Push new value in dataset
	            current_dataset.values.push({ timestamp: date.timestamp, value: date.value, level: date.level});    
	            //var current_dataset = string_dataset;

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
	             .attr("cy", function (d) { return height2/2; });

	            // Keep filter
	            for(var i in settings.logFilter) {
	              if(!settings.logFilter[i].value)
	                svg.selectAll("circle")
	                  .filter(function(d) { return d.level === settings.logFilter[i].key; })
	                  .attr("display", "none");
	            }
	        } else {
	          // Find according dataset
	          for(var i in allData.datasets) {
	            if(allData.datasets[i].key == date.key) {
	              // Push new value in dataset
	              allData.datasets[i].values.push({ timestamp: date.timestamp, value: date.value});
	              var current_dataset = allData.datasets[i];
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
	               return height2/2; 
	          });

	        // Update context axis
	        svg.select(".x.axis2").call(xAxis2);

	        // Keep brushed, update everything
	        brushed();
		}

        scope.render = function(data) {
	      if (!data) return;

	      allData = data;
	   	  console.log(allData.datasets);

		  // Get log data from datasets
		  for(var i in allData.datasets) {
		    if(allData.datasets[i].type == "string") {
		      string_dataset = allData.datasets[i];
		      delete allData.datasets[i];
		      allData.datasets.length--;
		    }
		  }

		  createSVGContainer(allData.datasets);
  		  createLogScatterplot(string_dataset);
  	      for(var i in allData.datasets) {
		    createLineChart(allData.datasets[i], i, string_dataset);
	      }
  	      // Give every area a different color
	      d3.selectAll(".area").attr("fill",function(d,i){return color(i);});
		  createContext(allData.datasets, string_dataset);
		  createSettingContainer();

		  function createSVGContainer(datasets) {
		  	// Tooltip for later use
			tip = d3.select("body").append("div")
				.attr("class", "tip")
				.style("opacity", 0);

			// Draw boundary box for everything
			svg = d3.select(ele[0]).append("svg")
            	.attr("width", width.graph)
            	.attr("height", height.scatterplot + (height.linechart * datasets.length + margin.top * datasets.length) + height.context + margin.top + margin.bottom);

	        // Clip on edges
	        svg.append("defs").append("clipPath")
	            .attr("id", "clip")
	          .append("rect")
	            .attr("width", width.graph)
	            .attr("height", height.scatterplot + (height.linechart * datasets.length + margin.top * datasets.length) + height.context + margin.top);
		  }

  		  function createLogScatterplot(string_dataset) {
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
		  }

          function createLineChart(dataset, i, string_dataset) {
          	// Create axes
	        var x = d3.time.scale().range([0, width.graph]),
	            y = d3.scale.linear().range([height.linechart, 0]);

	        var xAxis = d3.svg.axis().scale(x).orient("bottom"),
	            yAxis = d3.svg.axis().scale(y).orient("left");

	        //x.domain(d3.extent(data.datasets[0].values.map(function(d) { return parseDate(d.timestamp); })));
	        x.domain(d3.extent(dataset.values.map(function(d) { return parseDate(d.timestamp); })));
	        y.domain([0, d3.max(dataset.values, function(d) { return d.value; })]);

	        // Save domains and axes for later
	        xAxes.push(xAxis);
	        yAxes.push(yAxis);
	        xs.push(x);
	        ys.push(y);

	        // Create charts
			var main_line = d3.svg.area()
				.interpolate("linear")
				.x(function(d) { return x(parseDate(d.timestamp)); })
				.y0(height.linechart)
				.y1(function(d) { return y(d.value); });

			main_lines.push(main_line);

			var focus = svg.append("g")
			    .attr("class", "focus" + i)
			    .attr("transform", "translate(" + margin.left + "," + (margin.top + height.scatterplot + (height.linechart * i + margin.top * i)) + ")");

			focus.append("path")
			    .datum(dataset.values)
			    .attr("class", "area")
			    .attr("d", main_line);

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
			    .attr("x", width.graph - margin.left - 6)
			    .attr("y", height.linechart - 6)
			    .text(dataset.key);
          }

	      function createContext(datasets, string_dataset) {

	        x2 = d3.time.scale().range([0, width.graph]),
	            y2 = d3.scale.linear().range([height.context, 0]);

	        xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
	            yAxis2 = d3.svg.axis().scale(ys[xs.length-1]).orient("left");

	        x2.domain(xs[0].domain());
	        y2.domain(ys[xs.length-1].domain());

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
	            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

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
	            .text(function(d) { return d;})      

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
		      d3.select(".focus"+i).select(".area").attr("d", main_lines[i]);
		      d3.select(".focus"+i).select(".x.axis").call(xAxes[i]);
		    }
		}

    });
  }};
}]);
