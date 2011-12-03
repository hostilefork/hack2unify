function tabularViewQuery(job, onDone) {
    var queryNode = job.queryNode;
    queryNode["limit"] = 500;
    
    var addPath = function(path, valuesAreNative) {
        if (path.length > 0) {
            var queryNode2 = extendQueryNodeWithPath(queryNode, path);
            
            if (valuesAreNative) {
                queryNode2["value"] = null;
            } else {
                if (!("name" in queryNode2)) {
                    queryNode2["name"] = null;
                }
                if (!("id" in queryNode2)) {
                    queryNode2["id"] = null;
                }
            }
        }
    };
    
    if (job.hasRowColor) {
        addPath(job.rowColorPath, job.rowColorValuesAreNative);
        var rowColorNodeIterator = createForwardPathIterator(job.rowColorPath);
    }
    
    for (var i = 0; i < job.columnConfigs.length; i++) {
        var columnConfig = job.columnConfigs[i];
        if ("path" in columnConfig) {
            addPath(columnConfig.path, columnConfig.valuesAreNative);
            columnConfig.nodeIterator = createForwardPathIterator(columnConfig.path);
        }
    }
    
    var gotRestrictedItems = function(o) {
        var rows = [];
        var rowColorKeys = job.rowColorKeys;
        
        job.hasRowColorKeys = false;
        var processRow = function(itemNode) {
            var row = {
                cells: []
            };
            
            if (job.hasRowColor) {
                var colorNode = null;
                rowColorNodeIterator(itemNode,
                    function(node) {
                        colorNode = node;
                    }
                );
                if (colorNode != null) {
                    var key = "name" in colorNode ? colorNode.name : colorNode.value;
                    var color = job.colorCoder.getColorForKey(key);
                    
                    rowColorKeys[key] = true;
                    job.hasRowColorKeys = true;
                    
                    row.color = color;
                }
            }
            
            for (var c = 0; c < job.columnConfigs.length; c++) {
                var columnConfig = job.columnConfigs[c];
                var cell = { values: [] };
                if ("nodeIterator" in columnConfig) {
                    var valueNodeVisitor = function(valueNode) {
                        if ("name" in valueNode) {
                            cell.values.push({ name: valueNode.name, id: valueNode.id });
                        } else {
                            cell.values.push({ value: valueNode.value });
                        }
                    };
                    
                    columnConfig.nodeIterator(itemNode, valueNodeVisitor);
                }
                
                row.cells.push(cell);
            }
            
            rows.push(row);
        };
        
        for (var i = 0; i < o.result.length; i++) {
            var itemNode = o.result[i];
            processRow(itemNode);
        }
        
        onDone(rows);
    };
    
    JsonpQueue.queryOne([queryNode], gotRestrictedItems, genericErrorHandler);
};

function tabularViewSort(rows, columnIndex, sortAscending, valueType) {
    var stringComparator = function(a, b) {
        return a.sortKey.localeCompare(b.sortKey);
    };
    var numericComparator = function(a, b) {
        return a.sortKey - b.sortKey;
    };
    
    var sortKeyGenerator;
    var sortKeyDefault;
    var sortKeyComparator;
    if (valueType in SchemaUtil.nativeTypes) {
        switch (valueType) {
        case '/type/int':
        case '/type/float':
            sortKeyGenerator = function(valueEntry) {
                if (valueEntry != null) {
                    try {
                        var n = parseFloat(valueEntry.value);
                        if (!isNaN(n)) {
                            return n;
                        }
                    } catch (e) {}
                }
                return null;
            };
            sortKeyDefault = Number.NEGATIVE_INFINITY;
            sortKeyComparator = numericComparator;
            break;
        case '/type/boolean':
            sortKeyGenerator = function(valueEntry) {
                if (valueEntry != null) {
                    if ("value" in valueEntry) {
                        if (typeof valueEntry.value == "boolean") {
                            return valueEntry.value ? 1 : 0;
                        } else {
                            var s = valueEntry.value.toString().toLowerCase();
                            if (s == "true") {
                                return 1;
                            } else if (s == "false") {
                                return 0;
                            }
                        }
                    }
                }
                return null;
            };
            sortKeyDefault = -1;
            sortKeyComparator = numericComparator;
            break;
            
        default:
            sortKeyGenerator = function(valueEntry) {
                if (valueEntry != null) {
                    if ("value" in valueEntry) {
                        var s = valueEntry.value.toString().toLowerCase();
                        return s;
                    }
                }
                return null;
            };
            sortKeyDefault = "";
            sortKeyComparator = stringComparator;
        }
    } else {
        sortKeyGenerator = function(valueEntry) {
            if (valueEntry != null) {
                if ("name" in valueEntry) {
                    var s = valueEntry.name.toLowerCase();
                    return s;
                }
            }
            return null;
        };
        sortKeyDefault = "";
        sortKeyComparator = stringComparator;
    }
    
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var cell = row.cells[columnIndex];
        var values = cell.values;
        
        var sortKey = null;
        for (var v = 0; sortKey == null && v < values.length; v++) {
            sortKey = sortKeyGenerator(values[v]);
        }
        
        row.sortKey = (sortKey == null) ? sortKeyDefault : sortKey;
    }
    
    var comparator = sortAscending ? sortKeyComparator : function(a, b) { return sortKeyComparator(b, a); };
    rows.sort(comparator);
};

