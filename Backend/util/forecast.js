/*console.log("nostradamus");
var ts = require("timeseries-analysis")
  , data = [['28 05 1988, 04:04:04',5], 
            ['29 05 1988, 04:04:04',7], 
            ['30 05 1988, 04:04:04',2], 
            ['01 06 1988, 04:04:04',3], 
            ['02 06 1988, 04:04:04',4],
            ['03 06 1988, 04:04:04',4],
            ['04 06 1988, 04:04:04',4],
            ['05 06 1988, 04:04:04',4],
            ['06 06 1988, 04:04:04',30],
            ['07 06 1988, 04:04:04',4],
            ['08 06 1988, 04:04:04',4],
            ['09 06 1988, 04:04:04',4],
            ['28 06 1988, 04:04:04',5],
            ['29 06 1988, 04:04:04',6],
            ['30 06 1988, 04:04:04',7]];
var t     = new ts.main(data);
//var t         = new ts.main(ts.adapter.sin({cycles:4}));

// We're going to forecast the 11th datapoint
var forecastDatapoint    = 11;    

// We calculate the AR coefficients of the 10 previous points
var coeffs = t.ARMaxEntropy({
    data:    t.data.slice(0,10)
});

// Output the coefficients to the console
console.log(coeffs);

// Now, we calculate the forecasted value of that 11th datapoint using the AR coefficients:
var forecast    = 0;    // Init the value at 0.
for (var i=0;i<coeffs.length;i++) {    // Loop through the coefficients
    forecast -= t.data[10-i][1]*coeffs[i];
    // Explanation for that line:
    // t.data contains the current dataset, which is in the format [ [date, value], [date,value], ... ]
    // For each coefficient, we substract from "forecast" the value of the "N - x" datapoint's value, multiplicated by the coefficient, where N is the last known datapoint value, and x is the coefficient's index.
}
console.log("forecast",forecast);
// Output: 92.7237232432106*/