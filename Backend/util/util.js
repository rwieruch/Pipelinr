module.exports = {
    handleError: function(error) {
        if (error && error.code !== 11000 ) return 404;
		if ( error && error.code === 11000 ) return 409; // Duplicate
  	    return 500;
    }
};