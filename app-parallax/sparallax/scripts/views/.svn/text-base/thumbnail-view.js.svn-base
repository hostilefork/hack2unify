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
