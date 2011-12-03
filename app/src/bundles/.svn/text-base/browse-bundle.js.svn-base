var exploreWidget;
var trailPoints = [];
var trailPointIndex = -1;
var debug = false;
var showExplanation = false;

var log = (window.console) ? function(s) { window.console.log(s); } : /*window.alert*/ function() {};
function genericErrorHandler(s, query) {
	if (typeof query == "object") {
		log(s + ": " + JSON.stringify(query));
	} else {
		log(s);
	}
}

function onLoad() {
    var historyIndex;
    SimileAjax.WindowManager.initialize();
    SimileAjax.History.initialize();
    SimileAjax.History.addListener({
        onBeforeUndoSeveral: function() {
            historyIndex = SimileAjax.History._currentIndex;
        },
        onAfterUndoSeveral: function() {
            var diff = SimileAjax.History._currentIndex - historyIndex;
            if (diff != 0) Logging.log("undo", diff);
        },
        onBeforeRedoSeveral: function() {
            historyIndex = SimileAjax.History._currentIndex;
        },
        onAfterRedoSeveral: function() {
            var diff = SimileAjax.History._currentIndex - historyIndex;
            if (diff != 0) Logging.log("redo", diff);
        }
    });
    
    Logging.log("init", {
        os:         SimileAjax.Platform.os,
        browser:    SimileAjax.Platform.browser
    });

    var exploreInput = document.getElementById("explore-input");
    exploreWidget = ParallaxSearchWidget.create(exploreInput, exploreQueryHandler);
    
    var params = parseURLParameters(document.location.href);
    if ("state" in params) {
        var state = null;
        try {
            state = window.rison.decode(params["state"]);
        } catch (e) {}
        
        if (state != null) {
            Logging.log("browse-old-state", state);
            
            playback(state);
            return;
        }
    }
    
    if ("id" in params) {
        var id = params["id"];
        var label = "label" in params ? params["label"] : id;
        
        Logging.log("browse-new-state", { "id" : id });
        onNewTopic(id, label);
    } else {
        var typeID = params["type"];
        var search = "search" in params ? params["search"] : null;
        
        Logging.log("browse-new-state", { "typeID" : typeID, "search" : search });
        onNewCollection(
            new Collection(
                new RootTypeCollectionDefinition(
                    typeID,
                    search
                )
            )
        );
    }
}

function exploreQueryHandler(query) {
    Logging.log("browse-change-state", query);
    
    var collectionDefinition;
    if ("id" in query) {
        collectionDefinition = new SingleTopicCollectionDefinition(query.id, query.label);
    } else {
        collectionDefinition = new RootTypeCollectionDefinition(
            query.typeID,
            "search" in query ? query.search : null
        );
    }
    var collection = new Collection(collectionDefinition);
    var trailPoint = new TrailPoint(collection);
    
    exploreWidget.hide();
    
    var oldTrailPoints = [].concat(trailPoints);
    var oldTrailPointIndex = trailPointIndex;
    var newTrailPoints = [ trailPoint ];
    SimileAjax.History.addLengthyAction(
        function() { 
            internalSwitchCollection(newTrailPoints, 0, {});
        },
        function() { 
            internalSwitchCollection(oldTrailPoints, oldTrailPointIndex, {});
        },
        "New search"
    );
}

function getHistoryPane() {
    return document.getElementById("history-pane");
}

function getViewPane() {
    return document.getElementById("view-pane");
}

function getViewSelectorPane() {
    return document.getElementById("view-selector-pane");
}

function getFacetPane() {
    return document.getElementById("facet-pane");
}

function getPivotPane() {
    return document.getElementById("pivot-pane");
}

function getResultsSummaryContainer() {
    return document.getElementById("results-summary-container");
}

function getResultsViewContainer() {
    return document.getElementById("results-view-container");
}

function onNewCollection(collection) {
    showExplanation = trailPoints.length > 0 && !trailPoints[trailPointIndex].collection.isSingular() && !collection.isSingular();
    
    internalNewCollection(collection, "Pivot", {
        fadeIn:     trailPoints.length == 1,
        animate:    trailPointIndex == trailPoints.length - 1
    });
}

function onNewTopic(itemID, label) {
    internalNewCollection(new Collection(new SingleTopicCollectionDefinition(itemID, label)), "Focus", {
        fadeIn:     trailPoints.length == 1,
        animate:    trailPointIndex == trailPoints.length - 1
    });
}

function switchCollection(index) {
    var oldTrailPointIndex = trailPointIndex;
    SimileAjax.History.addLengthyAction(
        function() { 
            internalSwitchCollection(trailPoints, index, {});
        },
        function() { 
            internalSwitchCollection(trailPoints, oldTrailPointIndex, {});
        },
        "Switch collection"
    );
};

function internalNewCollection(collection, label, config) {
    var trailPoint = new TrailPoint(collection);
    if (trailPoints.length > 0) {
        var oldTrailPoints = [].concat(trailPoints);
        var oldTrailPointIndex = trailPointIndex;
        
        var newTrailPointIndex = trailPointIndex + 1;
        var newTrailPoints = trailPoints.slice(0, newTrailPointIndex);
        newTrailPoints.push(trailPoint);
        
        SimileAjax.History.addLengthyAction(
            function() { 
                internalSwitchCollection(newTrailPoints, newTrailPointIndex, config);
            },
            function() { 
                internalSwitchCollection(oldTrailPoints, oldTrailPointIndex, {});
            },
            label
        );
    } else {
        internalSwitchCollection([ trailPoint ], 0, {});
    }
};

function internalSwitchCollection(newTrailPoints, newTrailPointIndex, config) {
    if (trailPointIndex >= 0) {
        trailPoints[trailPointIndex].uninstallUI();
    }
    
    JsonpQueue.cancelAll();
    
    trailPoints = newTrailPoints;
    trailPointIndex = newTrailPointIndex;
    trailPoints[trailPointIndex].installUI();
    
    renderHistory(config);
};

function renderHistory(config) {
    var div = getHistoryPane();
    div.innerHTML = "";
    
    if (trailPoints.length < 2) {
        return;
    }
    
    var fadeIn = "fadeIn" in config ? config.fadeIn : false;
    var animate = "animate" in config ? config.animate : false;
    
    var max = Math.min(trailPoints.length - 1, trailPointIndex + 2);
    var min = Math.max(0, max - 4);
    
    if (min > 0) {
        var span = document.createElement("span");
        span.innerHTML = "&bull;&bull;&bull; ";
        div.appendChild(span);
    }
    
    var spanBefore = document.createElement("span");
    spanBefore.style.visibility = "hidden";
    div.appendChild(spanBefore);
    
    var spanAfter = document.createElement("span");
    spanAfter.style.visibility = "hidden";
    div.appendChild(spanAfter);
    
    var createHistoryBlock = function(index, container) {
        var isCurrent = (index == trailPointIndex);
        
        var collection = trailPoints[index].collection;
        var label = collection.getLabel();
        if (index < trailPointIndex && !collection.isSingular()) {
            var countLabel = collection.getCountLabel();
            if (countLabel != null) {
                label += " (" + countLabel + ")";
            }
        }
        
        var span = document.getElementById("history-block-template").cloneNode(true);
        span.className = isCurrent ? "history-entry history-entry-selected" : "history-entry";
        span.innerHTML = label;
        span.style.display = "inline";
        if (!isCurrent) {
            span.onclick = function() {
                Logging.log("trail-point-select", index);
                switchCollection(index);
            };
        }
        container.appendChild(span);
    };
    for (var i = min; i <= max; i++) {
        createHistoryBlock(i, i < trailPointIndex ? spanBefore : spanAfter);
    }
    
    if (max < trailPoints.length - 1) {
        var span = document.createElement("span");
        span.innerHTML = " &bull;&bull;&bull;";
        spanAfter.appendChild(span);
    }
    
    if (animate) {
        var width = spanAfter.offsetWidth + 10; // 10 is left + right margins
        var end = 200;
        var start = end - width;
        div.style.paddingRight = start + "px";
        
        SimileAjax.Graphics.createAnimation(
            function(current, step) {
                div.style.paddingRight = current + "px";
            }, 
            start, 
            end, 
            1000, 
            function() {
                if (showExplanation) {
                    showExplanation = false;
                    showPivotingExplanation(spanAfter);
                }
            }
        ).run();
    }
    spanAfter.style.visibility = "visible";
    
    if (fadeIn) {
        $(spanBefore).fadeIn("slow");
    }
    spanBefore.style.visibility = "visible";
}

function clone(o) {
    if (o instanceof Array) {
        var a = [];
        for (var i = 0; i < o.length; i++) {
            a.push(clone(o[i]));
        }
        return a;
    } else if (typeof o == "object") {
        var o2 = {};
        for (var n in o) {
            if (o.hasOwnProperty(n)) {
                o2[n] = clone(o[n]);
            }
        }
        return o2;
    } else {
        return o;
    }
}

function toggleDebug() {
    debug = !debug;
    document.getElementById("debug-toggle").innerHTML = debug ? "deactivate" : "activate";
    trailPoints[trailPointIndex].onModeChanged("debug");
}

function getMode(mode) {
    if (mode == "debug") {
        return debug;
    } else {
        return false;
    }
}

function showQuery(q) {
    var url = ParallaxConfig.corpusBaseUrl + "tools/queryeditor?q=" + JSON.stringify(q);
    window.open(url, "_blank");
}

function playback(stateArray) {
    var selectedIndex = stateArray.length - 1;
    var index = 0;
    var doNext = function() {
        try {
            if (index < stateArray.length) {
                var stateEntry = stateArray[index];
                
                if ("sel" in stateEntry && stateEntry.sel) {
                    selectedIndex = index;
                }
                
                var trailPoint = TrailPoint.reconstructFromState(
                    stateEntry, 
                    index == 0 ? null : trailPoints[index - 1].collection
                );
                trailPoints.push(trailPoint);
                
                index++;
                
                trailPoint.playback(stateEntry.s, doNext);
            } else {
                // That's it.
                internalSwitchCollection(trailPoints, selectedIndex, {});
            }
        } catch (e) {
            log(e);
        }
    };
    doNext();
}

function getState() {
    var state = [];
    try {
        var min = trailPointIndex;
        while (min > 0 && !trailPoints[min].collection.isSingular()) {
            min--;
        }
        
        for (var i = min; i <= trailPointIndex; i++) {
            var stateEntry = trailPoints[i].getState();
            state.push(stateEntry);
        }
        return state;
    } catch (e) {
        log(e);
    }
}

function getPermanentLink() {
    var url = document.location.href;
    var q = url.indexOf("?");
    if (q > 0) {
        url = url.substr(0, q);
    }
    return window.ParallaxConfig.appendConfigParams(url + "?state=" + rison.encode(getState()).replace(/ /g, "%20"));
}

function showPermanentLink() {
    var url = getPermanentLink();
    
    Logging.log("show-permanent-link", url);
    
    window.prompt("Permanent link to copy:", url);
}

function showPivotingExplanation(elmt) {try {
    var cookieName = 'shown_pivoting_explanation';
    var shownPivotingExplanation = $.cookie(cookieName);
    if (shownPivotingExplanation != "true") {
        $.cookie(cookieName, "true");
        
        var explanation = document.getElementById("pivoting-explanation").cloneNode(true);
        explanation.id = null;
        
        var c = SimileAjax.DOM.getPageCoordinates(elmt);
        
        SimileAjax.Graphics.createBubbleForContentAndPoint(
            explanation, 
            c.left + Math.ceil(elmt.offsetWidth / 2), 
            c.top + Math.ceil(elmt.offsetHeight / 2)
        );
    }} catch (e) { log(e); }
}
(function() {
    window.ParallaxConfig = {
        sandbox:        false,
        corpusBaseUrl:  "http://www.freebase.com/",
        appBaseUrl:     "freebaseapps.com/",
        appendConfigParams: function(url) { return url; }
    };
    
    var url = window.location.href;
    if (url.indexOf("-sandbox/") >= 0 || url.indexOf("sandbox=1") >= 0) {
        window.ParallaxConfig.sandbox = true;
        window.ParallaxConfig.corpusBaseUrl = "http://sandbox.freebase.com/";
        window.ParallaxConfig.appBaseUrl = "sandbox-freebaseapps.com/";
        
        if (url.indexOf("sandbox=1") >= 0) {
            window.ParallaxConfig.appendConfigParams = function(url) {
                if (url.indexOf("?") < 0) {
                    return url + "?sandbox=1";
                } else {
                    return url + "&sandbox=1";
                }
            };
        }
    }
})();function RootTypeCollectionDefinition(typeID, textSearch) {
    this._typeID = typeID;
    this._textSearch = (typeof textSearch == "string") ? textSearch : null;
    this._ownerCollection = null;
}

RootTypeCollectionDefinition.prototype.dispose = function() {
    this._ownerCollection = null;
};

RootTypeCollectionDefinition.prototype.getTypeID = function() {
    return this._typeID;
};

RootTypeCollectionDefinition.prototype.setOwnerCollection = function(collection) {
    this._ownerCollection = collection;
};

RootTypeCollectionDefinition.prototype.addRestrictions = function(queryNode) {
    queryNode["type"] = this._typeID;
    if (this._textSearch != null) {
        queryNode["name~="] = this._textSearch + "*";
    }
};

RootTypeCollectionDefinition.prototype.getLabel = function() {
    var typeRecord = SchemaUtil.typeRecords[this._typeID];
    return (typeof typeRecord == "object") ? typeRecord.name : this._typeID;
};

RootTypeCollectionDefinition.prototype.isSingular = function() {
    return false;
};

RootTypeCollectionDefinition.prototype.hasBaseCollection = function() {
    return false;
};

RootTypeCollectionDefinition.prototype.getState = function() {
    var r = {
        t: this._typeID
    };
    if (this._textSearch != null) {
        r.s = this._textSearch;
    }
    return r;
};

function PivotedCollectionDefinition(baseCollection, path, label) {
    this._baseCollection = baseCollection;
    this._ownerCollection = null;
    this._path = path;
    this._label = label;
    this._baseCollection.addListener(this);
}

PivotedCollectionDefinition.prototype.dispose = function() {
    this._baseCollection.removeListener(this);
    this._baseCollection = null;
    this._ownerCollection = null;
};

PivotedCollectionDefinition.prototype.getTypeID = function() {
    var lastSegment = this._path[this._path.length - 1];
    var propertyID = lastSegment.property;
    if (propertyID in SchemaUtil.propertyRecords) {
        return SchemaUtil.propertyRecords[propertyID].expectedType;
    } else {
        return null;
    }
};

PivotedCollectionDefinition.prototype.setOwnerCollection = function(collection) {
    this._ownerCollection = collection;
};

PivotedCollectionDefinition.prototype.addRestrictions = function(queryNode, augmentBaseResults) {
    for (var i = this._path.length - 1; i >= 0; i--) {
        var pathNode = this._path[i];
        var newQueryNode = {};
        queryNode[backwardPathSegment(pathNode)] = [newQueryNode];
        
        queryNode = newQueryNode;
    }
    this._baseCollection.addRestrictions(queryNode);
    
    if (typeof augmentBaseResults == "object") {
        for (var n in augmentBaseResults) {
            if (augmentBaseResults.hasOwnProperty(n) && !(n in queryNode)) {
                queryNode[n] = augmentBaseResults[n];
            }
        }
    }
};

PivotedCollectionDefinition.prototype.onItemsChanged = function() {
    if (this._ownerCollection != null) {
        this._ownerCollection.onRootItemsChanged();
    }
};

PivotedCollectionDefinition.prototype.getLabel = function() {
    return this._label;
};

PivotedCollectionDefinition.prototype.isSingular = function() {
    return false;
};

PivotedCollectionDefinition.prototype.hasBaseCollection = function() {
    return true;
};

PivotedCollectionDefinition.prototype.getBaseNodeIterator = function() {
    var backwardSegments = [];
    for (var i = this._path.length - 1; i >= 0; i--) {
        var pathNode = this._path[i];
        backwardSegments.push(backwardPathSegment(pathNode));
    }
    
    var iterate = function(queryNode, index, f) {
        var s = backwardSegments[index];
        if (s in queryNode) {
            var a = queryNode[s];
            if (index < backwardSegments.length - 1) {
                for (var i = 0; i < a.length; i++) {
                    iterate(a[i], index + 1, f);
                }
            } else {
                for (var i = 0; i < a.length; i++) {
                    f(a[i]);
                }
            }
        }
    };
    
    return function(queryNode, f) {
        iterate(queryNode, 0, f);
    };
};

PivotedCollectionDefinition.prototype.getState = function() {
    return {
        p: compressPath(this._path),
        l: this._label
    };
};

function SingleTopicCollectionDefinition(id, name) {
    this._id = id;
    this._name = name;
    this._ownerCollection = null;
}

SingleTopicCollectionDefinition.prototype.dispose = function() {
    this._ownerCollection = null;
};

SingleTopicCollectionDefinition.prototype.setOwnerCollection = function(collection) {
    this._ownerCollection = collection;
};

SingleTopicCollectionDefinition.prototype.addRestrictions = function(queryNode) {
    queryNode["id"] = this._id;
};

SingleTopicCollectionDefinition.prototype.getLabel = function() {
    return this._name;
};

SingleTopicCollectionDefinition.prototype.isSingular = function() {
    return true;
};

SingleTopicCollectionDefinition.prototype.hasBaseCollection = function() {
    return false;
};

SingleTopicCollectionDefinition.prototype.getTopicID = function() {
    return this._id;
};

SingleTopicCollectionDefinition.prototype.getState = function() {
    return {
        i: this._id,
        n: this._name
    };
};
function Collection(definition) {
	this._definition = definition;
	this._facets = [];
    
    // cached counts
    this._totalCount = null;
    this._restrictedCount = null;
	
	this._definition.setOwnerCollection(this);
	this._listeners = new ListenerQueue();
}

Collection.prototype.getDefinition = function() {
	return this._definition;
};

Collection.prototype.getLabel = function() {
	return this._definition.getLabel();
};

Collection.prototype.getCountLabel = function() {
    if (this._totalCount != null && this._restrictedCount != null) {
        if (this._totalCount == this._restrictedCount) {
            return this._totalCount;
        } else {
            return this._restrictedCount + "/" + this._totalCount;
        }
    }
    return null;
};

Collection.prototype.isSingular = function() {
	return this._definition.isSingular();
};

Collection.prototype.addListener = function(listener) {
    this._listeners.add(listener);
};

Collection.prototype.removeListener = function(listener) {
    this._listeners.remove(listener);
};

Collection.prototype.dispose = function() {
	for (var i = 0; i < this._facets.length; i++) {
		this._facets[i].dispose();
	}
	this._facets = null;
	
	this._definition.dispose();
	this._definition = null;
	this._listeners = null;
};

Collection.prototype.forEachFacet = function(f) {
	for (var i = 0; i < this._facets.length; i++) {
		f(this._facets[i]);
	}
};

Collection.prototype.findFacet = function(path) {
	var s1 = pathToString(path);
	for (var i = 0; i < this._facets.length; i++) {
		var facet = this._facets[i];
		if (s1 == pathToString(facet.getPath())) {
			return facet;
		}
	}
	return null;
};

Collection.prototype.addBaseRestrictions = function(queryNode, augmentBaseResults){
	queryNode = queryNode || {};
	this._definition.addRestrictions(queryNode, augmentBaseResults);
	
	return queryNode;
};

Collection.prototype.addRestrictions = function(queryNode, augmentBaseResults){
	queryNode = queryNode || {};
	this.addBaseRestrictions(queryNode, augmentBaseResults);
	for (var i = 0; i < this._facets.length; i++) {
		this._facets[i].restrict(queryNode);
	}
	return queryNode;
};

Collection.prototype.getAllItemCount = function(onDone, onError) {
	var queryNode = { "id" : null, "return" : "count" };
	this.addBaseRestrictions(queryNode);
	
    var self = this;
	JsonpQueue.queryOne(
        [queryNode], 
        function(o) { 
            var n = o.result[0];
            self._totalCount = n;

            onDone(n); 
        }, 
        onError
    );
};

Collection.prototype.getAllItems = function(onDone, onError, limit) {
	var queryNode = { "id" : null, "limit" : (typeof limit == "number") ? limit : 10 };
	this.addBaseRestrictions(queryNode);
	
	JsonpQueue.queryOne([queryNode], function(o) { onDone(o.result); }, onError);
};

Collection.prototype.getRestrictedItemCount = function(onDone, onError) {
	var queryNode = { "id" : null, "return" : "count" };
	this.addRestrictions(queryNode);
	
    var self = this;
	JsonpQueue.queryOne(
        [queryNode], 
        function(o) { 
            var n = o.result[0];
            self._restrictedCount = n;

            onDone(n); 
        }, 
        onError
    );
};

Collection.prototype.getRestrictedItems = function(onDone, onError, limit) {
	var queryNode = { "id" : null, "limit" : (typeof limit == "number") ? limit : 10 };
	this.addRestrictions(queryNode);
	
	JsonpQueue.queryOne([queryNode], function(o) { onDone(o.result); }, onError);
};

Collection.prototype.addFacet = function(facet) {
    this._facets.push(facet);
    
    if (facet.hasRestrictions()) {
        this._updateFacets(null);
        this._listeners.fire("onItemsChanged", []);
    } else {
        facet.update(this._getRestrictedItemsQueryNode());
    }

};

Collection.prototype.removeFacet = function(facet) {
    for (var i = 0; i < this._facets.length; i++) {
        if (facet == this._facets[i]) {
            this._facets.splice(i, 1);
            if (facet.hasRestrictions()) {
                this._updateFacets(null);
                this._listeners.fire("onItemsChanged", []);
            }
            break;
        }
    }

};

Collection.prototype.onFacetUpdated = function(facetChanged) {
	this._updateFacets(facetChanged);
	this._listeners.fire("onItemsChanged", []);
}

Collection.prototype.onRootItemsChanged = function() {
    this._listeners.fire("onRootItemsChanged", []);
    
    this._updateFacets(null);
    
    this._listeners.fire("onItemsChanged", []);
};

Collection.prototype._updateFacets = function(facetChanged) {
    this._totalCount = null;
    this._restrictedCount = null;

    var restrictedFacetCount = 0;
    for (var i = 0; i < this._facets.length; i++) {
        if (this._facets[i].hasRestrictions()) {
            restrictedFacetCount++;
        }
    }
    
    for (var i = 0; i < this._facets.length; i++) {
        var facet = this._facets[i];
        if (facet.hasRestrictions()) {
            if (restrictedFacetCount <= 1) {
                facet.update(this._getAllItemsQueryNode());
            } else {
                var queryNode = this._getAllItemsQueryNode();
                for (var j = 0; j < this._facets.length; j++) {
                    if (i != j) {
                        this._facets[j].restrict(queryNode);
                    }
                }
                facet.update(queryNode);
            }
        } else {
            facet.update(this._getRestrictedItemsQueryNode());
        }
    }
};

Collection.prototype._getRestrictedItemsQueryNode = function() {
	return this.addRestrictions();
};

Collection.prototype._getAllItemsQueryNode = function() {
	return this.addBaseRestrictions();
};

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
};var SchemaUtil = {
    typeRecords: {},
    propertyRecords: {},
    nativeTypes: {
        '/type/int': true,
        '/type/float': true,
        '/type/boolean': true,
        '/type/rawstring': true,
        '/type/uri': true,
        '/type/datetime': true,
        '/type/bytestring': true,
        //'/type/key': true,
        '/type/value': true,
        '/type/text': true,
        '/type/enumeration':true
    }
};

SchemaUtil.getContainingTypeOfProperty = function(propertyID) {
    var typeID = SchemaUtil.getContainingTypeIDOfProperty(propertyID);
    if (typeID != null && typeID in SchemaUtil.typeRecords) {
        return SchemaUtil.typeRecords[typeID];
    }
    return null;
};

SchemaUtil.getContainingTypeIDOfProperty = function(propertyID) {
    var slash = propertyID.lastIndexOf("/");
    if (slash > 0) {
        return propertyID.substr(0, slash);
    }
    return null;
};

SchemaUtil.retrieveSchemas = function(instanceQueryNode, onDone) {
    var types = [];
    var onDone2 = function() {
        onDone(types);
    };
    var gotTypeIDs = function(o) {
        var typesToFetch = [];
        for (var i = 0; i < o.result.length; i++) {
            var entry = o.result[i];
            if (typeof entry == "object") {
                var typeID = entry.id;
                
                types.push({
                    id:     typeID,
                    count:  ("/type/type/instance" in entry && entry["/type/type/instance"].length > 0) ?
                                entry["/type/type/instance"][0] : 0
                });
                
                if (!(typeID in SchemaUtil.typeRecords)) {
                    typesToFetch.push(typeID);
                }
            }
        }
        
        if (typesToFetch.length > 0) {
            SchemaUtil.getTypeSchemasInBatches(typesToFetch, onDone2);
        } else {
            onDone2();
        }
    };
    
    instanceQueryNode["return"] = "estimate-count";
    var query = [{ "type" : "/type/type", "id" : null, "/type/type/instance" : [instanceQueryNode] }];
    
    JsonpQueue.queryOne(query, gotTypeIDs, function(s) { log(s); log(query); onDone(); });
}

SchemaUtil.getTypeSchemasInBatches = function(typeIDs, onDone) {
    var from = 0;
    var doNext = function() {
        if (from < typeIDs.length) {
            var to = Math.min(from + 10, typeIDs.length);
            var typeIDs2 = typeIDs.slice(from, to);
            from = to;
            
            SchemaUtil._getSchemas(typeIDs2, doNext);
        } else {
            onDone();
        }
    };
    doNext();
}

SchemaUtil._getSchemas = function(typeIDs, onDone) {
    //log("Getting schema data for " + typeIDs.length + " types");
    var query = [
        {
            "/type/type/properties" : [{
                "id" : null,
                "name" : null,
                "expected_type" : [{ "id" : null, "name" : null, "/freebase/type_hints/mediator" : null }],
                "master_property" : null,
                "unique" : null
            }],
            "!/user/dfhuynh/parallax/type_profile/profile_of" : [{
                "/user/dfhuynh/parallax/type_profile/pivot_suggestion" : [{ "path" : null, "optional" : true }],
                "/user/dfhuynh/parallax/type_profile/filter_suggestion" : [{ "path" : null, "optional" : true }],
                "optional" : true
            }],
            "id" :         null,
            "name" :    null,
            "id|=" :     typeIDs
        }
    ];
    JsonpQueue.queryOne(query, function(o) { SchemaUtil._gotSchemas(o, onDone); }, function(s) { log(s); onDone(); });
};

SchemaUtil._gotSchemas = function(o, onDone) {
    var moreTypesToFetch = {};
    
    var a = o.result;
    for (var i = 0; i < a.length; i++){
        var entry = a[i];
        var typeRecord = { 
            id:                 entry.id, 
            name:               entry.name, 
            properties:         [],
            pivotSuggestions:   [],
            filterSuggestions:  []
        };
        SchemaUtil.typeRecords[entry.id] = typeRecord;
        
        if ("!/user/dfhuynh/parallax/type_profile/profile_of" in entry &&
            entry["!/user/dfhuynh/parallax/type_profile/profile_of"] != null &&
            entry["!/user/dfhuynh/parallax/type_profile/profile_of"].length > 0) {
            
            var typeProfiles = entry["!/user/dfhuynh/parallax/type_profile/profile_of"];
            for (var j = 0; j < typeProfiles.length; j++) {
                var typeProfile = typeProfiles[j];
                if ("/user/dfhuynh/parallax/type_profile/pivot_suggestion" in typeProfile &&
                    typeProfile["/user/dfhuynh/parallax/type_profile/pivot_suggestion"] != null &&
                    typeProfile["/user/dfhuynh/parallax/type_profile/pivot_suggestion"].length > 0) {
                    
                    typeRecord.pivotSuggestions = typeProfile["/user/dfhuynh/parallax/type_profile/pivot_suggestion"];
                }
                if ("/user/dfhuynh/parallax/type_profile/filter_suggestion" in typeProfile &&
                    typeProfile["/user/dfhuynh/parallax/type_profile/filter_suggestion"] != null &&
                    typeProfile["/user/dfhuynh/parallax/type_profile/filter_suggestion"].length > 0) {
                    
                    typeRecord.filterSuggestions = typeProfile["/user/dfhuynh/parallax/type_profile/filter_suggestion"];
                }
            }
            console.log(typeRecord);
        }
        
        var properties = entry["/type/type/properties"];
        SchemaUtil._processPropertySchemas(properties, typeRecord, moreTypesToFetch);
    }
    
    SchemaUtil._fetchMoreTypes(moreTypesToFetch, onDone);
};

SchemaUtil.retrievePropertySchemas = function(propertyIDs, onDone) {
    var from = 0;
    var doNext = function() {
        if (from < propertyIDs.length) {
            var to = Math.min(from + 10, propertyIDs.length);
            var propertyIDs2 = propertyIDs.slice(from, to);
            from = to;
            
            SchemaUtil._getPropertySchemas(propertyIDs2, doNext);
        } else {
            onDone();
        }
    };
    doNext();
};

SchemaUtil._getPropertySchemas = function(propertyIDs, onDone) {
    var query = [{
        "id" : propertyIDs,
        "name" : null,
        "expected_type" : [{ "id" : null, "name" : null, "/freebase/type_hints/mediator" : null }],
        "master_property" : null,
        "unique" : null
    }];
    JsonpQueue.queryOne(query, function(o) { SchemaUtil._gotPropertySchemas(o, onDone); }, function(s) { log(s); onDone(); });
};

SchemaUtil._gotPropertySchemas = function(o, onDone) {
    var moreTypesToFetch = {};
    
    SchemaUtil._processPropertySchemas(o.result, {}, moreTypesToFetch);
    SchemaUtil._fetchMoreTypes(moreTypesToFetch, onDone);
};

