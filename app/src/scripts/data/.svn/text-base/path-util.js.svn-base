function forwardPathSegment(pathNode) {
    return (pathNode.forward) ? pathNode.property : ("!" + pathNode.property);
};

function backwardPathSegment(pathNode) {
    return (!pathNode.forward) ? pathNode.property : ("!" + pathNode.property);
};

function pathToString(path) {
    var s = [];
    for (var i = 0; i < path.length; i++) {
        var pathNode = path[i];
        s.push((pathNode.forward ? "." : "!") + pathNode.property);
    }
    return s.join("");
};

function compressPath(path) {
    var p = [];
    for (var i = 0; i < path.length; i++) {
        var pathNode = path[i];
        p.push({ p: pathNode.property, f: pathNode.forward });
    }
    return p;
};

function decompressPath(path) {
    var p = [];
    for (var i = 0; i < path.length; i++) {
        var pathNode = path[i];
        p.push({ property: pathNode.p, forward: pathNode.f });
    }
    return p;
};

function createForwardPathIterator(path) {
    var forwardSegments = [];
    for (var i = 0; i < path.length; i++) {
        var pathNode = path[i];
        forwardSegments.push(forwardPathSegment(pathNode));
    }
    
    var getNodesAt = function(r, index, f) {
        if (index < forwardSegments.length) {
            var propertyID = forwardSegments[index];
            if (propertyID in r) {
                var a = r[propertyID];
                for (var i = 0; i < a.length; i++) {
                    getNodesAt(a[i], index + 1, f);
                }
            }
        } else {
            f(r);
        }
    };
    
    return function(r, f) {
        getNodesAt(r, 0, f);
    };
};

function extendQueryNodeWithPath(queryNode, path, optional) {
    if (optional == undefined) {
        optional = true;
    }
    
    for (var i = 0; i < path.length; i++) {
        var pathNode = path[i];
        var segment = forwardPathSegment(pathNode);
        
        var newQueryNode;
        if (segment in queryNode) {
            newQueryNode = queryNode[segment][0];
            if ("return" in newQueryNode) {
                delete newQueryNode["return"];
            }
        } else {
            newQueryNode = {};
            if (optional) {
                newQueryNode["optional"] = true;
            }
            
            queryNode[segment] = [newQueryNode];
        }
        queryNode = newQueryNode;
    }
    return queryNode;
};

function extractProxyPath(paths) {
    var proxy = [];
    var i = 0;
    while (true) {
        var longEnough = true;
        for (var p = 0; p < paths.length; p++) {
            if (i >= paths[p].length) {
                longEnough = false;
                break;
            }
        }
        
        if (!longEnough) {
            break;
        }
        
        var propertyID = paths[0][i].property;
        var forward = paths[0][i].forward;
        var same = true;
        for (var p = 1; p < paths.length; p++) {
            var segment = paths[p][i];
            if (segment.property != propertyID || segment.forward != forward) {
                same = false;
                break;
            }
        }
        
        if (same) {
            proxy.push({ property: propertyID, forward: forward });
        } else {
            break;
        }
        
        i++;
    }
    return proxy;
};

function removeProxyPath(path, proxyPath) {
    var i = 0;
    for (; i < path.length && i < proxyPath.length; i++) {
        if (path[i].property != proxyPath[i].property ||
            path[i].forward != proxyPath[i].forward) {
            break;
        }
    }
    return path.slice(i);
};

function makeQueryNodeOptionalIfEmpty(queryNode) {
    var hasProperties = false;
    for (var n in queryNode) {
        if (queryNode.hasOwnProperty(n)) {
            hasProperties = true;
            break;
        }
    }
    if (!hasProperties) {
        queryNode["optional"] = true;
    }
};