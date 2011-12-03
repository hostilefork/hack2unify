function mapViewQuery(job, onDone) {
    job.locationPath.push({ property: "/location/location/geolocation", forward: true });
    
    var paths = [ job.locationPath ];
    if (job.hasColor) {
        paths.push(job.colorPath);
    }
    if (job.hasSize) {
        paths.push(job.sizePath);
    }
    if (job.hasImage) {
        paths.push(job.imagePath);
    }
    
    var proxyPath = extractProxyPath(paths);
    var proxyValueNodeIterator = createForwardPathIterator(proxyPath);

    job.locationPath = removeProxyPath(job.locationPath, proxyPath);
    var locationNodeIterator = createForwardPathIterator(job.locationPath);
    
    if (job.hasColor) {
        job.colorPath = removeProxyPath(job.colorPath, proxyPath);
        var colorNodeIterator = createForwardPathIterator(job.colorPath);
    }
    if (job.hasSize) {
        job.sizePath = removeProxyPath(job.sizePath, proxyPath);
        var sizeNodeIterator = createForwardPathIterator(job.sizePath);
    }
    if (job.hasImage) {
        job.imagePath = removeProxyPath(job.imagePath, proxyPath);
        var imageNodeIterator = createForwardPathIterator(job.imagePath);
    }
    
    var queryNode = job.queryNode;
	queryNode["limit"] = 1000;
    
    var proxyQueryNode = extendQueryNodeWithPath(queryNode, proxyPath);
    if (proxyQueryNode != queryNode && job.locationPath.length > 0) {
        proxyQueryNode["name"] = null;
    }
    
    var locationQueryNode = extendQueryNodeWithPath(proxyQueryNode, job.locationPath);
    locationQueryNode["/location/geocode/latitude"] = null;
    locationQueryNode["/location/geocode/longitude"] = null;
    
    if (job.hasColor) {
        var colorQueryNode = extendQueryNodeWithPath(proxyQueryNode, job.colorPath);
        if (!("name" in colorQueryNode)) {
            colorQueryNode["name"] = null;
        }
        makeQueryNodeOptionalIfEmpty(colorQueryNode);
    }
    if (job.hasSize) {
        var sizeQueryNode = extendQueryNodeWithPath(proxyQueryNode, job.sizePath);
        makeQueryNodeOptionalIfEmpty(sizeQueryNode);
        if (!("value" in sizeQueryNode)) {
            sizeQueryNode["value"] = null;
        }
    }
    if (job.hasImage) {
        var imageQueryNode = extendQueryNodeWithPath(proxyQueryNode, job.imagePath);
        makeQueryNodeOptionalIfEmpty(imageQueryNode);

        if (!("/common/topic/image" in imageQueryNode)) {
            imageQueryNode["/common/topic/image"]  = [{ "id" : null, "limit" : 1, "optional" : true }];
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
                lat:        null,
                lng:        null,
                itemID:     itemNode.id,
                itemName:   itemNode.name
            };
            
            locationNodeIterator(proxyNode, function(node) { 
                point.lat = node["/location/geocode/latitude"]; 
                point.lng = node["/location/geocode/longitude"]; 
            });
            if (point.lat == null || point.lng == null) {
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
            if (job.hasSize) {
                sizeNodeIterator(proxyNode, function(node) { point.size = getValue(node); });
            }
            if (job.hasImage) {
                imageNodeIterator(proxyNode, function(node) { 
                    if ("/common/topic/image" in node) {
                        var a = node["/common/topic/image"];
                        if (a != null && a.length > 0) {
                            var node2 = a[0];
                            if ("id" in node2 && typeof node2.id == "string") {
                                point.image = ParallaxConfig.corpusBaseUrl + "api/trans/image_thumb" + node2.id +
                                    "?" + [ 
                                        "mode=fillcrop",
                                        "maxheight=100",
                                        "maxwidth=100"
                                    ].join("&");
                            }
                        }
                    }
                });
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
}