SchemaUtil._processPropertySchemas = function(properties, typeRecord, moreTypesToFetch) {
    for (var j = 0; j < properties.length; j++) {
        var propertyEntry = properties[j];
        var propertyRecord = {
            id:                 propertyEntry.id,
            name:               propertyEntry.name,
            cvt:                false,
            expectedType:       null,
            expectedTypeLabel:  null,
            masterProperty:     propertyEntry.master_property,
            unique:             false
        };
        SchemaUtil.propertyRecords[propertyEntry.id] = propertyRecord;
        typeRecord.properties.push(propertyEntry.id);
        
        if ("unique" in propertyEntry) {
            propertyRecord.unique = propertyEntry.unique;
        }
        if ("expected_type" in propertyEntry && propertyEntry.expected_type.length > 0) {
            var expectedTypeEntry = propertyEntry.expected_type[0];
            propertyRecord.expectedType = expectedTypeEntry.id;
            propertyRecord.expectedTypeLabel = expectedTypeEntry.name;
            propertyRecord.cvt = expectedTypeEntry["/freebase/type_hints/mediator"] == true;
            
            if (!(expectedTypeEntry.id in SchemaUtil.typeRecords) && propertyRecord.cvt) {
                moreTypesToFetch[expectedTypeEntry.id] = true;
            }
        }
    }
};

SchemaUtil._fetchMoreTypes = function(moreTypesToFetch, onDone) {
    var moreTypesToFetchA = [];
    for (var n in moreTypesToFetch) {
        moreTypesToFetchA.push(n);
    }
    
    if (moreTypesToFetchA.length > 0) {
        SchemaUtil._getSchemas(moreTypesToFetchA, onDone);
    } else {
        onDone();
    }
};

SchemaUtil.tryGetTypeLabel = function(collectionDefinition, onGotLabel) {
    if ("getTypeID" in collectionDefinition) {
        var tryGetTypeLabelCount = 5;
        var typeID = null;
        
        var tryGetTypeLabel = function() {
            if (typeID in SchemaUtil.typeRecords) {
                var label = SchemaUtil.typeRecords[typeID].name;
                onGotLabel(label);
            } else {
                tryGetTypeLabelCount--;
                if (tryGetTypeLabelCount > 0) {
                    window.setTimeout(tryGetTypeLabel, 1000);
                } else {
                    // give up
                }
            }
        };
        
        var tryGetTypeIDCount = 5;
        var tryGetTypeID = function() {
            typeID = collectionDefinition.getTypeID();
            if (typeID != null) {
                tryGetTypeLabel();
            } else {
                tryGetTypeIDCount--;
                if (tryGetTypeIDCount > 0) {
                    window.setTimeout(tryGetTypeID, 1000);
                } else {
                    // give up
                }
            }
        };
        tryGetTypeID();
    }
};

SchemaUtil.tryGetPropertyLabel = function(propertyID, onGotLabel) {
    if (propertyID in SchemaUtil.propertyRecords) {
        onGotLabel(SchemaUtil.propertyRecords[propertyID].name);
    } else {
        JsonpQueue.queryOne([{ "id" : propertyID, "name" : null }], function(o) {
            onGotLabel(o.result[0].name); 
        }, genericErrorHandler);
    }
};
function TypeStack(queryNode, includeNativeTypes, useCVTsAsIs) {
    this._queryNode = queryNode;
    this._includeNativeTypes = (includeNativeTypes);
    this._useCVTsAsIs = (useCVTsAsIs);
    
    this._typeRecords = null;
    this._currentTypeRecord = 0;
    this._processedProperties = {};
}

TypeStack.prototype.dispose = function() {
    this._queryNode = null;
    this._typeRecords = null;
};

TypeStack.prototype.getTypeCount = function() {
    return this._typeRecords != null ? this._typeRecords.length : 0;
};

TypeStack.prototype.getAllDimensions = function() {
    var allDimensions = [];
    if (this._typeRecords != null) {
        for (var t = 0; t < this._typeRecords.length; t++) {
            allDimensions = allDimensions.concat(this._typeRecords[t].dimensions);
        }
    }
    return allDimensions;
}

TypeStack.prototype.runWhenInitialized = function(f) {
    if (this._typeRecords != null) {
        f();
        return false;
    } else {
        var self = this;
        var onDone2 = function(typeEntries) {
            self._buildTypeRecords(typeEntries || []);
            self._builtTypeRecords = true;
            f();
        };
        
        SchemaUtil.retrieveSchemas(this._queryNode, onDone2);
        return true;
    }
};

TypeStack.computeDimensions = function(
    dimensions, 
    rootTypeID, 
    fromTypeID, 
    propertyID, 
    previousPath, 
    previousLabel, 
    processedProperties, 
    includeNativeTypes,
    useCVTsAsIs
) {
    var propertyRecord = SchemaUtil.propertyRecords[propertyID];
    if (typeof propertyRecord != "object") {
        return;
    }
    
    if (propertyRecord.expectedType != null &&
        (includeNativeTypes || !(propertyRecord.expectedType in SchemaUtil.nativeTypes))) {
        
        if (!useCVTsAsIs && propertyRecord.expectedType.indexOf("/measurement_unit/") != 0 && propertyRecord.cvt) {
            
            var cvtTypeID = propertyRecord.expectedType;
            var cvtTypeRecord = SchemaUtil.typeRecords[cvtTypeID];
            if (cvtTypeRecord != null) {
                var path = [].concat(previousPath);
                path.push({ property: propertyID, forward: true });
                
                TypeStack._computeNestedDimensions(
                    dimensions, 
                    rootTypeID, 
                    cvtTypeID, 
                    propertyRecord.masterProperty, // to ignore
                    path, 
                    previousLabel + cvtTypeRecord.name + "/", 
                    processedProperties,
                    includeNativeTypes
                );
            }
            
            /*
             *  Exception: treat /location/mailing_address as first class, too.
             */
            if (propertyRecord.expectedType != "/location/mailing_address") {
                return;
            } // else, fall through
        }
        
        var path = [].concat(previousPath);
        path.push({ property: propertyID, forward: true });
        
        dimensions.push({
            path:               path,
            typeID:             rootTypeID,
            label:              propertyRecord.name,
            fullLabel:          previousLabel + propertyRecord.name,
            expectedType:       propertyRecord.expectedType,
            expectedTypeLabel:  propertyRecord.expectedTypeLabel,
            count:              0
        });
    }
};

TypeStack._computeNestedDimensions = function(
    dimensions, 
    rootTypeID, 
    typeID, 
    ignorePropertyID, 
    previousPath, 
    previousLabel, 
    processedProperties, 
    includeNativeTypes
) {
    var propertyIDs = SchemaUtil.typeRecords[typeID].properties;
    for (var i = 0; i < propertyIDs.length; i++) {
        var propertyID = propertyIDs[i];
        var propertyRecord = SchemaUtil.propertyRecords[propertyID];
        var unique = propertyRecord != null && propertyRecord.unique;
        
        if (propertyID in processedProperties ||
            (propertyID == ignorePropertyID && unique)) {
            continue;
        }
        
        processedProperties[propertyID] = true;
        TypeStack.computeDimensions(
            dimensions, 
            rootTypeID, 
            typeID, 
            propertyID, 
            previousPath, 
            previousLabel, 
            processedProperties, 
            includeNativeTypes,
            true
        );
    }
};

TypeStack.buildTypeRecord = function(typeID, dimensions, processedProperties, includeNativeTypes, useCVTsAsIs) {
    var typeRecord = SchemaUtil.typeRecords[typeID];
    if (typeRecord) {
        var propertyIDs = typeRecord.properties;
        for (var i = 0; i < propertyIDs.length; i++) {
            var propertyID = propertyIDs[i];
            if (!(propertyID in processedProperties)) {
                processedProperties[propertyID] = true;
                TypeStack.computeDimensions(dimensions, typeID, typeID, propertyID, [], "", processedProperties, includeNativeTypes, useCVTsAsIs);
            }
        }
    }
};

TypeStack.prototype._buildTypeRecords = function(typeEntries) {
    this._typeRecords = [];
    for (var i = 0; i < typeEntries.length; i++) {
        var typeEntry = typeEntries[i];
        if ((typeEntry.id in SchemaUtil.typeRecords) && 
            (typeEntry.id != "/common/topic")) {
            
            var typeRecord = { typeID: typeEntry.id, count: typeEntry.count, dimensions: [], processedDimensions: 0 };
            
            TypeStack.buildTypeRecord(typeEntry.id, typeRecord.dimensions, this._processedProperties, this._includeNativeTypes, this._useCVTsAsIs);
            if (typeRecord.dimensions.length > 0) {
                this._typeRecords.push(typeRecord);
            }
        }
    }
    
    this._typeRecords.sort(function(a, b) {
        var c = b.count - a.count;
        if (c == 0) {
            c = a.typeID.localeCompare(b.typeID);
        }
        return c;
    });
};

TypeStack.prototype.runOnDimensionsOfNextType = function(f) {
    var self = this;
    if (this._typeRecords != null) {
        return this._internalRunOnDimensionsOfNextType(f);
    } else {
        this.runWhenInitialized(function() {
            self._internalRunOnDimensionsOfNextType(f);
        });
        return true;
    }
};

TypeStack.prototype._internalRunOnDimensionsOfNextType = function(f) {
    if (this._currentTypeRecord < this._typeRecords.length) {
        var typeRecord = this._typeRecords[this._currentTypeRecord];
        
        var self = this;
        var baseQueryNode = this._queryNode;
        
        var doneADimension = function() {
            typeRecord.processedDimensions++;
            if (typeRecord.processedDimensions >= typeRecord.dimensions.length) {
                self._currentTypeRecord++;
                f(typeRecord, typeRecord.dimensions);
            }
        };
        
        var processDimension = function(dimension) {
            var queryNode = clone(baseQueryNode);
            
            var path = dimension.path;
            for (var i = 0; i < path.length; i++) {
                var pathNode = path[i];
                var newQueryNode = {};
                newQueryNode[backwardPathSegment(pathNode)] = [queryNode];
                queryNode = newQueryNode;
            }
            queryNode["return"] = typeRecord.count > 1000 ? "estimate-count" : "count";

            JsonpQueue.queryOne(
                [queryNode],
                function(o) {
                    dimension.count = o.result[0];
                    doneADimension();
                }, 
                doneADimension
            );
        };
        for (var i = 0; i < typeRecord.dimensions.length; i++) {
            processDimension(typeRecord.dimensions[i]);
        }
        
        return true;
    } else {
        return false;
    }
};var DimensionPickerWidget = {};

DimensionPickerWidget.show = function(elmt, dimensions, onPick, staticChoices) {
    var popupDom = createPopupMenuDom(elmt);
    popupDom.bodyDiv.style.overflow = "auto";
    popupDom.bodyDiv.style.height = "400px";
    
    for (var i = 0; i < staticChoices.length; i++) {
        var staticChoice = staticChoices[i];
        popupDom.appendMenuItem(
            staticChoice.label,
            staticChoice.icon,
            staticChoice.onclick
        );
    }
    
    var typeGroupMap = {};
    var typeGroupArray = [];
    for (var i = 0; i < dimensions.length; i++) {
        var dimension = dimensions[i];
        var typeGroup;
        if (dimension.expectedType in typeGroupMap) {
            typeGroup = typeGroupMap[dimension.expectedType];
        } else {
            typeGroup = typeGroupMap[dimension.expectedType] = {
                dimensions: [],
                label: "To " + dimension.expectedTypeLabel
            };
            typeGroupArray.push(typeGroup);
        }
        typeGroup.dimensions.push(dimension);
    }
    typeGroupArray.sort(function(a, b) {
        return b.dimensions.length - a.dimensions.length;
    });
    
    var dimensionSorter = function(a, b) {
        var c = a.label.localeCompare(b.label);
        if (c == 0) {
            c = a.fullLabel.localeCompare(b.fullLabel);
        }
        return c;
    };
    var processDimension = function(dimension) {
        var path = dimension.path;
        var lastSegment = path[path.length - 1];
        
        var searchText = dimension.label;
        
        var labelSpan = document.createElement("span");
        
        var propertySpan = document.createElement("span");
        propertySpan.title = lastSegment.property;
        propertySpan.innerHTML = dimension.label;
        labelSpan.appendChild(propertySpan);
        
        var typeRecord = SchemaUtil.getContainingTypeOfProperty(lastSegment.property);
        if (typeRecord != null) {
            var hint = (typeof typeRecord.name == "string") ? typeRecord.name : typeRecord.id;
            var hintSpan = document.createElement("span");
            hintSpan.className = "pivot-choice-menu-hint";
            hintSpan.innerHTML = " (" + hint + ")";
            hintSpan.title = typeRecord.id;
            labelSpan.appendChild(hintSpan);
            
            searchText += " " + hint;
        }
        
        var elmt = popupDom.appendMenuItem(
            labelSpan,
            null,
            function() { onPick(dimension); }
        );
        elmt.setAttribute("searchText", searchText.toLowerCase());
    };
    
    for (var i = 0; i < typeGroupArray.length; i++) {
        var typeGroup = typeGroupArray[i];
        if (typeGroup.dimensions.length < 3) {
            break;
        }
        
        popupDom.appendSection(typeGroup.label);
        
        typeGroup.dimensions.sort(dimensionSorter);
        for (var j = 0; j < typeGroup.dimensions.length; j++) {
            processDimension(typeGroup.dimensions[j]);
        }
    }
    
    if (i < typeGroupArray.length - 1) {
        var remainingDimensions = [];
        for (; i < typeGroupArray.length; i++) {
            var typeGroup = typeGroupArray[i];
            remainingDimensions = remainingDimensions.concat(typeGroup.dimensions);
        }
        
        popupDom.appendSection("To Other Types of Topic");
        
        remainingDimensions.sort(dimensionSorter);
        for (var i = 0; i < remainingDimensions.length; i++) {
            processDimension(remainingDimensions[i]);
        }
    }
    
    var quickFilterDiv = document.createElement("div");
    quickFilterDiv.className = "dimension-picker-widget-quick-filter-section";
    quickFilterDiv.innerHTML = 
        '<div class="dimension-picker-widget-quick-filter-section-heading">Quick search:</div>' +
        '<div class="dimension-picker-widget-quick-filter-section-input"><input></input></div>';
        
    var input = quickFilterDiv.childNodes[1].childNodes[0];
    input.onkeyup = function() {
        var text = input.value.trim().toLowerCase();
        var childNodes = popupDom.bodyDiv.childNodes;
        if (text.length == 0) {
            for (var i = 0; i < childNodes.length; i++){
                childNodes[i].style.display = "block";
            }
        } else {
            var sectionHeading = null;
            var sectionCount = 0;
            for (var i = 0; i < childNodes.length; i++){
                var childNode = childNodes[i];
                if (childNode.className == "menu-section") {
                    if (sectionHeading != null) {
                        sectionHeading.style.display = sectionCount > 0 ? "block" : "none";
                    }
                    sectionHeading = childNode;
                    sectionCount = 0;
                } else {
                    var searchText = childNode.getAttribute("searchText");
                    if (searchText == null || searchText.length == 0 || searchText.indexOf(text) >= 0) {
                        childNode.style.display = "block";
                        sectionCount++;
                    } else {
                        childNode.style.display = "none";
                    }
                }
            }
            
            if (sectionHeading != null) {
                sectionHeading.style.display = sectionCount > 0 ? "block" : "none";
            }
        }
    };
    
    popupDom.elmt.insertBefore(quickFilterDiv, popupDom.bodyDiv);

    popupDom.open();
    input.focus();
};
/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

/**
 * Create a cookie with the given name and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
 *       used when the cookie was set.
 *
 * @param String name The name of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given name.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String name The name of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};/*
    http://www.JSON.org/json2.js
    2008-07-15

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the object holding the key.

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array, then it will be used to
            select the members to be serialized. It filters the results such
            that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true */

/*global JSON */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", call,
    charCodeAt, getUTCDate, getUTCFullYear, getUTCHours, getUTCMinutes,
    getUTCMonth, getUTCSeconds, hasOwnProperty, join, lastIndex, length,
    parse, propertyIsEnumerable, prototype, push, replace, slice, stringify,
    test, toJSON, toString
*/

if (!this.JSON) {

// Create a JSON object only if one does not already exist. We create the
// object in a closure to avoid creating global variables.

    JSON = function () {

        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        Date.prototype.toJSON = function (key) {

            return this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z';
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };

        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap,
            indent,
            meta = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"' : '\\"',
                '\\': '\\\\'
            },
            rep;


        function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

            escapeable.lastIndex = 0;
            return escapeable.test(string) ?
                '"' + string.replace(escapeable, function (a) {
                    var c = meta[a];
                    if (typeof c === 'string') {
                        return c;
                    }
                    return '\\u' + ('0000' +
                            (+(a.charCodeAt(0))).toString(16)).slice(-4);
                }) + '"' :
                '"' + string + '"';
        }


        function str(key, holder) {

// Produce a string from holder[key].

            var i,          // The loop counter.
                k,          // The member key.
                v,          // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

            if (value && typeof value === 'object' &&
                    typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

// What happens next depends on the value's type.

            switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

            case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                if (!value) {
                    return 'null';
                }

// Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

// If the object has a dontEnum length property, we'll treat it as an array.

                if (typeof value.length === 'number' &&
                        !(value.propertyIsEnumerable('length'))) {

// The object is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                    v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap +
                                partial.join(',\n' + gap) + '\n' +
                                    mind + ']' :
                              '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

// If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                            mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
            }
        }

// Return the JSON object containing the stringify and parse methods.

        return {
            stringify: function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

                var i;
                gap = '';
                indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

                if (typeof space === 'number') {
                    for (i = 0; i < space; i += 1) {
                        indent += ' ';
                    }

// If the space parameter is a string, it will be used as the indent string.

                } else if (typeof space === 'string') {
                    indent = space;
                }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

                rep = replacer;
                if (replacer && typeof replacer !== 'function' &&
                        (typeof replacer !== 'object' ||
                         typeof replacer.length !== 'number')) {
                    throw new Error('JSON.stringify');
                }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

                return str('', {'': value});
            },


            parse: function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

                var j;

                function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (Object.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function (a) {
                        return '\\u' + ('0000' +
                                (+(a.charCodeAt(0))).toString(16)).slice(-4);
                    });
                }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

                if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                    j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                    return typeof reviver === 'function' ?
                        walk({'': j}, '') : j;
                }

// If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError('JSON.parse');
            }
        };
    }();
}



//////////////////////////////////////////////////
//
//  the stringifier is based on
//    http://json.org/json.js as of 2006-04-28 from json.org
//  the parser is based on 
//    http://osteele.com/sources/openlaszlo/json
//

if (typeof rison == 'undefined')
    window.rison = {};

/**
 *  rules for an uri encoder that is more tolerant than encodeURIComponent
 *
 *  encodeURIComponent passes  ~!*()-_.'
 *
 *  we also allow              ,:@$/
 *
 */
rison.uri_ok = {  // ok in url paths and in form query args
            '~': true,  '!': true,  '*': true,  '(': true,  ')': true,
            '-': true,  '_': true,  '.': true,  ',': true,
            ':': true,  '@': true,  '$': true,
            "'": true,  '/': true
};

/*
 * we divide the uri-safe glyphs into three sets
 *   <rison> - used by rison                         ' ! : ( ) ,
 *   <reserved> - not common in strings, reserved    * @ $ & ; =
 *
 * we define <identifier> as anything that's not forbidden
 */

/**
 * punctuation characters that are legal inside ids.
 */
// this var isn't actually used
//rison.idchar_punctuation = "_-./~";  

(function () {
    var l = [];
    for (var hi = 0; hi < 16; hi++) {
        for (var lo = 0; lo < 16; lo++) {
            if (hi+lo == 0) continue;
            var c = String.fromCharCode(hi*16 + lo);
            if (! /\w|[-_.\/~]/.test(c))
                l.push('\\u00' + hi.toString(16) + lo.toString(16));
        }
    }
    /**
     * characters that are illegal inside ids.
     * <rison> and <reserved> classes are illegal in ids.
     *
     */
    rison.not_idchar = l.join('')
    //idcrx = new RegExp('[' + rison.not_idchar + ']');
    //console.log('NOT', (idcrx.test(' ')) );
})();
//rison.not_idchar  = " \t\r\n\"<>[]{}'!=:(),*@$;&";
rison.not_idchar  = " '!:(),*@$";


/**
 * characters that are illegal as the start of an id
 * this is so ids can't look like numbers.
 */
rison.not_idstart = "-0123456789";


(function () {
    var idrx = '[^' + rison.not_idstart + rison.not_idchar + 
               '][^' + rison.not_idchar + ']*';

    rison.id_ok = new RegExp('^' + idrx + '$');

    // regexp to find the end of an id when parsing
    // g flag on the regexp is necessary for iterative regexp.exec()
    rison.next_id = new RegExp(idrx, 'g');
})();


/**
 * uri-encode a string, using a tolerant url encoder.
 *
 * @see rison.uri_ok
 */
rison.quote = function (x) {
    // speedups todo:
    //   regex match exact set of uri_ok chars.
    //   chunking series of unsafe chars rather than encoding char-by-char
    var ok = rison.uri_ok;

    if (/^[A-Za-z0-9_-]*$/.test(x))  // XXX add more safe chars
        return x;

    x = x.replace(/([^A-Za-z0-9_-])/g, function(a, b) {
        var c = ok[b];
        if (c) return b;

        return encodeURIComponent(b);
    });
    return x.replace(/%20/g, '+');
};


//
//  based on json.js 2006-04-28 from json.org
//  license: http://www.json.org/license.html
//
//  hacked by nix for use in uris.
//

