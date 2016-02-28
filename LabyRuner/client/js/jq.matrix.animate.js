
(function ($) {
    //
    // regular expression for parsing out the matrix
    // components from the matrix string
    //
    var matrixRE = /\([0-9epx\.\, \t\-]+/gi;

    //
    // parses a matrix string of the form
    // "matrix(n1,n2,n3,n4,n5,n6)" and
    // returns an array with the matrix
    // components
    //
    var parseMatrix = function (val) {
        return val.match(matrixRE)[0].substr(1).
                  split(",").map(function (s) {
            return parseFloat(s);
        });
    }
    
    
    
    
    //
    // transform css property names with vendor prefixes;
    // the plugin will check for values in the order the 
    // names are listed here and return as soon as there
    // is a value; so listing the W3 std name for the
    // transform results in that being used if its available
    //
    var transformPropNames = [
        "transform",
        "msTransform",
        "-webkit-transform",
        "-moz-transform",
        "-o-transform"
    ];

    var getTransformMatrix = function (el) {
        //
        // iterate through the css3 identifiers till we
        // hit one that yields a value
        //
        var matrix = null;
        transformPropNames.some(function (prop) {
            matrix = el.css(prop);
            return (matrix !== null && matrix !== "");
        });

        //
        // if "none" then we supplant it with an identity matrix so
        // that our parsing code below doesn't break
        //
        matrix = (!matrix || matrix === "none") ?
                      "matrix(1,0,0,1,0,0)" : matrix;
        return parseMatrix(matrix);
    };

    //
    // set the given matrix transform on the element; note that we
    // apply the css transforms in reverse order of how its given
    // in "transformPropName" to ensure that the std compliant prop
    // name shows up last
    //
    var setTransformMatrix = function (el, matrix) {
        var m = "matrix(" + matrix.join(",") + ")";
        for (var i = transformPropNames.length - 1; i >= 0; --i) {
            el.css(transformPropNames[i], m);
        }
    };
    
    
    
    
    //
    // interpolates a value between a range given a percent
    //
    var interpolate = function (from, to, percent) {
        return from + ((to - from) * (percent / 100));
    }

    $.fn.transformAnimate = function (opt) {
        //
        // extend the options passed in by caller
        //
        var options = {
            transform: "matrix(1,0,0,1,0,0)"
        };
        $.extend(options, opt);

        //
        // initialize our custom property on the element
        // to track animation progress
        //
        this.css("percentAnim", 0);

        //
        // supplant "options.step" if it exists with our own
        // routine
        //
        var sourceTransform = getTransformMatrix(this);
        var targetTransform = parseMatrix(options.transform);
        options.step = function (percentAnim, fx) {
            //
            // compute the interpolated transform matrix for
            // the current animation progress
            //
            var $this = $(this);
            var matrix = sourceTransform.map(function (c, i) {
                return interpolate(c, targetTransform[i], 
                         percentAnim);
            });

            //
            // apply the new matrix
            //
            setTransformMatrix($this, matrix);

            //
            // invoke caller's version of "step" if one
            // was supplied;
            //
            if (opt.step) {
                opt.step.apply(this, [matrix, fx]);
            }
        };
        
        //
        // animate!
        //
        return this.animate({ percentAnim: 100 }, options);
    };
})(jQuery);