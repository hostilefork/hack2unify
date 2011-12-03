function TabularView(collection, label) {
    this.collection = collection;
    this._label = label;
    
    this._div = null;
    this._dom = null;
    this._colorCoder = new DefaultColorCoder();
    
    this._sortColumnIndex = 0;
    this._sortColumnAscending = true;
    this._columnRecords = [ this._constructColumnRecord(true) ];
    this._rowColorPropertyPicker = new PropertyPickerWidget(false, true, false);
    
    this._editing = false;
    this._editingElmt = null;
    this._editingIndex = -1;
    this._editingColumnRecord = null;
    
    this._setBaseRestrictionsToPropertyPickers();
    
    this.collection.addListener(this);
}

TabularView.prototype.getLabel = function() {
    return (typeof this._label == "string") ? ("Table (" + this._label + ")") : "Table";
};

TabularView.prototype.dispose = function() {
    this._disposeColumnRecords();
    
    this._rowColorPropertyPicker.dispose();
    this._rowColorPropertyPicker = null;

    this._div = null;
    this._dom = null;
    
    this.collection.removeListener(this);
    this.collection = null;
};

TabularView.prototype.getState = function() {
    var columnRecords = [];
    for (var i = 0; i < this._columnRecords.length; i++) {
        var columnRecord = this._columnRecords[i];
        columnRecords.push({ p: columnRecord.propertyPicker.getState() });
    }
    
    return {
        cols:     columnRecords,
        sort:    this._sortColumnIndex,
        asc:    this._sortColumnAscending,
        c:         this._rowColorPropertyPicker.getState()
    };
};

TabularView.prototype.getClassName = function() {
    return "TabularView";
};

TabularView.prototype.reconfigureFromState = function(state) {
    this._uninstallColumnUI();
    this._disposeColumnRecords();
    this._columnRecords = [];
    
    var columnRecordStates = state.cols;
    for (var i = 0; i < columnRecordStates.length; i++) {
        var columnRecordState = columnRecordStates[i];
        
        var columnRecord = this._constructColumnRecord();
        this._columnRecords.push(columnRecord);
        
        columnRecord.propertyPicker.reconfigureFromState(columnRecordState.p);
    }
    
    this._rowColorPropertyPicker.reconfigureFromState(state.c);
};

TabularView.prototype._disposeColumnRecords = function() {
    for (var i = 0; i < this._columnRecords.length; i++) {
        var columnRecord = this._columnRecords[i];
        columnRecord.propertyPicker.dispose();
        columnRecord.propertyPicker = null;
    }
    this._columnRecords = null;
};

TabularView.prototype.installUI = function(div) {
    this._div = div;
    this._constructUI();
    this._reRender();
};

TabularView.prototype.uninstallUI = function() {
    this._uninstallColumnUI();
    this._rowColorPropertyPicker.uninstallUI();
    
    this._disposeEditingUI();
    
    this._div.innerHTML = "";
    this._div = null;
    this._dom = null;
};

TabularView.prototype._disposeEditingUI = function() {
    if (this._editing) {
        this._editingColumnRecord.propertyPicker.uninstallUI();
        this._editingColumnRecord.propertyPicker.dispose();
        this._editingColumnRecord = null;
        
        this._editingElmt.innerHTML = "";
        this._editingElmt = null;
        this._editingIndex = -1;
        this._editing = false;
    }
};

TabularView.prototype._uninstallColumnUI = function() {
    if (this._div != null) {
        for (var i = 0; i < this._columnRecords.length; i++) {
            var columnRecord = this._columnRecords[i];
            columnRecord.propertyPicker.uninstallUI();
        }
    }
};

TabularView.prototype._constructColumnRecord = function(defaultToTopics) {
    var propertyPicker = new PropertyPickerWidget(defaultToTopics, true, false);
    propertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    
    return { propertyPicker: propertyPicker };
};

TabularView.prototype.onModeChanged = function(mode) {
};