(function () {
    var sq = { // url-ok but quoted in strings
               "'": true,  '!': true
    },
    s = {
            array: function (x) {
                var a = ['!('], b, f, i, l = x.length, v;
                for (i = 0; i < l; i += 1) {
                    v = x[i];
                    f = s[typeof v];
                    if (f) {
                        v = f(v);
                        if (typeof v == 'string') {
                            if (b) {
                                a[a.length] = ',';
                            }
                            a[a.length] = v;
                            b = true;
                        }
                    }
                }
                a[a.length] = ')';
                return a.join('');
            },
            'boolean': function (x) {
                if (x)
                    return '!t';
                return '!f'
            },
            'null': function (x) {
                return "!n";
            },
            number: function (x) {
                if (!isFinite(x))
                    return '!n';
                // strip '+' out of exponent, '-' is ok though
                return String(x).replace(/\+/,'');
            },
            object: function (x) {
                if (x) {
                    if (x instanceof Array) {
                        return s.array(x);
                    }
                    // WILL: will this work on non-Firefox browsers?
                    if (typeof x.__prototype__ === 'object' && typeof x.__prototype__.encode_rison !== 'undefined')
                        return x.encode_rison();

                    var a = ['('], b, f, i, v, ki, ks=[];
                    for (i in x)
                        ks[ks.length] = i;
                    ks.sort();
                    for (ki = 0; ki < ks.length; ki++) {
                        i = ks[ki];
                        v = x[i];
                        f = s[typeof v];
                        if (f) {
                            v = f(v);
                            if (typeof v == 'string') {
                                if (b) {
                                    a[a.length] = ',';
                                }
                                a.push(s.string(i), ':', v);
                                b = true;
                            }
                        }
                    }
                    a[a.length] = ')';
                    return a.join('');
                }
                return '!n';
            },
            string: function (x) {
                if (x == '')
                    return "''";

                if (rison.id_ok.test(x))
                    return x;

                x = x.replace(/(['!])/g, function(a, b) {
                    if (sq[b]) return '!'+b;
                    return b;
                });
                return "'" + x + "'";
            },
            undefined: function (x) {
                throw new Error("rison can't encode the undefined value");
            }
        };


    /**
     * rison-encode a javascript structure
     *
     *  implemementation based on Douglas Crockford's json.js:
     *    http://json.org/json.js as of 2006-04-28 from json.org
     *
     */
    rison.encode = function (v) {
        return s[typeof v](v);
    };

    /**
     * rison-encode a javascript object without surrounding parens
     *
     */
    rison.encode_object = function (v) {
        if (typeof v != 'object' || v === null || v instanceof Array)
            throw new Error("rison.encode_object expects an object argument");
        var r = s[typeof v](v);
        return r.substring(1, r.length-1);
    };

    /**
     * rison-encode a javascript array without surrounding parens
     *
     */
    rison.encode_array = function (v) {
        if (!(v instanceof Array))
            throw new Error("rison.encode_array expects an array argument");
        var r = s[typeof v](v);
        return r.substring(2, r.length-1);
    };

    /**
     * rison-encode and uri-encode a javascript structure
     *
     */
    rison.encode_uri = function (v) {
        return rison.quote(s[typeof v](v));
    };

})();




//
// based on openlaszlo-json and hacked by nix for use in uris.
//
// Author: Oliver Steele
// Copyright: Copyright 2006 Oliver Steele.  All rights reserved.
// Homepage: http://osteele.com/sources/openlaszlo/json
// License: MIT License.
// Version: 1.0


/**
 * parse a rison string into a javascript structure.
 *
 * this is the simplest decoder entry point.
 *
 *  based on Oliver Steele's OpenLaszlo-JSON
 *     http://osteele.com/sources/openlaszlo/json
 */
rison.decode = function(r) {
    var errcb = function(e) { throw Error('rison decoder error: ' + e); };
    var p = new rison.parser(errcb);
    return p.parse(r);
};

/**
 * parse an o-rison string into a javascript structure.
 *
 * this simply adds parentheses around the string before parsing.
 */
rison.decode_object = function(r) {
    return rison.decode('('+r+')');
};

/**
 * parse an a-rison string into a javascript structure.
 *
 * this simply adds array markup around the string before parsing.
 */
rison.decode_array = function(r) {
    return rison.decode('!('+r+')');
};


/**
 * construct a new parser object for reuse.
 *
 * @constructor
 * @class A Rison parser class.  You should probably 
 *        use rison.decode instead. 
 * @see rison.decode
 */
rison.parser = function (errcb) {
    this.errorHandler = errcb;
};

/**
 * a string containing acceptable whitespace characters.
 * by default the rison decoder tolerates no whitespace.
 * to accept whitespace set rison.parser.WHITESPACE = " \t\n\r\f";
 */
rison.parser.WHITESPACE = "";

// expose this as-is?
rison.parser.prototype.setOptions = function (options) {
    if (options['errorHandler'])
        this.errorHandler = options.errorHandler;
};

/**
 * parse a rison string into a javascript structure.
 */
rison.parser.prototype.parse = function (str) {
    this.string = str;
    this.index = 0;
    this.message = null;
    var value = this.readValue();
    if (!this.message && this.next())
        value = this.error("unable to parse string as rison: '" + rison.encode(str) + "'");
    if (this.message && this.errorHandler)
        this.errorHandler(this.message, this.index);
    return value;
};

rison.parser.prototype.error = function (message) {
    if (typeof(console) != 'undefined')
        console.log('rison parser error: ', message);
    this.message = message;
    return undefined;
}
    
rison.parser.prototype.readValue = function () {
    var c = this.next();
    var fn = c && this.table[c];

    if (fn)
        return fn.apply(this);

    // fell through table, parse as an id

    var s = this.string;
    var i = this.index-1;

    // Regexp.lastIndex may not work right in IE before 5.5?
    // g flag on the regexp is also necessary
    rison.next_id.lastIndex = i;
    var m = rison.next_id.exec(s);

    // console.log('matched id', i, r.lastIndex);

    if (m.length > 0) {
        var id = m[0];
        this.index = i+id.length;
        return id;  // a string
    }

    if (c) return this.error("invalid character: '" + c + "'");
    return this.error("empty expression");
}

rison.parser.parse_array = function (parser) {
    var ar = [];
    var c;
    while ((c = parser.next()) != ')') {
        if (!c) return parser.error("unmatched '!('");
        if (ar.length) {
            if (c != ',')
                parser.error("missing ','");
        } else if (c == ',') {
            return parser.error("extra ','");
        } else
            --parser.index;
        var n = parser.readValue();
        if (typeof n == "undefined") return undefined;
        ar.push(n);
    }
    return ar;
};

rison.parser.bangs = {
    t: true,
    f: false,
    n: null,
    '(': rison.parser.parse_array
}

rison.parser.prototype.table = {
    '!': function () {
        var s = this.string;
        var c = s.charAt(this.index++);
        if (!c) return this.error('"!" at end of input');
        var x = rison.parser.bangs[c];
        if (typeof(x) == 'function') {
            return x.call(null, this);
        } else if (typeof(x) == 'undefined') {
            return this.error('unknown literal: "!' + c + '"');
        }
        return x;
    },
    '(': function () {
        var o = {};
        var c;
        var count = 0;
        while ((c = this.next()) != ')') {
            if (count) {
                if (c != ',')
                    this.error("missing ','");
            } else if (c == ',') {
                return this.error("extra ','");
            } else
                --this.index;
            var k = this.readValue();
            if (typeof k == "undefined") return undefined;
            if (this.next() != ':') return this.error("missing ':'");
            var v = this.readValue();
            if (typeof v == "undefined") return undefined;
            o[k] = v;
            count++;
        }
        return o;
    },
    "'": function () {
        var s = this.string;
        var i = this.index;
        var start = i;
        var segments = [];
        var c;
        while ((c = s.charAt(i++)) != "'") {
            //if (i == s.length) return this.error('unmatched "\'"');
            if (!c) return this.error('unmatched "\'"');
            if (c == '!') {
                if (start < i-1)
                    segments.push(s.slice(start, i-1));
                c = s.charAt(i++);
                if ("!'".indexOf(c) >= 0) {
                    segments.push(c);
                } else {
                    return this.error('invalid string escape: "!'+c+'"');
                }
                start = i;
            }
        }
        if (start < i-1)
            segments.push(s.slice(start, i-1));
        this.index = i;
        return segments.length == 1 ? segments[0] : segments.join('');
    },
    // Also any digit.  The statement that follows this table
    // definition fills in the digits.
    '-': function () {
        var s = this.string;
        var i = this.index;
        var start = i-1;
        var state = 'int';
        var permittedSigns = '-';
        var transitions = {
            'int+.': 'frac',
            'int+e': 'exp',
            'frac+e': 'exp'
        };
        do {
            var c = s.charAt(i++);
            if (!c) break;
            if ('0' <= c && c <= '9') continue;
            if (permittedSigns.indexOf(c) >= 0) {
                permittedSigns = '';
                continue;
            }
            state = transitions[state+'+'+c.toLowerCase()];
            if (state == 'exp') permittedSigns = '-';
        } while (state);
        this.index = --i;
        s = s.slice(start, i)
        if (s == '-') return this.error("invalid number");
        return Number(s);
    }
};
// copy table['-'] to each of table[i] | i <- '0'..'9':
(function (table) {
    for (var i = 0; i <= 9; i++)
        table[String(i)] = table['-'];
})(rison.parser.prototype.table);

// return the next non-whitespace character, or undefined
rison.parser.prototype.next = function () {
    var s = this.string;
    var i = this.index;
    do {
        if (i == s.length) return undefined;
        var c = s.charAt(i++);
    } while (rison.parser.WHITESPACE.indexOf(c) >= 0);
    this.index = i;
    return c;
};

function ListFacet(collection, settings) {
    this._collection = collection;
    this._settings = settings;
    this._selection = [];
    
    this._div = null;
    this._dom = null;
    this._queryNode = null;
    this._choiceEntries = null;
    
    this._showAll = false;
    this._sortMode = "count";
    this._sortDirection = "forward";
    
    collection.addFacet(this);
};

ListFacet.abbreviatedCount = 7;

ListFacet.reconstructFromState = function(state, collection, facetRemover) {
    var path = decompressPath(state.p);
    
    var fullLabel = "";
    var label = "";
    var expectedType = "";
    var expectedTypeLabel = "";
    
    for (var i = 0; i < path.length; i++) {
        if (i > 0) {
            fullLabel += "/";
        }
        
        var propertyID = path[i].property;
        var propertyRecord = SchemaUtil.propertyRecords[propertyID];
        if (propertyRecord == null) {
            if (propertyID == "/type/object/type") {
                label = "Types of topic";
                expectedType = "/type/type";
                expectedTypeLabel = "Type";
            }
        } else {
            label = propertyRecord.name;
            expectedType = propertyRecord.expectedType;
            expectedTypeLabel = propertyRecord.expectedTypeLabel;
        }
        
        fullLabel += label;
    }
    
    var facet = new ListFacet(
        collection,
        {   path:               path,
            label:              label,
            fullLabel:          fullLabel,
            expectedType:       expectedType,
            expectedTypeLabel:  expectedTypeLabel,
            facetRemover:       facetRemover
        }
    );
    
    if ("s" in state) {
        facet._selection = [].concat(state.s);
    }
    
    return facet;
};

ListFacet.prototype.dispose = function() {
    this._collection.removeFacet(this);
    this._collection = null;
    
    this._div = null;
    this._dom = null;
    this._queryNode = null;
    this._choiceEntries = null;
};

ListFacet.prototype.getState = function() {
    var r = {
        p: compressPath(this._settings.path)
    };
    if (this._selection.length > 0) {
        r.s = [].concat(this._selection);
    }
    return r;
};

ListFacet.prototype.getPath = function() {
    return this._settings.path;
};

ListFacet.prototype.hasRestrictions = function() {
    return this._selection.length > 0;
};

ListFacet.prototype.installUI = function(div) {
    this._div = div;
    this._constructUI();
    this._updateUI();
};

ListFacet.prototype.uninstallUI = function() {
    if (this._dom != null) {
        this._dom.label.onclick = null;
        this._dom.mapAction.onclick = null;
        this._dom = null;
        this._div = null;
    }
};

ListFacet.prototype.onModeChanged = function(mode) {
    if (this._dom != null) {
        if (mode == "debug") {
            this._dom.showQueryAction.style.display = getMode("debug") ? "inline" : "none";
        }
    }
};

ListFacet.prototype.update = function(queryNode) {
    this._queryNode = queryNode;
    if (this._dom != null) { // no UI to update anyway
        this._updateUI();
    }
};

ListFacet.prototype.restrict = function(queryNode) {
    if (this._selection.length > 0) {
        var path = this._settings.path;
		var firstInnerNode = null;
        for (var i = 0; i < path.length; i++) {
            var pathNode = path[i];
            var newQueryNode = {};
            queryNode["f:" + forwardPathSegment(pathNode)] = [newQueryNode];
            
			if (firstInnerNode == null) {
				firstInnerNode = newQueryNode;
			}
            queryNode = newQueryNode;
        }
        queryNode["id|="] = this._selection;
		firstInnerNode["limit"] = 0;
			// this cuts off nested results that get returned but are of no use
    }
};

ListFacet.prototype._constructUI = function() {
    var self = this;
    
    var div = document.getElementById("facet-template").cloneNode(true);
    div.style.display = "block";
    div.id = "";
    this._div.appendChild(div);
    
    var divs = div.getElementsByTagName("div");
    var headerDiv = divs[0];
    var footerDiv = divs[3];
    
    var headerActions = headerDiv.getElementsByTagName("a");
    var footerActions = footerDiv.getElementsByTagName("a");
    var footerSeparators = footerDiv.getElementsByTagName("span");
    
    this._dom = {
        headerDiv:              headerDiv,
        closeButton:            headerDiv.getElementsByTagName("img")[0],
        label:                  headerDiv.getElementsByTagName("span")[0],
        resetAction:            headerDiv.getElementsByTagName("a")[0],
        mapAction:              headerDiv.getElementsByTagName("a")[1],
        showQueryAction:        headerDiv.getElementsByTagName("a")[2],
        
        bodyDiv:                divs[1],
        statusSection:          divs[2],
        
        footerDiv:              footerDiv,
        showAllAction:          footerActions[0],
        showTopChoicesAction:   footerActions[1],
        settingsAction:         footerActions[2],
        footerSeparators:       footerSeparators
    };
    
    var name = this._settings.label;
    var paren = name.indexOf(" (");
    if (paren > 0) {
        name = name.substr(0, paren);
    }
    
    this._dom.label.innerHTML = name;
    this._dom.label.title = this._settings.fullLabel + " - " + pathToString(this._settings.path);
    this._dom.closeButton.onclick = function() { self._settings.facetRemover(self); };
    this._dom.resetAction.onclick = function() { self._reset(); };
    
    this._dom.showAllAction.onclick = function() { self._showAllChoices(); };
    this._dom.showTopChoicesAction.onclick = function() { self._showTopChoices(); };
    this._dom.settingsAction.onclick = function() { self._configure(); };
    
    if (this._settings.expectedType == "/location/location") {
        this._dom.mapAction.style.display = "inline";
        this._dom.mapAction.onclick = function() { self._map(); };
    }
    
    this._dom.showQueryAction.onclick = function() { self._showQuery(); };
    if (getMode("debug")) {
        this._dom.showQueryAction.style.display = "inline";
    }
};

ListFacet.prototype._updateUI = function() {
    if (this._queryNode != null) {
        this._startRenderChoices();
    }
};

ListFacet.prototype._pivot = function() {
    onNewCollection(new Collection(new PivotedCollectionDefinition(this._collection, this._settings.path, this._settings.label)));
};

ListFacet.prototype._map = function() {
    var newPath = clone(this._settings.path);
    newPath.push({ property: "/location/location/geolocation", forward: true });
    
    trailPoints[trailPointIndex].addView(new MapView(this._collection, this._settings.label, newPath));
};

ListFacet.prototype._showQuery = function() {
    showQuery([this._createChoiceQuery()]);
};

ListFacet.prototype._startRenderChoices = function() {
    if (this._queryNode != null) {
        this._dom.bodyDiv.style.display = "block";
        this._dom.statusSection.style.display = "block";
        
        var self = this;
        JsonpQueue.queryOne(
			[ this._createChoiceQuery() ], 
			function(o) {
				self._onRenderChoicesResults(o.result);
			}, 
			function(s, query) {
				genericErrorHandler(s, query);
				self._dom.bodyDiv.style.display = "none";
				self._dom.statusSection.style.display = "none";
			}
		);
    }
};

ListFacet.prototype._createChoiceQuery = function() {
    var queryNode = clone(this._queryNode);
    
    var path = this._settings.path;
    var lastQueryNode = null;
    for (var i = 0; i < path.length; i++) {
        var pathNode = path[i];
        var newQueryNode = {};
        newQueryNode[backwardPathSegment(pathNode)] = [queryNode];
        
        lastQueryNode = queryNode;
        queryNode = newQueryNode;
    }
    lastQueryNode["return"] = "count";
    
    queryNode["id"] = null;
    queryNode["name"] = null;
    
    return queryNode;
};

ListFacet.prototype._onRenderChoicesResults = function(results) {
    if (this._dom == null) {
        return;
    }
    
    var path = this._settings.path;
    var lastPathSegmentBackward = (path.length > 0) ? backwardPathSegment(path[path.length - 1]) : "";
    var retrieveCount = function(r) {
        if (typeof r == "object" && lastPathSegmentBackward in r && r[lastPathSegmentBackward].length > 0) {
            return r[lastPathSegmentBackward][0];
        }
        return r;
    };
    
    /*
     *  Create choice entries and be sure to include any choice that
     *  has been selected even though its value might be zero.
     */
    var selectionMap = {};
    for (var i = 0; i < this._selection.length; i++) {
        selectionMap[this._selection[i]] = true;
    }
    
    var entries = [];
    for (var i = 0; i < results.length; i++) {
        var r = results[i];
        if (r.name != null) {
            var count = retrieveCount(r);
            if (count > 0 || r.id in selectionMap) {
                entries.push({
                    id:         r.id,
                    name:       r.name,
                    count:      count,
                    selected:   r.id in selectionMap
                });
            }
        }
    }
    
    this._choiceEntries = entries;
    
    this._renderChoices();
};

ListFacet.prototype._renderChoices = function() {
    var entries = this._choiceEntries;
    
    /*
     *  Sort the choice entries.
     */
    var baseSorter = function(a, b) {
        var c = a.name.localeCompare(b.name);
        return c != 0 ? c : a.id.localeCompare(b.id);
    };
    var modeSorter = (this._sortMode == "count") ?
        function(a, b) {
            var c = b.count - a.count;
            return c != 0 ? c : baseSorter(a, b);
        } :
        baseSorter;
    var sorter = (this._sortDirection == "forward") ?
        modeSorter :
        function(a, b) { return -modeSorter(a, b); };
    
    entries.sort(sorter);
    
    /*
     *  Bubble the selected choices up if we're abbreviating
     *  so that they are visible and can be deselected. But
     *  we need to try to preserve the choices' order as much
     *  as possible while bubbling.
     */
    if (!this._showAll && entries.length > ListFacet.abbreviatedCount) {
        var selectedCount = this._selection.length;
        
        var headList = entries.slice(0, ListFacet.abbreviatedCount);
        var tailList = entries.slice(ListFacet.abbreviatedCount);
        var bubbleList = [];
        
        for (var i = tailList.length - 1; i>= 0; i--) {
            var entry = tailList[i];
            if (entry.selected) {
                tailList.splice(i, 1);
                bubbleList.unshift(entry);
            }
        }
        
        var bubbleCount = bubbleList.length;
        for (var i = headList.length - 1; i >= 0 && bubbleCount > 0; i--) {
            var entry = headList[i];
            if (!entry.selected) {
                headList.splice(i, 1);
                bubbleCount--;
            }
        }
        
        entries = headList.concat(bubbleList);
    }

    /*
     *  Now generate the DOM.
     */
    var bodyDiv = this._dom.bodyDiv;
    bodyDiv.innerHTML = "";
    
    var self = this;
    var hasRestrictions = this.hasRestrictions();
    var facetChoiceTemplate = document.getElementById("facet-choice-template");
    var makeFacetChoice = function(entry) {
        var div = facetChoiceTemplate.cloneNode(true);
        div.id = null;
        div.className = entry.selected ? "facet-choice facet-choice-selected" : "facet-choice";
        div.style.display = "block";
        
        var label = div.getElementsByTagName("a")[0];
        label.innerHTML = entry.name;
        label.onclick = function(evt) {
            self._onFacetChoiceClick(entry);
        };
        
        var count = div.getElementsByTagName("span")[0];
        count.innerHTML = "(" + entry.count + ")";
        
        var action = div.getElementsByTagName("a")[1];
        action.style.display = hasRestrictions ? "inline" : "none";
        if (hasRestrictions) {
            if (entry.selected) {
                action.innerHTML = "remove";
                action.onclick = function(evt) {
                    self._removeRestriction(entry.id);
                };
            } else {
                action.innerHTML = "add";
                action.onclick = function(evt) {
                    self._addAlsoRestriction(entry.id);
                };
            }
        }
        
        bodyDiv.appendChild(div);
    };
    for (var i = 0; i < entries.length; i++) {
        makeFacetChoice(entries[i]);
    }
    
    /*
     *  Show/hide actions in the footer
     */
    var setDisplay = function(elmt, display) {
        elmt.style.display = display;
    };
    var setClassName = function(elmt, className) {
        elmt.className = className;
    };
    if (this._choiceEntries.length <= ListFacet.abbreviatedCount) {
        setDisplay(this._dom.showAllAction, "none");
        setDisplay(this._dom.showTopChoicesAction, "none");
        setDisplay(this._dom.footerSeparators[0], "none");
        setClassName(bodyDiv, "facet-body");
    } else {
        setDisplay(this._dom.footerSeparators[0], "inline");
        if (this._showAll) {
            setDisplay(this._dom.showAllAction, "none");
            setDisplay(this._dom.showTopChoicesAction, "inline");
            setClassName(bodyDiv, "facet-body-scrollable");
        } else {
            setDisplay(this._dom.showAllAction, "inline");
            setDisplay(this._dom.showTopChoicesAction, "none");
            setClassName(bodyDiv, "facet-body");
        }
    }
    setDisplay(this._dom.statusSection, "none");
    setDisplay(this._dom.resetAction, this._selection.length > 0 ? "inline" : "none");
};

ListFacet.prototype._showAllChoices = function() {
    Logging.log("facet-show-all-choices", {
        path:       pathToString(this._settings.path)
    });
    
    this._showAll = true;
    this._renderChoices();
};

ListFacet.prototype._showTopChoices = function() {
    Logging.log("facet-top-choices", {
        path:       pathToString(this._settings.path)
    });
    
    this._showAll = false;
    this._renderChoices();
};

ListFacet.prototype._onFacetChoiceClick = function(entry) {
    if (entry.selected && this._selection.length == 1) {
        this._removeRestriction(entry.id);
    } else {
        this._addOnlyRestriction(entry.id);
    }
};

ListFacet.prototype._addOnlyRestriction = function(choiceID) {
    Logging.log("facet-add-only-restriction", {
        path:       pathToString(this._settings.path),
        choiceID:   choiceID
    });
    this._applySelection([choiceID], "Select " + choiceID);
};

ListFacet.prototype._addAlsoRestriction = function(choiceID) {
    Logging.log("facet-add-also-restriction", {
        path:       pathToString(this._settings.path),
        choiceID:   choiceID
    });
    this._applySelection([].concat(this._selection, choiceID), "Also select " + choiceID);
};

ListFacet.prototype._removeRestriction = function(choiceID) {
    Logging.log("facet-remove-restriction", {
        path:       pathToString(this._settings.path),
        choiceID:   choiceID
    });
    
    var newSelection = [];
    for (var i = 0; i < this._selection.length; i++) {
        if (choiceID != this._selection[i]) {
            newSelection.push(this._selection[i]);
        }
    }
    this._applySelection(newSelection, "Unselect " + choiceID);
};

ListFacet.prototype._reset = function() {
    Logging.log("facet-reset-restrictions", {
        path:       pathToString(this._settings.path)
    });
    this._applySelection([], "Reset selection");
};

ListFacet.prototype._applySelection = function(newSelection, actionLabel) {
    var self = this;
    var oldSelection = this._selection;
        SimileAjax.History.addLengthyAction(
        function() { 
            self._selection = newSelection;
            self._notifyCollection();
        },
        function() { 
            self._selection = oldSelection;
            self._notifyCollection();
        },
        actionLabel
    );
};

ListFacet.prototype._notifyCollection = function() {
    this._collection.onFacetUpdated(this);
};
function TextSearchFacet(collection, settings) {
    this._collection = collection;
    this._settings = settings;
    this._query = null;
    
    this._div = null;
    this._dom = null;
    
    collection.addFacet(this);
};

TextSearchFacet.reconstructFromState = function(state, collection, facetRemover) {
    var facet = new TextSearchFacet(collection, {});
    if ("q" in state) {
        facet._query = state.q;
    }
    
    return facet;
};

TextSearchFacet.prototype.dispose = function() {
    this._collection.removeFacet(this);
    this._collection = null;
    
    this._div = null;
    this._dom = null;
    this._query = null;
};

TextSearchFacet.prototype.getState = function() {
    var r = {};
    if (this._query != null) {
        r.q = this._query;
    }
    return r;
};

TextSearchFacet.prototype.hasRestrictions = function() {
    return this._query != null;
};

TextSearchFacet.prototype.installUI = function(div) {
    this._div = div;
    this._constructUI();
    this._updateUI();
};

TextSearchFacet.prototype.uninstallUI = function() {
    if (this._dom != null) {
        this._dom.input.onkeydown = null;
        this._dom.resetAction.onclick = null;
        this._dom = null;
        this._div = null;
    }
};

TextSearchFacet.prototype.onModeChanged = function(mode) {
};

TextSearchFacet.prototype.update = function(queryNode) {
    // nothing to do
};

TextSearchFacet.prototype.restrict = function(queryNode) {
    if (this._query != null) {
        queryNode["name~="] = this._query + "*";
    }
};

TextSearchFacet.prototype._constructUI = function() {
    var self = this;
    
    var div = document.getElementById("text-search-facet-template").cloneNode(true);
    div.style.display = "block";
    div.id = "";
    
    var divs = div.getElementsByTagName("div");
    
    this._dom = {
        headerDiv:      divs[0],
        inputDiv:       divs[1],
        statusDiv:      divs[2]
    };
    this._dom.input = this._dom.inputDiv.firstChild;
    this._dom.pastQuery = this._dom.statusDiv.getElementsByTagName("span")[0];
    this._dom.resetAction = this._dom.statusDiv.getElementsByTagName("a")[0];
    this._div.appendChild(div);
    
    this._dom.input.onkeydown = function(evt) { return self._onKeyDown(evt); };
    this._dom.resetAction.onclick = function(evt) { self._reset(); };
};

TextSearchFacet.prototype._updateUI = function() {
    if (this._query != null) {
        this._dom.statusDiv.style.display = "block";
        this._dom.pastQuery.innerHTML = this._query;
    } else {
        this._dom.statusDiv.style.display = "none";
    }
};

TextSearchFacet.prototype._onKeyDown = function(evt) {
    if (evt.keyCode == 13) { // return, enter
        var query = this._dom.input.value.trim();
        if (query.length == 0) {
            query = null;
        }
        
        Logging.log("facet-search", { "query" : query });
        this._applySelection(query);
    }
};

TextSearchFacet.prototype._reset = function() {
    Logging.log("facet-search-reset", {});
    this._applySelection(null, "Clear text search");
};

TextSearchFacet.prototype._applySelection = function(query) {
    var self = this;
    var oldQuery = this._query;
    SimileAjax.History.addLengthyAction(
        function() { 
            self._query = query;
            self._updateUI();
            self._notifyCollection();
        },
        function() { 
            self._query = oldQuery;
            self._updateUI();
            self._notifyCollection();
        },
        "Search for " + query
    );
};

TextSearchFacet.prototype._notifyCollection = function() {
    this._collection.onFacetUpdated(this);
};
var ParallaxSearchWidget = {};

ParallaxSearchWidget.create = function(input, queryHandler) {
    return new ParallaxSearchWidget._Impl(input, queryHandler);
};

ParallaxSearchWidget.defaultQueryHandler = function(query) {
    var params = [];
    if ("id" in query) {
        params.push("id=" + encodeURIComponent(query.id));
        params.push("label=" + encodeURIComponent(query.label));
    } else {
        params.push("type=" + encodeURIComponent(query.typeID));
    };
    if ("search" in query) {
        params.push("search=" + encodeURIComponent(query.search));
    }
    window.location = window.ParallaxConfig.appendConfigParams("browse.html?" + params.join("&"));
};

ParallaxSearchWidget._Impl = function(input, queryHandler) {
    this._input = input;
    this._queryHandler = queryHandler;
    
    this._previousSearch = "";
    this._timerID = null;
    this._selectedLink = null;
    
    this._constructUI();
    this._registerEventHandlers();
    
    var self = this;
    $(window).click(function(evt) {
        self._hideAnyPanel(evt);
    });
    $(window).keyup(function(evt) { 
        if (evt.keyCode == 27) {
            self.hide();
        } 
    });
};

ParallaxSearchWidget._Impl.prototype.query = function(text) {
    this._input.value = text;
    this._input.focus();
    
    this._previousSearch = text;
    
    this._showResultPanel(false);
    this._showErrorPanel(false);
    this._clearResults();
    
    this._showStatusPanel(true);
    this._startQueryProcess(text);
};

ParallaxSearchWidget._Impl.prototype._constructUI = function() {
    var resultPanel = document.createElement("div");
    resultPanel.className = "parallax-search-widget-result-panel";
    resultPanel.innerHTML =
        '<div class="parallax-search-widget-result-section" style="border-top: none;">' +
            '<div class="parallax-search-widget-result-list"></div>' +
            '<div class="parallax-search-widget-result-show-more"><a href="javascript:{}" class="action">more collections about <span class="parallax-search-widget-result-highlight">blah</span></a></a></div>' +
        '</div>' +
        '<div class="parallax-search-widget-result-section">' +
            '<div class="parallax-search-widget-result-status">Trying to find more specific topics...</div>' +
            '<div class="parallax-search-widget-result-heading">Topics mentioning <span class="parallax-search-widget-result-highlight">blah</span> in their text content</div>' +
            '<div class="parallax-search-widget-result-list"></div>' +
            '<div class="parallax-search-widget-result-show-more"><a href="javascript:{}" class="action">more topics mentioning <span class="parallax-search-widget-result-highlight">blah</span></a></div>' +
        '</div>' +
        '<div class="parallax-search-widget-result-section">' +
            '<div class="parallax-search-widget-result-status">Trying to find more individual topics...</div>' +
            '<div class="parallax-search-widget-result-heading">Individual topics most resembling <span class="parallax-search-widget-result-highlight">blah</span></div>' +
            '<div class="parallax-search-widget-result-list"></div>' +
        '</div>';

    document.body.appendChild(resultPanel);
    
    this._resultPanelDom = { panel: resultPanel };
    
    this._resultPanelDom.generalResultSection = resultPanel.childNodes[0];
    this._resultPanelDom.generalResultList = this._resultPanelDom.generalResultSection.childNodes[0];
    this._resultPanelDom.generalResultShowMore = this._resultPanelDom.generalResultSection.childNodes[1];
    this._resultPanelDom.generalResultQueryText = this._resultPanelDom.generalResultShowMore.firstChild.getElementsByTagName("span")[0];
        
    this._resultPanelDom.specificResultSection = resultPanel.childNodes[1];
    this._resultPanelDom.specificResultStatus = this._resultPanelDom.specificResultSection.childNodes[0];
    this._resultPanelDom.specificResultHeading = this._resultPanelDom.specificResultSection.childNodes[1];
    this._resultPanelDom.specificResultList = this._resultPanelDom.specificResultSection.childNodes[2];
    this._resultPanelDom.specificResultShowMore = this._resultPanelDom.specificResultSection.childNodes[3];
    this._resultPanelDom.specificResultQueryText1 = this._resultPanelDom.specificResultHeading.getElementsByTagName("span")[0];
    this._resultPanelDom.specificResultQueryText2 = this._resultPanelDom.specificResultShowMore.firstChild.getElementsByTagName("span")[0];
    
    this._resultPanelDom.individualResultSection = resultPanel.childNodes[2];
    this._resultPanelDom.individualResultStatus = this._resultPanelDom.individualResultSection.childNodes[0];
    this._resultPanelDom.individualResultHeading = this._resultPanelDom.individualResultSection.childNodes[1];
    this._resultPanelDom.individualResultList = this._resultPanelDom.individualResultSection.childNodes[2];
    this._resultPanelDom.individualResultQueryText = this._resultPanelDom.individualResultHeading.getElementsByTagName("span")[0];
    
    var statusPanel = document.createElement("div");
    statusPanel.className = "parallax-search-widget-status-panel";
    statusPanel.innerHTML = 
        '<div class="parallax-search-widget-status-message">Working...</div>';
    document.body.appendChild(statusPanel);
        
    this._statusPanelDom = { panel: statusPanel };
    
    var errorPanel = document.createElement("div");
    errorPanel.className = "parallax-search-widget-error-panel";
    errorPanel.innerHTML = 
        '<div class="parallax-search-widget-error-title">Oops! Our web server is on strike...</div>' +
        '<div class="parallax-search-widget-error-message"></div>';
    document.body.appendChild(errorPanel);
        
    this._errorPanelDom = { panel: errorPanel };
    this._errorPanelDom.message = errorPanel.childNodes[1];
};

ParallaxSearchWidget._Impl.prototype._registerEventHandlers = function() {
    var self = this;
    
    this._input.onkeyup = function(event) { return self._inputOnKeyUp(event); };
    this._input.onkeydown = function(event) { return self._inputOnKeyDown(event); };
    
    this._resultPanelDom.generalResultShowMore.firstChild.onclick = function(event) { return self._showMoreGeneralResults(event); };
    this._resultPanelDom.specificResultShowMore.firstChild.onclick = function(event) { return self._showMoreSpecificResults(event); };
};

ParallaxSearchWidget._Impl.prototype._inputOnKeyUp = function(event) {
    var text = this._input.value;
    if (text != this._previousSearch) {
        this._previousSearch = text;
        
        if (this._timerID != null) {
            window.clearTimeout(this._timerID);
            this._timerID = null;
        }
        
        this._showResultPanel(false);
        this._showErrorPanel(false);
        
        this._clearResults();
        if (text.length >= 3) {
            this._scheduleQueryProcess(text);
        }
    }
}

ParallaxSearchWidget._Impl.prototype._inputOnKeyDown = function(event) {
    if (event.keyCode == 38) { // up
        this._selectPreviousResult();
    } else if (event.keyCode == 40) { // down
        this._selectNextResult();
    } else if (event.keyCode == 13) { // enter
        this._invokeCurrentExploreLink(event);
    } else if (event.keyCode == 27) { // esc
        this.hide();
    } else {
        return true;
    }
    return ParallaxSearchWidget._cancelEvent(event);
};

ParallaxSearchWidget._Impl.prototype.hide = function() {
    this._showResultPanel(false);
    this._showErrorPanel(false);
};

ParallaxSearchWidget._Impl.prototype._scheduleQueryProcess = function(text) {
    this._showStatusPanel(true);
    
    var self = this;
    window.setTimeout(function() { self._startQueryProcess(text); }, 300);
};

ParallaxSearchWidget._Impl.prototype._showStatusPanel = function(show) {
    this._showFloatingPanel(this._statusPanelDom.panel, show);
};

ParallaxSearchWidget._Impl.prototype._showErrorPanel = function(show, s) {
    if (show) {
        this._errorPanelDom.message.innerHTML = s;
    }
    this._showFloatingPanel(this._errorPanelDom.panel, show);
};

ParallaxSearchWidget._Impl.prototype._showResultPanel = function(show) {
    this._showFloatingPanel(this._resultPanelDom.panel, show);
};

ParallaxSearchWidget._Impl.prototype._hideAnyPanel = function(evt) {
    if (this._hidePanelIfShown(this._resultPanelDom.panel)) return;
    if (this._hidePanelIfShown(this._statusPanelDom.panel)) return;
    if (this._hidePanelIfShown(this._errorPanelDom.panel)) return;
};

ParallaxSearchWidget._Impl.prototype._hidePanelIfShown = function(panel, evt) {
    if (panel.style.display == "none") {
        return false;
    }
    
    if (evt) {
        var coords = SimileAjax.DOM.getEventRelativeCoordinates(evt, panel);
        if (coords.x > 0 && coords.y > 0 &&
            coords.x < panel.offsetWidth && coords.y < panel.offsetHeight) {
            
            return false;
        }
    }
    this._showFloatingPanel(panel, false);
    return true;
};

ParallaxSearchWidget._Impl.prototype._showFloatingPanel = function(panel, show) {
    panel.style.display = show ? "block" : "none";
    
    var bodyWidth = document.body.scrollWidth;
    var panelWidth = panel.offsetWidth;
    var c = ParallaxSearchWidget._getPageCoordinates(this._input);
    
    if (show) {
        if (c.left + panelWidth > bodyWidth) {
            panel.style.left = (c.left + this._input.offsetWidth - panelWidth) + "px";
        } else {
            panel.style.left = c.left + "px";
        }
        panel.style.top = (c.top - 1 + this._input.offsetHeight) + "px";
    }
};

ParallaxSearchWidget._Impl.prototype._clearResults = function() {
    this._selectLink();
    
    this._resultPanelDom.generalResultList.innerHTML = "";
    
    this._resultPanelDom.specificResultSection.style.display = "block";
    this._resultPanelDom.specificResultStatus.style.display = "block";
    
    this._resultPanelDom.specificResultList.innerHTML = "";
    this._resultPanelDom.specificResultHeading.style.display = "none";
    this._resultPanelDom.specificResultShowMore.style.display = "none";
    
    this._resultPanelDom.individualResultList.innerHTML = "";
    this._resultPanelDom.individualResultSection.style.display = "none";
};

ParallaxSearchWidget._Impl.prototype._makeErrorHandler = function() {
    var self = this;
    return function(s) {
        self._showStatusPanel(false);
        self._showErrorPanel(true, s);
    };
};

ParallaxSearchWidget._Impl.prototype._startQueryProcess = function(text) {try {
    this._resultPanelDom.generalResultQueryText.innerHTML = text;
    this._resultPanelDom.specificResultQueryText1.innerHTML = text;
    this._resultPanelDom.specificResultQueryText2.innerHTML = text;
    this._resultPanelDom.individualResultQueryText.innerHTML = text;
    
    var self = this;
    JsonpQueue.queryOne(
        [{  "id" : null,
            "name" : null,
            "name~=" : "*" + text + "*",
            "type" : "/type/type",
            "/freebase/type_profile/instance_count" : null
        }],
        function(o) { self._onQueryTypeDone(text, o); self._showStatusPanel(false); }, 
        this._makeErrorHandler()
    );} catch (e) { log(e) }
};

ParallaxSearchWidget._Impl.prototype._onQueryTypeDone = function(text, o) {
    try { 
        if (text != this._previousSearch) {
            return;
        }

        var results = o.result;
        for (var i = results.length - 1; i >= 0; i--) {
            var typeEntry = results[i];
            if (typeEntry["/freebase/type_profile/instance_count"] == null) {
                results.splice(i, 1);
            } else {
                typeEntry.fromUser = typeEntry.id.indexOf("/user/") == 0 ? 1 : 0;
                
                typeEntry.lName = typeEntry.name.toLowerCase();
                
                var start = typeEntry.lName.indexOf(text);
                if (start == 0) {
                    typeEntry.distance = 0;
                } else if (start > 0) {
                    var s = typeEntry.lName.substr(0, start);
                    var nonSpace = s.lastIndexOf(" ") + 1;
                    typeEntry.distance = s.length - nonSpace;
                } else {
                    typeEntry.distance = Number.POSITIVE_INFINITY;
                }
            }
        }

        results.sort(function(a, b) {
            var aName = a.lName;
            var bName = b.lName;
            var c = a.fromUser - b.fromUser;
            if (c == 0) {
                c = a.distance - b.distance;
                if (c == 0) {
                    c = aName.length - bName.length;
                    if (c == 0) {
                        c = b["/freebase/type_profile/instance_count"] - a["/freebase/type_profile/instance_count"];
                        if (c == 0) {
                            c = a.id.localeCompare(b.id);
                        }
                    }
                }
            }
            return c;
        });

        var generalResultList = this._resultPanelDom.generalResultList;
        generalResultList.innerHTML = "";

        var self = this;
        var processType = function(typeEntry, show) {
            var start = typeEntry.lName.indexOf(text);
            var html = 
                (start >= 0 ? 
                    (typeEntry.name.substr(0, start) + "<span class='parallax-search-widget-result-highlight'>" + 
                        typeEntry.name.substr(start, text.length) + "</span>" + 
                        typeEntry.name.substr(start + text.length)) :
                    typeEntry.name
                ) + 
                " collection (" + typeEntry["/freebase/type_profile/instance_count"] + " topics)";
                    
            var a = self._makeLink(
                html,
                typeEntry.id,
                (typeEntry.fromUser == 1),
                show
            );
            a.onclick = function() { self._queryHandler({ typeID: typeEntry.id }); };
            
            generalResultList.appendChild(a);
            
            return a;
        };

        for (var i = 0; i < results.length; i++) {
            var a = processType(results[i], i < 5);
            if (i == 0) {
                a.className += " parallax-search-widget-result-row-selected";
                this._selectedLink = a;
            }
        }

        this._resultPanelDom.generalResultShowMore.style.display = results.length > 5 ? "block" : "none";

        this._showResultPanel(true);
        this._querySpecificTopics(text);
    } catch (e) { log(e); }
};

ParallaxSearchWidget._Impl.prototype._showMoreGeneralResults = function(event) {
    var generalResultList = this._resultPanelDom.generalResultList;
    var childNodes = generalResultList.childNodes;
    for (var i = 0; i < childNodes.length; i++) {
        childNodes[i].style.display = "block";
    }
    this._resultPanelDom.generalResultShowMore.style.display = "none";
    
    SimileAjax.DOM.cancelEvent(event);
    return false;
};

ParallaxSearchWidget._Impl.prototype._querySpecificTopics = function(text) {
    var self = this;
    JsonpQueue.queryOne(
        [{  "/type/type/instance" : [{
                "name~=" : text + "*",
                "return" : "count"
            }],
            "id" : null,
            "name" : null,
            "type" : "/type/type"
        }],
        function(o) { self._onQuerySpecificTopicsDone(text, o); },
        function(o) { self._onQuerySpecificTopicsFailed(text); }
    );
};

ParallaxSearchWidget._Impl.prototype._onQuerySpecificTopicsDone = function(text, o) {
    if (text != this._previousSearch) {
        return;
    }

    var results = o.result;
    for (var i = results.length - 1; i >= 0; i--) {
        var typeEntry = results[i];
        if (typeEntry.id.indexOf("/common/") == 0 ||
            typeEntry.id.indexOf("/type/") == 0) {
            results.splice(i, 1);
        } else {
            typeEntry.fromUser = typeEntry.id.indexOf("/user/") == 0 ? 1 : 0;
            typeEntry.count = typeEntry["/type/type/instance"][0];
        }
    }
    
    results.sort(function(a, b) {
        var c = a.fromUser - b.fromUser;
        if (c == 0) {
            c = b.count - a.count;
            if (c == 0) {
                c = a.name.localeCompare(b.name);
                if (c == 0) {
                    c = a.id.localeCompare(b.id);
                }
            }
        }
        return c;
    });
    
    var specificResultList = this._resultPanelDom.specificResultList;
    specificResultList.innerHTML = "";
    
    var self = this;
    var processType = function(typeEntry, show) {
        var a = self._makeLink(
            "... in " + typeEntry.name + " collection (" + typeEntry.count + ")",
            typeEntry.id,
            (typeEntry.fromUser == 1),
            show
        );
        a.onclick = function() { self._queryHandler({ typeID: typeEntry.id, search: text }); };
        
        specificResultList.appendChild(a);
        
        return a;
    };
    
    for (var i = 0; i < results.length; i++) {
        var a = processType(results[i], i < 5);
        if (this._selectedLink == null && i == 0) {
            a.className += " parallax-search-widget-result-row-selected";
            this._selectedLink = a;
        }
    }
    
    this._resultPanelDom.specificResultStatus.style.display = "none";
    this._resultPanelDom.specificResultHeading.style.display = "block";
    this._resultPanelDom.specificResultSection.style.display = "block";
    this._resultPanelDom.specificResultShowMore.style.display = results.length > 5 ? "block" : "none";
    
    this._queryIndividualTopics(text);
};

ParallaxSearchWidget._Impl.prototype._showMoreSpecificResults = function(event) {
    var specificResultList = this._resultPanelDom.specificResultList;
    var childNodes = specificResultList.childNodes;
    for (var i = 0; i < childNodes.length; i++) {
        childNodes[i].style.display = "block";
    }
    this._resultPanelDom.specificResultShowMore.style.display = "none";
    
    SimileAjax.DOM.cancelEvent(event);
    return false;
};

ParallaxSearchWidget._Impl.prototype._onQuerySpecificTopicsFailed = function(text) {
    this._resultPanelDom.specificResultSection.style.display = "none";
    this._queryIndividualTopics(text);
};

ParallaxSearchWidget._Impl.prototype._queryIndividualTopics = function(text) {
    var url = ParallaxConfig.corpusBaseUrl + "api/service/search?strict=false&explain=false&limit=3&query=" + encodeURIComponent(text);
    var self = this;

    this._resultPanelDom.individualResultSection.style.display = "block";
    this._resultPanelDom.individualResultList.innerHTML = "";
    JsonpQueue.call(
        url, 
        function(o) { self._onQueryIndividualTopicsDone(text, o); },
        function() { self._onQueryIndividualTopicsFailed(text); }
    );
};

ParallaxSearchWidget._Impl.prototype._onQueryIndividualTopicsDone = function(text, o) {
    if (text != this._previousSearch) {
        return;
    }
    
    this._resultPanelDom.individualResultStatus.style.display = "none";
    this._resultPanelDom.individualResultHeading.style.display = "block";
    this._resultPanelDom.individualResultList.style.display = "block";
    
    var self = this;
    var individualResultList = this._resultPanelDom.individualResultList;
    var createEntry = function(entry) {
        var a = document.createElement("a");
        a.className = "parallax-search-widget-result-row";
        a.innerHTML = '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr valign="top"></tr></table>';
        a.onmouseover = function(event) { return self._onMouseOverLink(this, event); };;
        a.onclick = function() { self._queryHandler({ id: entry.id, label: entry.name }); };
        a.href = "javascript:{}";
        a.style.display = "block";
        
        var table = a.firstChild;
        var td0 = table.rows[0].insertCell(0);
        
        var divName = document.createElement("div");
        divName.className = "parallax-search-widget-result-topic-name";
        divName.innerHTML = entry.name;
        td0.appendChild(divName);
        
        var typeNames = [];
        for (var i = 0; i < entry.type.length && typeNames.length < 3; i++) {
            var type = entry.type[i];
            if (type.id != "/common/topic") {
                typeNames.push(type.name);
            }
        }
        if (i < entry.type.length) {
            typeNames.push("...");
        }
        
        var divTypes = document.createElement("div");
        divTypes.className = "parallax-search-widget-result-topic-types";
        divTypes.innerHTML = typeNames.join(", ");
        td0.appendChild(divTypes);
        
        try {
            var imageID = entry.image.id;
            if (typeof imageID == "string") {
                var td1 = table.rows[0].insertCell(1);
                td1.setAttribute("width", "1");
                
                var img = document.createElement("img");
                img.className = "parallax-search-widget-result-topic-image";
                img.src = ParallaxConfig.corpusBaseUrl + "api/trans/image_thumb" + imageID +
                    "?" + [ 
                        "mode=fillcrop",
                        "maxheight=40",
                        "maxwidth=40"
                    ].join("&");
                td1.appendChild(img);
            }
        } catch (e) {}
        
        individualResultList.appendChild(a);
        return a;
    };
    
    var entries = o.result;
    for (var i = 0; i < entries.length; i++) {
        var a = createEntry(entries[i]);
        if (this._selectedLink == null && i == 0) {
            a.className += " parallax-search-widget-result-row-selected";
            this._selectedLink = a;
        }
    }
};

ParallaxSearchWidget._Impl.prototype._onQueryIndividualTopicsFailed = function(text) {
    if (text != this._previousSearch) {
        return;
    }
    
    this._resultPanelDom.individualResultSection.style.display = "none";
};

ParallaxSearchWidget._Impl.prototype._makeLink = function(text, tooltip, fromUser, show) {
    var self = this;
    var a = document.createElement("a");
    if (fromUser) {
        a.className = "parallax-search-widget-result-user-type parallax-search-widget-result-row";
    } else {
        a.className = "parallax-search-widget-result-row";
    }
    
    a.innerHTML = text;
    a.title = tooltip;
    a.href = "javascript:{}";
    a.style.display = show ? "block" : "none";
    a.onmouseover = function(event) { return self._onMouseOverLink(this, event); };;

    return a;
};

ParallaxSearchWidget._Impl.prototype._onMouseOverLink = function(a, event) {
    this._selectLink(a);
};

ParallaxSearchWidget._Impl.prototype._selectLink = function(a) {
    if (this._selectedLink != null) {
        this._unStyleSelectedLink(this._selectedLink);
        this._selectedLink = null;
    }
    
    if (a) {
        this._styleSelectedLink(a);
        this._selectedLink = a;
    }
};

ParallaxSearchWidget._Impl.prototype._unStyleSelectedLink = function(a) {
    a.className = a.className.replace(/ parallax\-search\-widget\-result\-row\-selected/, "");
};

ParallaxSearchWidget._Impl.prototype._styleSelectedLink = function(a) {
    a.className += " parallax-search-widget-result-row-selected";
};

ParallaxSearchWidget._Impl.prototype._selectPreviousResult = function() {
    var elmt = this._selectedLink;
    if (elmt != null) {
        if (elmt.previousSibling != null) {
            this._selectLink(elmt.previousSibling);
        } else {
            var parent = elmt.parentNode;
            if (parent == this._resultPanelDom.specificResultList) {
                var generalResult = this._resultPanelDom.generalResultList.lastChild;
                while (generalResult != null) {
                    if (generalResult.style.display == "block") {
                        this._selectLink(generalResult);
                        break;
                    }
                    generalResult = generalResult.previousSibling;
                }
            } else if (parent == this._resultPanelDom.individualResultList) {
                var specificResult = this._resultPanelDom.specificResultList.lastChild;
                while (specificResult != null) {
                    if (specificResult.style.display == "block") {
                        this._selectLink(specificResult);
                        break;
                    }
                    specificResult = specificResult.previousSibling;
                }
            }
        }
    }
};

ParallaxSearchWidget._Impl.prototype._selectNextResult = function() {
    var elmt = this._selectedLink;
    if (elmt != null) {
        if (elmt.nextSibling != null && elmt.nextSibling.style.display == "block") {
            this._selectLink(elmt.nextSibling);
        } else {
            var parent = elmt.parentNode;
            if (parent == this._resultPanelDom.generalResultList) {
                if (this._resultPanelDom.specificResultList.firstChild != null) {
                    this._selectLink(this._resultPanelDom.specificResultList.firstChild);
                }
            } else if (parent == this._resultPanelDom.specificResultList) {
                if (this._resultPanelDom.individualResultList.firstChild != null) {
                    this._selectLink(this._resultPanelDom.individualResultList.firstChild);
                }
            }
        }
    }
};

ParallaxSearchWidget._Impl.prototype._invokeCurrentExploreLink = function(event) {
    if (this._selectedLink != null) {
        if (this._selectedLink.href == "javascript:{}") {
            var elmt = this._selectedLink;
            window.setTimeout(function() { elmt.onclick(); }, 100);
        } else {
            window.location.href = this._selectedLink.href;
        }
    }
};

ParallaxSearchWidget._getPageCoordinates = function(elmt) {
    var left = 0;
    var top = 0;
    
    if (elmt.nodeType != 1) {
        elmt = elmt.parentNode;
    }
    
    var elmt2 = elmt;
    while (elmt2 != null) {
        left += elmt2.offsetLeft;
        top += elmt2.offsetTop;
        elmt2 = elmt2.offsetParent;
    }
    
    var body = document.body;
    while (elmt != null && elmt != body) {
        if ("scrollLeft" in elmt) {
            left -= elmt.scrollLeft;
            top -= elmt.scrollTop;
        }
        elmt = elmt.parentNode;
    }
    
    return { left: left, top: top };
};

ParallaxSearchWidget._cancelEvent = function(evt) {
    if (evt) {
        evt.returnValue = false;
        evt.cancelBubble = true;
        if ("preventDefault" in evt) {
            evt.preventDefault();
        }
    }
    return false;
};
function PropertyPickerWidget(useTopicsThemselvesByDefault, includeNativeTypes, useCVTsAsIs) {
    this.specified = useTopicsThemselvesByDefault;
    
    this._baseQueryNode = null;
    this._basePropertyPicker = null;
    
    this._includeNativeTypes = (includeNativeTypes);
    this._useCVTsAsIs = (useCVTsAsIs);
    
    this._segments = [];
    
    this._elmt;
    this._dom;
}

PropertyPickerWidget.prototype.getExpectedType = function() {
    if (this._segments.length > 0) {
        return this._segments[this._segments.length - 1].dimension.expectedType;
    }
    return null;
}

PropertyPickerWidget.prototype.getState = function() {
    var state = { s: this.specified };
    if (this.specified) {
        var a = [];
        for (var i = 0; i < this._segments.length; i++) {
            var dimension = this._segments[i].dimension;
            var path = dimension.path;
            a.push(compressPath(path));
        }
        state.d = a;
    }
    return state;
}

PropertyPickerWidget.prototype.reconfigureFromState = function(state) {
    if (typeof state != "object") {
        return;
    }
    
    this.specified = state.s;
    this._segments = [];
    
    if (this.specified) {
        var d = state.d;
        for (var i = 0; i < d.length; i++) {
            var path = decompressPath(d[i]);
            var dimension = {
                path: path
            };
            this._segments.push({ dimension: dimension });
        }
    }
}

PropertyPickerWidget.prototype.getDimensions = function() {
    var dimensions = [];
    for (var i = 0; i < this._segments.length; i++) {
        dimensions.push(this._segments[i].dimension);
    }
    return dimensions;
};

PropertyPickerWidget.prototype.getTotalPath = function() {
    var path = [];
    for (var i = 0; i < this._segments.length; i++) {
        path = path.concat(this._segments[i].dimension.path);
    }
    return path;
};

PropertyPickerWidget.prototype.dispose = function() {
};

PropertyPickerWidget.prototype.setBaseQueryNode = function(queryNode) {
    this._baseQueryNode = queryNode;
};

PropertyPickerWidget.prototype.setBasePropertyPicker = function(basePropertyPicker) {
    this._basePropertyPicker = basePropertyPicker;
};

PropertyPickerWidget.prototype.installUI = function(elmt) {
    this._elmt = elmt;
    this._render();
};

PropertyPickerWidget.prototype.uninstallUI = function() {
    if (this._elmt != null) {
        this._elmt.innerHTML = "";
        this._elmt = null;
        
        this._dom = null;
    }
};

PropertyPickerWidget.prototype._render = function() {
    this._elmt.innerHTML = "";
    
    var self = this;
    if (this._segments.length == 0) {
        if (this.specified) {
            this._elmt.appendChild(document.createTextNode("use the topics themselves \u2022 or "));
            
            var span = document.createElement("span");
            span.innerHTML = '<a class="action" href="javascript:{}">select&nbsp;a&nbsp;property&nbsp;&raquo;</a>';
            span.firstChild.onclick = function() { self._showDropdown(span, 0); }
            
            this._elmt.appendChild(span);
        } else {
            this._elmt.appendChild(document.createTextNode("unspecified \u2022 "));
            
            var span = document.createElement("span");
            span.innerHTML = '<a class="action" href="javascript:{}">select&nbsp;property&nbsp;&raquo;</a>';
            span.firstChild.onclick = function() { self._showDropdown(span, 0); }
            
            this._elmt.appendChild(span);
        }
    } else {
        var createDimension = function(index, segment) {
            var path = segment.dimension.path;
            var lastNode = path[path.length - 1];
            var propertyID = lastNode.property;
            
            var span = document.createElement("span");
            span.innerHTML = '<a class="action" href="javascript:{}">' + propertyID + '</a>';
            span.firstChild.onclick = function() { self._showDropdown(span, index); }
            self._elmt.appendChild(span);
            
            if ("label" in segment.dimension) {
                span.firstChild.firstChild.nodeValue = segment.dimension.label;
            } else {
                SchemaUtil.tryGetPropertyLabel(propertyID, function(propertyLabel) {
                    span.firstChild.firstChild.nodeValue = propertyLabel;
                });
            }
        };
        
        var i;
        for (i = 0; i < this._segments.length; i++) {
            var segment = this._segments[i];
            if (i > 0) {
                this._elmt.appendChild(document.createTextNode(" \u2192 "));
            }
            createDimension(i, segment);
        }
        
        this._elmt.appendChild(document.createTextNode(" \u2022 "));
        
        var span = document.createElement("span");
        span.innerHTML = '<a class="action" href="javascript:{}">chain&nbsp;another&nbsp;property&nbsp;&raquo;</a>';
        span.firstChild.onclick = function() { self._showDropdown(span, i); }
        this._elmt.appendChild(span);
    }
};

PropertyPickerWidget.prototype._showDropdown = function(elmt, index) {
    var self = this;
    
    var typeStack = new TypeStack(this._getQueryNode(index), this._includeNativeTypes, this._useCVTsAsIs);
    typeStack.runWhenInitialized(function() {
        var dimensions = typeStack.getAllDimensions();
        typeStack.dispose();
        
        dimensions.sort(function(a, b) {
            var c = a.label.localeCompare(b.label);
            if (c == 0) {
                c = a.fullLabel.localeCompare(b.fullLabel);
            }
            return c;
        });
        self._showDropdownGivenDimensions(elmt, index, dimensions);
    });
};

PropertyPickerWidget.prototype._showDropdownGivenDimensions = function(elmt, index, dimensions) {
    var self = this;
    var staticChoices = [];
    var onPick = function(dimension) {
        self._pickDimension(index, dimension);
    };
    
    if (index == 0) {
        staticChoices.push({
            label:      "(Don't specify anything)",
            icon:       null,
            onclick:    function() { self._dontSpecify(); }
        });
        staticChoices.push({
            label:      "(Use topics themselves)",
            icon:       null,
            onclick:    function() { self._useTopicsThemselves(); }
        });
    }
    if (index < this._segments.length) {
        staticChoices.push({
            label:      "(Remove property)",
            icon:       null,
            onclick:    function() { self._truncate(index); }
        });
    }
    
    DimensionPickerWidget.show(elmt, dimensions, onPick, staticChoices);
};

PropertyPickerWidget.prototype._pickDimension = function(index, dimension) {
    if (index < this._segments.length) {
        this._segments = this._segments.slice(0, index);
    }
    this._segments.push({ dimension: dimension });
    this.specified = true;
    
    if (this._elmt != null) {
        this._render();
    }
};

PropertyPickerWidget.prototype._dontSpecify = function() {
    this.specified = false;
    this._segments = [];
    if (this._elmt != null) {
        this._render();
    }
};

PropertyPickerWidget.prototype._useTopicsThemselves = function() {
    this.specified = true;
    this._segments = [];
    if (this._elmt != null) {
        this._render();
    }
};

PropertyPickerWidget.prototype._truncate = function(index) {
    this._segments = this._segments.slice(0, index);
    if (this._elmt != null) {
        this._render();
    }
};

PropertyPickerWidget.prototype.getQueryNode = function() {
    return this._getQueryNode(this._segments.length);
};

PropertyPickerWidget.prototype._getQueryNode = function(index) {
    if (index == 0) {
        if (this._basePropertyPicker != null) {
            return this._basePropertyPicker.getQueryNode();
        } else {
            return clone(this._baseQueryNode);
        }
    } else {
        var queryNode = this._getQueryNode(index - 1);
        var path = this._segments[index - 1].dimension.path;
        
        var lastQueryNode = null;
        for (var i = 0; i < path.length; i++) {
            var pathNode = path[i];
            var newQueryNode = {};
            newQueryNode[backwardPathSegment(pathNode)] = [queryNode];
            
            lastQueryNode = queryNode;
            queryNode = newQueryNode;
        }
        lastQueryNode["return"] = "count";
        
        return queryNode;
    }
};
function TrailPoint(collection) {
    this.collection = collection;
    
    this._hasUI = false;
    this._baseTypeStack = new TypeStack(this.collection.addBaseRestrictions());
    this._currentTypeStack = new TypeStack(this.collection.addRestrictions());
    
    this._facetRecords = []; // Currently opened
    this._pivotDimensions = [];
    
    this._viewIndex = 0;
    this._views = [
        this.collection.isSingular() ? 
            new SingleTopicView(this.collection) :
            new ThumbnailView(this.collection)
    ];
    
    var self = this;
    this._facetRemover = function(facet) {
        self._removeFacet(facet);
    };
    
    this._textSearchFacet = new TextSearchFacet(collection, {});
    
    this.collection.addListener(this);
}

TrailPoint.maxFacetSuggestions = 7;
TrailPoint.highFacetRatio = 0.5;
TrailPoint.lowFacetRatio = 0.01;

TrailPoint.maxPivotSuggestions = 5;

TrailPoint.reconstructFromState = function(stateEntry, baseCollection) {
    var trailPointDefn = stateEntry.d;
    var collectionDefinition;
    if ("t" in trailPointDefn) {
        collectionDefinition = new RootTypeCollectionDefinition(
            trailPointDefn.t,
            "s" in trailPointDefn ? trailPointDefn.s : null
        );
    } else if ("p" in trailPointDefn) {
        collectionDefinition = new PivotedCollectionDefinition(
            baseCollection,
            decompressPath(trailPointDefn.p),
            trailPointDefn.l
        );
    } else {
        collectionDefinition = new SingleTopicCollectionDefinition(
            trailPointDefn.i,
            trailPointDefn.n
        );
    }
    
    var collection = new Collection(collectionDefinition);
    var trailPoint = new TrailPoint(collection);
    
    return trailPoint;
};

TrailPoint.prototype.playback = function(state, onDone) {
    var self = this;
    
    if ("v" in state) {
        var viewStateArray = state.v;
        
        for (var i = 0; i < this._views.length; i++) {
            this._views[i].dispose();
        }
        this._views = [];
        
        for (var i = 0; i < viewStateArray.length; i++) {
            var viewState = viewStateArray[i];
            var viewClass = eval(viewState.c);
            
            var view = new viewClass(this.collection);
            view.reconfigureFromState(viewState.s);
            
            this._views.push(view);
        }
        
        if ("vi" in state) {
            this._viewIndex = state.vi;
        }
    }
    
    if ("f" in state) {
        var facetStateArray = state.f;
        var fetchFacetSchemas = function() {
            var properties = {};
            for (var i = 0; i < facetStateArray.length; i++) {
                var facetState = facetStateArray[i];
                var path = decompressPath(facetState.p);
                for (var j = 0; j < path.length; j++){
                    properties[path[j].property] = true;
                }
            }
            
            var propertiesA = [];
            for (var n in properties) {
                if (n != "/type/object/type") {
                    propertiesA.push(n);
                }
            }
            
            SchemaUtil.retrievePropertySchemas(propertiesA, constructFacets);
        };
        var constructFacets = function() {
            for (var i = 0; i < facetStateArray.length; i++) {
                var facetState = facetStateArray[i];
                var facet = ListFacet.reconstructFromState(facetState, self.collection, self._facetRemover);
                self._facetRecords.push({ facet: facet });
            }
            onDone();
        };
        
        this._baseTypeStack.runWhenInitialized(fetchFacetSchemas);
    } else {
        onDone();
    }
};

TrailPoint.prototype.getState = function() {
    var r = {
        d: this.collection.getDefinition().getState(),
        s: {}
    };
    
    if (!this.collection.isSingular()) {
        var facetStateArray = [];
        for (var i = 0; i < this._facetRecords.length; i++) {
            var facetRecord = this._facetRecords[i];
            var facet = facetRecord.facet;
            if (facet.hasRestrictions()) {
                facetStateArray.push(facet.getState());
            }
        }
        
        if (facetStateArray.length > 0){
            r.s.f = facetStateArray;
        }
    }
    
    var viewStateArray = [];
    for (var i = 0; i < this._views.length; i++) {
        var view = this._views[i];
        var viewState = view.getState();
        if (viewState != null) {
            viewStateArray.push({
                c: view.getClassName(),
                s: viewState
            });
        }
    }
    if (viewStateArray.length > 0){
        r.s.v = viewStateArray;
        r.s.vi = this._viewIndex;
    }
    
    return r;
};

TrailPoint.prototype.dispose = function() {
    for (var i = 0; i < this._facetRecords.length; i++) {
        var facetRecord = this._facetRecords[i];
        facetRecord.facet.dispose();
    }
    this._facetRecords = null;
    
    this._textSearchFacet.dispose();
    this._textSearchFacet = null;
    
    this._pivotDimensions = null;

    for (var i = 0; i <this._views.length; i++) {
        this._views[i].dispose();
    }
    this._views = null;
    
    this._baseTypeStack.dispose();
    this._baseTypeStack = null;
    
    this.collection = null;
};

TrailPoint.prototype.installUI = function() {try {
    this._hasUI = true;
    
    var div = getFacetPane();
    div.innerHTML = 
        '<div></div>' +
        '<div class="facet-pane-heading">Filter Results</div>' +
        '<div class="facet-pane-controls" style="display: none;">' +
            '<a href="javascript:{}" class="action">more filters &raquo;</a>' +
        '</div>' +
        '<div></div>' +
        '<div class="facet-pane-status-section">' +
            '<img src="images/progress-running.gif" /> Suggesting useful filters...' +
        '</div>';
        
    this._facetPaneDom = {
        textSearchFacetContainer:   div.childNodes[0],
        heading:                    div.childNodes[1],
        controlContainer:           div.childNodes[2],
        facetContainer:             div.childNodes[3],
        statusSection:              div.childNodes[4]
    };
    this._facetPaneDom.addFiltersAction = this._facetPaneDom.controlContainer.getElementsByTagName("a")[0];
    
    div = getPivotPane();
    div.innerHTML = 
        '<div class="pivot-pane-sign">' +
            '<img src="images/parallax-sign-white.png" />' +
        '</div>' +
        '<div class="pivot-pane-header">' +
            'Connections from the topics on this page:' +
        '</div>' +
        '<div class="pivot-pane-body"></div>' +
        '<div class="pivot-pane-status-section status">' +
            '<img src="images/progress-running.gif" /> Finding connections...' +
        '</div>' +
        '<div class="pivot-pane-footer" style="display: none;">' +
            '<a href="javascript:{}" class="action">more connections &raquo;</a>' +
        '</div>';
    this._pivotPaneDom = {
        header:         div.childNodes[1],
        pivotContainer: div.childNodes[2],
        statusSection:  div.childNodes[3],
        footer:         div.childNodes[4]
    };
    this._pivotPaneDom.showMoreRelatedTopicsAction = this._pivotPaneDom.footer.childNodes[0];
    
    var isSingular = this.collection.isSingular();
    getFacetPane().style.display = isSingular ? "none" : "block";
    if (isSingular) {
        this._pivotPaneDom.header.style.display = "none";
        this._pivotPaneDom.pivotContainer.style.display = "none";
        this._pivotPaneDom.statusSection.style.display = "none";
        this._pivotPaneDom.footer.style.display = "none";
    }
    
    this._registerEventHandlers();
    this._startBuildingUI();
    
    this._views[this._viewIndex].installUI(getViewPane());
    this._renderViewSelectorPane();} catch(e) { console.log(e) }
};

TrailPoint.prototype._registerEventHandlers = function() {
    var self = this;
    this._facetPaneDom.addFiltersAction.onclick = function(event) { self._showMoreFilters(); };
    this._pivotPaneDom.showMoreRelatedTopicsAction.onclick = function(event) { self._showMoreRelatedTopics(); };
};

TrailPoint.prototype.uninstallUI = function() {
    this._hasUI = false;
    
    this._unregisterEventHandlers();
    this._uninstallFacetUI();
    this._views[this._viewIndex].uninstallUI();
    
    this._facetPaneDom = null;
    this._pivotPaneDom = null;
    
    getFacetPane().innerHTML = "";
    getPivotPane().innerHTML = "";
};

TrailPoint.prototype._unregisterEventHandlers = function() {
    this._facetPaneDom.addFiltersAction.onclick = null;
    this._pivotPaneDom.showMoreRelatedTopicsAction.onclick = null;
};

TrailPoint.prototype.onModeChanged = function(mode) {
    for (var i = 0; i < this._facetRecords.length; i++) {
        var facetRecord = this._facetRecords[i];
        facetRecord.facet.onModeChanged(mode);
    }
    for (var i = 0; i <this._views.length; i++) {
        this._views[i].onModeChanged(mode);
    }
};

TrailPoint.prototype.onItemsChanged = function() {
    this._currentTypeStack.dispose();
    this._currentTypeStack = new TypeStack(this.collection.addRestrictions());
    this._pivotDimensions = [];
    
    if (this._hasUI) {
        this._pivotPaneDom.pivotContainer.innerHTML = "";
        this._tryAddMorePivots();
    }
};

TrailPoint.prototype.addView = function(view) {
    this._views.push(view);
    this._selectView(this._views.length - 1);
};

TrailPoint.prototype._startBuildingUI = function() {
    var self = this;
    this._baseTypeStack.runWhenInitialized(function() {
        self._installFacetUI();
        self._installPivotUI();
        
        self._tryAddMoreFacets();
        self._tryAddMorePivots();
    });
};

TrailPoint.prototype._tryAddMoreFacets = function() {
    if (this.collection.isSingular()) {
        return;
    }
    
    if (this._facetRecords.length < TrailPoint.maxFacetSuggestions) {
        var self = this;
        if (this._baseTypeStack.runOnDimensionsOfNextType(function(typeRecord, dimensions) {
            self._addMoreFacets(typeRecord, dimensions);
        })) {
            this._facetPaneDom.statusSection.style.display = "block";
            this._facetPaneDom.controlContainer.style.display = "none";
            return;
        }
    }
    this._facetPaneDom.statusSection.style.display = "none";
    this._facetPaneDom.controlContainer.style.display = "block";
};

TrailPoint.prototype._tryAddMorePivots = function() {
    if (this.collection.isSingular()) {
        return;
    }
    
    if (this._pivotDimensions.length < TrailPoint.maxPivotSuggestions) {
        var self = this;
        if (this._currentTypeStack.runOnDimensionsOfNextType(function(typeRecord, dimensions) {
            self._addMorePivots(typeRecord, dimensions);
        })) {
            this._pivotPaneDom.statusSection.style.display = "block";
            this._pivotPaneDom.footer.style.display = "none";
            return;
        }
    }
    this._pivotPaneDom.statusSection.style.display = "none";
    this._pivotPaneDom.footer.style.display = "block";
};

TrailPoint.prototype._addMoreFacets = function(typeRecord, dimensions) {
    if (this._facetRecords.length == 0 && this._baseTypeStack.getTypeCount() > 1) {
        var facet = new ListFacet(
            this.collection,
            {
                path:               [{ property: "/type/object/type", forward: true }],
                label:              "Types of Topic",
                fullLabel:          "Types of Topic",
                expectedType:       "/type/type",
                expectedTypeLabel:  "Type",
                facetRemover:       this._facetRemover
            }
        );
        this._appendFacet(facet);
    }
    
    for (var i = 0; i < dimensions.length; i++) {
        var dimension = dimensions[i];
        if (dimension.count > Math.max(1, typeRecord.count * TrailPoint.lowFacetRatio) && 
            dimension.count < typeRecord.count * TrailPoint.highFacetRatio) {
            dimension.score = dimension.count;
        } else {
            dimension.score = 0;
        }
    }
    dimensions.sort(function(a, b) {
        return b.score - a.score;
    });
    
    for (var i = 0; i < dimensions.length && this._facetRecords.length < TrailPoint.maxFacetSuggestions; i++) {
        var dimension = dimensions[i];
        if (dimension.score > 0 && !this._alreadyHasFacetWithPath(dimension.path)) {
            this._appendFacetGivenDimension(dimension);
        }
    }
    
    this._tryAddMoreFacets();
};

TrailPoint.prototype._alreadyHasFacetWithPath = function(path) {
    var pathString = pathToString(path);
    for (var i = 0; i < this._facetRecords.length; i++) {
        var path2 = this._facetRecords[i].facet.getPath();
        if (pathToString(path2) == pathString) {
            return true;
        }
    }
    return false;
};

TrailPoint.prototype._addMorePivots = function(typeRecord, dimensions) {
    for (var i = 0; i < dimensions.length; i++) {
        var dimension = dimensions[i];
        // Boost pivots leading to /people/person
        dimension.score = (dimension.expectedType == "/people/person") ? (2 * dimension.count) : dimension.count;
    }
    dimensions.sort(function(a, b) {
        return b.score - a.score;
    });
    
    var self = this;
    var pivotContainer = this._pivotPaneDom.pivotContainer;
    var makePivot = function(dimension) {
        self._appendPivotGivenDimension(dimension);
        self._pivotDimensions.push(dimension);
    };
    
    for (var i = 0; i < dimensions.length && this._pivotDimensions.length < TrailPoint.maxPivotSuggestions; i++) {
        var dimension = dimensions[i];
        if (dimension.score > typeRecord.count / 2 &&
            dimension.score < typeRecord.count * 10) { // thresholds for whether a pivot is suggested
            makePivot(dimension);
        }
    }
    
    this._tryAddMorePivots();
};

TrailPoint.prototype._appendFacetGivenDimension = function(dimension) {
    var facet = this._constructFacetGivenDimension(dimension);
    this._appendFacet(facet);
    return facet;
};

TrailPoint.prototype._prependFacetGivenDimension = function(dimension) {
    var facet = this._constructFacetGivenDimension(dimension);
    this._prependFacet(facet);
    return facet;
};

TrailPoint.prototype._constructFacetGivenDimension = function(dimension) {
    return new ListFacet(
        this.collection,
        {
            path:               dimension.path,
            label:              dimension.label,
            fullLabel:          dimension.fullLabel,
            expectedType:       dimension.expectedType,
            expectedTypeLabel:  dimension.expectedTypeLabel,
            facetRemover:       this._facetRemover
        }
    );
};

TrailPoint.prototype._appendFacet = function(facet) {
    this._facetRecords.push({ facet: facet });
    
    var div = document.createElement("div");
    
    this._facetPaneDom.facetContainer.appendChild(div);
    
    facet.installUI(div);
};

TrailPoint.prototype._prependFacet = function(facet) {
    this._facetRecords.unshift({ facet: facet });
    
    var div = document.createElement("div");
    
    var facetContainer = this._facetPaneDom.facetContainer;
    if (facetContainer.firstChild == null){
        facetContainer.appendChild(div);
    } else {
        facetContainer.insertBefore(div, facetContainer.firstChild);
    }
    
    facet.installUI(div);
};

TrailPoint.prototype._installFacetUI = function() {
    this._textSearchFacet.installUI(this._facetPaneDom.textSearchFacetContainer);
    
    var body = this._facetPaneDom.facetContainer;
    for (var i = 0; i < this._facetRecords.length; i++) {
        var div = document.createElement("div");
        body.appendChild(div);
        
        this._facetRecords[i].facet.installUI(div);
    }
};

TrailPoint.prototype._uninstallFacetUI = function() {
    this._textSearchFacet.uninstallUI();

    for (var i = 0; i < this._facetRecords.length; i++) {
        this._facetRecords[i].facet.uninstallUI();
    }
};

TrailPoint.prototype._removeFacet = function(facet) {
    for (var i = 0; i < this._facetRecords.length; i++) {
        var facet2 = this._facetRecords[i].facet;
        if (facet2 == facet) {
            facet.uninstallUI();
            facet.dispose();
            
            this._facetRecords.splice(i, 1);
            
            if (this._facetPaneDom != null) {
                this._facetPaneDom.facetContainer.removeChild(this._facetPaneDom.facetContainer.childNodes[i]);
            }
        }
    }
};

TrailPoint.prototype._installPivotUI = function() {
    var body = this._pivotPaneDom.pivotContainer;
    for (var i = 0; i < this._pivotDimensions.length; i++) {
        this._appendPivotGivenDimension(this._pivotDimensions[i]);
    }
};

TrailPoint.prototype._appendPivotGivenDimension = function(dimension) {
    var self = this;
    
    var label = dimension.label;
    var paren = label.indexOf(" (");
    if (paren > 0) {
        label = label.substr(0, paren);
    }
    
    var div = document.createElement("div");
    div.className = "pivot-choice";
    div.innerHTML = '<a href="javascript:{}">' + label + '</a> (' + dimension.count + ')';
    div.title = dimension.fullLabel;
    div.firstChild.onclick = function() { 
        Logging.log("pivot", {
            path:       pathToString(dimension.path),
            suggested:  true
        });
        self._pivot(dimension); 
    };
    
    this._pivotPaneDom.pivotContainer.appendChild(div);
};

TrailPoint.prototype._renderViewSelectorPane = function() {
    var pane = getViewSelectorPane();
    pane.innerHTML = "";
    
    var viewClasses = {};
    
    var self = this;
    var renderViewSelector = function(index) {
        var span = document.createElement("span");
        var selected = (index == self._viewIndex);
        span.className = selected ? "view-selector view-selector-selected" : "view-selector";
        span.innerHTML = self._views[index].getLabel();
        if (!selected) {
            span.onclick = function() {
                Logging.log("view-select", index);
                self._selectView(index); 
            };
        }
        pane.appendChild(span);
    };
    
    var displayedViewSelectors = false;
    if (this._views.length > 1) {
        displayedViewSelectors = true;
        for (var i = 0; i < this._views.length; i++) {
            renderViewSelector(i);
            viewClasses[this._views[i].getClassName()] = true;
        }
    }
    
    var displayedShowOn = false;
    var addCommonView = function(viewClass, label) {
        if (!displayedShowOn) {
            displayedShowOn = true;
            
            if (displayedViewSelectors) {
                pane.appendChild(document.createTextNode(" \u2022 "));
            }
            pane.appendChild(document.createTextNode("Show results on: "));
        } else {
            pane.appendChild(document.createTextNode(", "));
        }
        
        var a = document.createElement("a");
        a.className = "action";
        a.innerHTML = label;
        a.href = "javascript:{}";
        a.onclick = function() { 
            Logging.log("add-view", {
                label:      label,
                suggested:  true
            });
            self.addView(new viewClass(self.collection)); 
        };
        pane.appendChild(a);
    };
    if (!("MapView" in viewClasses)) {
        addCommonView(MapView, "Map");
    }
    if (!("TimelineView" in viewClasses)) {
        addCommonView(TimelineView, "Timeline");
    }
    
    pane.appendChild(document.createTextNode(" \u2022 "));
    var a = document.createElement("a");
    a.className = "action";
    a.innerHTML = "more &raquo;";
    a.href = "javascript:{}";
    a.onclick = function() { self._showAddViewPopup(a); };
    pane.appendChild(a);
};

TrailPoint.prototype._selectView = function(index) {
    if (this._hasUI) {
        this._views[this._viewIndex].uninstallUI();
    }
    
    this._viewIndex = index;
    
    if (this._hasUI) {
        this._views[this._viewIndex].installUI(getViewPane());
        this._renderViewSelectorPane();
    }
};

TrailPoint.prototype._showMoreFilters = function() {
    Logging.log("show-more-facets", {});
    
    var self = this;
    DimensionPickerWidget.show(
        this._facetPaneDom.addFiltersAction, 
        this._baseTypeStack.getAllDimensions(), 
        function(dimension) {
            Logging.log("add-facet", {
                path:  pathToString(dimension.path)
            });
            self._prependFacetGivenDimension(dimension);
        }, 
        []
    );
};

TrailPoint.prototype._showMoreRelatedTopics = function() {
    Logging.log("show-more-pivots", {});
                
    var self = this;
    DimensionPickerWidget.show(
        this._pivotPaneDom.showMoreRelatedTopicsAction, 
        this._currentTypeStack.getAllDimensions(), 
        function(dimension) {
            Logging.log("pivot", {
                path:       pathToString(dimension.path),
                suggested:  false
            });
            self._pivot(dimension);
        }, 
        []
    );
};

TrailPoint.prototype._showAddViewPopup = function(elmt) {
    Logging.log("show-more-views", {});
    
    var popupDom = createPopupMenuDom(elmt);
    
    var self = this;
    var processView = function(viewClass, label) {
        popupDom.appendMenuItem(
            label,
            null,
            function() {
                Logging.log("add-view", {
                    label:      label,
                    suggested:  false
                });
                self.addView(new viewClass(self.collection));
            }
        );
    };
    
    processView(ThumbnailView, "Thumbnails");
    processView(MapView, "Map");
    processView(TimelineView, "Timeline");
    processView(Chart1DView, "Chart 1D");
    processView(Chart2DView, "Chart 2D");
	processView(TabularView, "Table");

    popupDom.open();
};

TrailPoint.prototype._pivot = function(dimension) {
    onNewCollection(new Collection(new PivotedCollectionDefinition(this.collection, dimension.path, dimension.label)));
};
var ChangeManager = {
	_changes: [],
	_div: null
};

ChangeManager.addChange = function(change) {
	if (ChangeManager._changes.length == 0) {
		ChangeManager._addUI();
	}
	ChangeManager._changes.push(change);
};

ChangeManager.hasChanges = function() {
	return ChangeManager._changes.length > 0;
};

ChangeManager._submitData = function() {
    Logging.log("write", ChangeManager._changes);
    ChangeManager._changes = [];
    ChangeManager._removeUI();
};

ChangeManager._discardData = function() {
	if (window.confirm("Discard all of your data contributions?")) {
		ChangeManager._changes = [];
		ChangeManager._removeUI();
	}
};

ChangeManager._addUI = function() {
	var div = document.createElement("div");
	div.className = "change-popup";
	div.innerHTML =
		'<div>Thank you for your data contributions!</div>' +
		'<div>They are currently not sent in yet. You can continue to contribute more before sending. Or you can send them in now.</div>' +
		'<div><button>Send Now</button> <button>Discard All</button></div>';
	
	var buttons = div.getElementsByTagName("button");
	buttons[0].onclick = ChangeManager._submitData;
	buttons[1].onclick = ChangeManager._discardData;
	
	ChangeManager._div = div;
	
	document.body.appendChild(div);
	
	var count = 0;
	var timerID = window.setInterval(function() {
		if (count % 2 == 0) {
			div.style.display = "none";
		} else {
			div.style.display = "block";
		}
		if (count > 4) {
			window.clearInterval(timerID);
		} else {
			count++;
		}
	}, 200);
};

ChangeManager._removeUI = function() {
	document.body.removeChild(ChangeManager._div);
	ChangeManager._div = null;
};

window.onbeforeunload = function(evt) {
	if (ChangeManager.hasChanges()) {
		evt.returnValue = "Your data contributions have not been submitted. (Look at the bottom right corner of the window.)";
		return false;
	}
};
function DefaultColorCoder() {
    this._colorMap = {};
    this._colorMax = 0;
}

DefaultColorCoder.defaultColors = [
    "#FF9000",
    "#5D7CBA",
    "#A97838",
    "#8B9BBA",
    "#FFC77F",
    "#003EBA",
    "#29447B",
    "#543C1C"
];

DefaultColorCoder.prototype.getColorForKey = function(key) {
    if (key in this._colorMap) {
        return this._colorMap[key];
    } else {
        var color = this._colorMap[key] = DefaultColorCoder.defaultColors[this._colorMax];
        
        this._colorMax = (this._colorMax + 1) % DefaultColorCoder.defaultColors.length;
        
        return color;
    }
};

DefaultColorCoder.prototype.getDefaultColor = function() {
    return "#FF9000";
};/*
 *  Adopted from SimileAjax, http://static.simile.mit.edu/ajax/api-2.0/.
 *
 */

function ListenerQueue(wildcardHandlerName) {
    this._listeners = [];
    this._wildcardHandlerName = wildcardHandlerName;
};

ListenerQueue.prototype.add = function(listener) {
    this._listeners.push(listener);
};

ListenerQueue.prototype.remove = function(listener) {
    var listeners = this._listeners;
    for (var i = 0; i < listeners.length; i++) {
        if (listeners[i] == listener) {
            listeners.splice(i, 1);
            break;
        }
    }
};

ListenerQueue.prototype.fire = function(handlerName, args) {
    var listeners = [].concat(this._listeners);
    for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        if (handlerName in listener) {
            try {
                listener[handlerName].apply(listener, args);
            } catch (e) {
                log("Error firing event of name " + handlerName, e);
            }
        } else if (this._wildcardHandlerName != null &&
            this._wildcardHandlerName in listener) {
            try {
                listener[this._wildcardHandlerName].apply(listener, [ handlerName ]);
            } catch (e) {
                log("Error firing event of name " + handlerName + " to wildcard handler", e);
            }
        }
    }
};
var Logging = {
    service: "http://mqlx.com:5555/parallax-logger",
    _pad2: function(n) {
        return (n < 10) ? ("0" + n) : n;
    }
};

