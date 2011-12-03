var defaultIconSettings = {
    "iconFit" : "smaller",
    "iconScale" : 1,
    "iconOffsetX" : 0,
    "iconOffsetY" : 0,
    "shape" : "circle",
    "shapeWidth" : 24,
    "shapeHeight" : 24,
    "shapeAlpha" : 0.7,
    "pinHeight" : 6,
    "pinWidth" : 6
};
var iconData = null;
var markerUrlPrefix = "http://simile.mit.edu/painter/painter?";
var defaultMarkerShape = "circle";

function makeIcon(shape, color, iconSize, label, iconURL, pin, settings) {
    var extra = label.length * 3;
    var halfWidth = Math.ceil(settings.shapeWidth / 2) + extra;
    var bodyHeight = settings.shapeHeight;
    var width = halfWidth * 2;
    var height = bodyHeight;
    if (iconSize > 0) {
        width = iconSize;
        halfWidth = Math.ceil(iconSize / 2);
        height = iconSize;
        bodyHeight = iconSize;
    }   
    var icon = new GIcon();
    var imageParameters = [
        "renderer=map-marker",
        "shape=" + shape,
        "alpha=" + settings.shapeAlpha,
        "width=" + width,
        "height=" + bodyHeight,
        "background=" + color.substr(1),
        "label=" + label
    ];
    var shadowParameters = [
        "renderer=map-marker-shadow",
        "shape=" + shape,
        "width=" + width,
        "height=" + bodyHeight
    ];
    var pinParameters = [];
    
    if (iconURL != null) {
        imageParameters.push("icon=" + encodeURIComponent(iconURL));
        if (settings.iconFit != "smaller") {
            imageParameters.push("iconFit=" + settings.iconFit);
        }
        if (settings.iconScale != 1) {
            imageParameters.push("iconScale=" + settings.iconScale);
        }
        if (settings.iconOffsetX != 1) {
            imageParameters.push("iconX=" + settings.iconOffsetX);
        }
        if (settings.iconOffsetY != 1) {
            imageParameters.push("iconY=" + settings.iconOffsetY);
        }
    }
    
    if (pin) {
        var pinHeight = settings.pinHeight;
        var pinHalfWidth = Math.ceil(settings.pinWidth / 2);
        
        height += pinHeight;
        
        pinParameters.push("pinHeight=" + pinHeight);
        pinParameters.push("pinWidth=" + (pinHalfWidth * 2));
        
        icon.iconAnchor = new GPoint(halfWidth, height);
        icon.imageMap = [ 
            0, 0, 
            0, bodyHeight, 
            halfWidth - pinHalfWidth, bodyHeight,
            halfWidth, height,
            halfWidth + pinHalfWidth, bodyHeight,
            width, bodyHeight,
            width, 0
        ];
        icon.shadowSize = new GSize(width * 1.5, height - 2);
        icon.infoWindowAnchor = (settings.bubbleTip == "bottom") ? new GPoint(halfWidth, height) : new GPoint(halfWidth, 0);
    } else {
        pinParameters.push("pin=false");
        
        icon.iconAnchor = new GPoint(halfWidth, Math.ceil(height / 2));
        icon.imageMap = [ 
            0, 0, 
            0, bodyHeight, 
            width, bodyHeight,
            width, 0
        ];
        icon.infoWindowAnchor = new GPoint(halfWidth, 0);
    }
    
    icon.image = markerUrlPrefix + imageParameters.concat(pinParameters).join("&") + "&.png";
    icon.iconSize = new GSize(width, height);
    if (pin) { 
        icon.shadow = markerUrlPrefix + shadowParameters.concat(pinParameters).join("&") + "&.png"; 
        icon.shadowSize = new GSize(width * 1.5, height - 2);
    }
    
    return icon;
};