/*
combined files : 

gallery/parallax/1.0/helpers
gallery/parallax/1.0/index

*/
KISSY.add('gallery/parallax/1.0/helpers',function (S,DOM) {

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

KISSY.add('gallery/parallax/1.0/index',function(S,Node,DOM,Event,JSON,Helpers){

    'use strict';


    var DEFAULTS = {
        calibrationDelay: 500,
        scalarX: 10.0,
        scalarY: 10.0,
        frictionX: 0.1,
        frictionY: 0.1,
        originX: 0.5,
        originY: 0.5
    };

    var requestAnimationFrame = Helpers.requestAnimationFrame;
    var cancelAnimationFrame = Helpers.cancelAnimationFrame;

    function Plugin(sence, options) {

        // DOM Context
        var $element= S.all(sence);
        var element = this.element = $element[0];

        // Selections
        this.$context = $element;
        this.$layers = this.$context.all('.layer');

        this.$window  = S.all(window);
        // Compose Settings Object
        S.mix(this, S.mix(S.clone(DEFAULTS), options));

        // States
        this.calibrationTimer = null;
        this.enabled = false;
        this.layersCache = [];
        this.raf = null;

        // Element Bounds
        this.bounds = null;
        this.ex = 0;
        this.ey = 0;
        this.ew = 0;
        this.eh = 0;

        // Element Center
        this.ecx = 0;
        this.ecy = 0;

        // Element Range
        this.erx = 0;
        this.ery = 0;


        // Input
        this.ix = 0;
        this.iy = 0;

        // Motion
        this.mx = 0;
        this.my = 0;

        // Velocity
        this.vx = 0;
        this.vy = 0;

        // Callbacks
        this.onMouseMove = S.bind(this.onMouseMove, this);
        this.onWindowResize = S.bind(this.onWindowResize, this);
        this.doUpdateBounds = S.throttle(this.updateBounds, 500, this);
        this.onAnimationFrame = S.bind(this.onAnimationFrame, this);

        // Initialise
        this.initialise();
    }

    Plugin.prototype.ww = null;
    Plugin.prototype.wh = null;
    Plugin.prototype.wcx = null;
    Plugin.prototype.wcy = null;
    Plugin.prototype.wrx = null;
    Plugin.prototype.wry = null;
    Plugin.prototype.transform2DSupport = Helpers.transformSupport('2D');
    Plugin.prototype.transform3DSupport = Helpers.transformSupport('3D');

    Plugin.prototype.initialise = function () {

        // Configure Styles
        if (this.$context.css('position') === 'static') {
            this.$context.css({
                position: 'relative'
            });
        }

        // Hardware Accelerate Context
        Helpers.accelerate3D(this.$context);

        // Setup
        this.updateLayers();
        this.updateDimensions();
        this.updateBounds();
        this.enable();
    };

    Plugin.prototype.updateLayers = function () {

        // Cache Layer Elements
        this.$layers = this.$context.all('.layer');
        this.layersCache = [];

        // Configure Layer Styles
        this.$layers.css({
            position: 'absolute',
            display: 'block',
            left: 0,
            top: 0
        });
        this.$layers.slice(0,1).css({
            position: 'relative'
        });

        // Hardware Accelerate Layers
        Helpers.accelerate3D(this.$layers);

        // Cache Depths
        this.$layers.each(S.bind(function (element, index) {
            var $ele = S.all(element);
            var depth = parseFloat($ele.attr('data-depth'), 10);
            var limitY = parseFloat($ele.attr('data-limit-y'), 10);
            var limitX = parseFloat($ele.attr('data-limit-x'), 10);
            this.layersCache.push({
                depth  : depth||0,
                limitY : limitY||null,
                limitX : limitX||null
            });
        }, this));
    };

    Plugin.prototype.updateDimensions = function () {
        this.ww = this.$window.width();
        this.wh = this.$window.height();

        this.wcx = this.ww * this.originX;
        this.wcy = this.wh * this.originY;
        this.wrx = Math.max(this.wcx, this.ww - this.wcx);
        this.wry = Math.max(this.wcy, this.wh - this.wcy);
    };

    Plugin.prototype.updateBounds = function () {

        var $context= this.$context;
        var offset  = $context.offset();

        this.bounds = {
            left    : offset.left,
            top     : offset.top,
            width   : $context.width(),
            height  : $context.height()
        };

        //alert(JSON.stringify(this.bounds));
        //S.all("h1").append("<p>"+JSON.stringify(this.bounds)+"</p>");
        this.ex = this.bounds.left;
        this.ey = this.bounds.top;
        this.ew = this.bounds.width;
        this.eh = this.bounds.height;
        this.ecx = this.ew * this.originX;
        this.ecy = this.eh * this.originY;
        this.erx = Math.max(this.ecx, this.ew - this.ecx);
        this.ery = Math.max(this.ecy, this.eh - this.ecy);
    };


    Plugin.prototype.enable = function () {
        if (!this.enabled) {
            this.enabled = true;
            Event.on(document, "mousemove", this.onMouseMove);
            Event.on(window, 'resize', this.onWindowResize);
            Event.on(window, 'resize', this.doUpdateBounds);
            Event.on(window, "scroll", this.doUpdateBounds);
            this.raf = requestAnimationFrame(this.onAnimationFrame);
        }
    };

    Plugin.prototype.disable = function () {
        if (this.enabled) {
            this.enabled = false;
            Event.detach('mousemove', this.onMouseMove);
            Event.detach('resize', this.onWindowResize);
            Event.detach(window, 'resize', this.doUpdateBounds);
            Event.detach(window, "scroll", this.doUpdateBounds);
            cancelAnimationFrame(this.raf);
        }
    };

    Plugin.prototype.setPosition = function (element, x, y) {
        x += 'px';
        y += 'px';
        if (this.transform3DSupport) {
            Helpers.css(element, 'transform', 'translate3d(' + x + ',' + y + ',0)');
        } else if (this.transform2DSupport) {
            Helpers.css(element, 'transform', 'translate(' + x + ',' + y + ')');
        } else {
            element.style.left = x;
            element.style.top = y;
        }
    };

    Plugin.prototype.onWindowResize = function (event) {
        this.updateDimensions();
    };

    Plugin.prototype.onAnimationFrame = function () {

        //this.updateBounds();

        this.mx = this.ix * this.ew * (this.scalarX / 100) * -1;
        this.my = this.iy * this.eh * (this.scalarY / 100) * -1;

        var vxInc = (this.mx - this.vx) * this.frictionX;
        var vyInc = (this.my - this.vy) * this.frictionY;
        this.vx += vxInc;
        this.vy += vyInc;

        for (var i = 0, l = this.$layers.length; i < l; i++) {
            var depth = this.layersCache[i].depth;
            var limitX = this.layersCache[i].limitX;
            var limitY = this.layersCache[i].limitY;
            var layer = this.$layers[i];
            var xOffset = this.vx * depth;
            var yOffset = this.vy * depth;

            if(limitX && xOffset > 0){
                xOffset = Math.min(limitX, xOffset);
            }
            if(limitX && xOffset < 0){
                xOffset = Math.max(-limitX, xOffset);
            }
            if(limitY && yOffset > 0){
                yOffset = Math.min(limitY, yOffset);
            }
            if(limitY && yOffset < 0){
                yOffset = Math.max(-limitY, yOffset);
            }

            this.setPosition(layer, xOffset, yOffset);
        }

        this.raf = requestAnimationFrame(this.onAnimationFrame);

    };


    Plugin.prototype.onMouseMove = function (event) {

        // Cache mouse coordinates.
        var clientX = event.clientX;
        var clientY = event.clientY;

        // Calculate input relative to the window.
        this.ix = (clientX - this.wcx) / this.wrx;
        this.iy = (clientY - this.wcy) / this.wry;


    };


    return Plugin;

}, {
    requires : [ "node","dom","event","json","./helpers" ]
});