(function() {
    Logging.id = "id" + new Date().getTime() + "x" + Math.floor(1000000 * Math.random());
})();

Logging.log = function(event, payload) {
	/*
    var d = new Date();
    var ds = "" + d.getUTCFullYear() + "-" + Logging._pad2(d.getUTCMonth() + 1) + "-" + Logging._pad2(d.getUTCDate()) + "T" +
        Logging._pad2(d.getUTCHours()) + ":" + Logging._pad2(d.getUTCMinutes()) + ":" + Logging._pad2(d.getUTCSeconds()) + "Z";
        
    var params = [
        "id=" + encodeURIComponent(Logging.id),
        "time=" + encodeURIComponent(ds),
        "event=" + encodeURIComponent(event),
        "payload=" + encodeURIComponent(JSON.stringify(payload)),
        "env=" + encodeURIComponent(JSON.stringify(SimileAjax.Platform.browser.isIE ?
            { w: document.body.scrollWidth, h: document.body.offsetHeight, y: document.body.scrollTop, bh: document.body.scrollHeight } :
            { w: window.innerWidth, h: window.innerHeight, y: window.scrollY, bh: document.body.offsetHeight }
        ))
    ];
    
    var script = document.createElement("script");
    script.setAttribute('src', Logging.service + "?" + params.join("&"));
    document.getElementsByTagName("head")[0].appendChild(script);
    
    window.setTimeout(function() { script.parentNode.removeChild(script); }, 1000);
    */
};
var JsonpQueue = {
    pendingCallIDs: {},
    callInProgress: 0
};

