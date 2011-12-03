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

