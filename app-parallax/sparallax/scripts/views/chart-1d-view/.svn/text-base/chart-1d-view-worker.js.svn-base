function chart1DViewQuery(job, onDone) {
    var paths = [ job.valuePath ];
    if (job.hasColor) {
        paths.push(job.colorPath);
    }
    if (job.hasPointLabel) {
        paths.push(job.pointLabelPath);
    }
    
    var proxyPath = extractProxyPath(paths);
    var proxyValueNodeIterator = createForwardPathIterator(proxyPath);
    
    job.valuePath = removeProxyPath(job.valuePath, proxyPath);
    var valueNodeIterator = createForwardPathIterator(job.valuePath);
    
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
    if (proxyQueryNode != queryNode && job.valuePath.length > 0) {
        proxyQueryNode["name"] = null;
    }
    
    var valueQueryNode = extendQueryNodeWithPath(proxyQueryNode, job.valuePath);
    valueQueryNode["value"] = null;
    
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
        if (!("name" in colorQueryNode)) {
            colorQueryNode["name"] = null;
        }
        makeQueryNodeOptionalIfEmpty(colorQueryNode);
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
                value:      null,
                itemID:     itemNode.id,
                itemName:   itemNode.name
            };
            
            valueNodeIterator(proxyNode, function(node) { point.value = getValue(node); });
            if (point.value == null) {
                return;
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
        
        
        points.sort(function(a, b) {
            return b.value - a.value;
        });
        onDone(points);
    };
    
    JsonpQueue.queryOne([queryNode], gotRestrictedItems, genericErrorHandler);
};


function chart1DViewPlot(canvasDiv, points, colorCoder) {
    if (points.length == 0) {
        canvasDiv.innerHTML = "";
        return;
    }
    
    var rowHeight = 30;
    var labelWidth = 200;
    
    /*
     *  Create the canvas
     */
    
    var pixelHeight = rowHeight * points.length;
    canvasDiv.innerHTML = '<div style="position: relative; margin: 5px; margin-left: ' + labelWidth + 'px; height: ' + pixelHeight + 'px;"></div>';
    
    var layerContainerDiv = canvasDiv.firstChild;
    var pixelWidth = layerContainerDiv.offsetWidth;
    
    var createLayer = function() {
        var div = document.createElement("div");
        div.className = "chart1d-view-layer";
        div.innerHTML = '<div class="chart1d-view-layer-inner"></div>';
        layerContainerDiv.appendChild(div);
        return div.firstChild;
    };
    
    /*
     *  Figure out the min, max, and scale
     */
    var minValue = Number.POSITIVE_INFINITY;
    var maxValue = Number.NEGATIVE_INFINITY;
    for (var i = 0; i < points.length; i++) {
        var v = points[i].value;
        minValue = Math.min(minValue, v);
        maxValue = Math.max(maxValue, v); 
    }
    
    var xInterval = 1;
    var xDiff = maxValue - minValue;
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
    var xAxisMin = Math.floor(minValue / xInterval) * xInterval;
    var xAxisMax = Math.ceil(maxValue / xInterval) * xInterval;
    var xScale = pixelWidth / (xAxisMax - xAxisMin);
    
    /*
     *  Grid lines and axis labels
     */
    
    var gridLayer = createLayer();
    gridLayer.style.border = "1px solid #eee";
    
    for (var x = xAxisMin; x < xAxisMax; x += xInterval) {
        var left = Math.floor((x - xAxisMin) * xScale);
        
        var divLine = document.createElement("div");
        divLine.className = "chart1d-view-vertical-grid-line";
        divLine.style.left = left + "px";
        gridLayer.appendChild(divLine);
        
        var xLabel = x;
        if (x > 1e9) {
            xLabel = (Math.floor(x / 1e8) / 10) + "B";
        } else if (x > 1e6) {
            xLabel = (Math.floor(x / 1e5) / 10) + "M";
        } else if (x > 1e3) {
            xLabel = (Math.floor(x / 1e2) / 10) + "K";
        } else if (x > 1) {
            xLabel = x;
        } else if (x > 1e-3) {
            xLabel = (Math.floor(x / 1e-4) / 10) + "m";
        } else if (x > 1e-6) {
            xLabel = (Math.floor(x / 1e-7) / 10) + "u";
        }
        
        var divLabel = document.createElement("div");
        divLabel.className = "chart1d-view-vertical-grid-label";
        divLabel.style.left = left + "px";
        divLabel.style.top = (pixelHeight + 5) + "px";
        divLabel.innerHTML = xLabel;
        gridLayer.appendChild(divLabel);
    }
    
    /*
     *  Data labels and points
     */
    var labelLayer = createLayer();
    var pointLabelLayer = createLayer();
    var pointLayer = createLayer();
    var plotPoint = function(point, top) {
        var divLabel = document.createElement("div");
        divLabel.className = "chart1d-view-vertical-data-label";
        divLabel.style.top = top + "px";
        divLabel.style.left = -labelWidth + "px";
        divLabel.style.width = labelWidth + "px";
        divLabel.style.height = rowHeight + "px";
        divLabel.innerHTML = '<div style="padding-right: 5px;">' + point.itemName + '</div>';
        labelLayer.appendChild(divLabel);
        
        var tooltip = point.itemName != null ? point.itemName : "";
        if ("proxyLabel" in point && point.proxyLabel != null) {
            tooltip += " (" + point.proxyLabel + ")";
        }
        if (tooltip.length > 0) {
            tooltip += ": ";
        }
        tooltip += formatNumberWithSeparators(point.value);
        
        var left = Math.floor((point.value - xAxisMin) * xScale);
        var color = ("color" in point) ? point.color : colorCoder.getDefaultColor();
        var radius = 7;
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
        img.className = "chart1d-view-data-point";
        img.style.top = (top + Math.floor(rowHeight / 2) - radius) + "px";
        img.style.left = (left - radius) + "px";
        img.title = tooltip;
        pointLayer.appendChild(img);
        
        if ("proxyLabel" in point && point.proxyLabel != null) {
            var divPointLabel = document.createElement("div");
            divPointLabel.style.top = (top + Math.floor(rowHeight / 2) - radius) + "px";
            if (left > pixelWidth / 2) {
                divPointLabel.className = "chart1d-view-vertical-data-point-label-left";
                divPointLabel.style.right = (pixelWidth - left + radius + 2) + "px";
            } else {
                divPointLabel.className = "chart1d-view-vertical-data-point-label-right";
                divPointLabel.style.left = (left + radius + 2) + "px";
            }
            divPointLabel.innerHTML = point.proxyLabel;
            pointLabelLayer.appendChild(divPointLabel);
        }
    };
    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        var top = i * rowHeight;
        plotPoint(point, top);
    }
};
