function PropertyPickerWidget(useTopicsThemselvesByDefault, includeNativeTypes, useCVTsAsIs) {
    this.specified = useTopicsThemselvesByDefault;
    
    this._baseQueryNode = null;
    this._basePropertyPicker = null;
    
    this._includeNativeTypes = (includeNativeTypes);
    this._useCVTsAsIs = (useCVTsAsIs);
    
    this._segments = [];
    
    this._elmt;
    this._dom;
}

PropertyPickerWidget.prototype.getExpectedType = function() {
    if (this._segments.length > 0) {
        return this._segments[this._segments.length - 1].dimension.expectedType;
    }
    return null;
}

PropertyPickerWidget.prototype.getState = function() {
    var state = { s: this.specified };
    if (this.specified) {
        var a = [];
        for (var i = 0; i < this._segments.length; i++) {
            var dimension = this._segments[i].dimension;
            var path = dimension.path;
            a.push(compressPath(path));
        }
        state.d = a;
    }
    return state;
}

PropertyPickerWidget.prototype.reconfigureFromState = function(state) {
    if (typeof state != "object") {
        return;
    }
    
    this.specified = state.s;
    this._segments = [];
    
    if (this.specified) {
        var d = state.d;
        for (var i = 0; i < d.length; i++) {
            var path = decompressPath(d[i]);
            var dimension = {
                path: path
            };
            this._segments.push({ dimension: dimension });
        }
    }
}

PropertyPickerWidget.prototype.getDimensions = function() {
    var dimensions = [];
    for (var i = 0; i < this._segments.length; i++) {
        dimensions.push(this._segments[i].dimension);
    }
    return dimensions;
};

PropertyPickerWidget.prototype.getTotalPath = function() {
    var path = [];
    for (var i = 0; i < this._segments.length; i++) {
        path = path.concat(this._segments[i].dimension.path);
    }
    return path;
};

PropertyPickerWidget.prototype.dispose = function() {
};

PropertyPickerWidget.prototype.setBaseQueryNode = function(queryNode) {
    this._baseQueryNode = queryNode;
};

PropertyPickerWidget.prototype.setBasePropertyPicker = function(basePropertyPicker) {
    this._basePropertyPicker = basePropertyPicker;
};

PropertyPickerWidget.prototype.installUI = function(elmt) {
    this._elmt = elmt;
    this._render();
};

PropertyPickerWidget.prototype.uninstallUI = function() {
    if (this._elmt != null) {
        this._elmt.innerHTML = "";
        this._elmt = null;
        
        this._dom = null;
    }
};

PropertyPickerWidget.prototype._render = function() {
    this._elmt.innerHTML = "";
    
    var self = this;
    if (this._segments.length == 0) {
        if (this.specified) {
            this._elmt.appendChild(document.createTextNode("use the topics themselves \u2022 or "));
            
            var span = document.createElement("span");
            span.innerHTML = '<a class="action" href="javascript:{}">select&nbsp;a&nbsp;property&nbsp;&raquo;</a>';
            span.firstChild.onclick = function() { self._showDropdown(span, 0); }
            
            this._elmt.appendChild(span);
        } else {
            this._elmt.appendChild(document.createTextNode("unspecified \u2022 "));
            
            var span = document.createElement("span");
            span.innerHTML = '<a class="action" href="javascript:{}">select&nbsp;property&nbsp;&raquo;</a>';
            span.firstChild.onclick = function() { self._showDropdown(span, 0); }
            
            this._elmt.appendChild(span);
        }
    } else {
        var createDimension = function(index, segment) {
            var path = segment.dimension.path;
            var lastNode = path[path.length - 1];
            var propertyID = lastNode.property;
            
            var span = document.createElement("span");
            span.innerHTML = '<a class="action" href="javascript:{}">' + propertyID + '</a>';
            span.firstChild.onclick = function() { self._showDropdown(span, index); }
            self._elmt.appendChild(span);
            
            if ("label" in segment.dimension) {
                span.firstChild.firstChild.nodeValue = segment.dimension.label;
            } else {
                SchemaUtil.tryGetPropertyLabel(propertyID, function(propertyLabel) {
                    span.firstChild.firstChild.nodeValue = propertyLabel;
                });
            }
        };
        
        var i;
        for (i = 0; i < this._segments.length; i++) {
            var segment = this._segments[i];
            if (i > 0) {
                this._elmt.appendChild(document.createTextNode(" \u2192 "));
            }
            createDimension(i, segment);
        }
        
        this._elmt.appendChild(document.createTextNode(" \u2022 "));
        
        var span = document.createElement("span");
        span.innerHTML = '<a class="action" href="javascript:{}">chain&nbsp;another&nbsp;property&nbsp;&raquo;</a>';
        span.firstChild.onclick = function() { self._showDropdown(span, i); }
        this._elmt.appendChild(span);
    }
};

