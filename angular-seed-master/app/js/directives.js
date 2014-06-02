'use strict';

/* Directives */

angular.module('myApp.directives', ['d3']).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).directive('pwCheck', [function () {
	return {
		require: 'ngModel',
		link: function (scope, elem, attrs, ctrl) {
			var firstPassword = '#' + attrs.pwCheck;
			elem.add(firstPassword).on('keyup', function () {
				scope.$apply(function () {
					var v = elem.val()===$(firstPassword).val();
					ctrl.$setValidity('pwmatch', v);
				});
			});
		}
	}
  }]) 
  .directive('d3Timeline', ['d3Service', '$window', function(d3Service, $window) {
    return {
      restrict: 'EA',
      scope: {
      	date: '=',
        data: '=' // bi-directional data-binding
      },
      link: function(scope, ele, attrs) {
        d3Service.d3().then(function(d3) {

        var logColor = d3.scale.ordinal()
	        .domain(["","warning","error"])
	        .range(["#FFF", "#FFFF00", "#FF0000"]);

  	    // TODO: Change this
	    var xAxes = new Array();
	    var yAxes = new Array();
	    var xs = new Array();
	    var ys = new Array();
	    var main_lines = new Array();

	    var context;
	    var xAxis2, yAxis2;

        var margin = {top: 20, right: 10, bottom: 60, left: 40},
            margin2 = {top: 215, right: 10, bottom: 10, left: 40},
            width = 840 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom,
            height2 = 250 - margin2.top - margin2.bottom;

	    // TODO: change this to global settings object
	    var settings = {};
	    settings.logFilter = new Array();
	    settings.logFilter.push({ key: "warning", value: true }, { key: "error", value: true });

	    var color = d3.scale.category20();

        var legendWidth = 200; // Additional legend width

        var parseDate = d3.time.format('%d %m %Y, %H:%M:%S').parse;

       	var svg = d3.select(ele[0]).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", 3*height + 2*margin.top + margin.bottom); // TODO: 3 to x

        var x_log, y_log, xAxis_log, yAxis_log;
        var brush;

        var x2, y2;

        var tip;

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
		scope.$watch('date', function(newVals, oldVals) {
	        if (scope.date) {
				if(rendered)
					return scope.renderUpdate(newVals);
			}
		}, true);

		scope.renderUpdate = function(date) {
	        console.log(date);
	        if(date.type == "string") {
	            // Push new value in dataset
	            string_dataset.values.push({ timestamp: date.timestamp, value: date.value, level: date.level});    
	            var current_dataset = string_dataset;

	            // Append new focus circle
	            d3.select(".focus.scatter").selectAll('circle')
	              .data(string_dataset.values)
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
	             .data(string_dataset.values).enter()
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

	    // TODO: Change this
	    //for(var i in data.datasets) {
	    //  data.datasets[i].values.splice(0, 0, { timestamp: "14 05 2014, 12:02:00", value: null});
	    //}
	    console.log(data.datasets);

	    // Get log data from datasets
	    for(var i in data.datasets) {
	      if(data.datasets[i].type == "string") {
	        string_dataset = data.datasets[i];
	        //delete data.datasets[i];
	        //data.datasets.length--;
	      }
	    }

	    createSVGContainer(data.datasets, string_dataset);
	    createLogScatterplot(string_dataset);
	    for(var i in data.datasets) {
	      if(data.datasets[i].type == "int") {
	        createLineChart(data.datasets[i], i, string_dataset);
	      }
	    }

	    // Give every area a different color
	    d3.selectAll(".area").attr("fill",function(d,i){return color(i);});

	    for(var i in data.datasets) {
    	  if(data.datasets[i].type == "int") {
		      createHoverline(data.datasets[i], i);
		  }
	    }

        function createHoverline(dataset, i) {
	        var bisectDate = d3.bisector(function(d) { return parseDate(d.timestamp); }).left

	        d3.select(".focus"+i).append("rect")
	          .datum(dataset)
	          .attr("class", "overlay")
	          .attr("width", width)
	          .attr("height", height)
	          .on("mouseover", function() { tooltip.style("display", null); text.style("display", null); })
	          .on("mouseout", function() { tooltip.style("display", "none"); text.style("display", "none"); })
	          .on("mousemove", mousemove);

	        var tooltip = d3.select(".focus"+i).append("g")
	            .attr("class", "hover-line " + i)
	            .attr("clip-path", "url(#clip)")
	            .style("display", "none");

	        tooltip.append("g")
	            .attr("class", "hover-line")
	            .append("line")
	            .attr("x1", 0).attr("x2", 0) 
	            .attr("y1", 0).attr("y2", height);

	        var text = d3.select(".focus"+i).append("text")
	            .attr("class", "y"+i)
	            .attr("x", 5)
	            .attr("y", height/2)
	            .attr("dy", ".35em");

	        function mousemove() {
	          var x0 = xs[xs.length-1].invert(d3.mouse(this)[0]),
	          i = bisectDate(dataset.values, x0, 1),
	          d0 = dataset.values[i - 1],
	          d1 = dataset.values[i];

	          if(d1 != null) { // Last value is sometimes undefined after immediate update
	            var d = x0 - d0.timestamp > d1.timestamp - x0 ? d1 : d0;
	          } else {
	            var d = d0;
	          }

	          tooltip.attr("transform", "translate(" + xs[xs.length-1](parseDate(d.timestamp)) + "," + 0 + ")");
	          text.attr("transform", "translate(" + xs[xs.length-1](parseDate(d.timestamp)) + "," + 0 + ")").text(d.value);
	        }
	    }

		function createLogScatterplot(string_dataset) {
			x_log = d3.time.scale().range([0, width]),
		    	y_log = d3.scale.linear().range([height2, 0]);

			// Axis
			xAxis_log = d3.svg.axis().scale(x_log).orient("bottom"),
			    yAxis_log = d3.svg.axis().scale(y_log).orient("left");

			x_log.domain(d3.extent(string_dataset.values.map(function(d) { return parseDate(d.timestamp); })));
			y_log.domain([0, d3.max(string_dataset.values, function(d) { return d.value; })]);

			var focus = svg.append("g")
			    .attr("class", "focus scatter")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			focus.append("g")
			    .attr("class", "x axis")
			    .attr("transform", "translate(0," + margin.top * 2 + ")")
			    .call(xAxis_log);

			focus.selectAll('circle')
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
			  	//.style("left", (parseInt(d3.select(this).attr("cx")) + document.getElementById("timeline").offsetLeft) + "px")     
				//.style("top", (parseInt(d3.select(this).attr("cy")) + document.getElementById("timeline").offsetTop) + "px");
			  })                  
			  .on("mouseout", function(d) {       
			    tip.transition().duration(500).style("opacity", 0);   
			  });
		}

		function createLineChart(dataset, i, string_dataset) {
			// Focus lines
			var main_line = d3.svg.area()
				.interpolate("linear")
				.x(function(d) { return xs[i](parseDate(d.timestamp)); })
				.y0(height)
				.y1(function(d) { return ys[i](d.value); });

			main_lines.push(main_line);

			var focus = svg.append("g")
			    .attr("class", "focus" + i)
			    .attr("transform", "translate(" + margin.left + "," + (margin.top*6 + (margin2.top *i)) + ")");

			focus.append("path")
			    .datum(dataset.values)
			    .attr("class", "area")
			    .attr("d", main_line);

			focus.append("g")
			    .attr("class", "x axis")
			    .attr("transform", "translate(0," + height + ")")
			    .call(xAxes[i]);

			focus.append("g")
			    //.attr("class", "y axis")
			    .attr("class", "y "+i+ " axis")
			    .call(yAxes[i]);

	        focus.append("text")
			    .attr("class", "x label")
			    .attr("text-anchor", "end")
			    .attr("x", width -6)
			    .attr("y", height - 6)
			    .text(dataset.key);
		}

      function createSVGContainer(datasets, string_dataset) {

		tip = d3.select("body").append("div")   
		    .attr("class", "tip")               
		    .style("opacity", 0);

        for(var i in datasets) {
        	if(data.datasets[i].type == "int") {
				drawAxis(datasets[i]);
			}
        }

        x2 = d3.time.scale().range([0, width]), // Context
            y2 = d3.scale.linear().range([height2, 0]); // Context

        xAxis2 = d3.svg.axis().scale(x2).orient("bottom"), // Context
            yAxis2 = d3.svg.axis().scale(ys[xs.length-1]).orient("left"); // Context

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

        // Clip on edges
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
          .append("rect")
            .attr("width", width)
            .attr("height", height);

        context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + (margin.top *6 + margin2.top * (datasets.length-1)) + ")");

        context.selectAll('circle')
          .data(string_dataset.values)
          .enter().append("circle")
          .attr("clip-path", "url(#clip)")
          .attr('class', 'circle')
          .style("fill", function (d) { return logColor(d.level);})
          .attr("cx", function (d) { return x2(parseDate(d.timestamp)); })
          .attr("cy", function (d) { return height2/2; })
          .attr("r", function(d){ return 3;});

        context.append("g")
            .attr("class", "x axis2")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "x brush")
            .call(brush)
          .selectAll("rect")
            .attr("y", -6)
            .attr("height", height2 + 7);

        // Setting container
  		var settingSvg = d3.select("#setting-container").append("svg")
            .attr("width", legendWidth)
            .attr("height", height);

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

        function drawAxis(dataset) {
	        var x = d3.time.scale().range([0, width]), // Focus
	            y = d3.scale.linear().range([height, 0]); // Focus

	        // Axis
	        var xAxis = d3.svg.axis().scale(x).orient("bottom"), // Focus
	            yAxis = d3.svg.axis().scale(y).orient("left"); // Focus

	        x.domain(d3.extent(data.datasets[0].values.map(function(d) { return parseDate(d.timestamp); })));
	        y.domain([0, d3.max(dataset.values, function(d) { return d.value; })]);

	        // Save domains and axes for later retrieval
	        xAxes.push(xAxis);
	        yAxes.push(yAxis);
	        xs.push(x);
	        ys.push(y);
	      }
      }

      // On hover (e.g. for a circle) move svg to front (instead of z-index)
      d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
          this.parentNode.appendChild(this);
        });
      };
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
