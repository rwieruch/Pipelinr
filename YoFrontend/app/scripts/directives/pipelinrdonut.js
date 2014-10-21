'use strict';

/**
 * @ngdoc directive
 * @name pipelinrApp.directive:pipelinrDonut
 * @description
 * # pipelinrDonut
 */
angular.module('pipelinrApp')
  .directive('pipelinrDonut', ['d3Service', '$window', function(d3Service, $window) {
    return {
      restrict: 'EA',
      link: function(scope, ele, attrs) {
        d3Service.d3().then(function(d3) {
        	console.log("pipelinrDonut");
					console.log(scope.dataset);

					if(scope.dataset.values.length < 2) return; // Do not draw for no values

					var globalMax = d3.max(scope.dataset.values, function(d) { return +d.value; } );
					var data = scope.configuration.donutGraph.computeDonutData(scope.dataset.values, globalMax);
					console.log(data);
					var width = 150,
					    height = 150,
					    radius = Math.min(width, height) / 2;

					var donut_color = d3.scale.ordinal()
			        .domain(["high","mid","low"])
					    .range(["#D24D57", "#F5D76E", "#87D37C"]);

					var pie = d3.layout.pie()
					    .value(function(d) { return d.count; })
					    .sort(null);

			    scope.configuration.donutGraph.pie = pie;

					var arc = d3.svg.arc()
					    .outerRadius(radius - 0)
					    .innerRadius(radius - 30);

	    		var arcOver = d3.svg.arc()
					    .outerRadius(radius - 0)
					    .innerRadius(radius - 10);

			    scope.configuration.donutGraph.arc = arc;

					var svg = d3.select(ele[0]).append("svg")
					    .attr("width", width)
					    .attr("height", height)
					  .append("g")
					    .attr("transform", "translate(" + height / 2 + "," + height / 2 + ")");

					var text = svg.append('text')
            .attr('class','center-label');

			    var path = svg.selectAll("path")
			      .data(pie(data))
			    	.enter().append("path")
			      .attr("fill", function(d, i) { return donut_color(i); })
			      .attr("d", arc)
    				.on("mouseover", function(d) {
            	d3.select(this).transition()
	               .duration(500)
	               .attr("d", arcOver);
              text
      					.text(d.data.label)
      					.attr("fill", d.data.color);
             })
						.on("mouseout", function(d) {
            	d3.select(this).transition()
	               .duration(500)
	               .attr("d", arc);
               text
      					.text('');
             })
			      .each(function(d) { this._current = d; }); // store the initial angles

		      scope.configuration.donutGraph.donutPaths[scope.dataset._id] = path;
    	});
  	}
  }
}])
