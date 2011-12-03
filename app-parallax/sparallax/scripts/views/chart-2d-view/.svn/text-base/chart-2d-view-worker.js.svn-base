function chart2DViewQuery(job, onDone) {
    var paths = [ job.xValuePath, job.yValuePath ];
    if (job.hasSize) {
        paths.push(job.sizePath);
    }
    if (job.hasColor) {
        paths.push(job.colorPath);
    }
    if (job.hasPointLabel) {
        paths.push(job.pointLabelPath);
    }
    
    var proxyPath = extractProxyPath(paths);
    var proxyValueNodeIterator = createForwardPathIterator(proxyPath);
    
    job.xValuePath = removeProxyPath(job.xValuePath, proxyPath);
    var xValueNodeIterator = createForwardPathIterator(job.xValuePath);
    
    job.yValuePath = removeProxyPath(job.yValuePath, proxyPath);
    var yValueNodeIterator = createForwardPathIterator(job.yValuePath);
    
    if (job.hasSize) {
        job.sizePath = removeProxyPath(job.sizePath, proxyPath);
        var sizeValueNodeIterator = createForwardPathIterator(job.sizePath);
    }
    if (job.hasColor) {
        job.colorPath = removeProxyPath(job.colorPath, proxyPath);
        var colorNodeIterator = createForwardPathIterator(job.colorPath);
    }
    if (job.hasPointLabel) {
        job.pointLabelPath = removeProxyPath(job.pointLabelPath, proxyPath);
        var pointLabelNodeIterator = createForwardPathIterator(job.pointLabelPath);
    }
    
    var queryNode = job.queryNode;
	queryNode["limit"] = 1000;
	
    var proxyQueryNode = extendQueryNodeWithPath(queryNode, proxyPath);
    
    var xValueQueryNode = extendQueryNodeWithPath(proxyQueryNode, job.xValuePath);
    xValueQueryNode["value"] = null;
    
    var yValueQueryNode = extendQueryNodeWithPath(proxyQueryNode, job.yValuePath);
    yValueQueryNode["value"] = null;
    
    if (job.hasSize) {
        var sizeQueryNode = extendQueryNodeWithPath(proxyQueryNode, job.sizePath);
        sizeQueryNode["value"] = null;
    }
    if (job.hasPointLabel) {
        var pointLabelQueryNode = extendQueryNodeWithPath(proxyQueryNode, job.pointLabelPath);
        if (job.pointLabelTypeIsNative) {
            if (!("value" in pointLabelQueryNode)) {
                pointLabelQueryNode["value"] = null;
            }
        } else {
            if (!("name" in pointLabelQueryNode)) {
                pointLabelQueryNode["name"] = null;
            }
        }
    }
    if (job.hasColor) {
        var colorQueryNode = extendQueryNodeWithPath(proxyQueryNode, job.colorPath);
        makeQueryNodeOptionalIfEmpty(colorQueryNode);
        if (!("name" in colorQueryNode)) {
            colorQueryNode["name"] = null;
        }
    }
    
    var gotRestrictedItems = function(o) {
        var points = [];
        var colorKeys = job.colorKeys;
        
        job.hasColorKeys = false;
        var getValue = function(node) {
            var n = node.value;
            if (typeof n == "string") {
                try {
                    n = parseFloat(n);
                } catch (e) {}
            }
            if (typeof n == "number" && !isNaN(n)) {
                return n;
            } else {
                return null;
            }
        };
        var processPoint = function(itemNode, proxyNode) {
            var point = {
                itemID:     itemNode.id,
                itemName:   itemNode.name,
                x:          null,
                y:          null,
                size:       null
            };
            
            xValueNodeIterator(proxyNode, function(node) { point.x = getValue(node); });
            yValueNodeIterator(proxyNode, function(node) { point.y = getValue(node); });
            if (point.x == null || point.y == null) {
                return;
            }
            
            if (job.hasSize) {
                sizeValueNodeIterator(proxyNode, function(node) { point.size = getValue(node); });
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
            if (job.hasPointLabel) {
                pointLabelNodeIterator(proxyNode,
                    function(node) {
                        if (node.name != null) {
                            point.proxyLabel = node.name;
                        } else if (node.value != null) {
                            point.proxyLabel = node.value;
                        }
                    }
                );
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


function chart2DViewPlot(canvasDiv, points, colorCoder, pixelHeight, labelXAxis, labelYAxis) {
    if (points.length == 0) {
        canvasDiv.innerHTML = "";
        return;
    }
    
    var leftAxisLabelWidth = 150;
    
    /*
     *  Create the canvas
     */
    canvasDiv.innerHTML = '<div style="position: relative; margin: 5px; margin-left: ' + leftAxisLabelWidth + 'px; height: ' + pixelHeight + 'px;"></div>';
    
    var layerContainerDiv = canvasDiv.firstChild;
    var pixelWidth = layerContainerDiv.offsetWidth;
    
    var createLayer = function() {
        var div = document.createElement("div");
        div.className = "chart2d-view-layer";
        div.innerHTML = '<div class="chart2d-view-layer-inner"></div>';
        layerContainerDiv.appendChild(div);
        return div.firstChild;
    };
    
    /*
     *  Figure out the min, max, and scale
     */
    var minXValue = Number.POSITIVE_INFINITY;
    var maxXValue = Number.NEGATIVE_INFINITY;
    var minYValue = Number.POSITIVE_INFINITY;
    var maxYValue = Number.NEGATIVE_INFINITY;
    var minSizeValue = Number.POSITIVE_INFINITY;
    var maxSizeValue = Number.NEGATIVE_INFINITY;
    var sizeCoding = false;
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var x = p.x;
        var y = p.y;
        minXValue = Math.min(minXValue, x);
        maxXValue = Math.max(maxXValue, x); 
        minYValue = Math.min(minYValue, y);
        maxYValue = Math.max(maxYValue, y); 
        
        if (p.size != null) {
            sizeCoding = true;
            
            var s = p.size;
            minSizeValue = Math.min(minSizeValue, s);
            maxSizeValue = Math.max(maxSizeValue, s); 
        }
    }
    
    var xInterval = 1;
    var xDiff = maxXValue - minXValue;
    if (xDiff > 1) {
        while (xInterval * 20 < xDiff) {
            xInterval *= 10;
        }
        if (xDiff / xInterval < 4) {
            xInterval /= 2;
        }
    } else {
        while (xInterval < xDiff * 20) {
            xInterval /= 10;
        }
        if (xDiff / xInterval < 4) {
            xInterval /= 2;
        }
    }
    var xAxisMin = Math.floor(minXValue / xInterval) * xInterval;
    var xAxisMax = Math.ceil(maxXValue / xInterval) * xInterval;
    var xScale = pixelWidth / (xAxisMax - xAxisMin);
    
    var yInterval = 1;
    var yDiff = maxYValue - minYValue;
    if (yDiff > 1) {
        while (yInterval * 20 < yDiff) {
            yInterval *= 10;
        }
        if (yDiff / yInterval < 4) {
            yInterval /= 2;
        }
    } else {
        while (yInterval < yDiff * 20) {
            yInterval /= 10;
        }
        if (yDiff / yInterval < 4) {
            yInterval /= 2;
        }
    }
    var yAxisMin = Math.floor(minYValue / yInterval) * yInterval;
    var yAxisMax = Math.ceil(maxYValue / yInterval) * yInterval;
    var yScale = pixelHeight / (yAxisMax - yAxisMin);
    
    var largestRadius = 50;
    var smallestRadius = 5;
    if (sizeCoding) {
        var sizeDiff = maxSizeValue - minSizeValue;
        var sizeDiffSqrt = Math.sqrt(sizeDiff);
        var sizeScale = (largestRadius - smallestRadius) / sizeDiffSqrt;
    }
    
    /*
     *  Grid lines and axis labels
     */
    
    var gridLayer = createLayer();
    gridLayer.style.border = "1px solid #eee";
    
    for (var x = xAxisMin + xInterval; x < xAxisMax; x += xInterval) {
        var left = Math.floor((x - xAxisMin) * xScale);
        
        var divLine = document.createElement("div");
        divLine.className = "chart2d-view-vertical-grid-line";
        divLine.style.left = left + "px";
        gridLayer.appendChild(divLine);
        
        var xLabel = formatNumberWithSuffix(x);
        var divLabel = document.createElement("div");
        divLabel.className = "chart2d-view-vertical-grid-label";
        divLabel.style.left = left + "px";
        divLabel.style.top = (pixelHeight + 5) + "px";
        divLabel.innerHTML = xLabel;
        gridLayer.appendChild(divLabel);
    }
    
    for (var y = yAxisMin + yInterval; y < yAxisMax; y += yInterval) {
        var top = pixelHeight - Math.floor((y - yAxisMin) * yScale);
        
        var divLine = document.createElement("div");
        divLine.className = "chart2d-view-horizontal-grid-line";
        divLine.style.top = top + "px";
        gridLayer.appendChild(divLine);
        
        var yLabel = formatNumberWithSuffix(y);
        
        var divLabel = document.createElement("div");
        divLabel.className = "chart2d-view-horizontal-grid-label";
        divLabel.style.top = top + "px";
        divLabel.style.right = (pixelWidth + 5) + "px";
        divLabel.innerHTML = yLabel;
        gridLayer.appendChild(divLabel);
    }
    
    labelXAxis(function(xAxisLabel) {
        var divXAxisLabel = document.createElement("div");
        divXAxisLabel.className = "chart2d-view-horizontal-axis-label";
        divXAxisLabel.style.top = pixelHeight + "px";
        divXAxisLabel.style.right = "0px";
        divXAxisLabel.innerHTML = xAxisLabel;
        gridLayer.appendChild(divXAxisLabel);
    });
    labelYAxis(function(yAxisLabel) {
        var divYAxisLabel = document.createElement("div");
        divYAxisLabel.className = "chart2d-view-vertical-axis-label";
        divYAxisLabel.style.top = "0px";
        divYAxisLabel.style.right = (pixelWidth + 5) + "px";
        divYAxisLabel.innerHTML = yAxisLabel;
        gridLayer.appendChild(divYAxisLabel);
    });
    
    /*
     *  Data labels and points
     */
    var labelLayer = createLayer();
    var pointLabelLayer = createLayer();
    var pointLayer = createLayer();
    var plotPoint = function(point, top) {
        var left = Math.floor((point.x - xAxisMin) * xScale);
        var top = pixelHeight - Math.floor((point.y - yAxisMin) * yScale);
        
        var tooltip = point.itemName != null ? point.itemName : "";
        if ("proxyLabel" in point && point.proxyLabel != null) {
            tooltip += " (" + point.proxyLabel + ")";
        }
        if (tooltip.length > 0) {
            tooltip += ": ";
        }
        tooltip += formatNumberWithSeparators(point.x) + " x " + formatNumberWithSeparators(point.y);
        
        var color = ("color" in point) ? point.color : colorCoder.getDefaultColor();
        var radius = 7;
        if (sizeCoding && point.size != null) {
            radius = Math.round(smallestRadius + Math.sqrt(point.size - minSizeValue) * sizeScale);
        }
        var dia = radius * 2;
        var img = SimileAjax.Graphics.createTranslucentImage(
            "http://simile.mit.edu/painter/painter?" + [
                "renderer=map-marker",
                "pin=false",
                "borderThickness=1",
                "borderColor=" + color.substr(1),
                "shape=circle",
                "width=" + dia,
                "height=" + dia,
                "background=" + color.substr(1)
            ].join("&"),
            "middle"
        );
        img.className = "chart2d-view-data-point";
        img.style.top = (top - radius) + "px";
        img.style.left = (left - radius) + "px";
        img.title = tooltip;
        pointLayer.appendChild(img);
        
        if ("proxyLabel" in point && point.proxyLabel != null) {
            var divPointLabel = document.createElement("div");
            divPointLabel.style.top = top + "px";
            if (left > pixelWidth / 2) {
                divPointLabel.className = "chart2d-view-data-point-label-left";
                divPointLabel.style.right = (pixelWidth - left + radius + 2) + "px";
            } else {
                divPointLabel.className = "chart2d-view-data-point-label-right";
                divPointLabel.style.left = (left + radius + 2) + "px";
            }
            divPointLabel.innerHTML = point.proxyLabel;
            pointLabelLayer.appendChild(divPointLabel);
        }
    };
    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        plotPoint(point);
    }
};
