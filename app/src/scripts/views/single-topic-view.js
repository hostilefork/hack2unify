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
