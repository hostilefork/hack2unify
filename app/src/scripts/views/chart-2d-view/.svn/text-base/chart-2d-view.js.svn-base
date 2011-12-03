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
