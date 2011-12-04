var map;
var genericErrorHandler = function() {};

function createMap() {
    map = new GMap2(document.getElementById("the-map"));
    map.enableDoubleClickZoom();
    map.enableContinuousZoom();

    map.setCenter(new GLatLng(0, 0), 2);
    
    map.addControl(new GLargeMapControl());
    map.addControl(new GOverviewMapControl);
    map.addControl(new GScaleControl());
    
    map.addControl(new GMapTypeControl());
    map.setMapType(G_NORMAL_MAP);
}

function internalAddPoints(dataPoints, hasSize, hasImage, popupRenderer, onFocus) {
    if (dataPoints.length > 0) {
        /*
         *  Group by exact lat/lng
         */
        var groupMap = {};
        var groups = [];
        for (var i = 0; i < dataPoints.length; i++) {
            var dataPoint = dataPoints[i];
            var latlng = dataPoint.lat + "," + dataPoint.lng;
            var group;
            if (latlng in groupMap) {
                group = groupMap[latlng];
            } else {
                group = groupMap[latlng] = {
                    lat:    dataPoint.lat,
                    lng:    dataPoint.lng,
                    points: []
                };
                groups.push(group);
            }
            group.points.push(dataPoint);
        }
        
        if (hasSize) {
            for (var i = 0; i < groups.length; i++) {
                var group = groups[i];
                if (group.points.length == 1) {
                    if ("size" in group.points[0]) {
                        group.size = group.points[0].size;
                    }
                } else { 
                    var size = 0;
                    var groupHasSize = false;
                    for (var j = 0; j < group.points.length; j++) {
                        var point = group.points[j];
                        if ("size" in point) {
                            groupHasSize = true;
                            size += point.size;
                        }
                    }
                    if (groupHasSize) {
                        group.size = size;
                    }
                }
            }
            mapViewRescaleSizes(groups, 10, 100);
        }
        
        var bounds = new GLatLngBounds();
        for (var i = 0; i < groups.length; i++) {
            var point = addGroupPoint(groups[i], hasSize, popupRenderer, onFocus);
            bounds.extend(point);
        }
        
        map.setZoom(map.getBoundsZoomLevel(bounds));
        map.setCenter(bounds.getCenter());
    }
}

function addGroupPoint(group, hasSize, popupRenderer, onFocus) {
    var shape = "circle";
    var color = "#FF9000";
    var iconURL = null;
    var label = "";
    
    if (group.points.length == 1) {
        var p = group.points[0];
        if ("color" in p) {
            color = p.color;
        }
        if ("image" in p) {
            iconURL = p.image;
        }
    } else {
        color = "#AAAAAA";
        label = "" + group.points.length;
    }
    
    var iconSize = ("size" in group) ? group.size : iconURL != null ? 60 : 0;
    
    var icon = makeIcon(shape, color, iconSize, label, iconURL, !hasSize, defaultIconSettings);
    var point = new GLatLng(group.lat, group.lng);
    var marker = new GMarker(point, icon);
    GEvent.addListener(marker, "click", function() { mapViewShowBubble(marker, group, popupRenderer, onFocus); });
    
    map.addOverlay(marker);
    
    return point;
}

function mapViewRescaleSizes(points, minPixelSize, maxPixelSize) {
    var maxSize = Number.NEGATIVE_INFINITY;
    var minSize = Number.POSITIVE_INFINITY;
    for (var i = 0; i <points.length; i++) {
        var point = points[i];
        if ("size" in point) {
            maxSize = Math.max(maxSize, point.size);
            minSize = Math.min(minSize, point.size);
        }
    }
    
    if (maxSize > Number.NEGATIVE_INFINITY) {
        var sizeDiff = maxSize - minSize;
        var sizeDiffSqrt = Math.sqrt(sizeDiff);
        var sizeScale = (maxPixelSize - minPixelSize) / sizeDiffSqrt;

        for (var i = 0; i <points.length; i++) {
            var point = points[i];
            if ("size" in point) {
                point.size = Math.round(minPixelSize + Math.sqrt(point.size - minSize) * sizeScale);
            } else {
                point.size = minPixelSize;
            }
        }
    }
}

function mapViewShowBubble(marker, group, popupRenderer, onFocus) {
    if (group.points.length == 1) {
        mapViewShowBubbleForSingleItem(marker, group.points[0].itemID, onFocus);
    } else {
        var ul = document.createElement("ul");
        var createItem = function(point) {
            var li = document.createElement("li");
            ul.appendChild(li);
            
            var a = document.createElement("a");
            a.href = "javascript:{}";
            a.innerHTML = point.itemName;
            a.onclick = function() { popupRenderer(a, point.itemID, point.itemName) };

            li.appendChild(a);
        };
        for (var i = 0; i < group.points.length; i++) {
            createItem(group.points[i]);
        }
        marker.openInfoWindow(ul);
    }
}

function mapViewShowBubbleForSingleItem(marker, itemID, onFocus) {
    var div = document.createElement("div");
    div.className = "item-lens-container";
    renderItem(
        itemID, 
        div, 
        function() { 
            marker.openInfoWindow(div); 
        },
        onFocus
    );
}