JsonpQueue.cancelAll = function() {
    JsonpQueue.pendingCallIDs = {};
};

JsonpQueue.call = function(url, onDone, onError, debug) {
    if (JsonpQueue.callInProgress == 0) {
        document.body.style.cursor = "progress";
    }
    JsonpQueue.callInProgress++;
    
    var callbackID = new Date().getTime() + "x" + Math.floor(Math.random() * 1000);
    var script = document.createElement("script");
    script.setAttribute('onerror', 'err' + callbackID + '();');
    
    url += (url.indexOf("?") < 0 ? "?" : "&") + "callback=cb" + callbackID;
    script.setAttribute('src', url);
    
    var cleanup = function() {
        JsonpQueue.callInProgress--;
        if (JsonpQueue.callInProgress == 0) {
            document.body.style.cursor = "auto";
        }
        
		if (!(debug)) {
			script.parentNode.removeChild(script);
		}
		
        try {
            delete window["cb" + callbackID];
            delete window["err" + callbackID];
        } catch (e) {
            // IE doesn't seem to allow calling delete on window
            window["cb" + callbackID] = undefined;
            window["err" + callbackID] = undefined;
        }
        
        if (callbackID in JsonpQueue.pendingCallIDs) {
            delete JsonpQueue.pendingCallIDs[callbackID];
            return true;
        } else {
            return false;
        }
    };
    
    var callback = function(o) {
        if (cleanup()) {
            try {
                onDone(o);
            } catch (e) {
                log(e);
            }
        }
    };
    var error = function() {
        if (cleanup()) {
            if (typeof onError == "function") {
                try {
                    onError(url);
                } catch (e) {
                    log(e);
                }
            }
        }
    };
    
    window["cb" + callbackID] = callback;
    window["err" + callbackID] = error;
    
    JsonpQueue.pendingCallIDs[callbackID] = true;
    document.getElementsByTagName("head")[0].appendChild(script);
};

JsonpQueue.queryOne = function(query, onDone, onError, debug) {
    var q = JSON.stringify({ "q1" : { "query" : query } });
    var url = ParallaxConfig.corpusBaseUrl + 'api/service/mqlread?queries=' + encodeURIComponent(q);
    var onDone2 = function(o) {
        if (o.q1.code == "/api/status/error") {
            if (typeof onError == "function") {
                onError(o.q1.messages[0].message, query);
            }
        } else {
            onDone(o.q1);
        }
    };
    var onError2 = function() {
        if (typeof onError == "function") {
            onError("Unknown", query);
        }
    }
    JsonpQueue.call(url, onDone2, onError2, debug);
};
function renderTopicPage(itemID, outerDiv, onDone, focusHandler, pivotHandler) {
    new TopicPageRendering(itemID, outerDiv, onDone, focusHandler, pivotHandler);
}

function TopicPageRendering(itemID, outerDiv, onDone, focusHandler, pivotHandler) {
    this._itemID = itemID;
    this._outerDiv = outerDiv;
    this._onDone = onDone;
    this._focusHandler = focusHandler;
    this._pivotHandler = pivotHandler;
    
    var self = this;
    var url = "http://hotshot.jdouglas.user.dev." + window.ParallaxConfig.appBaseUrl + "acre/json?id=" + encodeURIComponent(itemID);
    JsonpQueue.call(url, function(o) { self._render(o); }, function(e) {});
};

TopicPageRendering.prototype._render = function(o) {
    var self = this;
    var itemID = this._itemID;
    var outerDiv = this._outerDiv;
    outerDiv.innerHTML = '<h1>' + o.name + ' <a class="topic-view-freebase-link" href="' + ParallaxConfig.corpusBaseUrl + 'view' + itemID + '">view on Freebase</a></h1><table cellspacing="0" cellpadding="0"><tr valign="top"><td></td><td width="30%"></td></tr></table>';
    
    var leftColumn = outerDiv.childNodes[1].rows[0].cells[0];
    var rightColumn = outerDiv.childNodes[1].rows[0].cells[1];
    
    var articleAndImagesDiv = document.createElement("div");
    articleAndImagesDiv.className = "topic-view-article-and-images-section";
    articleAndImagesDiv.innerHTML = '<table cellspacing="0" cellpadding="0"><tr valign="top"><td></td><td rowspan="2"></td></tr><tr><td></td></tr></table>';
    rightColumn.appendChild(articleAndImagesDiv);
    
    var getFirstValue = function(a, def) {
        return a.length > 0 ? a[0].value : def;
    };
    var processCommonTopicType = function(typeEntry) {
        for (var p = 0; p < typeEntry.properties.length; p++) {
            var propertyEntry = typeEntry.properties[p];
            var dataEntries = propertyEntry.data;
            if (dataEntries.length == 0) {
                continue;
            }
                
            switch (propertyEntry.id) {
            case "/common/topic/alias":
                var aliasDiv = document.createElement("div");
                aliasDiv.className = "topic-view-alias-section";
                aliasDiv.innerHTML = '<span class="topic-view-section-inline-label">' + propertyEntry.name + ":</span> ";
                outerDiv.insertBefore(aliasDiv, outerDiv.childNodes[1]);
                
                for (var d = 0; d < dataEntries.length; d++) {
                    if (d > 0) {
                        aliasDiv.appendChild(document.createTextNode(", "));
                    }
                    
                    var span = document.createElement("span");
                    span.innerHTML = dataEntries[d].value;
                    
                    aliasDiv.appendChild(span);
                }
                
                aliasDiv.style.display = "block";
                break;
                
            case "/common/topic/article":
                var td = articleAndImagesDiv.firstChild.rows[0].cells[0];
                var text = dataEntries[0].value;
                if (text.length > 500) {
                    text = text.substr(0, 500);
                    
                    var space = text.lastIndexOf(" ");
                    if (space > 0) {
                        text = text.substr(0, space);
                    }
                    text += " ...";
                }
                
                var elmt = document.createElement("div");
                elmt.appendChild(document.createTextNode(text));
                td.appendChild(elmt);
                
                break;
                
            case "/common/topic/image":
                var td = articleAndImagesDiv.firstChild.rows[0].cells[1];
                for (var d = 0; d < Math.min(3, dataEntries.length); d++) {
                    var dataEntry = dataEntries[d];
                    var id = dataEntry.id;
                    
                    var div = document.createElement("div");
                    div.className = "topic-view-thumbnail-container";
                    
                    var img = document.createElement("img");
                    img.src = ParallaxConfig.corpusBaseUrl + "api/trans/image_thumb" + id +
                        "?" + [ 
                            "mode=fill",
                            "maxheight=100",
                            "maxwidth=100"
                        ].join("&")
                    img.onclick = showLightboxForThumbnail;
                    
                    div.style.height = "100px";
                    div.style.width = "100px";
                    div.style.overflow = "hidden";
                    div.appendChild(img);
                    
                    td.appendChild(div);
                }
                break;
                
            case "/common/topic/webpage":
                var webLinksDiv = document.createElement("div");
                webLinksDiv.className = "topic-view-web-links-section";
                webLinksDiv.innerHTML = '<div class="topic-view-section-label">Web Links</div>';
                articleAndImagesDiv.firstChild.rows[1].cells[0].appendChild(webLinksDiv);
                
                for (var d = 0; d < dataEntries.length; d++) {
                    var dataEntry = dataEntries[d];
                    var url = dataEntry["/common/webpage/uri"][0].value;
                    
                    var div = document.createElement("div");
                    var a = document.createElement("a");
                    a.href = url;
                    a.target = "_blank";
                    a.innerHTML = getFirstValue(dataEntry["/common/webpage/description"], url);
                    div.appendChild(a);
                    
                    webLinksDiv.appendChild(div);
                }
                break;
            }
        }
    };
    
    var uniqueProperties = [];
    var disambiguatorProperties = [];
    var separateProperties = [];
    var separateTypes = [];
    var combinedTypes = [];
    
    var processOtherType = function(typeEntry) {
        var typeRecord = {
            typeEntry: typeEntry,
            propertyEntries: []
        };
        
        for (var p = 0; p < typeEntry.properties.length; p++) {
            var propertyEntry = typeEntry.properties[p];
            var dataEntries = propertyEntry.data;
            if (dataEntries == null || dataEntries.length == 0) {
                continue;
            }
            
            if (propertyEntry.unique) {
                uniqueProperties.push(propertyEntry);
            } else if (propertyEntry.disambiguator && propertyEntry.expected_type["/freebase/type_hints/mediator"] != true) {
                disambiguatorProperties.push(propertyEntry);
            } else if (dataEntries.length > 3) {
                separateProperties.push(propertyEntry);
            } else {
                typeRecord.propertyEntries.push(propertyEntry);
            }
        }
        
        if (typeRecord.propertyEntries.length > 0){
            if (typeRecord.propertyEntries.length > 3) {
                separateTypes.push(typeRecord);
            } else {
                combinedTypes.push(typeRecord);
            }
        }
    };
    
    var processTypeEntry = function(typeEntry) {
        if (typeEntry.id == "/common/topic") {
            processCommonTopicType(typeEntry);
        } else {
            processOtherType(typeEntry);
        }
    }
    
    for (var d = 0; d < o.domains.length; d++){
        var domain = o.domains[d];
        for (var t = 0; t < domain.types.length; t++) {
            var typeEntry = domain.types[t];
            processTypeEntry(typeEntry);
        }
    }
    
    var pathToString2 = function(path) {
        return "." + path.join(".");
    };
    var createPropertyAddMore = function(path, expectedTypeID) {
        var a = document.createElement("a");
        a.className = "action";
        a.href = "javascript:{}";
        a.innerHTML = "&nbsp;[&nbsp;+&nbsp;]&nbsp;";
        a.onclick = function() { 
            Logging.log("topic-add-more", { path: pathToString2(path) });
            interactiveAddMoreProperty(itemID, path, expectedTypeID, a.parentNode); 
        };
        return a;
    };
    var createCVTPropertyAddMore = function(path, expectedTypeID, subProperties) {
        var a = document.createElement("a");
        a.className = "action";
        a.href = "javascript:{}";
        a.innerHTML = "&nbsp;[&nbsp;+&nbsp;]&nbsp;";
        a.onclick = function() {
            Logging.log("topic-add-more-cvt", { path: pathToString2(path) });
            interactiveAddMoreCVTProperty(itemID, path, expectedTypeID, subProperties, a.parentNode.parentNode); 
        };
        return a;
    };
    var renderPropertyValue = function(elmt, valueEntry) {
        if ("id" in valueEntry) {
            var a = document.createElement("a");
            a.className = "topic-view-focus-link";
            a.href = ParallaxConfig.corpusBaseUrl + "view" + valueEntry.id;
            a.title = valueEntry.id;
            $(a).click(function(evt) { 
                Logging.log("topic-to-topic", { "id" : valueEntry.id });
                self._focusHandler(valueEntry.id, valueEntry.name); 
				
				evt.preventDefault();
            });
            
            if ("/common/topic/image" in valueEntry) {
                var img = document.createElement("img");
                img.className = "topic-view-micro-thumbnail";
                if (valueEntry["/common/topic/image"] != null) {
                    img.src = ParallaxConfig.corpusBaseUrl + "api/trans/image_thumb" + valueEntry["/common/topic/image"].id +
                        "?" + [ 
                            "mode=fillcrop",
                            "maxheight=40",
                            "maxwidth=40"
                        ].join("&");
                    img.onclick = showLightboxForThumbnail;
                } else {
                    img.src = "images/blank-16x16.png";
                    img.style.width = "38px";
                    img.style.height = "38px";
                    img.style.border = "1px solid #ddd";
                }
                a.appendChild(img);
            }
            a.appendChild(document.createTextNode(valueEntry.name));
            
            elmt.appendChild(a);
        } else {
            elmt.innerHTML = valueEntry.value;
        }
    };
    var renderPropertyValues = function(propertyEntry, elmt, valueEntries, expectedType, path, nested) {
        if (expectedType["/freebase/type_hints/mediator"] == true) {
            elmt.className += " topic-view-nested-property-container";
            
            var table = document.createElement("table");
            table.className = 'topic-view-nested-table';
            table.setAttribute("border", "0");
            table.setAttribute("cellspacing", "0");
            table.setAttribute("cellpadding", "0");
            table.setAttribute("width", "100%");
            elmt.appendChild(table);
            
            var masterPropertyID = "";
            if ("master_property" in propertyEntry) {
                masterPropertyID = propertyEntry.master_property.id;
            }
            
            var subProperties = expectedType.properties;
            var counts = {};
            
            var trHead = table.insertRow(0);
            trHead.vAlign = "top";
            for (var j = 0; j < subProperties.length; j++) {
                var subProperty = subProperties[j];
                var td = trHead.insertCell(j);
                td.innerHTML = subProperty.name;
                td.className = "topic-view-nested-property-label";
                counts[subProperty.id] = 0;
            }
            
            for (var i = 0; i < valueEntries.length; i++) {
                var valueEntry = valueEntries[i];
                var tr = table.insertRow(i + 1);
                tr.vAlign = "top";
                
                for (var j = 0; j < subProperties.length; j++) {
                    var td = tr.insertCell(j);
                    td.className = "topic-view-nested-property-value-container";
                    
                    var subProperty = subProperties[j];
                    var subPropertyID = subProperty.id;
                    if (subPropertyID in valueEntry) {
                        var subValueEntries = valueEntry[subPropertyID];
                        if (subValueEntries.length > 0) {
                            var path2 = path.concat(subPropertyID);
                            renderPropertyValues(subProperty, td, subValueEntries, subProperty.expected_type, path2, true);
                            
                            counts[subProperty.id] += subValueEntries.length;
                            continue;
                        }
                    }
                    td.innerHTML = "&nbsp;";
                }
            }
            
            var makeBrowseAll = function(td, subProperty) {
                var path2 = path.concat(subProperty.id);
                
                td.innerHTML = "&raquo;&nbsp;";
                
                var a = document.createElement("a");
                a.href = "javascript:{}";
                a.innerHTML = "browse&nbsp;all";
                a.onclick = function() { 
                    Logging.log("topic-to-cvt-column", { path: pathToString2(path2) });
                    self._pivotHandler(path2, subProperty.name); 
                };
                td.appendChild(a);
            };
            
            var trFoot = table.insertRow(table.rows.length);
            trFoot.vAlign = "top";
            for (var j = 0; j < subProperties.length; j++) {
                var subProperty = subProperties[j];
                var td = trFoot.insertCell(j);
                td.className = "topic-view-browse-all";
                if (counts[subProperty.id] > 0 && !(subProperty.expected_type.id in SchemaUtil.nativeTypes)) {
                    makeBrowseAll(td, subProperty);
                } else {
                    td.innerHTML = "&nbsp;";
                }
            }
            
            var trAdd = table.insertRow(table.rows.length);
            var tdAdd = trAdd.insertCell(0);
            tdAdd.colSpan = subProperties.length;
            
            var divAdd = document.createElement("div");
            tdAdd.appendChild(divAdd);
            divAdd.className = "topic-view-add";
            divAdd.appendChild(createCVTPropertyAddMore(path, expectedType.id, subProperties));
        } else {
            elmt.className += " topic-view-property-value-container";
            
            for (var i = 0; i < valueEntries.length; i++) {
                var valueEntry = valueEntries[i];
                var div = document.createElement("div");
                renderPropertyValue(div, valueEntry);
                elmt.appendChild(div);
            }
            
            if (valueEntries.length > 1) {
                var div = document.createElement("div");
                div.className = "topic-view-browse-all";
                div.innerHTML = "&raquo;&nbsp;";
                elmt.appendChild(div);
                
                var a = document.createElement("a");
                a.href = "javascript:{}";
                a.innerHTML = "browse&nbsp;all";
                a.onclick = function() { 
                    Logging.log("topic-to-property-values", { path: pathToString2(path) });
                    self._pivotHandler(path, propertyEntry.name); 
                };
                div.appendChild(a);
            }
            
            if (!nested && !propertyEntry.unique) {
                var divAdd = document.createElement("div");
                div.appendChild(divAdd);
                divAdd.className = "topic-view-add";
                divAdd.appendChild(createPropertyAddMore(path, expectedType.id));
            }
        }
    };
    
    var renderProperty = function(table, propertyEntry) {
        var row = table.insertRow(table.rows.length);
        row.vAlign = "top";
        
        var td0 = row.insertCell(0);
        td0.innerHTML = propertyEntry.name;
        td0.title = propertyEntry.id;
        td0.className = "topic-view-property-label";
        
        var td1 = row.insertCell(1);
        renderPropertyValues(propertyEntry, td1, propertyEntry.data, propertyEntry.expected_type, [propertyEntry.id], false);
    };
    
    var tabContainer = document.createElement("div");
    tabContainer.style.marginRight = "20px";
    tabContainer.innerHTML = '<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr valign="top"><td width="10%"></td><td></td></tr></table>';
    leftColumn.appendChild(tabContainer);
    
    var tabHeaderContainer = tabContainer.firstChild.rows[0].cells[0];
    tabHeaderContainer.className = "topic-view-tab-header-container";
    var tabBodyContainer = tabContainer.firstChild.rows[0].cells[1];
    tabBodyContainer.className = "topic-view-tab-body-container";
    
    var selectTab = function(index) {
        for (var i = 0; i < tabHeaderContainer.childNodes.length; i++) {
            if (index == i) {
                tabHeaderContainer.childNodes[i].className = "topic-view-tab-header topic-view-tab-header-selected";
                tabBodyContainer.childNodes[i].style.display = "block";
            } else {
                tabHeaderContainer.childNodes[i].className = "topic-view-tab-header";
                tabBodyContainer.childNodes[i].style.display = "none";
            }
        }
    };
    var createNewTab = function(label) {
        var index = tabHeaderContainer.childNodes.length;
        
        var paren = label.indexOf(" (");
        if (paren > 0) {
            label = label.substr(0, paren);
        }
        
        var tabHeader = document.createElement("div");
        tabHeader.innerHTML = label;
        tabHeader.className = index == 0 ? "topic-view-tab-header topic-view-tab-header-selected" : "topic-view-tab-header";
        tabHeader.onclick = function() { 
            Logging.log("topic-select-tab", { "label": label });
            selectTab(index); 
        };
        tabHeaderContainer.appendChild(tabHeader);
        
        var tabBody = document.createElement("div");
        tabBody.className = "topic-view-tab-body";
        tabBody.style.display = index == 0 ? "block" : "none";
        tabBodyContainer.appendChild(tabBody);
        
        return tabBody;
    };
    
    var basicSection = document.createElement("div");
    basicSection.className = "topic-view-essential-section";
    basicSection.innerHTML = '<table width="100%" border="0" cellspacing="0" cellpadding="0" class="topic-view-table"></table>';
    for (var i = 0; i < uniqueProperties.length; i++) {
        renderProperty(basicSection.firstChild, uniqueProperties[i]);
    }
    for (var i = 0; i < disambiguatorProperties.length; i++) {
        renderProperty(basicSection.firstChild, disambiguatorProperties[i]);
    }
    rightColumn.insertBefore(basicSection, rightColumn.firstChild);
    
    separateTypes.sort(function(a, b) {
        return b.propertyEntries.length - a.propertyEntries.length;
    });
    for (var i = 0; i < separateTypes.length; i++) {
        var typeRecord = separateTypes[i];
        var section = createNewTab("As " + typeRecord.typeEntry.name);
        section.innerHTML = '<table border="0" cellspacing="0" cellpadding="0" class="topic-view-table"></table>';
        
        for (var j = 0; j < typeRecord.propertyEntries.length; j++) {
            renderProperty(section.firstChild, typeRecord.propertyEntries[j]);
        }
    }
    
    for (var i = 0; i < separateProperties.length; i++) {
        var property = separateProperties[i];
        var listSection = createNewTab(property.name);
        listSection.innerHTML = '<table border="0" cellspacing="0" cellpadding="0" class="topic-view-table"></table>';
        
        renderPropertyValues(property, listSection, property.data, property.expected_type, [property.id], false);
    }
    
    var moreSection = createNewTab("More...");
    moreSection.innerHTML = '<table border="0" cellspacing="0" cellpadding="0" class="topic-view-table"></table>';
    
    var moreSectionTable = moreSection.firstChild;
    for (var i = 0; i < combinedTypes.length; i++) {
        var typeRecord = combinedTypes[i];
        
        var tr = moreSectionTable.insertRow(moreSectionTable.rows.length);
        var td = tr.insertCell(0);
        td.className = "topic-view-type-section";
        td.setAttribute("colspan", "2");
        td.innerHTML = typeRecord.typeEntry.name;
        
        for (var j = 0; j < typeRecord.propertyEntries.length; j++) {
            renderProperty(moreSectionTable, typeRecord.propertyEntries[j]);
        }
    }
    
    this._onDone();
};

