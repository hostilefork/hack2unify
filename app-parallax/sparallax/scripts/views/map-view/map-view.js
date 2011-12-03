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