function tabularViewRender(div, job, rows, settings) {
    div.innerHTML = "";
    if (rows.length == 0) {
        return;
    }
    
    var table = document.createElement("table");
    table.className = "tabular-view-table";
    //table.setAttribute("border", "1");
    table.setAttribute("cellspacing", "0");
    table.setAttribute("width", "100%");
    div.appendChild(table);
    
    var columnCount = job.columnConfigs.length + (settings.editable ? 1 : 0);
    
    /*
     *  Create table header and edit rows
     */
     
    var trHead = table.insertRow(0);
    var trEdit = table.insertRow(1);
    var tdEdit = trEdit.insertCell(0);
    tdEdit.setAttribute("colspan", columnCount);
    tdEdit.className = "tabular-view-header-editing-container";
    trEdit.style.display = "none";
    
    var revertEditingUI = function() {
        var cells = trHead.cells;
        for (var i = 0; i < cells.length; i++) {
            cells[i].className = "tabular-view-header-cell";
        }
        trEdit.style.display = "none";
    };
    var createColumnHeader = function(columnConfig, c) {
        var td = trHead.insertCell(c);
        td.className = "tabular-view-header-cell";
        
        if (c > 0 && settings.editable) {
            var img = SimileAjax.Graphics.createTranslucentImage("images/close-button.png", "middle");
            img.className = "tabular-view-header-remove-button";
            img.onclick = function() { settings.onRemoveColumn(img, c); }
            td.appendChild(img);
            
            var aEditColumn = document.createElement("a");
            aEditColumn.className = "action tabular-view-header-edit-button";
            aEditColumn.href = "javascript:{}";
            aEditColumn.innerHTML = "edit";
            aEditColumn.onclick = function() {
                revertEditingUI();
                
                trEdit.style.display = "";
                td.className = "tabular-view-header-cell tabular-view-header-editing"; 
                settings.onEditColumn(aEditColumn, c, tdEdit, revertEditingUI); 
            };
            td.appendChild(aEditColumn);
        }
        
        var spanLabel = document.createElement("span");
        spanLabel.className = "tabular-view-header-label";
        spanLabel.appendChild(document.createTextNode("label" in columnConfig ? columnConfig.label : "?"));
        if (c == job.sortColumnIndex) {
            var imgSort = SimileAjax.Graphics.createTranslucentImage(
                job.sortColumnAscending ? "images/up-arrow.png" : "images/down-arrow.png", "middle");
            spanLabel.appendChild(imgSort);
        }
        spanLabel.onclick = function() {
            settings.onSortColumn(c);
        };
        td.appendChild(spanLabel);
    };
    for (var c = 0; c < job.columnConfigs.length; c++) {
        var columnConfig = job.columnConfigs[c];
        createColumnHeader(columnConfig, c);
    }
    
    if (settings.editable) {
        var tdAdd = trHead.insertCell(job.columnConfigs.length);
        tdAdd.className = "tabular-view-header-cell";
        tdAdd.setAttribute("width", "1%");
        
        var aAddColumn = document.createElement("a");
        aAddColumn.className = "action";
        aAddColumn.href = "javascript:{}";
        aAddColumn.innerHTML = "add";
        aAddColumn.onclick = function() {
            revertEditingUI();
                
            trEdit.style.display = "";
            tdAdd.className = "tabular-view-header-cell tabular-view-header-editing";
            settings.onAddColumn(aAddColumn, tdEdit, revertEditingUI);
        };
        tdAdd.appendChild(aAddColumn);
    }
    
    /*
     *  Create table data rows
     */
    var createTopicValue = function(valueEntry) {
        var a = document.createElement("a");
        a.href = ParallaxConfig.corpusBaseUrl + "view" + valueEntry.id;
        a.appendChild(document.createTextNode(valueEntry.name));
        $(a).click(function(evt) { 
            Logging.log("tabular-view-to-topic", { "id" : valueEntry.id });
            settings.onFocus(valueEntry.id, valueEntry.name);
            evt.preventDefault();
        });
        return a;
    };
    var createValue = function(valueEntry) {
        if ("name" in valueEntry) {
            return createTopicValue(valueEntry);
        } else {
            return document.createTextNode(valueEntry.value);
        }
    };
    for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        var tr = table.insertRow(r + 2);
        
        if ("color" in row) {
            tr.style.backgroundColor = row.color;
        }
        
        var cells = row.cells;
        for (var c = 0; c < cells.length; c++) {
            var cell = cells[c];
            var td = tr.insertCell(c);
            td.className = "tabular-view-data-cell";
            
            var values = cell.values;
            if (values.length == 0) {
                td.innerHTML = "&nbsp;";
            } else if (values.length == 1) {
                td.appendChild(createValue(values[0]));
            } else {
                var ol = document.createElement("ol");
                td.appendChild(ol);
                
                for (var v = 0; v < values.length; v++) {
                    var value = values[v];
                    var li = document.createElement("li");
                    ol.appendChild(li);
                    li.appendChild(createValue(value));
                }
            }
        }
    }
};
