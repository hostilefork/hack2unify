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
