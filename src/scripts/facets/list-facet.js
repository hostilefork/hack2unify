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