function interactiveAddMoreProperty(topicID, path, expectedType, div) {
    var valueEditors = [];
    
    var rowWidth = div.offsetWidth;
    var shadeRemover = createShade();
    var editingContainer = createEditingContainer(div, 5, 5);
    editingContainer.innerHTML = 
        '<div style="padding: 5px; background: #444;">' +
            '<div style="width: ' + rowWidth + 'px; font-style: italic;">' +
                '<table width="100%" cellspacing="10" style="color: white;">' +
                    '<tr valign="top">' +
                        '<td colspan="2">Start typing something and we\'ll guess what you mean...</td>' +
                    '</tr>' +
                    '<tr valign="top">' +
                        '<td>' +
                            '<button>Cancel</button>' +
                        '</td>' +
                        '<td align="right">' +
                            '<button>Done Adding</button>' +
                        '</td>' +
                    '</tr>' +
                '</table>' +
            '</div>';
        '</div>';
        
    var dismissUI = function() {
        editingContainer.parentNode.removeChild(editingContainer);
        shadeRemover();
    };
    var onDone = function() {
        for (var i = 0; i < valueEditors.length; i++) {
            var valueEditor = valueEditors[i];
            
            var change = { "id" : topicID };
            var node = { "connect" : "insert" };
            change[path[0]] = node;
            
            if (valueEditor.topicID != null) {
                node["id"] = valueEditor.topicID;
            } else if (valueEditor.topicName != null) {
                node["create"] = "unless_exists";
                node["id"] = null;
                node["type"] = expectedType;
                node["name"] = valueEditor.topicName;
            } else if (valueEditor.value != null) {
                node["value"] = valueEditor.value;
            } else {
                continue;
            }
            ChangeManager.addChange(change);
        }
        dismissUI();
    };
    
    var buttons = editingContainer.getElementsByTagName("button");
    buttons[0].onclick = dismissUI;
    buttons[1].onclick = onDone;
    
    var createRow = function() {
        var index = valueEditors.length;
        
        var rowDiv = document.createElement("div");
        rowDiv.style.width = rowWidth + "px";
        rowDiv.style.marginBottom = "5px";
        editingContainer.firstChild.insertBefore(rowDiv, editingContainer.firstChild.lastChild);
        
        var config = {
            ac_param:{
                type:    expectedType
            },
            soft: false,
            suggest_new: "Create new topic"
        };
        var ve = new ValueEditor(
            rowDiv, 
            function() {
                if (index + 1 < valueEditors.length) {
                    valueEditors[index + 1].focus();
                } else {
                    createRow();
                }
            }, 
            config
        );
        ve.focus();
        
        valueEditors.push(ve);
        
        return ve;
    };
    
    createRow();
}

function interactiveAddMoreCVTProperty(topicID, path, expectedType, subProperties, td) {
    var rowRecords = [];
    var columnWidths = [];
    
    var tr = td.parentNode.previousSibling;
    for (var i = 0; i < tr.cells.length; i++) {
        columnWidths.push(tr.cells[i].offsetWidth);
    }
    
    var rowWidth = td.offsetWidth;
    var shadeRemover = createShade();
    var editingContainer = createEditingContainer(td, 5, 5);
    editingContainer.innerHTML = 
        '<div style="padding: 5px; background: #444;">' +
            '<table width="' + rowWidth + '" cellspacing="0" cellpadding="0"></table>' +
            '<div style="width: ' + rowWidth + 'px; font-style: italic;">' +
                '<table width="100%" cellspacing="10" style="color: white;">' +
                    '<tr valign="top">' +
                        '<td colspan="2">Start typing something and we\'ll guess what you mean...</td>' +
                    '</tr>' +
                    '<tr valign="top">' +
                        '<td>' +
                            '<button>Cancel</button>' +
                        '</td>' +
                        '<td align="right">' +
                            '<button>Done Adding</button>' +
                        '</td>' +
                    '</tr>' +
                '</table>' +
            '</div>';
        '</div>';
        
    var dismissUI = function() {
        editingContainer.parentNode.removeChild(editingContainer);
        shadeRemover();
    };
    var onDone = function() {
        for (var i = 0; i < rowRecords.length; i++) {
            var rowRecord = rowRecords[i];
            
            var hasInput = false;
            var ves = rowRecord.ves;
            for (var j = 0; j < ves.length; j++) {
                if (ves[j].hasInput()) {
                    hasInput = true;
                    break;
                }
            }
            
            if (!hasInput) {
                continue;
            }
            
            var cvtNode = { "create" : "unconditional", "type" : expectedType };
            var change = { "id" : topicID };
            change[path[0]] = cvtNode;
            
            for (var j = 0; j < ves.length; j++) {
                var valueEditor = ves[j];
                var node = { "connect" : "insert" };
                    
                if (valueEditor.topicID != null) {
                    node["id"] = valueEditor.topicID;
                } else if (valueEditor.topicName != null) {
                    node["create"] = "unless_exists";
                    node["id"] = null;
                    node["type"] = expectedType;
                    node["name"] = valueEditor.topicName;
                } else if (valueEditor.value != null) {
                    node["value"] = valueEditor.value;
                } else {
                    continue;
                }
                
                cvtNode[subProperties[j].id] = node;
            }
            
            ChangeManager.addChange(change);
        }
        dismissUI();
    };
    
    var buttons = editingContainer.getElementsByTagName("button");
    buttons[0].onclick = dismissUI;
    buttons[1].onclick = onDone;
    
    var createCell = function(rowIndex, columnIndex, td, subProperty) {
        var cellDiv = document.createElement("div");
        td.appendChild(cellDiv);
        
        var config = {
            ac_param: { type: subProperty.expected_type.id },
            soft: false,
            suggest_new: "Create new topic"
        };
        var ve = new ValueEditor(
            cellDiv, 
            function() {
                if (columnIndex + 1 < subProperties.length) {
                    rowRecords[rowIndex].ves[columnIndex + 1].focus();
                } else if (rowIndex + 1 < rowRecords.length) {
                    rowRecords[rowIndex + 1].ves[0].focus();
                } else {
                    createRow();
                }
            }, 
            config
        );
        return ve;
    };
    var createRow = function() {
        var index = rowRecords.length;
        
        var table = editingContainer.firstChild.firstChild;
        var tr = table.insertRow(table.rows.length);
        
        var ves = [];
        for (var i = 0; i < subProperties.length; i++) {
            var td = tr.insertCell(i);
            td.width = columnWidths[i];
            
            var ve = createCell(index, i, td, subProperties[i]);
            ves.push(ve);
        }
        rowRecords.push({ ves: ves });
        
        ves[0].focus();
    };
    
    createRow();
}

function createShade() {
    var divExtraSpace = document.createElement("div");
    divExtraSpace.style.height = "500px";
    divExtraSpace.innerHTML = "&nbsp;";
    document.body.appendChild(divExtraSpace);
    
    var bodyWidth = document.body.scrollWidth;
    var bodyHeight = document.body.scrollHeight;
    
    var shadeDiv = document.createElement("div");
    shadeDiv.style.position = "absolute";
    shadeDiv.style.top = "0px";
    shadeDiv.style.left = "0px";
    shadeDiv.style.width = bodyWidth + "px";
    shadeDiv.style.height = bodyHeight + "px";
    shadeDiv.style.background = "black";
    shadeDiv.style.opacity = 0.5;
    shadeDiv.style.zIndex = 100;
    document.body.appendChild(shadeDiv);
    
    return function() {
        document.body.removeChild(divExtraSpace);
        document.body.removeChild(shadeDiv);
    };
}

function createEditingContainer(elmt, marginLeftRight, marginTopBottom) {
    var c = SimileAjax.DOM.getPageCoordinates(elmt);
    
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.top = (c.top + elmt.offsetHeight) + "px";
    div.style.left = (c.left - marginLeftRight) + "px";
    div.style.width = (elmt.offsetWidth + 16 + 2 * marginLeftRight) + "px";
    div.style.height = (500 + 2 * marginTopBottom) + "px";
    div.style.overflow = "auto";
    div.style.zIndex = 200;
    document.body.appendChild(div);
    
    return div;
}

function ValueEditor(parentElmt, onCommit, config) {
    this.topicID = null;
    this.topicName = null;
    this.value = null;
    
    this._input = document.createElement("input");
    this._input.style.width = "100%";
    parentElmt.appendChild(this._input);
    
    var self = this;
    if (config.ac_param.type in SchemaUtil.nativeTypes) {
        this._input.onkeypress = function(evt) {
            self.value = self._input.value;
            if (evt.keyCode == 13) {
                onCommit();
            }
        };
    } else {
        $(this._input).freebaseSuggest(config)
            .bind('fb-select', function(e, data) { 
                self.topicID = data.id; 
                self.topicName = null; 
                //console.log('suggest: ', data.id); 
                onCommit();
            })
            .bind('fb-select-new', function(e, data) { 
                self.topicID = null;
                self.topicName = data.name; 
                //console.log('suggest new: ', data.name);
                onCommit();
            });
    }
}

ValueEditor.prototype.focus = function() {
    this._input.focus();
};

ValueEditor.prototype.hasInput = function() {
    return this.topicID != null || this.topicName != null || this.value != null;
};
var encodeHTML = function(s) {
    return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
};

function renderItem(itemID, div, onDone, onFocus) {
    var gotJSON = function(o) {
        var name = o.name;
        var description = null;
        if ("description" in o) {
            var fragments = o.description.split("\\n");
            for (var i = fragments.length - 1; i >= 0; i--) {
                var fragment = fragments[i];
                if (fragment.length == 0) {
                    fragments.splice(i, 1);
                }
            }

            if (fragments.length > 0) {
                description = "";
                for (var i = 0; i < fragments.length; i++) {
                    var fragment = fragments[i];
                    if (i == fragments.length - 1) {
                        fragment += " ...";
                    }
                    description += "<p>" + encodeHTML(fragment) + "</p>";
                }
            }
        }
		
		var url = ParallaxConfig.corpusBaseUrl + "view" + itemID;

        div.innerHTML = 
            "<div class='freebase-hotshot-container'><table><tr valign='top'>" +
                "<td>" +
                    "<div>" +
                        ("name" in o ?
                            ("<h1 class='freebase-hotshot-name'><a href='" + url + "'>" + name + "</a></h1>") :
                            ("<h1 class='freebase-hotshot-id'><a href='" + url + "'>" + itemID + "</a></h1>")) +
                    "</div>" +
                    ((description != null) ? ("<div class='freebase-hotshot-blurb'>" + description + "</div>") : "") +
                "</td>" +
                "<td></td>" +
            "</tr></table></div>";
		
		$(div.firstChild.firstChild.rows[0].cells[0].childNodes[0].childNodes[0]).click(function(evt) {
            try {
                window.top.Logging.log("thumbnail-to-topic", { "id" : itemID });
            } catch (e) { /* if we are embedded in another site, this doesn't work */ }
            onFocus(itemID, name);
			
			evt.preventDefault();
        });

        if ("thumbnails" in o) {
            var thumbnails = o.thumbnails;
            
            var secondTD = div.firstChild.firstChild.rows[0].cells[1];
            for (var i = 0; i < thumbnails.length; i++) {
                var entry = thumbnails[i];
                var thumbnailDiv = document.createElement("div");
                thumbnailDiv.className = "freebase-hotshot-thumbnail";
                thumbnailDiv.innerHTML = "<img src='" + entry.url + "' title='" + entry.title + "' />";
                thumbnailDiv.firstChild.onclick = showLightboxForThumbnail;
                secondTD.appendChild(thumbnailDiv);
            }
        }
        
        if (typeof onDone == "function") {
            onDone();
        }
    };
    
    var url = "http://hotshot.dfhuynh.user.dev." + window.ParallaxConfig.appBaseUrl + "acre/json?id=" + encodeURIComponent(itemID);
    JsonpQueue.call(url, gotJSON, genericErrorHandler);
}function createPopupMenuDom(element) {
    var div = document.createElement("div");
    div.className = "menu-popup";
    div.innerHTML = '<div class="menu-popup-body"></div>';
    
    var dom = {
        elmt: div,
        bodyDiv: div.firstChild,
        close: function() {
            document.body.removeChild(this.elmt);
        },
        open: function() {
            var self = this;
            this.layer = SimileAjax.WindowManager.pushLayer(function() { self.close(); }, true, div);
                
            var docWidth = document.body.offsetWidth;
            var docHeight = document.body.offsetHeight;
        
            var coords = SimileAjax.DOM.getPageCoordinates(element);
            div.style.top = (coords.top + element.scrollHeight) + "px";
            div.style.right = (docWidth - (coords.left + element.scrollWidth)) + "px";
        
            document.body.appendChild(this.elmt);
        },
        appendMenuItem: function(label, icon, onClick) {
            var self = this;
            var a = document.createElement("a");
            a.className = "menu-item";
            a.href = "javascript:";
            SimileAjax.WindowManager.registerEvent(a, "click", function(elmt2, evt, target) {
                onClick(elmt2, evt, target);
                SimileAjax.WindowManager.popLayer(self.layer);
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            });
            
            var divItem = document.createElement("div");
            a.appendChild(divItem);
            
            divItem.appendChild(SimileAjax.Graphics.createTranslucentImage(
                icon != null ? icon : "images/blank-16x16.png"));
                
            if (typeof label == "string") {
                divItem.appendChild(document.createTextNode(label));
            } else {
                divItem.appendChild(label);
            }
            
            this.bodyDiv.appendChild(a);
            
            return a;
        },
        appendSection: function(label) {
            var sectionDiv = document.createElement("div");
            sectionDiv.className = "menu-section";
            sectionDiv.innerHTML = label;
            
            this.bodyDiv.appendChild(sectionDiv);
            
            return sectionDiv;
        },
        appendSeparator: function() {
            var hr = document.createElement("hr");
            this.bodyDiv.appendChild(hr);
        }
    };
    return dom;
}

SimileAjax.WindowManager.cancelPopups = function(evt) {
    var evtCoords = (evt) ? SimileAjax.DOM.getEventPageCoordinates(evt) : { x: -1, y: -1 };
    
    var i = SimileAjax.WindowManager._layers.length - 1;
    while (i > 0 && SimileAjax.WindowManager._layers[i].ephemeral) {
        var layer = SimileAjax.WindowManager._layers[i];
        if (layer.elmt != null) { // if event falls within main element of layer then don't cancel
            var elmt = layer.elmt;
            var elmtCoords = SimileAjax.DOM.getPageCoordinates(elmt);
            elmtCoords.top += elmt.scrollTop;
            elmtCoords.left += elmt.scrollLeft;
            if (evtCoords.x >= elmtCoords.left && evtCoords.x < (elmtCoords.left + elmt.offsetWidth) &&
                evtCoords.y >= elmtCoords.top && evtCoords.y < (elmtCoords.top + elmt.offsetHeight)) {
                break;
            }
        }
        i--;
    }
    SimileAjax.WindowManager._popToLayer(i);
};

function showLightboxForThumbnail(evt, url) {
    var shadeDiv = document.createElement("div");
    shadeDiv.style.position = "fixed";
    shadeDiv.style.top = "0px";
    shadeDiv.style.left = "0px";
    shadeDiv.style.width = "100%";
    shadeDiv.style.height = "100%";
    shadeDiv.style.background = "black";
    shadeDiv.style.opacity = 0.5;
    shadeDiv.style.zIndex = 1000;
    document.body.appendChild(shadeDiv);
    
    var pictureDiv = document.createElement("div");
    pictureDiv.style.position = "fixed";
    pictureDiv.style.top = "0px";
    pictureDiv.style.left = "0px";
    pictureDiv.style.width = "100%";
    pictureDiv.style.height = "100%";
    pictureDiv.style.zIndex = 1001;
    pictureDiv.style.textAlign = "center"
    document.body.appendChild(pictureDiv);
    
    var height = pictureDiv.offsetHeight;
    var maxsize = Math.max(1, Math.floor(height / 100) - 1) * 100;
    
    var href = (typeof url == "string") ? url : this.src;
    var q = href.indexOf("?");
    href = href.substr(0, q) + "?mode=fill&maxheight=" + maxsize;
    
    pictureDiv.innerHTML = '<img src="' + href + '" style="margin-top: 50px; padding: 10px; border: 1px solid #aaa;" />';
    pictureDiv.onclick = function() {
        document.body.removeChild(pictureDiv);
        document.body.removeChild(shadeDiv);
    };
    
    if (evt) {
        SimileAjax.DOM.cancelEvent(evt);
        return null;
    }
};

function padNumber(n) {
    if (n < 10) {
        return "00" + n;
    } else if (n < 100) {
        return "0" + n;
    } else {
        return n;
    }
};

function formatNumberWithSeparators(n) {
    if (n < 1) {
        return n;
    } else {
        var a = [];
        while (n > 1000) {
            a.unshift(padNumber(n % 1000));
            n = Math.floor(n / 1000);
        }
        a.unshift(n);
        return a.join(",");
    }
};

function formatNumberWithSuffix(x) {
    if (x > 1e9) {
        return (Math.floor(x / 1e8) / 10) + "B";
    } else if (x > 1e6) {
        return (Math.floor(x / 1e5) / 10) + "M";
    } else if (x > 1e3) {
        return (Math.floor(x / 1e2) / 10) + "K";
    } else if (x > 1) {
        return x;
    } else if (x > 1e-3) {
        return (Math.floor(x / 1e-4) / 10) + "m";
    } else if (x > 1e-6) {
        return (Math.floor(x / 1e-7) / 10) + "u";
    } else {
        return x;
    }
};
function parseURLParameters(url, to, types) {
    to = to || {};
    types = types || {};
    
    if (typeof url == "undefined") {
        url = location.href;
    }
    var q = url.indexOf("?");
    if (q < 0) {
        return to;
    }
    url = (url+"#").slice(q+1, url.indexOf("#")); // toss the URL fragment
    
    var params = url.split("&"), param, parsed = {};
    var decode = window.decodeURIComponent || unescape;
    for (var i = 0; param = params[i]; i++) {
        var eq = param.indexOf("=");
        var name = decode(param.slice(0,eq));
        var old = parsed[name];
        if (typeof old == "undefined") {
            old = [];
        } else if (!(old instanceof Array)) {
            old = [old];
        }
        parsed[name] = old.concat(decode(param.slice(eq+1)));
    }
    for (var i in parsed) {
        if (!parsed.hasOwnProperty(i)) continue;
        var type = types[i] || String;
        var data = parsed[i];
        if (!(data instanceof Array)) {
            data = [data];
        }
        if (type === Boolean && data[0] == "false") {
            to[i] = false; // because Boolean("false") === true
        } else {
            to[i] = type.apply(this, data);
        }
    }
    return to;
}

