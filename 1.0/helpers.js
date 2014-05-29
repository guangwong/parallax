KISSY.add(function (S,DOM) {

    var EXPORTS = {};
    var vendors = [null, ['-webkit-', 'webkit'], ['-moz-', 'Moz'], ['-o-', 'O'], ['-ms-', 'ms']];
    function transformSupport(value) {
        var element = document.createElement('div');
        var propertySupport = false;
        var propertyValue = null;
        var featureSupport = false;
        var cssProperty = null;
        var jsProperty = null;
        for (var i = 0, l = vendors.length; i < l; i++) {
            if (vendors[i] !== null) {
                cssProperty = vendors[i][0] + 'transform';
                jsProperty = vendors[i][1] + 'Transform';
            } else {
                cssProperty = 'transform';
                jsProperty = 'transform';
            }
            if (element.style[jsProperty] !== undefined) {
                propertySupport = true;
                break;
            }
        }
        switch (value) {
            case '2D':
                featureSupport = propertySupport;
                break;
            case '3D':
                if (propertySupport) {
                    var body = document.body || document.createElement('body');
                    var documentElement = document.documentElement;
                    var documentOverflow = documentElement.style.overflow;
                    if (!document.body) {
                        documentElement.style.overflow = 'hidden';
                        documentElement.appendChild(body);
                        body.style.overflow = 'hidden';
                        body.style.background = '';
                    }
                    body.appendChild(element);
                    element.style[jsProperty] = 'translate3d(1px,1px,1px)';
                    propertyValue = window.getComputedStyle(element).getPropertyValue(cssProperty);
                    featureSupport = propertyValue !== undefined && propertyValue.length > 0 && propertyValue !== "none";
                    documentElement.style.overflow = documentOverflow;
                    body.removeChild(element);
                }
                break;
        }
        return featureSupport;
    };
    EXPORTS.transformSupport = transformSupport;

    function camelCase(value) {
        return value.replace(/-+(.)?/g, function(match, character){
            return character ? character.toUpperCase() : '';
        });
    };


    function css(element, property, value){
        var jsProperty;
        for (var i = 0, l = vendors.length; i < l; i++) {
            if (vendors[i] !== null) {
                jsProperty = camelCase(vendors[i][1] + '-' + property);
            } else {
                jsProperty = property;
            }
            if (element.style[jsProperty] !== undefined) {
                break;
            }
        }
        element.style[jsProperty] = value;
    }

    EXPORTS.css = css;

    function accelerate3D ($element){

        for (var i = 0, l = $element.length; i < l; i++) {
            var element = $element[i];

            css(element, 'transform', 'translate3d(0,0,0)');
            css(element, 'transform-style', 'preserve-3d');
            css(element, 'backface-visibility', 'hidden');
        }
    }
    EXPORTS.accelerate3D = accelerate3D;



    var requestAnimationFrame;
    var cancelAnimationFrame;
    ;(function() {

        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];

        var reqAtWin = window.requestAnimationFrame;
        var cancelAtWin = window.cancelAnimationFrame;

        for(var x = 0; x < vendors.length && !reqAtWin; ++x) {
            reqAtWin = window[vendors[x]+'RequestAnimationFrame'];
            cancelAtWin = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        requestAnimationFrame = reqAtWin || function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        cancelAnimationFrame = cancelAtWin || function(id) {
            clearTimeout(id);
        };

    }());

    EXPORTS.requestAnimationFrame = requestAnimationFrame;
    EXPORTS.cancelAnimationFrame  = cancelAnimationFrame;

    return EXPORTS;

}, {
    requires : ["dom"]
});
