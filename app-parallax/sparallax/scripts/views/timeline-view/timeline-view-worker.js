function timelineViewQuery(job, onDone) {
    var paths = [ job.startPath ];
    if (job.hasEnd) {
        paths.push(job.endPath);
    }
    if (job.hasLabel) {
        paths.push(job.labelPath);
    }
    if (job.hasColor) {
        paths.push(job.colorPath);
    }
    
    var proxyPath = extractProxyPath(paths);
    var proxyValueNodeIterator = createForwardPathIterator(proxyPath);

    job.startPath = removeProxyPath(job.startPath, proxyPath);
    var startNodeIterator = createForwardPathIterator(job.startPath);
    
    if (job.hasEnd) {
        job.endPath = removeProxyPath(job.endPath, proxyPath);
        var endNodeIterator = createForwardPathIterator(job.endPath);
    }
    if (job.hasLabel) {
        job.labelPath = removeProxyPath(job.labelPath, proxyPath);
        var labelNodeIterator = createForwardPathIterator(job.labelPath);
    }
    if (job.hasColor) {
        job.colorPath = removeProxyPath(job.colorPath, proxyPath);
        var colorNodeIterator = createForwardPathIterator(job.colorPath);
    }
    
    var queryNode = job.queryNode;
	queryNode["limit"] = 1000;
	
    var proxyQueryNode = extendQueryNodeWithPath(queryNode, proxyPath);
    if (proxyQueryNode != queryNode && job.startPath.length > 0) {
        proxyQueryNode["name"] = null;
    }
    
    var startQueryNode = extendQueryNodeWithPath(proxyQueryNode, job.startPath);
    if (!("value" in startQueryNode)) {
        startQueryNode["value"] = null;
    }
    
    if (job.hasEnd) {
        var endQueryNode = extendQueryNodeWithPath(proxyQueryNode, job.endPath);
        makeQueryNodeOptionalIfEmpty(endQueryNode);
        if (!("value" in endQueryNode)) {
            endQueryNode["value"] = null;
        }
    }
    if (job.hasLabel) {
        var labelQueryNode = extendQueryNodeWithPath(proxyQueryNode, job.labelPath);
        if (!("name" in labelQueryNode)) {
            labelQueryNode["name"] = null;
        }
        if (!("id" in labelQueryNode)) {
            labelQueryNode["id"] = null;
        }
        makeQueryNodeOptionalIfEmpty(labelQueryNode);
    }
    if (job.hasColor) {
        var colorQueryNode = extendQueryNodeWithPath(proxyQueryNode, job.colorPath);
        if (!("name" in colorQueryNode)) {
            colorQueryNode["name"] = null;
        }
        makeQueryNodeOptionalIfEmpty(colorQueryNode);
    }
    
    var gotRestrictedItems = function(o) {
        var points = [];
        var colorKeys = job.colorKeys;
        
        job.hasColorKeys = false;
        
        var getDate = function(node) {
            try {
                return SimileAjax.DateTime.parseIso8601DateTime(node.value);
            } catch (e) {}
            return null;
        };
        var processPoint = function(itemNode, proxyNode) {
            var point = {
                start:      null,
                end:        null,
                itemID:     itemNode.id,
                itemName:   itemNode.name
            };
            
            startNodeIterator(proxyNode, function(node) { point.start = getDate(node) });
            if (point.start == null) {
                return;
            }
            
            if (job.hasEnd) {
                endNodeIterator(proxyNode, function(node) { point.end = getDate(node) });
            }
            if (job.hasLabel) {
                labelNodeIterator(proxyNode, function(node) { point.itemID = node.id; point.itemName = node.name; });
            }
            if (job.hasColor) {
                var colorNode = null;
                colorNodeIterator(proxyNode,
                    function(node) {
                        colorNode = node;
                    }
                );
                if (colorNode != null) {
                    var key = colorNode.name;
                    var color = job.colorCoder.getColorForKey(key);
                    
                    colorKeys[key] = true;
                    job.hasColorKeys = true;
                    
                    point.color = color;
                }
            }
            
            points.push(point);
        };

        for (var i = 0; i < o.result.length; i++) {
            var itemNode = o.result[i];
            proxyValueNodeIterator(itemNode, function(proxyNode) { processPoint(itemNode, proxyNode); });
        }
        
        onDone(points);
    };
    JsonpQueue.queryOne([queryNode], gotRestrictedItems, genericErrorHandler);
};

function timelineViewFillEventSource(eventSource, points) {
    var events = [];
    var addEvent = function(point) {
        var color = "color" in point ? point.color : null;
        var evt = new Timeline.DefaultEventSource.Event(
            point.itemID,
            point.start,
            "end" in point ? point.end : null,
            null,
            null,
            !("end" in point), // is instant?
            point.itemName,
            "",     // description
            null,   // image url
            null,   // link url
            null,   // icon url
            color,
            color,
            null    // hover text
        );
        evt._itemID = point.itemID;

        events.push(evt);
    };
    for (var i = 0; i < points.length; i++) {
        addEvent(points[i]);
    }
    eventSource.addMany(events);
};

function timelineViewConstructTimeline(eventSource, div, onFocus) {
    var topBandPixelsPerUnit = 100;
    var bottomBandPixelsPerUnit = 100;
    
    var earliest = eventSource.getEarliestDate();
    var latest = eventSource.getLatestDate();
    
    var totalDuration = latest.getTime() - earliest.getTime();
    var totalEventCount = eventSource.getCount();
    if (totalDuration > 0 && totalEventCount > 1) {
        var totalDensity = totalEventCount / totalDuration;
        
        var topIntervalUnit = Timeline.DateTime.MILLENNIUM;
        while (topIntervalUnit > 0) {
            var intervalDuration = Timeline.DateTime.gregorianUnitLengths[topIntervalUnit];
            var eventsPerPixel = totalDensity * intervalDuration / topBandPixelsPerUnit;
            if (eventsPerPixel < 0.1) {
                break;
            }
            topIntervalUnit--;
        }
    } else {
        topIntervalUnit = Timeline.DateTime.YEAR;
    }
    bottomIntervalUnit = topIntervalUnit + 1;
    
    var theme = Timeline.ClassicTheme.create();
    theme.event.bubble.width = 400;
    var bandInfos = [
        Timeline.createBandInfo({
            width:          "90%", 
            intervalUnit:   topIntervalUnit, 
            intervalPixels: topBandPixelsPerUnit,
            eventSource:    eventSource,
            date:           latest,
            theme:          theme
        }),
        Timeline.createBandInfo({
            width:          "10%", 
            intervalUnit:   bottomIntervalUnit, 
            intervalPixels: bottomBandPixelsPerUnit,
            eventSource:    eventSource,
            overview:       true,
            date:           latest,
            theme:          theme
        })
    ];
    bandInfos[1].syncWith = 0;
    bandInfos[1].highlight = true;

    var timeline = Timeline.create(div, bandInfos, Timeline.HORIZONTAL);
    timeline.getBand(0).getEventPainter()._showBubble =
    timeline.getBand(1).getEventPainter()._showBubble = function(x, y, evt) {
        var div = document.createElement("div");
        div.innerHTML = '<div class="timeline-view-bubble-content"></div>';
        
        var width = this._params.theme.event.bubble.width;
        renderItem(evt._itemID, div.firstChild, 
            function() { 
                SimileAjax.WindowManager.cancelPopups();
                SimileAjax.Graphics.createBubbleForContentAndPoint(div, x, y, width);
            },
            function(itemID, name) {
                onFocus(itemID, name);
            }
        );
    };
    
    return timeline;
};
