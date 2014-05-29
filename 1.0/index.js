KISSY.add(function(S,Node,DOM,Event,JSON,Helpers){

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
