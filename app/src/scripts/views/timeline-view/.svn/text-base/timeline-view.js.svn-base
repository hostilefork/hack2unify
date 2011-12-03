function TimelineView(collection, label) {
    this.collection = collection;
    this._label = label;
    
    this._div = null;
    this._dom = null;
    this._timeline = null;
    this._eventSource = null;
    this._colorCoder = new DefaultColorCoder();
    
    this._startPropertyPicker = new PropertyPickerWidget(false, true);
    this._endPropertyPicker = new PropertyPickerWidget(false, true);
    this._labelPropertyPicker = new PropertyPickerWidget(false, true);
    this._colorPropertyPicker = new PropertyPickerWidget(false, true);
    
    this._setBaseRestrictionsToPropertyPickers();
    
    this.collection.addListener(this);
}

TimelineView.prototype.getLabel = function() {
    return (typeof this._label == "string") ? ("Timeline (" + this._label + ")") : "Timeline";
};

TimelineView.prototype.dispose = function() {
    this._startPropertyPicker.dispose();
    this._startPropertyPicker = null;
    
    this._endPropertyPicker.dispose();
    this._endPropertyPicker = null;
    
    this._colorPropertyPicker.dispose();
    this._colorPropertyPicker = null;
    
    this._div = null;
    this._dom = null;
    
    this.collection.removeListener(this);
    this.collection = null;
};

TimelineView.prototype.getState = function() {
    return {
        s: this._startPropertyPicker.getState(),
        e: this._endPropertyPicker.getState(),
        l: this._labelPropertyPicker.getState(),
        c: this._colorPropertyPicker.getState()
    };
};

TimelineView.prototype.getClassName = function() {
    return "TimelineView";
};

TimelineView.prototype.reconfigureFromState = function(state) {
    this._startPropertyPicker.reconfigureFromState(state.s);
    this._endPropertyPicker.reconfigureFromState(state.e);
    if ("l" in state) {
        this._labelPropertyPicker.reconfigureFromState(state.l);
    }
    this._colorPropertyPicker.reconfigureFromState(state.c);
};

TimelineView.prototype.installUI = function(div) {
    this._div = div;
    this._constructUI();
};

TimelineView.prototype.uninstallUI = function() {
    if (this._timeline != null) {
        this._timeline.dispose();
        this._timeline = null;
    }
    
    this._startPropertyPicker.uninstallUI();
    this._endPropertyPicker.uninstallUI();
    this._labelPropertyPicker.uninstallUI();
    this._colorPropertyPicker.uninstallUI();
    
    this._div.innerHTML = "";
    this._div = null;
    this._dom = null;
};

TimelineView.prototype.onModeChanged = function(mode) {
};

TimelineView.prototype._constructUI = function() {
    var self = this;
    
    this._div.innerHTML = 
        '<div id="results-summary-container"></div>' +
        '<div class="timeline-view-controls"><table width="100%" cellspacing="10">' +
            '<tr><td width="10%">Start:</td><td colspan="2"></td></tr>' +
            '<tr><td width="10%">End:</td><td colspan="2"></td></tr>' +
            '<tr><td width="10%">Label:</td><td colspan="2"></td></tr>' +
            '<tr><td width="10%">Color:</td><td colspan="2"></td></tr>' +
            '<tr><td colspan="2"><button>Render&nbsp;Timeline</button></td><td align="right" width="10%"><a href="javascript:{}" class="action">embed&nbsp;this&nbsp;timeline</a></td></tr>' +
        '</table></div>' +
        '<div class="timeline-view-container"></div>' +
        '<div class="timeline-view-legend"></div>';
        
    this._dom = {
        viewSummaryContainer:     this._div.childNodes[0],
        controlTable:             this._div.childNodes[1].childNodes[0],
        timelineDiv:              this._div.childNodes[2],
        legendDiv:                this._div.childNodes[3],
        ready:                    false
    };
    
    this._startPropertyPicker.installUI(this._dom.controlTable.rows[0].cells[1]);
    this._endPropertyPicker.installUI(this._dom.controlTable.rows[1].cells[1]);
    this._labelPropertyPicker.installUI(this._dom.controlTable.rows[2].cells[1]);
    this._colorPropertyPicker.installUI(this._dom.controlTable.rows[3].cells[1]);
    this._dom.controlTable.rows[4].cells[0].firstChild.onclick = function() {
        Logging.log("timeline-view-re-render", { "state" : self.getState() });
        self._reRender(); 
    };
    this._dom.controlTable.rows[4].cells[1].firstChild.onclick = function() {
        Logging.log("timeline-view-embed", {});
        self._embed(); 
    };
    
    if ("Timeline" in window) {
        this._dom.ready = true;
        this._startRenderView();
    } else {
        var self = this;
        SimileAjax_onLoad = function() {
            self._dom.ready = true;
            self._startRenderView();
        };
        SimileAjax.includeJavascriptFiles(document, "", [ "http://static.simile.mit.edu/timeline/api-2.0/timeline-api.js" ]);
    }
};

