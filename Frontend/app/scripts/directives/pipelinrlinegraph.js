'use strict';

/**
 * @ngdoc directive
 * @name pipelinrApp.directive:pipelinrLineGraph
 * @description
 * # pipelinrLineGraph
 */
angular.module('pipelinrApp')
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
	        scope.configuration.yAxes[scope.dataset._id] = yAxis;
	        scope.configuration.ys[scope.dataset._id] = y;

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
					    .attr("width", scope.configuration.width.graph + scope.configuration.margin.left + scope.configuration.margin.right)
					    .attr("height", scope.configuration.height.linechart + scope.configuration.margin.bottom)
			    		.append("g")
							.attr("transform", "translate(" + scope.configuration.margin.left/2 + "," + scope.configuration.margin.top/2 + ")");

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

				  // Draw statistic lines
				  var line = d3.svg.line()						
					 	.x(function(d) { return x(scope.configuration.parseDate(d.timestamp)); })
						.y(function(d) { return y(d.value); });

					scope.configuration.line = line;

				  // Trendline
					var series = scope.configuration.util.calculateSeries(scope.dataset.values);	
					var leastSquaresCoeff = scope.configuration.util.leastSquares(series.xSeries, series.ySeries);
					var trendData = scope.configuration.util.trendCoordinates(series.xSeries, leastSquaresCoeff, scope.dataset.values);

					focus.append('path')
				    .datum(trendData)
				    .attr("class", "trendline")
						.attr("d", line );

					// Draw max line
					var max = d3.max(scope.dataset.values, function(d) { return +d.value;} );
					var maxData = [{timestamp: scope.dataset.values[0].timestamp, value: max}, {timestamp: scope.dataset.values[scope.dataset.values.length - 1].timestamp, value: max}];

					focus.append('path')
				    .datum(maxData)
				    .attr("class", "maxline")
						.attr("d", line );

	        focus.append("text")
            .attr("x", 0)
            .attr("y", scope.configuration.height.linechart + scope.configuration.margin.bottom/2 + 5)
            .attr("dy", ".35em")
            .attr("class", "maxline-label")
            .text("Max: " + max.toFixed(2));

					// Draw min line
					var min = d3.min(scope.dataset.values, function(d) { return +d.value;} );
					var minData = [{timestamp: scope.dataset.values[0].timestamp, value: min}, {timestamp: scope.dataset.values[scope.dataset.values.length - 1].timestamp, value: min}];

					focus.append('path')
				    .datum(minData)
				    .attr("class", "minline")
						.attr("d", line );

	        focus.append("text")
            .attr("x", 100)
            .attr("y", scope.configuration.height.linechart + scope.configuration.margin.bottom/2 + 5)
            .attr("dy", ".35em")
            .attr("class", "minline-label")
            .text("Min: " + min.toFixed(2));

					var statistic = scope.configuration.util.calcMeanSdVar(scope.dataset.values);
					// Draw mean and standard deviation line and variance
					var meanData = [{timestamp: scope.dataset.values[0].timestamp, value: statistic.mean}, {timestamp: scope.dataset.values[scope.dataset.values.length - 1].timestamp, value: statistic.mean}];

					focus.append('path')
				    .datum(meanData)
				    .attr("class", "meanline")
						.attr("d", line );

	        focus.append("text")
            .attr("x", 200)
            .attr("y", scope.configuration.height.linechart + scope.configuration.margin.bottom/2 + 5)
            .attr("dy", ".35em")
            .attr("class", "meanline-label")
            .text("Mean: " + statistic.mean.toFixed(2) );

          var sdMinData = [{timestamp: scope.dataset.values[0].timestamp, value: statistic.mean - statistic.deviation}, {timestamp: scope.dataset.values[scope.dataset.values.length - 1].timestamp, value: statistic.mean - statistic.deviation}];

					focus.append('path')
				    .datum(sdMinData)
				    .attr("class", "sdminline")
						.attr("d", line );

          var sdMaxData = [{timestamp: scope.dataset.values[0].timestamp, value: statistic.mean + statistic.deviation}, {timestamp: scope.dataset.values[scope.dataset.values.length - 1].timestamp, value: statistic.mean + statistic.deviation}];

					focus.append('path')
				    .datum(sdMaxData)
				    .attr("class", "sdmaxline")
						.attr("d", line );

	        focus.append("text")
            .attr("x", 300)
            .attr("y", scope.configuration.height.linechart + scope.configuration.margin.bottom/2 + 5)
            .attr("dy", ".35em")
            .attr("class", "sdline-label")
            .text("Standard Deviation: " + statistic.deviation.toFixed(2) );

	        focus.append("text")
            .attr("x", 500)
            .attr("y", scope.configuration.height.linechart + scope.configuration.margin.bottom/2 + 5)
            .attr("dy", ".35em")
            .attr("class", "variance-label")
            .text("Variance: " + statistic.variance.toFixed(2) );

	        focus.append("text")
            .attr("x", 650)
            .attr("y", scope.configuration.height.linechart + scope.configuration.margin.bottom/2 + 5)
            .attr("dy", ".35em")
            .attr("class", "trend-label")
            .text("Trend line: - - -");
    		});
    	}
  	};
  }]);