function includeJavascriptFile(url, onerror, charset) {
    var doc = document;
    onerror = onerror || "";
    if (doc.body == null) {
        try {
            var q = "'" + onerror.replace( /'/g, '&apos' ) + "'"; // "
            doc.write("<script src='" + url + "' onerror="+ q +
                      (charset ? " charset='"+ charset +"'" : "") +
                      " type='text/javascript'>"+ onerror + "</script>");
            return;
        } catch (e) {
            // fall through
        }
    }

    var script = doc.createElement("script");
    if (onerror) {
        try { script.innerHTML = onerror; } catch(e) {}
        script.setAttribute("onerror", onerror);
    }
    if (charset) {
        script.setAttribute("charset", charset);
    }
    script.type = "text/javascript";
    script.language = "JavaScript";
    script.src = url;
    return getHead(doc).appendChild(script);
};
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
function Chart1DView(collection, label) {
    this.collection = collection;
    this._label = label;
    
    this._div = null;
    this._dom = null;
    this._colorCoder = new DefaultColorCoder();
    
    this._valuePropertyPicker = new PropertyPickerWidget(false, true, false);
    this._pointLabelPropertyPicker = new PropertyPickerWidget(false, true, false);
    this._colorPropertyPicker = new PropertyPickerWidget(false, true, false);
    
    this._setBaseRestrictionsToPropertyPickers();
    
    this.collection.addListener(this);
}

Chart1DView.prototype.getLabel = function() {
    return (typeof this._label == "string") ? ("Chart 1D (" + this._label + ")") : "Chart 1D";
};

Chart1DView.prototype.dispose = function() {
    this._valuePropertyPicker.dispose();
    this._valuePropertyPicker = null;
    
    this._pointLabelPropertyPicker.dispose();
    this._pointLabelPropertyPicker = null;
    
    this._colorPropertyPicker.dispose();
    this._colorPropertyPicker = null;

    this._div = null;
    this._dom = null;
    
    this.collection.removeListener(this);
    this.collection = null;
};

Chart1DView.prototype.getState = function() {
    return {
        v: this._valuePropertyPicker.getState(),
        pl: this._pointLabelPropertyPicker.getState(),
        c: this._colorPropertyPicker.getState()
    };
};

Chart1DView.prototype.getClassName = function() {
    return "Chart1DView";
};

Chart1DView.prototype.reconfigureFromState = function(state) {
    this._valuePropertyPicker.reconfigureFromState(state.v);
    this._pointLabelPropertyPicker.reconfigureFromState(state.pl);
    this._colorPropertyPicker.reconfigureFromState(state.c);
};

Chart1DView.prototype.installUI = function(div) {
    this._div = div;
    this._constructUI();
    this._reRender();
};

Chart1DView.prototype.uninstallUI = function() {
    this._valuePropertyPicker.uninstallUI();
    this._pointLabelPropertyPicker.uninstallUI();
    this._colorPropertyPicker.uninstallUI();
    
    this._div.innerHTML = "";
    this._div = null;
    this._dom = null;
};

Chart1DView.prototype.onModeChanged = function(mode) {
};

Chart1DView.prototype._getColorForKey = function(key) {
    if (key in this._colorMap) {
        return this._colorMap[key];
    } else {
        var color = this._colorMap[key] = Chart1DView.defaultColors[this._colorMax];
        
        this._colorMax = (this._colorMax + 1) % Chart1DView.defaultColors.length;
        
        return color;
    }
};

Chart1DView.prototype._constructUI = function() {
    var self = this;
    
    this._div.innerHTML = 
        '<div id="results-summary-container"></div>' +
        '<div class="chart1d-view-controls"><table width="100%" cellspacing="10">' +
            '<tr><td width="10%">What&nbsp;to&nbsp;Plot:</td><td colspan="2"></td></tr>' +
            '<tr><td width="10%">How&nbsp;to&nbsp;Label&nbsp;Points:</td><td colspan="2"></td></tr>' +
            '<tr><td width="10%">Color&nbsp;Coding:</td><td></td colspan="2"></tr>' +
            '<tr><td colspan="2"><button>Render&nbsp;Chart</button></td><td width="10%"<a href="javascript:{}" class="action">embed&nbsp;this&nbsp;chart</a></td></tr>' +
        '</table></div>' +
        '<div class="chart1d-view-canvas"></div>' +
        '<div class="chart1d-view-legend"></div>';
        
    this._dom = {
        viewSummaryContainer:     this._div.childNodes[0],
        controlTable:             this._div.childNodes[1].childNodes[0],
        canvasDiv:                this._div.childNodes[2],
        legendDiv:                this._div.childNodes[3],
        ready:                    false
    };
    
    this._valuePropertyPicker.installUI(this._dom.controlTable.rows[0].cells[1]);
    this._pointLabelPropertyPicker.installUI(this._dom.controlTable.rows[1].cells[1]);
    this._colorPropertyPicker.installUI(this._dom.controlTable.rows[2].cells[1]);
    this._dom.controlTable.rows[3].cells[0].firstChild.onclick = function() { 
        Logging.log("chart1d-view-re-render", { "state" : self.getState() });
        self._reRender(); 
    };
    this._dom.controlTable.rows[3].cells[1].firstChild.onclick = function() {
        Logging.log("chart1d-view-embed", {});
        self._embed(); 
    };
};

Chart1DView.prototype.onItemsChanged = function() {
    this._reRender();
};

Chart1DView.prototype.onRootItemsChanged = function() {
    this._setBaseRestrictionsToPropertyPickers();
};

Chart1DView.prototype._setBaseRestrictionsToPropertyPickers = function() {
    this._valuePropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._pointLabelPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._colorPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
};

Chart1DView.prototype._reRender = function() {
    if (this._div != null) {
        this._dom.viewSummaryContainer.innerHTML = "";
        this._dom.legendDiv.innerHTML = "";
        this._startRenderView();
    }
};

Chart1DView.prototype._createJob = function() {
    var queryNode = { "id" : null, "name" : null };
    this.collection.addRestrictions(queryNode);
    
    var job = {
        queryNode:      queryNode,
        valuePath:      this._valuePropertyPicker.getTotalPath(),
        hasColor:       this._colorPropertyPicker.specified,
        hasPointLabel:  this._pointLabelPropertyPicker.specified
    };
    if (job.hasColor) {
        job.colorPath = this._colorPropertyPicker.getTotalPath();
    }
    if (job.hasPointLabel) {
        job.pointLabelPath = this._pointLabelPropertyPicker.getTotalPath();
        job.pointLabelTypeIsNative = this._pointLabelPropertyPicker.getExpectedType() in SchemaUtil.nativeTypes
    }
    return job;
};

Chart1DView.prototype._startRenderView = function() {
    ViewUtil.renderViewSummary(this.collection, this._dom.viewSummaryContainer);
    
    var self = this;
    
    if (!this._valuePropertyPicker.specified) {
        return;
    }
    
    var job = this._createJob();
    job.colorCoder = this._colorCoder;
    job.colorKeys = {};
    
    var self = this;
    chart1DViewQuery(job, function(points) {
        chart1DViewPlot(self._dom.canvasDiv, points, self._colorCoder);
        
        if (job.hasColorKeys) {
            for (var key in job.colorKeys) {
                var color = self._colorCoder.getColorForKey(key);
                var div = document.createElement("div");
                div.className = "chart1d-view-legend-entry";
                div.appendChild(SimileAjax.Graphics.createTranslucentImage(
                    "http://simile.mit.edu/painter/painter?" + [
                        "renderer=map-marker",
                        "pin=false",
                        "borderThickness=1",
                        "borderColor=" + color.substr(1),
                        "shape=circle",
                        "width=15",
                        "height=15",
                        "background=" + color.substr(1)
                    ].join("&"),
                    "middle"
                ));
                div.appendChild(document.createTextNode(key));
                
                self._dom.legendDiv.appendChild(div);
            }
        }
    });
};

Chart1DView.prototype._embed = function() {
    var job = this._createJob();
    
    var url = document.location.href;
    var q = url.indexOf("browse.html");
    url = window.ParallaxConfig.appendConfigParams(url.substr(0, q) + "chart-1d-view-embed.html?" + encodeURIComponent(JSON.stringify(job)));
    
    var html = '<iframe height="600" width="100%" src="' + url + '"></iframe>';
    
    window.prompt("HTML code to copy:", html);
};
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
function Chart2DView(collection, label) {
    this.collection = collection;
    this._label = label;
    
    this._div = null;
    this._dom = null;
    this._colorCoder = new DefaultColorCoder();
    
    this._xValuePropertyPicker = new PropertyPickerWidget(false, true, false);
    this._yValuePropertyPicker = new PropertyPickerWidget(false, true, false);
    this._sizeValuePropertyPicker = new PropertyPickerWidget(false, true, false);
    this._pointLabelPropertyPicker = new PropertyPickerWidget(false, true, false);
    this._colorPropertyPicker = new PropertyPickerWidget(false, true, false);
    
    this._setBaseRestrictionsToPropertyPickers();
    
    this.collection.addListener(this);
}

Chart2DView.prototype.getLabel = function() {
    return (typeof this._label == "string") ? ("Chart 2D (" + this._label + ")") : "Chart 2D";
};

Chart2DView.prototype.dispose = function() {
    this._xValuePropertyPicker.dispose();
    this._xValuePropertyPicker = null;
    
    this._yValuePropertyPicker.dispose();
    this._yValuePropertyPicker = null;
    
    this._sizeValuePropertyPicker.dispose();
    this._sizeValuePropertyPicker = null;
    
    this._pointLabelPropertyPicker.dispose();
    this._pointLabelPropertyPicker = null;
    
    this._colorPropertyPicker.dispose();
    this._colorPropertyPicker = null;

    this._div = null;
    this._dom = null;
    
    this.collection.removeListener(this);
    this.collection = null;
};

Chart2DView.prototype.getState = function() {
    return {
        x: this._xValuePropertyPicker.getState(),
        y: this._yValuePropertyPicker.getState(),
        s: this._sizeValuePropertyPicker.getState(),
        pl: this._pointLabelPropertyPicker.getState(),
        c: this._colorPropertyPicker.getState()
    };
};

Chart2DView.prototype.getClassName = function() {
    return "Chart2DView";
};

Chart2DView.prototype.reconfigureFromState = function(state) {
    this._xValuePropertyPicker.reconfigureFromState(state.x);
    this._yValuePropertyPicker.reconfigureFromState(state.y);
    this._sizeValuePropertyPicker.reconfigureFromState(state.s);
    this._pointLabelPropertyPicker.reconfigureFromState(state.pl);
    this._colorPropertyPicker.reconfigureFromState(state.c);
};

Chart2DView.prototype.installUI = function(div) {
    this._div = div;
    this._constructUI();
    this._reRender();
};

Chart2DView.prototype.uninstallUI = function() {
    this._xValuePropertyPicker.uninstallUI();
    this._yValuePropertyPicker.uninstallUI();
    this._sizeValuePropertyPicker.uninstallUI();
    this._pointLabelPropertyPicker.uninstallUI();
    this._colorPropertyPicker.uninstallUI();
    
    this._div.innerHTML = "";
    this._div = null;
    this._dom = null;
};

Chart2DView.prototype.onModeChanged = function(mode) {
};

Chart2DView.prototype._getColorForKey = function(key) {
    if (key in this._colorMap) {
        return this._colorMap[key];
    } else {
        var color = this._colorMap[key] = Chart2DView.defaultColors[this._colorMax];
        
        this._colorMax = (this._colorMax + 1) % Chart2DView.defaultColors.length;
        
        return color;
    }
};

Chart2DView.prototype._constructUI = function() {
    var self = this;
    
    this._div.innerHTML = 
        '<div id="results-summary-container"></div>' +
        '<div class="chart2d-view-controls"><table width="100%" cellspacing="10">' +
            '<tr><td width="10%">X&nbsp;Values:</td><td></td></tr>' +
            '<tr><td width="10%">Y&nbsp;Values:</td><td></td></tr>' +
            '<tr><td width="10%">Size&nbsp;Values:</td><td></td></tr>' +
            '<tr><td width="10%">How&nbsp;to&nbsp;Label&nbsp;Points:</td><td></td></tr>' +
            '<tr><td width="10%">Color&nbsp;Coding:</td><td></td></tr>' +
            '<tr><td colspan="2"><button>Render&nbsp;Chart</button></td><td width="10%"><a href="javascript:{}" class="action">embed&nbsp;this&nbsp;chart</a></td></tr>' +
        '</table></div>' +
        '<div class="chart2d-view-canvas"></div>' +
        '<div class="chart2d-view-legend"></div>';
        
    this._dom = {
        viewSummaryContainer:     this._div.childNodes[0],
        controlTable:             this._div.childNodes[1].childNodes[0],
        canvasDiv:                this._div.childNodes[2],
        legendDiv:                this._div.childNodes[3],
        ready:                    false
    };
    
    this._xValuePropertyPicker.installUI(this._dom.controlTable.rows[0].cells[1]);
    this._yValuePropertyPicker.installUI(this._dom.controlTable.rows[1].cells[1]);
    this._sizeValuePropertyPicker.installUI(this._dom.controlTable.rows[2].cells[1]);
    this._pointLabelPropertyPicker.installUI(this._dom.controlTable.rows[3].cells[1]);
    this._colorPropertyPicker.installUI(this._dom.controlTable.rows[4].cells[1]);
    this._dom.controlTable.rows[5].cells[0].firstChild.onclick = function() {
        Logging.log("chart2d-view-re-render", { "state" : self.getState() });
        self._reRender(); 
    };
    this._dom.controlTable.rows[5].cells[1].firstChild.onclick = function() {
        Logging.log("chart2d-view-embed", {});
        self._embed(); 
    };
};

Chart2DView.prototype.onItemsChanged = function() {
    this._reRender();
};

Chart2DView.prototype.onRootItemsChanged = function() {
    this._setBaseRestrictionsToPropertyPickers();
};

Chart2DView.prototype._setBaseRestrictionsToPropertyPickers = function() {
    this._xValuePropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._yValuePropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._sizeValuePropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._pointLabelPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._colorPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
};

Chart2DView.prototype._reRender = function() {
    if (this._div != null) {
        this._dom.viewSummaryContainer.innerHTML = "";
        this._dom.legendDiv.innerHTML = "";
        this._startRenderView();
    }
};

Chart2DView.prototype._createJob = function() {
    var queryNode = { "id" : null, "name" : null };
    this.collection.addRestrictions(queryNode);
    
    var job = {
        queryNode:      queryNode,
        xValuePath:     this._xValuePropertyPicker.getTotalPath(),
        yValuePath:     this._yValuePropertyPicker.getTotalPath(),
        hasSize:        this._sizeValuePropertyPicker.specified,
        hasColor:       this._colorPropertyPicker.specified,
        hasPointLabel:  this._pointLabelPropertyPicker.specified
    };
    if (job.hasSize) {
        job.sizePath = this._sizeValuePropertyPicker.getTotalPath();
    }
    if (job.hasColor) {
        job.colorPath = this._colorPropertyPicker.getTotalPath();
    }
    if (job.hasPointLabel) {
        job.pointLabelPath = this._pointLabelPropertyPicker.getTotalPath();
        job.pointLabelTypeIsNative = this._pointLabelPropertyPicker.getExpectedType() in SchemaUtil.nativeTypes;
    }
    return job;
};

Chart2DView.prototype._startRenderView = function() {
    ViewUtil.renderViewSummary(this.collection, this._dom.viewSummaryContainer);
    
    var self = this;
    
    if (!this._xValuePropertyPicker.specified || !this._yValuePropertyPicker.specified) {
        return;
    }
    
    var job = this._createJob();
    job.colorCoder = this._colorCoder;
    job.colorKeys = {};
    
    var self = this;
    chart2DViewQuery(job, function(points) {
        var xAxisPropertyID = self._getAxisProperty(self._xValuePropertyPicker.getTotalPath());
        var yAxisPropertyID = self._getAxisProperty(self._yValuePropertyPicker.getTotalPath());
        var labelXAxis = function(f) {
            SchemaUtil.tryGetPropertyLabel(xAxisPropertyID, f);
        };
        var labelYAxis = function(f) {
            SchemaUtil.tryGetPropertyLabel(yAxisPropertyID, f);
        };
        
        chart2DViewPlot(self._dom.canvasDiv, points, self._colorCoder, 600, labelXAxis, labelYAxis);
        
        if (job.hasColorKeys) {
            for (var key in job.colorKeys) {
                var color = self._colorCoder.getColorForKey(key);
                var div = document.createElement("div");
                div.className = "chart1d-view-legend-entry";
                div.appendChild(SimileAjax.Graphics.createTranslucentImage(
                    "http://simile.mit.edu/painter/painter?" + [
                        "renderer=map-marker",
                        "pin=false",
                        "borderThickness=1",
                        "borderColor=" + color.substr(1),
                        "shape=circle",
                        "width=15",
                        "height=15",
                        "background=" + color.substr(1)
                    ].join("&"),
                    "middle"
                ));
                div.appendChild(document.createTextNode(key));
                
                self._dom.legendDiv.appendChild(div);
            }
        }
    });
};

Chart2DView.prototype._getAxisProperty = function(path) {
    for (var i = path.length - 1; i >= 0; i--) {
        var propertyID = path[i].property;
        if (propertyID.indexOf("/measurement_unit/") != 0) {
            return propertyID;
        }
    }
    return null;
};

Chart2DView.prototype._embed = function() {
    var job = this._createJob();
    
    var xAxisPropertyID = this._getAxisProperty(this._xValuePropertyPicker.getTotalPath());
    var yAxisPropertyID = this._getAxisProperty(this._yValuePropertyPicker.getTotalPath());
    SchemaUtil.tryGetPropertyLabel(xAxisPropertyID, function(xAxisLabel) {
        SchemaUtil.tryGetPropertyLabel(yAxisPropertyID, function(yAxisLabel) {
            job.xAxisLabel = xAxisLabel;
            job.yAxisLabel = yAxisLabel;
            
            var url = document.location.href;
            var q = url.indexOf("browse.html");
            url = window.ParallaxConfig.appendConfigParams(url.substr(0, q) + "chart-2d-view-embed.html?" + encodeURIComponent(JSON.stringify(job)));
            
            var html = '<iframe height="600" width="100%" src="' + url + '"></iframe>';
            
            window.prompt("HTML code to copy:", html);
        });
    });
};
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
function MapView(collection, label) {
    this.collection = collection;
    this._label = label;
    
    this._div = null;
    this._dom = null;
    this._colorCoder = new DefaultColorCoder();
    
    this._latlngPropertyPicker = new PropertyPickerWidget(true, false);
    this._colorPropertyPicker = new PropertyPickerWidget(false, true);
    this._sizePropertyPicker = new PropertyPickerWidget(false, true);
    this._imagePropertyPicker = new PropertyPickerWidget(false, false);
    
    this._setBaseRestrictionsToPropertyPickers();
    
    this.collection.addListener(this);
}

MapView.prototype.getLabel = function() {
    return (typeof this._label == "string") ? ("Map (" + this._label + ")") : "Map";
};

MapView.prototype.dispose = function() {
    this._latlngPropertyPicker.dispose();
    this._latlngPropertyPicker = null;
    
    this._colorPropertyPicker.dispose();
    this._colorPropertyPicker = null;

    this._sizePropertyPicker.dispose();
    this._sizePropertyPicker = null;
    
    this._imagePropertyPicker.dispose();
    this._imagePropertyPicker = null;
    
    this._div = null;
    this._dom = null;
    
    this.collection.removeListener(this);
    this.collection = null;
};

MapView.prototype.getState = function() {
    return {
        l: this._latlngPropertyPicker.getState(),
        c: this._colorPropertyPicker.getState(),
        s: this._sizePropertyPicker.getState(),
        i: this._imagePropertyPicker.getState()
    };
};

MapView.prototype.getClassName = function() {
    return "MapView";
};

MapView.prototype.reconfigureFromState = function(state) {
    this._latlngPropertyPicker.reconfigureFromState(state.l);
    this._colorPropertyPicker.reconfigureFromState(state.c);
    if ("s" in state) {
        this._sizePropertyPicker.reconfigureFromState(state.s);
    }
    if ("i" in state) {
        this._imagePropertyPicker.reconfigureFromState(state.i);
    }
};

MapView.prototype.installUI = function(div) {
    this._div = div;
    this._constructUI();
};

MapView.prototype.uninstallUI = function() {
    this._latlngPropertyPicker.uninstallUI();
    this._colorPropertyPicker.uninstallUI();
    
    this._div.innerHTML = "";
    this._div = null;
    this._dom = null;
};

MapView.prototype.onModeChanged = function(mode) {
};

MapView.prototype._constructUI = function() {
    var self = this;
    
    this._div.innerHTML = 
        '<div id="results-summary-container"></div>' +
        '<div class="map-view-controls"><table width="100%" cellspacing="10">' +
            '<tr><td width="10%">Location:</td><td></td></tr>' +
            '<tr><td width="10%">Color&nbsp;Markers&nbsp;by:</td><td></td></tr>' +
            '<tr><td width="10%">Size&nbsp;Markers&nbsp;by:</td><td></td></tr>' +
            '<tr><td width="10%">Images&nbsp;in&nbsp;Markers:</td><td></td></tr>' +
            '<tr><td><button>Render Map</button></td><td align="right"><a href="javascript:{}" class="action">embed this map</a></td></tr>' +
        '</table></div>' +
        '<iframe id="results-view-container" style="width: 100%; border: 1px solid #aaa; height: 500px;"></iframe>' +
        '<div class="map-view-legend"></div>';
        
    this._dom = {
        viewSummaryContainer:     this._div.childNodes[0],
        controlTable:             this._div.childNodes[1].childNodes[0],
        frame:                    this._div.childNodes[2],
        legendDiv:                this._div.childNodes[3],
        ready:                    false
    };
    
    this._latlngPropertyPicker.installUI(this._dom.controlTable.rows[0].cells[1]);
    this._colorPropertyPicker.installUI(this._dom.controlTable.rows[1].cells[1]);
    this._sizePropertyPicker.installUI(this._dom.controlTable.rows[2].cells[1]);
    this._imagePropertyPicker.installUI(this._dom.controlTable.rows[3].cells[1]);
    this._dom.controlTable.rows[4].cells[0].firstChild.onclick = function() {
        Logging.log("map-view-re-render", { "state" : self.getState() });
        self._reRender(); 
    };
    this._dom.controlTable.rows[4].cells[1].firstChild.onclick = function() {
        Logging.log("map-view-embed", {});
        self._embed(); 
    };
    
    var self = this;
    var callbackID = "mv" + new Date().getTime();
    var callback = function() {
        delete window[callbackID];
        self._dom.ready = true;
        self._startRenderView();
    };
    window[callbackID] = callback;
    
    this._dom.frame.setAttribute("src", "map-view.html?callbackID=" + callbackID);
};

MapView.prototype.onItemsChanged = function() {
    this._reRender();
};

MapView.prototype.onRootItemsChanged = function() {
    this._setBaseRestrictionsToPropertyPickers();
};

MapView.prototype._setBaseRestrictionsToPropertyPickers = function() {
    this._latlngPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._colorPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._sizePropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._imagePropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
};

MapView.prototype._reRender = function() {
    if (this._div != null) {
        this._dom.viewSummaryContainer.innerHTML = "";
        this._dom.legendDiv.innerHTML = "";
        if (this._dom.ready) {
            this._startRenderView();
        }
    }
};

MapView.prototype._createJob = function() {
    var queryNode = { "id" : null, "name" : null };
    this.collection.addRestrictions(queryNode);
    
    var job = {
        queryNode:      queryNode,
        locationPath:   this._latlngPropertyPicker.getTotalPath(),
        hasColor:       this._colorPropertyPicker.specified,
        hasSize:        this._sizePropertyPicker.specified,
        hasImage:       this._imagePropertyPicker.specified
    };
    if (job.hasColor) {
        job.colorPath = this._colorPropertyPicker.getTotalPath();
    }
    if (job.hasSize) {
        job.sizePath = this._sizePropertyPicker.getTotalPath();
    }
    if (job.hasImage) {
        job.imagePath = this._imagePropertyPicker.getTotalPath();
    }
    return job;
};

MapView.prototype._startRenderView = function() {
    ViewUtil.renderViewSummary(this.collection, this._dom.viewSummaryContainer);
    
    if (!this._latlngPropertyPicker.specified) {
        try {
            this._dom.frame.contentWindow["clearPoints"]();
        } catch (e) {}
        return;
    }
    
    var self = this;
    var job = this._createJob();
    job.colorCoder = this._colorCoder;
    job.colorKeys = {};

    var onFocus = function(itemID, itemName) {
        SimileAjax.WindowManager.cancelPopups();
        onNewTopic(itemID, itemName);
    };
    mapViewQuery(job, function(points) {
        self._dom.frame.contentWindow["mapPoints"](
            points, 
            job.hasSize, 
            job.hasImage,
            function(elmt, itemID, itemName) {
                var c1 = SimileAjax.DOM.getPageCoordinates(elmt);
                var c2 = SimileAjax.DOM.getPageCoordinates(self._dom.frame);
                var x = c2.left + c1.left + Math.floor(elmt.offsetWidth / 2);
                var y = c2.top + c1.top + Math.floor(elmt.offsetHeight / 2);

                var div = document.createElement("div");
                div.innerHTML = '<div class="item-lens-container"></div>';
                
                renderItem(
                    itemID, 
                    div, 
                    function() { 
                        SimileAjax.WindowManager.cancelPopups();
                        SimileAjax.Graphics.createBubbleForContentAndPoint(div, x, y, 400);
                    },
                    onFocus
                );
            },
            onFocus
        );
        
        if (job.hasColorKeys) {
            var colorKeys = job.colorKeys;
            for (var key in colorKeys) {
                var color = self._colorCoder.getColorForKey(key);
                var div = document.createElement("div");
                div.className = "map-view-legend-entry";
                div.appendChild(SimileAjax.Graphics.createTranslucentImage(
                    "http://simile.mit.edu/painter/painter?renderer=map-marker&shape=circle&width=20&height=20&pinHeight=5&background=" + color.substr(1),
                    "middle"
                ));
                div.appendChild(document.createTextNode(key));
                
                self._dom.legendDiv.appendChild(div);
            }
        }
    });
};

MapView.prototype._embed = function() {
    var job = this._createJob();
    
    var url = document.location.href;
    var q = url.indexOf("browse.html");
    url = window.ParallaxConfig.appendConfigParams(url.substr(0, q) + "map-view-embed.html?" + encodeURIComponent(JSON.stringify(job)));
    
    var html = '<iframe height="500" width="100%" src="' + url + '"></iframe>';
    
    window.prompt("HTML code to copy:", html);
};
function SingleTopicView(collection) {
    this.collection = collection;
    this._div = null;
}

SingleTopicView.prototype.getLabel = function() {
    return "Single Topic";
};

SingleTopicView.prototype.dispose = function() {
    this._div = null;
    this.collection = null;
};

SingleTopicView.prototype.getState = function() {
	return {};
};

SingleTopicView.prototype.getClassName = function() {
	return "SingleTopicView";
};

SingleTopicView.prototype.reconfigureFromState = function(state) {
};

SingleTopicView.prototype.installUI = function(div) {
    this._div = div;
    this._constructUI();
};

SingleTopicView.prototype.uninstallUI = function() {
    this._div.innerHTML = "";
    this._div = null;
};

SingleTopicView.prototype.onModeChanged = function(mode) {
};

SingleTopicView.prototype._constructUI = function() {
    var itemID = this.collection.getDefinition().getTopicID();
    
    this._div.innerHTML = '<div class="status"><img src="images/progress-running.gif" /> Retrieving information on ' + itemID + '...</div>';
    
    var div = document.createElement("div");
    var self = this;
    
    var onDone = function() { 
        if (self._div != null) {
            self._div.innerHTML = "";
            self._div.appendChild(div);
        }
    };
    
    var focusHandler = function(itemID, label) {
        onNewTopic(itemID, label);
    };
    
    var pivotHandler = function(path, label) {
        var path2 = [];
        for (var i = 0; i < path.length; i++){
            path2.push({ property: path[i], forward: true });
        }
        onNewCollection(new Collection(new PivotedCollectionDefinition(self.collection, path2, label)));
    };
    
    renderTopicPage(itemID, div, onDone, focusHandler, pivotHandler);
};
function tabularViewQuery(job, onDone) {
    var queryNode = job.queryNode;
    queryNode["limit"] = 500;
    
    var addPath = function(path, valuesAreNative) {
        if (path.length > 0) {
            var queryNode2 = extendQueryNodeWithPath(queryNode, path);
            
            if (valuesAreNative) {
                queryNode2["value"] = null;
            } else {
                if (!("name" in queryNode2)) {
                    queryNode2["name"] = null;
                }
                if (!("id" in queryNode2)) {
                    queryNode2["id"] = null;
                }
            }
        }
    };
    
    if (job.hasRowColor) {
        addPath(job.rowColorPath, job.rowColorValuesAreNative);
        var rowColorNodeIterator = createForwardPathIterator(job.rowColorPath);
    }
    
    for (var i = 0; i < job.columnConfigs.length; i++) {
        var columnConfig = job.columnConfigs[i];
        if ("path" in columnConfig) {
            addPath(columnConfig.path, columnConfig.valuesAreNative);
            columnConfig.nodeIterator = createForwardPathIterator(columnConfig.path);
        }
    }
    
    var gotRestrictedItems = function(o) {
        var rows = [];
        var rowColorKeys = job.rowColorKeys;
        
        job.hasRowColorKeys = false;
        var processRow = function(itemNode) {
            var row = {
                cells: []
            };
            
            if (job.hasRowColor) {
                var colorNode = null;
                rowColorNodeIterator(itemNode,
                    function(node) {
                        colorNode = node;
                    }
                );
                if (colorNode != null) {
                    var key = "name" in colorNode ? colorNode.name : colorNode.value;
                    var color = job.colorCoder.getColorForKey(key);
                    
                    rowColorKeys[key] = true;
                    job.hasRowColorKeys = true;
                    
                    row.color = color;
                }
            }
            
            for (var c = 0; c < job.columnConfigs.length; c++) {
                var columnConfig = job.columnConfigs[c];
                var cell = { values: [] };
                if ("nodeIterator" in columnConfig) {
                    var valueNodeVisitor = function(valueNode) {
                        if ("name" in valueNode) {
                            cell.values.push({ name: valueNode.name, id: valueNode.id });
                        } else {
                            cell.values.push({ value: valueNode.value });
                        }
                    };
                    
                    columnConfig.nodeIterator(itemNode, valueNodeVisitor);
                }
                
                row.cells.push(cell);
            }
            
            rows.push(row);
        };
        
        for (var i = 0; i < o.result.length; i++) {
            var itemNode = o.result[i];
            processRow(itemNode);
        }
        
        onDone(rows);
    };
    
    JsonpQueue.queryOne([queryNode], gotRestrictedItems, genericErrorHandler);
};

function tabularViewSort(rows, columnIndex, sortAscending, valueType) {
    var stringComparator = function(a, b) {
        return a.sortKey.localeCompare(b.sortKey);
    };
    var numericComparator = function(a, b) {
        return a.sortKey - b.sortKey;
    };
    
    var sortKeyGenerator;
    var sortKeyDefault;
    var sortKeyComparator;
    if (valueType in SchemaUtil.nativeTypes) {
        switch (valueType) {
        case '/type/int':
        case '/type/float':
            sortKeyGenerator = function(valueEntry) {
                if (valueEntry != null) {
                    try {
                        var n = parseFloat(valueEntry.value);
                        if (!isNaN(n)) {
                            return n;
                        }
                    } catch (e) {}
                }
                return null;
            };
            sortKeyDefault = Number.NEGATIVE_INFINITY;
            sortKeyComparator = numericComparator;
            break;
        case '/type/boolean':
            sortKeyGenerator = function(valueEntry) {
                if (valueEntry != null) {
                    if ("value" in valueEntry) {
                        if (typeof valueEntry.value == "boolean") {
                            return valueEntry.value ? 1 : 0;
                        } else {
                            var s = valueEntry.value.toString().toLowerCase();
                            if (s == "true") {
                                return 1;
                            } else if (s == "false") {
                                return 0;
                            }
                        }
                    }
                }
                return null;
            };
            sortKeyDefault = -1;
            sortKeyComparator = numericComparator;
            break;
            
        default:
            sortKeyGenerator = function(valueEntry) {
                if (valueEntry != null) {
                    if ("value" in valueEntry) {
                        var s = valueEntry.value.toString().toLowerCase();
                        return s;
                    }
                }
                return null;
            };
            sortKeyDefault = "";
            sortKeyComparator = stringComparator;
        }
    } else {
        sortKeyGenerator = function(valueEntry) {
            if (valueEntry != null) {
                if ("name" in valueEntry) {
                    var s = valueEntry.name.toLowerCase();
                    return s;
                }
            }
            return null;
        };
        sortKeyDefault = "";
        sortKeyComparator = stringComparator;
    }
    
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var cell = row.cells[columnIndex];
        var values = cell.values;
        
        var sortKey = null;
        for (var v = 0; sortKey == null && v < values.length; v++) {
            sortKey = sortKeyGenerator(values[v]);
        }
        
        row.sortKey = (sortKey == null) ? sortKeyDefault : sortKey;
    }
    
    var comparator = sortAscending ? sortKeyComparator : function(a, b) { return sortKeyComparator(b, a); };
    rows.sort(comparator);
};

