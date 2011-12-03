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