TabularView.prototype._constructUI = function() {
    var self = this;
    
    this._div.innerHTML = 
        '<div id="results-summary-container"></div>' +
        '<div class="tabular-view-controls"><table cellspacing="10">' +
            '<tr><td width="10%">Row&nbsp;Color&nbsp;Coding:</td><td></td></tr>' +
            '<tr><td colspan="2"><button>Render&nbsp;Table</button></td><td width="10%"><a href="javascript:{}" class="action">embed&nbsp;this&nbsp;table</a></td></tr>' +
        '</table></div>' +
        '<div class="tabular-view-legend"></div>' +
        '<div class="tabular-view-canvas"></div>';
        
    this._dom = {
        viewSummaryContainer:     this._div.childNodes[0],
        controlTable:             this._div.childNodes[1].childNodes[0],
        legendDiv:                this._div.childNodes[2],
        canvasDiv:                this._div.childNodes[3]
    };
    
    this._rowColorPropertyPicker.installUI(this._dom.controlTable.rows[0].cells[1]);
    this._dom.controlTable.rows[1].cells[0].firstChild.onclick = function() {
        Logging.log("tabular-view-re-render", { "state" : self.getState() });
        self._reRender(); 
    };
    this._dom.controlTable.rows[1].cells[1].firstChild.onclick = function() {
        Logging.log("tabular-view-embed", {});
        self._embed(); 
    };
};

TabularView.prototype.onItemsChanged = function() {
    this._reRender();
};

TabularView.prototype.onRootItemsChanged = function() {
    this._setBaseRestrictionsToPropertyPickers();
};

TabularView.prototype._setBaseRestrictionsToPropertyPickers = function() {
    for (var i = 0; i < this._columnRecords.length; i++) {
        var columnRecord = this._columnRecords[i];
        columnRecord.propertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
    }
    this._rowColorPropertyPicker.setBaseQueryNode(this.collection.addBaseRestrictions());
};

TabularView.prototype._reRender = function() {
    if (this._div != null) {
        this._dom.viewSummaryContainer.innerHTML = "";
        this._dom.legendDiv.innerHTML = "";
        this._startRenderView();
    }
};

TabularView.prototype._createJob = function() {
    var queryNode = { "id" : null, "name" : null };
    this.collection.addRestrictions(queryNode);
    
    var job = {
        queryNode:              queryNode,
        columnConfigs:          [],
        sortColumnIndex:        this._sortColumnIndex,
        sortColumnAscending:    this._sortColumnAscending,
        hasRowColor:            this._rowColorPropertyPicker.specified
    };
    if (job.hasRowColor) {
        job.rowColorPath = this._rowColorPropertyPicker.getTotalPath();
        job.rowColorValuesAreNative = true;
        if (job.rowColorPath.length == 0) {
            job.rowColorValuesAreNative = false;
        } else {
            var propertyID = job.rowColorPath[job.rowColorPath.length - 1].property;
            if (propertyID in SchemaUtil.propertyRecords) {
                var propertyRecord = SchemaUtil.propertyRecords[propertyID];
                if (!(propertyRecord.expectedType in SchemaUtil.nativeTypes)) {
                    job.rowColorValuesAreNative = false;
                }
            }
        }
    }
    
    var createColumnConfig = function(columnRecord) {
        var columnConfig = {
            valuesAreNative: false,
            valueType: ""
        };
        if (columnRecord.propertyPicker.specified) {
            columnConfig.path = columnRecord.propertyPicker.getTotalPath();
            
            if (columnConfig.path.length == 0) {
                columnConfig.label = "Topic";
                columnConfig.valuesAreNative = false;
            } else {
                var propertyID = columnConfig.path[columnConfig.path.length - 1].property;
                columnConfig.label = propertyID;
                
                if (propertyID in SchemaUtil.propertyRecords) {
                    var propertyRecord = SchemaUtil.propertyRecords[propertyID];
                    columnConfig.label = propertyRecord.name;
                    columnConfig.valueType = propertyRecord.expectedType;
                    
                    if (propertyRecord.expectedType in SchemaUtil.nativeTypes) {
                        columnConfig.valuesAreNative = true;
                    }
                }
            }
        }
        return columnConfig;
    };
    
    for (var i = 0; i < this._columnRecords.length; i++) {
        job.columnConfigs.push(createColumnConfig(this._columnRecords[i]));
    }
    return job;
};