function tabularViewRender(div, job, rows, settings) {
    div.innerHTML = "";
    if (rows.length == 0) {
        return;
    }
    
    var table = document.createElement("table");
    table.className = "tabular-view-table";
    //table.setAttribute("border", "1");
    table.setAttribute("cellspacing", "0");
    table.setAttribute("width", "100%");
    div.appendChild(table);
    
    var columnCount = job.columnConfigs.length + (settings.editable ? 1 : 0);
    
    /*
     *  Create table header and edit rows
     */
     
    var trHead = table.insertRow(0);
    var trEdit = table.insertRow(1);
    var tdEdit = trEdit.insertCell(0);
    tdEdit.setAttribute("colspan", columnCount);
    tdEdit.className = "tabular-view-header-editing-container";
    trEdit.style.display = "none";
    
    var revertEditingUI = function() {
        var cells = trHead.cells;
        for (var i = 0; i < cells.length; i++) {
            cells[i].className = "tabular-view-header-cell";
        }
        trEdit.style.display = "none";
    };
    var createColumnHeader = function(columnConfig, c) {
        var td = trHead.insertCell(c);
        td.className = "tabular-view-header-cell";
        
        if (c > 0 && settings.editable) {
            var img = SimileAjax.Graphics.createTranslucentImage("images/close-button.png", "middle");
            img.className = "tabular-view-header-remove-button";
            img.onclick = function() { settings.onRemoveColumn(img, c); }
            td.appendChild(img);
            
            var aEditColumn = document.createElement("a");
            aEditColumn.className = "action tabular-view-header-edit-button";
            aEditColumn.href = "javascript:{}";
            aEditColumn.innerHTML = "edit";
            aEditColumn.onclick = function() {
                revertEditingUI();
                
                trEdit.style.display = "";
                td.className = "tabular-view-header-cell tabular-view-header-editing"; 
                settings.onEditColumn(aEditColumn, c, tdEdit, revertEditingUI); 
            };
            td.appendChild(aEditColumn);
        }
        
        var spanLabel = document.createElement("span");
        spanLabel.className = "tabular-view-header-label";
        spanLabel.appendChild(document.createTextNode("label" in columnConfig ? columnConfig.label : "?"));
        if (c == job.sortColumnIndex) {
            var imgSort = SimileAjax.Graphics.createTranslucentImage(
                job.sortColumnAscending ? "images/up-arrow.png" : "images/down-arrow.png", "middle");
            spanLabel.appendChild(imgSort);
        }
        spanLabel.onclick = function() {
            settings.onSortColumn(c);
        };
        td.appendChild(spanLabel);
    };
    for (var c = 0; c < job.columnConfigs.length; c++) {
        var columnConfig = job.columnConfigs[c];
        createColumnHeader(columnConfig, c);
    }
    
    if (settings.editable) {
        var tdAdd = trHead.insertCell(job.columnConfigs.length);
        tdAdd.className = "tabular-view-header-cell";
        tdAdd.setAttribute("width", "1%");
        
        var aAddColumn = document.createElement("a");
        aAddColumn.className = "action";
        aAddColumn.href = "javascript:{}";
        aAddColumn.innerHTML = "add";
        aAddColumn.onclick = function() {
            revertEditingUI();
                
            trEdit.style.display = "";
            tdAdd.className = "tabular-view-header-cell tabular-view-header-editing";
            settings.onAddColumn(aAddColumn, tdEdit, revertEditingUI);
        };
        tdAdd.appendChild(aAddColumn);
    }
    
    /*
     *  Create table data rows
     */
    var createTopicValue = function(valueEntry) {
        var a = document.createElement("a");
        a.href = ParallaxConfig.corpusBaseUrl + "view" + valueEntry.id;
        a.appendChild(document.createTextNode(valueEntry.name));
        $(a).click(function(evt) { 
            Logging.log("tabular-view-to-topic", { "id" : valueEntry.id });
            settings.onFocus(valueEntry.id, valueEntry.name);
            evt.preventDefault();
        });
        return a;
    };
    var createValue = function(valueEntry) {
        if ("name" in valueEntry) {
            return createTopicValue(valueEntry);
        } else {
            return document.createTextNode(valueEntry.value);
        }
    };
    for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        var tr = table.insertRow(r + 2);
        
        if ("color" in row) {
            tr.style.backgroundColor = row.color;
        }
        
        var cells = row.cells;
        for (var c = 0; c < cells.length; c++) {
            var cell = cells[c];
            var td = tr.insertCell(c);
            td.className = "tabular-view-data-cell";
            
            var values = cell.values;
            if (values.length == 0) {
                td.innerHTML = "&nbsp;";
            } else if (values.length == 1) {
                td.appendChild(createValue(values[0]));
            } else {
                var ol = document.createElement("ol");
                td.appendChild(ol);
                
                for (var v = 0; v < values.length; v++) {
                    var value = values[v];
                    var li = document.createElement("li");
                    ol.appendChild(li);
                    li.appendChild(createValue(value));
                }
            }
        }
    }
};
function TabularView(collection, label) {
    this.collection = collection;
    this._label = label;
    
    this._div = null;
    this._dom = null;
    this._colorCoder = new DefaultColorCoder();
    
    this._sortColumnIndex = 0;
    this._sortColumnAscending = true;
    this._columnRecords = [ this._constructColumnRecord(true) ];
    this._rowColorPropertyPicker = new PropertyPickerWidget(false, true, false);
    
    this._editing = false;
    this._editingElmt = null;
    this._editingIndex = -1;
    this._editingColumnRecord = null;
    
    this._setBaseRestrictionsToPropertyPickers();
    
    this.collection.addListener(this);
}

TabularView.prototype.getLabel = function() {
    return (typeof this._label == "string") ? ("Table (" + this._label + ")") : "Table";
};

TabularView.prototype.dispose = function() {
    this._disposeColumnRecords();
    
    this._rowColorPropertyPicker.dispose();
    this._rowColorPropertyPicker = null;

    this._div = null;
    this._dom = null;
    
    this.collection.removeListener(this);
    this.collection = null;
};

TabularView.prototype.getState = function() {
    var columnRecords = [];
    for (var i = 0; i < this._columnRecords.length; i++) {
        var columnRecord = this._columnRecords[i];
        columnRecords.push({ p: columnRecord.propertyPicker.getState() });
    }
    
    return {
        cols:     columnRecords,
        sort:    this._sortColumnIndex,
        asc:    this._sortColumnAscending,
        c:         this._rowColorPropertyPicker.getState()
    };
};

TabularView.prototype.getClassName = function() {
    return "TabularView";
};

TabularView.prototype.reconfigureFromState = function(state) {
    this._uninstallColumnUI();
    this._disposeColumnRecords();
    this._columnRecords = [];
    
    var columnRecordStates = state.cols;
    for (var i = 0; i < columnRecordStates.length; i++) {
        var columnRecordState = columnRecordStates[i];
        
        var columnRecord = this._constructColumnRecord();
        this._columnRecords.push(columnRecord);
        
        columnRecord.propertyPicker.reconfigureFromState(columnRecordState.p);
    }
    
    this._rowColorPropertyPicker.reconfigureFromState(state.c);
};

TabularView.prototype._disposeColumnRecords = function() {
    for (var i = 0; i < this._columnRecords.length; i++) {
        var columnRecord = this._columnRecords[i];
        columnRecord.propertyPicker.dispose();
        columnRecord.propertyPicker = null;
    }
    this._columnRecords = null;
};

TabularView.prototype.installUI = function(div) {
    this._div = div;
    this._constructUI();
    this._reRender();
};

TabularView.prototype.uninstallUI = function() {
    this._uninstallColumnUI();
    this._rowColorPropertyPicker.uninstallUI();
    
    this._disposeEditingUI();
    
    this._div.innerHTML = "";
    this._div = null;
    this._dom = null;
};

TabularView.prototype._disposeEditingUI = function() {
    if (this._editing) {
        this._editingColumnRecord.propertyPicker.uninstallUI();
        this._editingColumnRecord.propertyPicker.dispose();
        this._editingColumnRecord = null;
        
        this._editingElmt.innerHTML = "";
        this._editingElmt = null;
        this._editingIndex = -1;
        this._editing = false;
    }
};

TabularView.prototype._uninstallColumnUI = function() {
    if (this._div != null) {
        for (var i = 0; i < this._columnRecords.length; i++) {
            var columnRecord = this._columnRecords[i];
            columnRecord.propertyPicker.uninstallUI();
        }
    }
};

TabularView.prototype._constructColumnRecord = function(defaultToTopics) {
    var propertyPicker = new PropertyPickerWidget(defaultToTopics, true, false);
    propertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    
    return { propertyPicker: propertyPicker };
};

TabularView.prototype.onModeChanged = function(mode) {
};

TabularView.prototype._constructUI = function() {
    var self = this;
    
    this._div.innerHTML = 
        '<div id="results-summary-container"></div>' +
        '<div class="tabular-view-controls"><table cellspacing="10">' +
            '<tr><td width="10%">Row&nbsp;Color&nbsp;Coding:</td><td></td></tr>' +
            '<tr><td colspan="2"><button>Render&nbsp;Table</button></td><td width="10%"><a href="javascript:{}" class="action">embed&nbsp;this&nbsp;table</a></td></tr>' +
        '</table></div>' +
        '<div class="tabular-view-legend"></div>' +
        '<div class="tabular-view-canvas"></div>';
        
    this._dom = {
        viewSummaryContainer:     this._div.childNodes[0],
        controlTable:             this._div.childNodes[1].childNodes[0],
        legendDiv:                this._div.childNodes[2],
        canvasDiv:                this._div.childNodes[3]
    };
    
    this._rowColorPropertyPicker.installUI(this._dom.controlTable.rows[0].cells[1]);
    this._dom.controlTable.rows[1].cells[0].firstChild.onclick = function() {
        Logging.log("tabular-view-re-render", { "state" : self.getState() });
        self._reRender(); 
    };
    this._dom.controlTable.rows[1].cells[1].firstChild.onclick = function() {
        Logging.log("tabular-view-embed", {});
        self._embed(); 
    };
};

TabularView.prototype.onItemsChanged = function() {
    this._reRender();
};

TabularView.prototype.onRootItemsChanged = function() {
    this._setBaseRestrictionsToPropertyPickers();
};

TabularView.prototype._setBaseRestrictionsToPropertyPickers = function() {
    for (var i = 0; i < this._columnRecords.length; i++) {
        var columnRecord = this._columnRecords[i];
        columnRecord.propertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    }
    this._rowColorPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
};

TabularView.prototype._reRender = function() {
    if (this._div != null) {
        this._dom.viewSummaryContainer.innerHTML = "";
        this._dom.legendDiv.innerHTML = "";
        this._startRenderView();
    }
};

TabularView.prototype._createJob = function() {
    var queryNode = { "id" : null, "name" : null };
    this.collection.addRestrictions(queryNode);
    
    var job = {
        queryNode:              queryNode,
        columnConfigs:          [],
        sortColumnIndex:        this._sortColumnIndex,
        sortColumnAscending:    this._sortColumnAscending,
        hasRowColor:            this._rowColorPropertyPicker.specified
    };
    if (job.hasRowColor) {
        job.rowColorPath = this._rowColorPropertyPicker.getTotalPath();
        job.rowColorValuesAreNative = true;
        if (job.rowColorPath.length == 0) {
            job.rowColorValuesAreNative = false;
        } else {
            var propertyID = job.rowColorPath[job.rowColorPath.length - 1].property;
            if (propertyID in SchemaUtil.propertyRecords) {
                var propertyRecord = SchemaUtil.propertyRecords[propertyID];
                if (!(propertyRecord.expectedType in SchemaUtil.nativeTypes)) {
                    job.rowColorValuesAreNative = false;
                }
            }
        }
    }
    
    var createColumnConfig = function(columnRecord) {
        var columnConfig = {
            valuesAreNative: false,
            valueType: ""
        };
        if (columnRecord.propertyPicker.specified) {
            columnConfig.path = columnRecord.propertyPicker.getTotalPath();
            
            if (columnConfig.path.length == 0) {
                columnConfig.label = "Topic";
                columnConfig.valuesAreNative = false;
            } else {
                var propertyID = columnConfig.path[columnConfig.path.length - 1].property;
                columnConfig.label = propertyID;
                
                if (propertyID in SchemaUtil.propertyRecords) {
                    var propertyRecord = SchemaUtil.propertyRecords[propertyID];
                    columnConfig.label = propertyRecord.name;
                    columnConfig.valueType = propertyRecord.expectedType;
                    
                    if (propertyRecord.expectedType in SchemaUtil.nativeTypes) {
                        columnConfig.valuesAreNative = true;
                    }
                }
            }
        }
        return columnConfig;
    };
    
    for (var i = 0; i < this._columnRecords.length; i++) {
        job.columnConfigs.push(createColumnConfig(this._columnRecords[i]));
    }
    return job;
};

TabularView.prototype._startRenderView = function() {
    ViewUtil.renderViewSummary(this.collection, this._dom.viewSummaryContainer);
    
    var self = this;
    
    var job = this._createJob();
    job.colorCoder = this._colorCoder;
    job.rowColorKeys = {};
    
    var self = this;
    tabularViewQuery(job, function(rows) {
        if (self._sortColumnIndex >= 0) {
            tabularViewSort(rows, self._sortColumnIndex, self._sortColumnAscending);
        }
        
        var onAddColumn = function(actionElmt, editElmt, revertEditingUI) {
            self._startEditing(self._columnRecords.length, self._constructColumnRecord(false), editElmt, revertEditingUI);
        };
        var onRemoveColumn = function(actionElmt, index) {
            self._columnRecords.splice(index, 1);
            self._startRenderView();
        };
        var onEditColumn = function(actionElmt, index, editElmt, revertEditingUI) {
            var columnRecord = self._constructColumnRecord(false);
            columnRecord.propertyPicker.reconfigureFromState(self._columnRecords[index].propertyPicker.getState());
        
            self._startEditing(index, columnRecord, editElmt, revertEditingUI);
        };
        var onSortColumn = function(index) {
            if (index == self._sortColumnIndex) {
                self._sortColumnAscending = !self._sortColumnAscending;
            } else {
                self._sortColumnIndex = index;
                self._sortColumnAscending = true;
            }
            job.sortColumnIndex = self._sortColumnIndex;
            job.sortColumnAscending = self._sortColumnAscending;
            
            tabularViewSort(rows, self._sortColumnIndex, self._sortColumnAscending, job.columnConfigs[self._sortColumnIndex].valueType);
            
            render();
        };
        var render = function() {
            tabularViewRender(self._dom.canvasDiv, job, rows, 
                {
                    editable:           true,
                    onAddColumn:        onAddColumn, 
                    onRemoveColumn:     onRemoveColumn, 
                    onEditColumn:       onEditColumn,
                    onFocus:            onNewTopic,
                    onSortColumn:       onSortColumn
                }
            );
        };
        render();
        
        if (job.hasRowColorKeys) {
            for (var key in job.rowColorKeys) {
                var color = self._colorCoder.getColorForKey(key);
                var div = document.createElement("div");
                div.className = "tabular-view-legend-entry";
                div.appendChild(SimileAjax.Graphics.createTranslucentImage(
                    "http://simile.mit.edu/painter/painter?" + [
                        "renderer=map-marker",
                        "pin=false",
                        "borderThickness=1",
                        "borderColor=" + color.substr(1),
                        "shape=circle",
                        "width=15",
                        "height=15",
                        "background=" + color.substr(1)
                    ].join("&"),
                    "middle"
                ));
                div.appendChild(document.createTextNode(key));
                
                self._dom.legendDiv.appendChild(div);
            }
        }
    });
};

TabularView.prototype._embed = function() {
    var job = this._createJob();
    
    var url = document.location.href;
    var q = url.indexOf("browse.html");
    url = window.ParallaxConfig.appendConfigParams(url.substr(0, q) + "tabular-view-embed.html?" + encodeURIComponent(JSON.stringify(job)));
    
    var html = '<iframe height="600" width="100%" src="' + url + '"></iframe>';
    
    window.prompt("HTML code to copy:", html);
};

TabularView.prototype._startEditing = function(columnIndex, columnRecord, editElmt, onCancel) {
    this._disposeEditingUI();
    
    this._editingElmt = editElmt;
    this._editingIndex = columnIndex;
    this._editingColumnRecord = columnRecord;
    this._editing = true;
    
    editElmt.innerHTML = "";
    
    var divPicker = document.createElement("div");
    divPicker.className = "tabular-view-editing-settings";
    editElmt.appendChild(divPicker);
    this._editingColumnRecord.propertyPicker.installUI(divPicker);
    
    var divControls = document.createElement("div");
    divControls.className = "tabular-view-editing-controls";
    divControls.innerHTML = "<button>Done</button> <button>Cancel</button>";
    editElmt.appendChild(divControls);
    
    var self = this;
    var buttons = divControls.getElementsByTagName("button");
    buttons[0].onclick = function() {
        self._columnRecords[columnIndex] = columnRecord;
        self._disposeEditingUI();
        self._startRenderView();
    };
    buttons[1].onclick = function() {
        self._disposeEditingUI();
        onCancel();
    };
};
function ThumbnailView(collection) {
    this.collection = collection;
    
    this._div = null;
    this._dom = null;
    
    this.collection.addListener(this);
}

ThumbnailView.prototype.getLabel = function() {
    return "Thumbnails";
};

ThumbnailView.prototype.dispose = function() {
    this._div = null;
    this._dom = null;
    
    this.collection.removeListener(this);
    this.collection = null;
};

ThumbnailView.prototype.getState = function() {
	return {};
};

ThumbnailView.prototype.getClassName = function() {
	return "ThumbnailView";
};

ThumbnailView.prototype.reconfigureFromState = function(state) {
};

ThumbnailView.prototype.installUI = function(div) {
    this._div = div;
    
    this._constructUI();
    this._startRenderView();
};

ThumbnailView.prototype.uninstallUI = function() {
    this._div.innerHTML = "";
    this._div = null;
    this._dom = null;
};

ThumbnailView.prototype.onModeChanged = function(mode) {
};

ThumbnailView.prototype._constructUI = function() {
    this._div.innerHTML = 
        '<div id="results-summary-container"></div>' +
        '<div id="thumbnail-view-controls">&raquo; embed these topics <a href="javascript:{}" class="action">as thumbnails</a> &bull; <a href="javascript:{}" class="action">as tiles</a></div>' +
        '<div id="results-view-container"></div>';
        
    this._dom = {
        viewSummaryContainer:     this._div.childNodes[0],
        controlDiv:               this._div.childNodes[1],
        viewContainer:            this._div.childNodes[2]
    };
    
    var self = this;
    var actions = this._dom.controlDiv.getElementsByTagName("a");
    actions[0].onclick = function() {
        Logging.log("thumbnail-view-embed-thumbnails");
        self._embedThumbnails(); 
    };
    actions[1].onclick = function() {
        Logging.log("thumbnail-view-embed-tiles");
        self._embedTiles(); 
    };
};

ThumbnailView.prototype.onItemsChanged = function() {
    if (this._div != null) {
        this._dom.viewSummaryContainer.innerHTML = "";
        this._dom.viewContainer.innerHTML = "";
        this._startRenderView();
    }
};

ThumbnailView.prototype._startRenderView = function() {
    ViewUtil.renderViewSummary(this.collection, this._dom.viewSummaryContainer);
    
    this._dom.viewContainer.innerHTML = "";
    
    var self = this;
    var queryNode = { "id" : null, "limit" : 100 };
    this.collection.addRestrictions(queryNode, { "id": null, "name": null });
    JsonpQueue.queryOne([queryNode], function(o) { self._renderView(o.result); }, genericErrorHandler);
};

ThumbnailView.prototype._renderView = function(results) {
    var cd = this.collection.getDefinition();
    var f = function() {};
    if (cd.hasBaseCollection()) {
        var baseResults;
        var iterator = cd.getBaseNodeIterator();
        var createLink = function(queryNode) {
            var a = document.createElement("a");
            a.href = "javascript:{}";
            a.innerHTML = queryNode.name;
            a.onclick = function() { onNewTopic(queryNode.id, queryNode.name); };
            return a;
        };
        
        f = function(baseResultDiv, queryNode) {
            var baseResults = [];
            iterator(queryNode, function(queryNode2) {
                baseResults.push(queryNode2);
            });
            
            for (var j = 0; j < Math.min(3, baseResults.length); j++) {
                if (j > 0) {
                    baseResultDiv.appendChild(document.createTextNode(", "));
                }
                baseResultDiv.appendChild(createLink(baseResults[j]));
            }
            
            if (baseResults.length > 3) {
                baseResultDiv.appendChild(document.createTextNode(" ..."));
            }
            baseResultDiv.appendChild(document.createTextNode(" \u2192"));
        };
    }
        
    this._dom.viewContainer.innerHTML = '';
    for (var i = 0; i < results.length; i++) {
        var node = results[i];
        var itemID = node.id;
        
        var div = document.createElement("div");
        div.className = "item-lens-container";
        div.innerHTML = '<div class="item-lens-base-results"></div><div class="item-lens-inner-container">Rendering ' + itemID + '</div>';
        this._dom.viewContainer.appendChild(div);
        
        f(div.childNodes[0], node);        
        
        renderItem(itemID, div.childNodes[1], function() {}, onNewTopic);
    }
};

ThumbnailView.prototype._embedThumbnails = function() {
    this._embed("thumbnail-view-embed-thumbnails.html", 80);
};

ThumbnailView.prototype._embedTiles = function() {
    this._embed("thumbnail-view-embed-tiles.html", 50);
};

ThumbnailView.prototype._embed = function(file, thumbSize) {
    var queryNode = { "id" : null, "limit" : 100 };
    this.collection.addRestrictions(queryNode, { "id": null, "name": null });
    
    var url = document.location.href;
    var q = url.indexOf("browse.html");
    url = url.substr(0, q) + file + "?thumbsize=" + thumbSize + "&query=" + encodeURIComponent(JSON.stringify(queryNode));
    
    var html = '<iframe height="600" width="100%" src="' + url + '"></iframe>';
    
    window.prompt("HTML code to copy:", html);
};
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
function TimelineView(collection, label) {
    this.collection = collection;
    this._label = label;
    
    this._div = null;
    this._dom = null;
    this._timeline = null;
    this._eventSource = null;
    this._colorCoder = new DefaultColorCoder();
    
    this._startPropertyPicker = new PropertyPickerWidget(false, true);
    this._endPropertyPicker = new PropertyPickerWidget(false, true);
    this._labelPropertyPicker = new PropertyPickerWidget(false, true);
    this._colorPropertyPicker = new PropertyPickerWidget(false, true);
    
    this._setBaseRestrictionsToPropertyPickers();
    
    this.collection.addListener(this);
}

TimelineView.prototype.getLabel = function() {
    return (typeof this._label == "string") ? ("Timeline (" + this._label + ")") : "Timeline";
};

TimelineView.prototype.dispose = function() {
    this._startPropertyPicker.dispose();
    this._startPropertyPicker = null;
    
    this._endPropertyPicker.dispose();
    this._endPropertyPicker = null;
    
    this._colorPropertyPicker.dispose();
    this._colorPropertyPicker = null;
    
    this._div = null;
    this._dom = null;
    
    this.collection.removeListener(this);
    this.collection = null;
};

TimelineView.prototype.getState = function() {
    return {
        s: this._startPropertyPicker.getState(),
        e: this._endPropertyPicker.getState(),
        l: this._labelPropertyPicker.getState(),
        c: this._colorPropertyPicker.getState()
    };
};

TimelineView.prototype.getClassName = function() {
    return "TimelineView";
};

TimelineView.prototype.reconfigureFromState = function(state) {
    this._startPropertyPicker.reconfigureFromState(state.s);
    this._endPropertyPicker.reconfigureFromState(state.e);
    if ("l" in state) {
        this._labelPropertyPicker.reconfigureFromState(state.l);
    }
    this._colorPropertyPicker.reconfigureFromState(state.c);
};

TimelineView.prototype.installUI = function(div) {
    this._div = div;
    this._constructUI();
};

TimelineView.prototype.uninstallUI = function() {
    if (this._timeline != null) {
        this._timeline.dispose();
        this._timeline = null;
    }
    
    this._startPropertyPicker.uninstallUI();
    this._endPropertyPicker.uninstallUI();
    this._labelPropertyPicker.uninstallUI();
    this._colorPropertyPicker.uninstallUI();
    
    this._div.innerHTML = "";
    this._div = null;
    this._dom = null;
};

TimelineView.prototype.onModeChanged = function(mode) {
};

TimelineView.prototype._constructUI = function() {
    var self = this;
    
    this._div.innerHTML = 
        '<div id="results-summary-container"></div>' +
        '<div class="timeline-view-controls"><table width="100%" cellspacing="10">' +
            '<tr><td width="10%">Start:</td><td colspan="2"></td></tr>' +
            '<tr><td width="10%">End:</td><td colspan="2"></td></tr>' +
            '<tr><td width="10%">Label:</td><td colspan="2"></td></tr>' +
            '<tr><td width="10%">Color:</td><td colspan="2"></td></tr>' +
            '<tr><td colspan="2"><button>Render&nbsp;Timeline</button></td><td align="right" width="10%"><a href="javascript:{}" class="action">embed&nbsp;this&nbsp;timeline</a></td></tr>' +
        '</table></div>' +
        '<div class="timeline-view-container"></div>' +
        '<div class="timeline-view-legend"></div>';
        
    this._dom = {
        viewSummaryContainer:     this._div.childNodes[0],
        controlTable:             this._div.childNodes[1].childNodes[0],
        timelineDiv:              this._div.childNodes[2],
        legendDiv:                this._div.childNodes[3],
        ready:                    false
    };
    
    this._startPropertyPicker.installUI(this._dom.controlTable.rows[0].cells[1]);
    this._endPropertyPicker.installUI(this._dom.controlTable.rows[1].cells[1]);
    this._labelPropertyPicker.installUI(this._dom.controlTable.rows[2].cells[1]);
    this._colorPropertyPicker.installUI(this._dom.controlTable.rows[3].cells[1]);
    this._dom.controlTable.rows[4].cells[0].firstChild.onclick = function() {
        Logging.log("timeline-view-re-render", { "state" : self.getState() });
        self._reRender(); 
    };
    this._dom.controlTable.rows[4].cells[1].firstChild.onclick = function() {
        Logging.log("timeline-view-embed", {});
        self._embed(); 
    };
    
    if ("Timeline" in window) {
        this._dom.ready = true;
        this._startRenderView();
    } else {
        var self = this;
        SimileAjax_onLoad = function() {
            self._dom.ready = true;
            self._startRenderView();
        };
        SimileAjax.includeJavascriptFiles(document, "", [ "http://static.simile.mit.edu/timeline/api-2.0/timeline-api.js" ]);
    }
};

TimelineView.prototype.onItemsChanged = function() {
    this._reRender();
};

TimelineView.prototype.onRootItemsChanged = function() {
    this._setBaseRestrictionsToPropertyPickers();
};

TimelineView.prototype._setBaseRestrictionsToPropertyPickers = function() {
    this._startPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._endPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._labelPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._colorPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
};

TimelineView.prototype._reRender = function() {
    if (this._div != null) {
        this._dom.viewSummaryContainer.innerHTML = "";
        this._dom.legendDiv.innerHTML = "";
        if (this._dom.ready) {
            this._startRenderView();
        }
    }
};

TimelineView.prototype._createJob = function() {
    var queryNode = { "id" : null, "name" : null };
    this.collection.addRestrictions(queryNode);
    
    var job = {
        queryNode:      queryNode,
        startPath:      this._startPropertyPicker.getTotalPath(),
        hasEnd:         this._endPropertyPicker.specified,
        hasColor:       this._colorPropertyPicker.specified,
        hasLabel:       this._labelPropertyPicker.specified
    };
    if (job.hasEnd) {
        job.endPath = this._endPropertyPicker.getTotalPath();
    }
    if (job.hasLabel) {
        job.labelPath = this._labelPropertyPicker.getTotalPath();
    }
    if (job.hasColor) {
        job.colorPath = this._colorPropertyPicker.getTotalPath();
    }
    return job;
};

TimelineView.prototype._startRenderView = function() {
    var self = this;
    
    ViewUtil.renderViewSummary(this.collection, this._dom.viewSummaryContainer);
    
    if (this._eventSource != null) {
        this._eventSource.clear();
    }
    if (!this._startPropertyPicker.specified) {
        return;
    }
    
    var job = this._createJob();
    job.colorCoder = this._colorCoder;
    job.colorKeys = {};
        
    var self = this;
    timelineViewQuery(job, function(points) {
        self._plotEvents(points);
        
        if (job.hasColorKeys) {
            for (var key in job.colorKeys) {
                var color = self._colorCoder.getColorForKey(key);
                var div = document.createElement("div");
                div.className = "timeline-view-legend-entry";
                div.appendChild(SimileAjax.Graphics.createTranslucentImage(
                    "http://simile.mit.edu/painter/painter?renderer=map-marker&shape=circle&width=20&height=20&pin=false&background=" + color.substr(1),
                    "middle"
                ));
                div.appendChild(document.createTextNode(key));
                
                self._dom.legendDiv.appendChild(div);
            }
        }
    });
};

TimelineView.prototype._plotEvents = function(points) {
    if (this._eventSource == null) {
        this._eventSource = new Timeline.DefaultEventSource();
    }
    timelineViewFillEventSource(this._eventSource, points);
    
    if (this._timeline == null) {
        this._dom.timelineDiv.style.height = "500px";
        this._timeline = timelineViewConstructTimeline(this._eventSource, this._dom.timelineDiv, function(itemID, name) {
            onNewTopic(itemID, name); 
        });
    } else {
        var band = this._timeline.getBand(0);
        var centerDate = band.getCenterVisibleDate();
        var earliest = this._eventSource.getEarliestDate();
        var latest = this._eventSource.getLatestDate();
        if (earliest != null && centerDate < earliest) {
            band.scrollToCenter(earliest);
        } else if (latest != null && centerDate > latest) {
            band.scrollToCenter(latest);
        }
    }
};

TimelineView.prototype._embed = function() {
    var job = this._createJob();
    
    var url = document.location.href;
    var q = url.indexOf("browse.html");
    url = window.ParallaxConfig.appendConfigParams(url.substr(0, q) + "timeline-view-embed.html?" + encodeURIComponent(JSON.stringify(job)));
    
    var html = '<iframe height="500" width="100%" src="' + url + '"></iframe>';
    
    window.prompt("HTML code to copy:", html);
};
var ViewUtil = {};

ViewUtil.renderViewSummary = function(collection, div) {
    var results = {};
    
    div.innerHTML = '<div class="status"><img src="images/progress-running.gif" /> Retrieving information...</div>';
    
    var gotAllCount = function(n) {
        results.allCount = n;
        collection.getRestrictedItemCount(gotRestrictedCount, genericErrorHandler);
    };
    
    var gotRestrictedCount = function(n) {
        results.restrictedCount = n;
        ViewUtil._tryRenderSummary(collection, div, results.restrictedCount, results.allCount);
    };
    
    collection.getAllItemCount(gotAllCount, genericErrorHandler);
};

ViewUtil._tryRenderSummary = function(collection, div, restrictedCount, allCount) {
    ViewUtil._renderSummary(div, null, restrictedCount, allCount);
    
    SchemaUtil.tryGetTypeLabel(collection.getDefinition(), function(label) {
        ViewUtil._renderSummary(div, label, restrictedCount, allCount);
    });
};

ViewUtil._renderSummary = function(div, typeLabel, restrictedCount, allCount) {
    var html = "";
    if (typeLabel != null) {
        html += '<span class="results-summary-type">' + typeLabel + '</span>: ';
    }
    
    if (restrictedCount == allCount) {
        html += '<span class="results-summary-count">' + allCount + ' topics</span>';
    } else {
        html +=
            '<span class="results-summary-count">' + restrictedCount + ' topics</span>' +
            ' filtered from ' +
            '<span results-summary-original-count>' + allCount + '</span>' +
            ' originally';
    }
    
    div.innerHTML = html;
}