PropertyPickerWidget.prototype._showDropdown = function(elmt, index) {
    var self = this;
    
    var typeStack = new TypeStack(this._getQueryNode(index), this._includeNativeTypes, this._useCVTsAsIs);
    typeStack.runWhenInitialized(function() {
        var dimensions = typeStack.getAllDimensions();
        typeStack.dispose();
        
        dimensions.sort(function(a, b) {
            var c = a.label.localeCompare(b.label);
            if (c == 0) {
                c = a.fullLabel.localeCompare(b.fullLabel);
            }
            return c;
        });
        self._showDropdownGivenDimensions(elmt, index, dimensions);
    });
};

PropertyPickerWidget.prototype._showDropdownGivenDimensions = function(elmt, index, dimensions) {
    var self = this;
    var staticChoices = [];
    var onPick = function(dimension) {
        self._pickDimension(index, dimension);
    };
    
    if (index == 0) {
        staticChoices.push({
            label:      "(Don't specify anything)",
            icon:       null,
            onclick:    function() { self._dontSpecify(); }
        });
        staticChoices.push({
            label:      "(Use topics themselves)",
            icon:       null,
            onclick:    function() { self._useTopicsThemselves(); }
        });
    }
    if (index < this._segments.length) {
        staticChoices.push({
            label:      "(Remove property)",
            icon:       null,
            onclick:    function() { self._truncate(index); }
        });
    }
    
    DimensionPickerWidget.show(elmt, dimensions, onPick, staticChoices);
};

PropertyPickerWidget.prototype._pickDimension = function(index, dimension) {
    if (index < this._segments.length) {
        this._segments = this._segments.slice(0, index);
    }
    this._segments.push({ dimension: dimension });
    this.specified = true;
    
    if (this._elmt != null) {
        this._render();
    }
};

PropertyPickerWidget.prototype._dontSpecify = function() {
    this.specified = false;
    this._segments = [];
    if (this._elmt != null) {
        this._render();
    }
};

PropertyPickerWidget.prototype._useTopicsThemselves = function() {
    this.specified = true;
    this._segments = [];
    if (this._elmt != null) {
        this._render();
    }
};

PropertyPickerWidget.prototype._truncate = function(index) {
    this._segments = this._segments.slice(0, index);
    if (this._elmt != null) {
        this._render();
    }
};

PropertyPickerWidget.prototype.getQueryNode = function() {
    return this._getQueryNode(this._segments.length);
};

PropertyPickerWidget.prototype._getQueryNode = function(index) {
    if (index == 0) {
        if (this._basePropertyPicker != null) {
            return this._basePropertyPicker.getQueryNode();
        } else {
            return clone(this._baseQueryNode);
        }
    } else {
        var queryNode = this._getQueryNode(index - 1);
        var path = this._segments[index - 1].dimension.path;
        
        var lastQueryNode = null;
        for (var i = 0; i < path.length; i++) {
            var pathNode = path[i];
            var newQueryNode = {};
            newQueryNode[backwardPathSegment(pathNode)] = [queryNode];
            
            lastQueryNode = queryNode;
            queryNode = newQueryNode;
        }
        lastQueryNode["return"] = "count";
        
        return queryNode;
    }
};
