'use strict';

/**
 * @ngdoc directive
 * @name pipelinrApp.directive:pipelinrPointGraph
 * @description
 * # pipelinrPointGraph
 */
angular.module('pipelinrApp')
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
					    .attr("width", scope.configuration.width.graph + scope.configuration.margin.left + scope.configuration.margin.right)
					    .attr("height", scope.configuration.height.scatterplot + scope.configuration.margin.top/2)
			    		.append("g")
							.attr("transform", "translate(" + scope.configuration.margin.left/2 + ",0)")
							.attr("clip-path", "url(#clip)");

					scatterplot.append("defs").append("clipPath")
				    .attr("id", "clip")
				  .append("rect")
				    .attr("width", scope.configuration.width.graph)
				    .attr("height", scope.configuration.height.scatterplot + scope.configuration.margin.top/2);

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
        });
      }
    };
  }]);
