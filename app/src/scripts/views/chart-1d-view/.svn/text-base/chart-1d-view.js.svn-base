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