TabularView.prototype._startRenderView = function() {
    ViewUtil.renderViewSummary(this.collection, this._dom.viewSummaryContainer);
    
    var self = this;
    
    var job = this._createJob();
    job.colorCoder = this._colorCoder;
    job.rowColorKeys = {};
    
    var self = this;
    tabularViewQuery(job, function(rows) {
        if (self._sortColumnIndex >= 0) {
            tabularViewSort(rows, self._sortColumnIndex, self._sortColumnAscending);
        }
        
        var onAddColumn = function(actionElmt, editElmt, revertEditingUI) {
            self._startEditing(self._columnRecords.length, self._constructColumnRecord(false), editElmt, revertEditingUI);
        };
        var onRemoveColumn = function(actionElmt, index) {
            self._columnRecords.splice(index, 1);
            self._startRenderView();
        };
        var onEditColumn = function(actionElmt, index, editElmt, revertEditingUI) {
            var columnRecord = self._constructColumnRecord(false);
            columnRecord.propertyPicker.reconfigureFromState(self._columnRecords[index].propertyPicker.getState());
        
            self._startEditing(index, columnRecord, editElmt, revertEditingUI);
        };
        var onSortColumn = function(index) {
            if (index == self._sortColumnIndex) {
                self._sortColumnAscending = !self._sortColumnAscending;
            } else {
                self._sortColumnIndex = index;
                self._sortColumnAscending = true;
            }
            job.sortColumnIndex = self._sortColumnIndex;
            job.sortColumnAscending = self._sortColumnAscending;
            
            tabularViewSort(rows, self._sortColumnIndex, self._sortColumnAscending, job.columnConfigs[self._sortColumnIndex].valueType);
            
            render();
        };
        var render = function() {
            tabularViewRender(self._dom.canvasDiv, job, rows, 
                {
                    editable:           true,
                    onAddColumn:        onAddColumn, 
                    onRemoveColumn:     onRemoveColumn, 
                    onEditColumn:       onEditColumn,
                    onFocus:            onNewTopic,
                    onSortColumn:       onSortColumn
                }
            );
        };
        render();
        
        if (job.hasRowColorKeys) {
            for (var key in job.rowColorKeys) {
                var color = self._colorCoder.getColorForKey(key);
                var div = document.createElement("div");
                div.className = "tabular-view-legend-entry";
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

TabularView.prototype._embed = function() {
    var job = this._createJob();
    
    var url = document.location.href;
    var q = url.indexOf("browse.html");
    url = window.ParallaxConfig.appendConfigParams(url.substr(0, q) + "tabular-view-embed.html?" + encodeURIComponent(JSON.stringify(job)));
    
    var html = '<iframe height="600" width="100%" src="' + url + '"></iframe>';
    
    window.prompt("HTML code to copy:", html);
};

TabularView.prototype._startEditing = function(columnIndex, columnRecord, editElmt, onCancel) {
    this._disposeEditingUI();
    
    this._editingElmt = editElmt;
    this._editingIndex = columnIndex;
    this._editingColumnRecord = columnRecord;
    this._editing = true;
    
    editElmt.innerHTML = "";
    
    var divPicker = document.createElement("div");
    divPicker.className = "tabular-view-editing-settings";
    editElmt.appendChild(divPicker);
    this._editingColumnRecord.propertyPicker.installUI(divPicker);
    
    var divControls = document.createElement("div");
    divControls.className = "tabular-view-editing-controls";
    divControls.innerHTML = "<button>Done</button> <button>Cancel</button>";
    editElmt.appendChild(divControls);
    
    var self = this;
    var buttons = divControls.getElementsByTagName("button");
    buttons[0].onclick = function() {
        self._columnRecords[columnIndex] = columnRecord;
        self._disposeEditingUI();
        self._startRenderView();
    };
    buttons[1].onclick = function() {
        self._disposeEditingUI();
        onCancel();
    };
};
