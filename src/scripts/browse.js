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