TimelineView.prototype.onItemsChanged = function() {
    this._reRender();
};

TimelineView.prototype.onRootItemsChanged = function() {
    this._setBaseRestrictionsToPropertyPickers();
};

TimelineView.prototype._setBaseRestrictionsToPropertyPickers = function() {
    this._startPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._endPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._labelPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    this._colorPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
};

TimelineView.prototype._reRender = function() {
    if (this._div != null) {
        this._dom.viewSummaryContainer.innerHTML = "";
        this._dom.legendDiv.innerHTML = "";
        if (this._dom.ready) {
            this._startRenderView();
        }
    }
};

TimelineView.prototype._createJob = function() {
    var queryNode = { "id" : null, "name" : null };
    this.collection.addRestrictions(queryNode);
    
    var job = {
        queryNode:      queryNode,
        startPath:      this._startPropertyPicker.getTotalPath(),
        hasEnd:         this._endPropertyPicker.specified,
        hasColor:       this._colorPropertyPicker.specified,
        hasLabel:       this._labelPropertyPicker.specified
    };
    if (job.hasEnd) {
        job.endPath = this._endPropertyPicker.getTotalPath();
    }
    if (job.hasLabel) {
        job.labelPath = this._labelPropertyPicker.getTotalPath();
    }
    if (job.hasColor) {
        job.colorPath = this._colorPropertyPicker.getTotalPath();
    }
    return job;
};

TimelineView.prototype._startRenderView = function() {
    var self = this;
    
    ViewUtil.renderViewSummary(this.collection, this._dom.viewSummaryContainer);
    
    if (this._eventSource != null) {
        this._eventSource.clear();
    }
    if (!this._startPropertyPicker.specified) {
        return;
    }
    
    var job = this._createJob();
    job.colorCoder = this._colorCoder;
    job.colorKeys = {};
        
    var self = this;
    timelineViewQuery(job, function(points) {
        self._plotEvents(points);
        
        if (job.hasColorKeys) {
            for (var key in job.colorKeys) {
                var color = self._colorCoder.getColorForKey(key);
                var div = document.createElement("div");
                div.className = "timeline-view-legend-entry";
                div.appendChild(SimileAjax.Graphics.createTranslucentImage(
                    "http://simile.mit.edu/painter/painter?renderer=map-marker&shape=circle&width=20&height=20&pin=false&background=" + color.substr(1),
                    "middle"
                ));
                div.appendChild(document.createTextNode(key));
                
                self._dom.legendDiv.appendChild(div);
            }
        }
    });
};

TimelineView.prototype._plotEvents = function(points) {
    if (this._eventSource == null) {
        this._eventSource = new Timeline.DefaultEventSource();
    }
    timelineViewFillEventSource(this._eventSource, points);
    
    if (this._timeline == null) {
        this._dom.timelineDiv.style.height = "500px";
        this._timeline = timelineViewConstructTimeline(this._eventSource, this._dom.timelineDiv, function(itemID, name) {
            onNewTopic(itemID, name); 
        });
    } else {
        var band = this._timeline.getBand(0);
        var centerDate = band.getCenterVisibleDate();
        var earliest = this._eventSource.getEarliestDate();
        var latest = this._eventSource.getLatestDate();
        if (earliest != null && centerDate < earliest) {
            band.scrollToCenter(earliest);
        } else if (latest != null && centerDate > latest) {
            band.scrollToCenter(latest);
        }
    }
};

TimelineView.prototype._embed = function() {
    var job = this._createJob();
    
    var url = document.location.href;
    var q = url.indexOf("browse.html");
    url = window.ParallaxConfig.appendConfigParams(url.substr(0, q) + "timeline-view-embed.html?" + encodeURIComponent(JSON.stringify(job)));
    
    var html = '<iframe height="500" width="100%" src="' + url + '"></iframe>';
    
    window.prompt("HTML code to copy:", html);
};
