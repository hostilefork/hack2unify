function renderTopicPage(itemID, outerDiv, onDone, focusHandler, pivotHandler) {
    new TopicPageRendering(itemID, outerDiv, onDone, focusHandler, pivotHandler);
}

function TopicPageRendering(itemID, outerDiv, onDone, focusHandler, pivotHandler) {
    this._itemID = itemID;
    this._outerDiv = outerDiv;
    this._onDone = onDone;
    this._focusHandler = focusHandler;
    this._pivotHandler = pivotHandler;
    
    var self = this;
    var url = "http://hotshot.jdouglas.user.dev." + window.ParallaxConfig.appBaseUrl + "acre/json?id=" + encodeURIComponent(itemID);
    JsonpQueue.call(url, function(o) { self._render(o); }, function(e) {});
};

TopicPageRendering.prototype._render = function(o) {
    var self = this;
    var itemID = this._itemID;
    var outerDiv = this._outerDiv;
    outerDiv.innerHTML = '<h1>' + o.name + ' <a class="topic-view-freebase-link" href="' + ParallaxConfig.corpusBaseUrl + 'view' + itemID + '">view on Freebase</a></h1><table cellspacing="0" cellpadding="0"><tr valign="top"><td></td><td width="30%"></td></tr></table>';
    
    var leftColumn = outerDiv.childNodes[1].rows[0].cells[0];
    var rightColumn = outerDiv.childNodes[1].rows[0].cells[1];
    
    var articleAndImagesDiv = document.createElement("div");
    articleAndImagesDiv.className = "topic-view-article-and-images-section";
    articleAndImagesDiv.innerHTML = '<table cellspacing="0" cellpadding="0"><tr valign="top"><td></td><td rowspan="2"></td></tr><tr><td></td></tr></table>';
    rightColumn.appendChild(articleAndImagesDiv);
    
    var getFirstValue = function(a, def) {
        return a.length > 0 ? a[0].value : def;
    };
    var processCommonTopicType = function(typeEntry) {
        for (var p = 0; p < typeEntry.properties.length; p++) {
            var propertyEntry = typeEntry.properties[p];
            var dataEntries = propertyEntry.data;
            if (dataEntries.length == 0) {
                continue;
            }
                
            switch (propertyEntry.id) {
            case "/common/topic/alias":
                var aliasDiv = document.createElement("div");
                aliasDiv.className = "topic-view-alias-section";
                aliasDiv.innerHTML = '<span class="topic-view-section-inline-label">' + propertyEntry.name + ":</span> ";
                outerDiv.insertBefore(aliasDiv, outerDiv.childNodes[1]);
                
                for (var d = 0; d < dataEntries.length; d++) {
                    if (d > 0) {
                        aliasDiv.appendChild(document.createTextNode(", "));
                    }
                    
                    var span = document.createElement("span");
                    span.innerHTML = dataEntries[d].value;
                    
                    aliasDiv.appendChild(span);
                }
                
                aliasDiv.style.display = "block";
                break;
                
            case "/common/topic/article":
                var td = articleAndImagesDiv.firstChild.rows[0].cells[0];
                var text = dataEntries[0].value;
                if (text.length > 500) {
                    text = text.substr(0, 500);
                    
                    var space = text.lastIndexOf(" ");
                    if (space > 0) {
                        text = text.substr(0, space);
                    }
                    text += " ...";
                }
                
                var elmt = document.createElement("div");
                elmt.appendChild(document.createTextNode(text));
                td.appendChild(elmt);
                
                break;
                
            case "/common/topic/image":
                var td = articleAndImagesDiv.firstChild.rows[0].cells[1];
                for (var d = 0; d < Math.min(3, dataEntries.length); d++) {
                    var dataEntry = dataEntries[d];
                    var id = dataEntry.id;
                    
                    var div = document.createElement("div");
                    div.className = "topic-view-thumbnail-container";
                    
                    var img = document.createElement("img");
                    img.src = ParallaxConfig.corpusBaseUrl + "api/trans/image_thumb" + id +
                        "?" + [ 
                            "mode=fill",
                            "maxheight=100",
                            "maxwidth=100"
                        ].join("&")
                    img.onclick = showLightboxForThumbnail;
                    
                    div.style.height = "100px";
                    div.style.width = "100px";
                    div.style.overflow = "hidden";
                    div.appendChild(img);
                    
                    td.appendChild(div);
                }
                break;
                
            case "/common/topic/webpage":
                var webLinksDiv = document.createElement("div");
                webLinksDiv.className = "topic-view-web-links-section";
                webLinksDiv.innerHTML = '<div class="topic-view-section-label">Web Links</div>';
                articleAndImagesDiv.firstChild.rows[1].cells[0].appendChild(webLinksDiv);
                
                for (var d = 0; d < dataEntries.length; d++) {
                    var dataEntry = dataEntries[d];
                    var url = dataEntry["/common/webpage/uri"][0].value;
                    
                    var div = document.createElement("div");
                    var a = document.createElement("a");
                    a.href = url;
                    a.target = "_blank";
                    a.innerHTML = getFirstValue(dataEntry["/common/webpage/description"], url);
                    div.appendChild(a);
                    
                    webLinksDiv.appendChild(div);
                }
                break;
            }
        }
    };
    
    var uniqueProperties = [];
    var disambiguatorProperties = [];
    var separateProperties = [];
    var separateTypes = [];
    var combinedTypes = [];
    
    var processOtherType = function(typeEntry) {
        var typeRecord = {
            typeEntry: typeEntry,
            propertyEntries: []
        };
        
        for (var p = 0; p < typeEntry.properties.length; p++) {
            var propertyEntry = typeEntry.properties[p];
            var dataEntries = propertyEntry.data;
            if (dataEntries == null || dataEntries.length == 0) {
                continue;
            }
            
            if (propertyEntry.unique) {
                uniqueProperties.push(propertyEntry);
            } else if (propertyEntry.disambiguator && propertyEntry.expected_type["/freebase/type_hints/mediator"] != true) {
                disambiguatorProperties.push(propertyEntry);
            } else if (dataEntries.length > 3) {
                separateProperties.push(propertyEntry);
            } else {
                typeRecord.propertyEntries.push(propertyEntry);
            }
        }
        
        if (typeRecord.propertyEntries.length > 0){
            if (typeRecord.propertyEntries.length > 3) {
                separateTypes.push(typeRecord);
            } else {
                combinedTypes.push(typeRecord);
            }
        }
    };
    
    var processTypeEntry = function(typeEntry) {
        if (typeEntry.id == "/common/topic") {
            processCommonTopicType(typeEntry);
        } else {
            processOtherType(typeEntry);
        }
    }
    
    for (var d = 0; d < o.domains.length; d++){
        var domain = o.domains[d];
        for (var t = 0; t < domain.types.length; t++) {
            var typeEntry = domain.types[t];
            processTypeEntry(typeEntry);
        }
    }
    
    var pathToString2 = function(path) {
        return "." + path.join(".");
    };
    var createPropertyAddMore = function(path, expectedTypeID) {
        var a = document.createElement("a");
        a.className = "action";
        a.href = "javascript:{}";
        a.innerHTML = "&nbsp;[&nbsp;+&nbsp;]&nbsp;";
        a.onclick = function() { 
            Logging.log("topic-add-more", { path: pathToString2(path) });
            interactiveAddMoreProperty(itemID, path, expectedTypeID, a.parentNode); 
        };
        return a;
    };
    var createCVTPropertyAddMore = function(path, expectedTypeID, subProperties) {
        var a = document.createElement("a");
        a.className = "action";
        a.href = "javascript:{}";
        a.innerHTML = "&nbsp;[&nbsp;+&nbsp;]&nbsp;";
        a.onclick = function() {
            Logging.log("topic-add-more-cvt", { path: pathToString2(path) });
            interactiveAddMoreCVTProperty(itemID, path, expectedTypeID, subProperties, a.parentNode.parentNode); 
        };
        return a;
    };
    var renderPropertyValue = function(elmt, valueEntry) {
        if ("id" in valueEntry) {
            var a = document.createElement("a");
            a.className = "topic-view-focus-link";
            a.href = ParallaxConfig.corpusBaseUrl + "view" + valueEntry.id;
            a.title = valueEntry.id;
            $(a).click(function(evt) { 
                Logging.log("topic-to-topic", { "id" : valueEntry.id });
                self._focusHandler(valueEntry.id, valueEntry.name); 
				
				evt.preventDefault();
            });
            
            if ("/common/topic/image" in valueEntry) {
                var img = document.createElement("img");
                img.className = "topic-view-micro-thumbnail";
                if (valueEntry["/common/topic/image"] != null) {
                    img.src = ParallaxConfig.corpusBaseUrl + "api/trans/image_thumb" + valueEntry["/common/topic/image"].id +
                        "?" + [ 
                            "mode=fillcrop",
                            "maxheight=40",
                            "maxwidth=40"
                        ].join("&");
                    img.onclick = showLightboxForThumbnail;
                } else {
                    img.src = "images/blank-16x16.png";
                    img.style.width = "38px";
                    img.style.height = "38px";
                    img.style.border = "1px solid #ddd";
                }
                a.appendChild(img);
            }
            a.appendChild(document.createTextNode(valueEntry.name));
            
            elmt.appendChild(a);
        } else {
            elmt.innerHTML = valueEntry.value;
        }
    };
    var renderPropertyValues = function(propertyEntry, elmt, valueEntries, expectedType, path, nested) {
        if (expectedType["/freebase/type_hints/mediator"] == true) {
            elmt.className += " topic-view-nested-property-container";
            
            var table = document.createElement("table");
            table.className = 'topic-view-nested-table';
            table.setAttribute("border", "0");
            table.setAttribute("cellspacing", "0");
            table.setAttribute("cellpadding", "0");
            table.setAttribute("width", "100%");
            elmt.appendChild(table);
            
            var masterPropertyID = "";
            if ("master_property" in propertyEntry) {
                masterPropertyID = propertyEntry.master_property.id;
            }
            
            var subProperties = expectedType.properties;
            var counts = {};
            
            var trHead = table.insertRow(0);
            trHead.vAlign = "top";
            for (var j = 0; j < subProperties.length; j++) {
                var subProperty = subProperties[j];
                var td = trHead.insertCell(j);
                td.innerHTML = subProperty.name;
                td.className = "topic-view-nested-property-label";
                counts[subProperty.id] = 0;
            }
            
            for (var i = 0; i < valueEntries.length; i++) {
                var valueEntry = valueEntries[i];
                var tr = table.insertRow(i + 1);
                tr.vAlign = "top";
                
                for (var j = 0; j < subProperties.length; j++) {
                    var td = tr.insertCell(j);
                    td.className = "topic-view-nested-property-value-container";
                    
                    var subProperty = subProperties[j];
                    var subPropertyID = subProperty.id;
                    if (subPropertyID in valueEntry) {
                        var subValueEntries = valueEntry[subPropertyID];
                        if (subValueEntries.length > 0) {
                            var path2 = path.concat(subPropertyID);
                            renderPropertyValues(subProperty, td, subValueEntries, subProperty.expected_type, path2, true);
                            
                            counts[subProperty.id] += subValueEntries.length;
                            continue;
                        }
                    }
                    td.innerHTML = "&nbsp;";
                }
            }
            
            var makeBrowseAll = function(td, subProperty) {
                var path2 = path.concat(subProperty.id);
                
                td.innerHTML = "&raquo;&nbsp;";
                
                var a = document.createElement("a");
                a.href = "javascript:{}";
                a.innerHTML = "browse&nbsp;all";
                a.onclick = function() { 
                    Logging.log("topic-to-cvt-column", { path: pathToString2(path2) });
                    self._pivotHandler(path2, subProperty.name); 
                };
                td.appendChild(a);
            };
            
            var trFoot = table.insertRow(table.rows.length);
            trFoot.vAlign = "top";
            for (var j = 0; j < subProperties.length; j++) {
                var subProperty = subProperties[j];
                var td = trFoot.insertCell(j);
                td.className = "topic-view-browse-all";
                if (counts[subProperty.id] > 0 && !(subProperty.expected_type.id in SchemaUtil.nativeTypes)) {
                    makeBrowseAll(td, subProperty);
                } else {
                    td.innerHTML = "&nbsp;";
                }
            }
            
            var trAdd = table.insertRow(table.rows.length);
            var tdAdd = trAdd.insertCell(0);
            tdAdd.colSpan = subProperties.length;
            
            var divAdd = document.createElement("div");
            tdAdd.appendChild(divAdd);
            divAdd.className = "topic-view-add";
            divAdd.appendChild(createCVTPropertyAddMore(path, expectedType.id, subProperties));
        } else {
            elmt.className += " topic-view-property-value-container";
            
            for (var i = 0; i < valueEntries.length; i++) {
                var valueEntry = valueEntries[i];
                var div = document.createElement("div");
                renderPropertyValue(div, valueEntry);
                elmt.appendChild(div);
            }
            
            if (valueEntries.length > 1) {
                var div = document.createElement("div");
                div.className = "topic-view-browse-all";
                div.innerHTML = "&raquo;&nbsp;";
                elmt.appendChild(div);
                
                var a = document.createElement("a");
                a.href = "javascript:{}";
                a.innerHTML = "browse&nbsp;all";
                a.onclick = function() { 
                    Logging.log("topic-to-property-values", { path: pathToString2(path) });
                    self._pivotHandler(path, propertyEntry.name); 
                };
                div.appendChild(a);
            }
            
            if (!nested && !propertyEntry.unique) {
                var divAdd = document.createElement("div");
                div.appendChild(divAdd);
                divAdd.className = "topic-view-add";
                divAdd.appendChild(createPropertyAddMore(path, expectedType.id));
            }
        }
    };
    
    var renderProperty = function(table, propertyEntry) {
        var row = table.insertRow(table.rows.length);
        row.vAlign = "top";
        
        var td0 = row.insertCell(0);
        td0.innerHTML = propertyEntry.name;
        td0.title = propertyEntry.id;
        td0.className = "topic-view-property-label";
        
        var td1 = row.insertCell(1);
        renderPropertyValues(propertyEntry, td1, propertyEntry.data, propertyEntry.expected_type, [propertyEntry.id], false);
    };
    
    var tabContainer = document.createElement("div");
    tabContainer.style.marginRight = "20px";
    tabContainer.innerHTML = '<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr valign="top"><td width="10%"></td><td></td></tr></table>';
    leftColumn.appendChild(tabContainer);
    
    var tabHeaderContainer = tabContainer.firstChild.rows[0].cells[0];
    tabHeaderContainer.className = "topic-view-tab-header-container";
    var tabBodyContainer = tabContainer.firstChild.rows[0].cells[1];
    tabBodyContainer.className = "topic-view-tab-body-container";
    
    var selectTab = function(index) {
        for (var i = 0; i < tabHeaderContainer.childNodes.length; i++) {
            if (index == i) {
                tabHeaderContainer.childNodes[i].className = "topic-view-tab-header topic-view-tab-header-selected";
                tabBodyContainer.childNodes[i].style.display = "block";
            } else {
                tabHeaderContainer.childNodes[i].className = "topic-view-tab-header";
                tabBodyContainer.childNodes[i].style.display = "none";
            }
        }
    };
    var createNewTab = function(label) {
        var index = tabHeaderContainer.childNodes.length;
        
        var paren = label.indexOf(" (");
        if (paren > 0) {
            label = label.substr(0, paren);
        }
        
        var tabHeader = document.createElement("div");
        tabHeader.innerHTML = label;
        tabHeader.className = index == 0 ? "topic-view-tab-header topic-view-tab-header-selected" : "topic-view-tab-header";
        tabHeader.onclick = function() { 
            Logging.log("topic-select-tab", { "label": label });
            selectTab(index); 
        };
        tabHeaderContainer.appendChild(tabHeader);
        
        var tabBody = document.createElement("div");
        tabBody.className = "topic-view-tab-body";
        tabBody.style.display = index == 0 ? "block" : "none";
        tabBodyContainer.appendChild(tabBody);
        
        return tabBody;
    };
    
    var basicSection = document.createElement("div");
    basicSection.className = "topic-view-essential-section";
    basicSection.innerHTML = '<table width="100%" border="0" cellspacing="0" cellpadding="0" class="topic-view-table"></table>';
    for (var i = 0; i < uniqueProperties.length; i++) {
        renderProperty(basicSection.firstChild, uniqueProperties[i]);
    }
    for (var i = 0; i < disambiguatorProperties.length; i++) {
        renderProperty(basicSection.firstChild, disambiguatorProperties[i]);
    }
    rightColumn.insertBefore(basicSection, rightColumn.firstChild);
    
    separateTypes.sort(function(a, b) {
        return b.propertyEntries.length - a.propertyEntries.length;
    });
    for (var i = 0; i < separateTypes.length; i++) {
        var typeRecord = separateTypes[i];
        var section = createNewTab("As " + typeRecord.typeEntry.name);
        section.innerHTML = '<table border="0" cellspacing="0" cellpadding="0" class="topic-view-table"></table>';
        
        for (var j = 0; j < typeRecord.propertyEntries.length; j++) {
            renderProperty(section.firstChild, typeRecord.propertyEntries[j]);
        }
    }
    
    for (var i = 0; i < separateProperties.length; i++) {
        var property = separateProperties[i];
        var listSection = createNewTab(property.name);
        listSection.innerHTML = '<table border="0" cellspacing="0" cellpadding="0" class="topic-view-table"></table>';
        
        renderPropertyValues(property, listSection, property.data, property.expected_type, [property.id], false);
    }
    
    var moreSection = createNewTab("More...");
    moreSection.innerHTML = '<table border="0" cellspacing="0" cellpadding="0" class="topic-view-table"></table>';
    
    var moreSectionTable = moreSection.firstChild;
    for (var i = 0; i < combinedTypes.length; i++) {
        var typeRecord = combinedTypes[i];
        
        var tr = moreSectionTable.insertRow(moreSectionTable.rows.length);
        var td = tr.insertCell(0);
        td.className = "topic-view-type-section";
        td.setAttribute("colspan", "2");
        td.innerHTML = typeRecord.typeEntry.name;
        
        for (var j = 0; j < typeRecord.propertyEntries.length; j++) {
            renderProperty(moreSectionTable, typeRecord.propertyEntries[j]);
        }
    }
    
    this._onDone();
};

function interactiveAddMoreProperty(topicID, path, expectedType, div) {
    var valueEditors = [];
    
    var rowWidth = div.offsetWidth;
    var shadeRemover = createShade();
    var editingContainer = createEditingContainer(div, 5, 5);
    editingContainer.innerHTML = 
        '<div style="padding: 5px; background: #444;">' +
            '<div style="width: ' + rowWidth + 'px; font-style: italic;">' +
                '<table width="100%" cellspacing="10" style="color: white;">' +
                    '<tr valign="top">' +
                        '<td colspan="2">Start typing something and we\'ll guess what you mean...</td>' +
                    '</tr>' +
                    '<tr valign="top">' +
                        '<td>' +
                            '<button>Cancel</button>' +
                        '</td>' +
                        '<td align="right">' +
                            '<button>Done Adding</button>' +
                        '</td>' +
                    '</tr>' +
                '</table>' +
            '</div>';
        '</div>';
        
    var dismissUI = function() {
        editingContainer.parentNode.removeChild(editingContainer);
        shadeRemover();
    };
    var onDone = function() {
        for (var i = 0; i < valueEditors.length; i++) {
            var valueEditor = valueEditors[i];
            
            var change = { "id" : topicID };
            var node = { "connect" : "insert" };
            change[path[0]] = node;
            
            if (valueEditor.topicID != null) {
                node["id"] = valueEditor.topicID;
            } else if (valueEditor.topicName != null) {
                node["create"] = "unless_exists";
                node["id"] = null;
                node["type"] = expectedType;
                node["name"] = valueEditor.topicName;
            } else if (valueEditor.value != null) {
                node["value"] = valueEditor.value;
            } else {
                continue;
            }
            ChangeManager.addChange(change);
        }
        dismissUI();
    };
    
    var buttons = editingContainer.getElementsByTagName("button");
    buttons[0].onclick = dismissUI;
    buttons[1].onclick = onDone;
    
    var createRow = function() {
        var index = valueEditors.length;
        
        var rowDiv = document.createElement("div");
        rowDiv.style.width = rowWidth + "px";
        rowDiv.style.marginBottom = "5px";
        editingContainer.firstChild.insertBefore(rowDiv, editingContainer.firstChild.lastChild);
        
        var config = {
            ac_param:{
                type:    expectedType
            },
            soft: false,
            suggest_new: "Create new topic"
        };
        var ve = new ValueEditor(
            rowDiv, 
            function() {
                if (index + 1 < valueEditors.length) {
                    valueEditors[index + 1].focus();
                } else {
                    createRow();
                }
            }, 
            config
        );
        ve.focus();
        
        valueEditors.push(ve);
        
        return ve;
    };
    
    createRow();
}

function interactiveAddMoreCVTProperty(topicID, path, expectedType, subProperties, td) {
    var rowRecords = [];
    var columnWidths = [];
    
    var tr = td.parentNode.previousSibling;
    for (var i = 0; i < tr.cells.length; i++) {
        columnWidths.push(tr.cells[i].offsetWidth);
    }
    
    var rowWidth = td.offsetWidth;
    var shadeRemover = createShade();
    var editingContainer = createEditingContainer(td, 5, 5);
    editingContainer.innerHTML = 
        '<div style="padding: 5px; background: #444;">' +
            '<table width="' + rowWidth + '" cellspacing="0" cellpadding="0"></table>' +
            '<div style="width: ' + rowWidth + 'px; font-style: italic;">' +
                '<table width="100%" cellspacing="10" style="color: white;">' +
                    '<tr valign="top">' +
                        '<td colspan="2">Start typing something and we\'ll guess what you mean...</td>' +
                    '</tr>' +
                    '<tr valign="top">' +
                        '<td>' +
                            '<button>Cancel</button>' +
                        '</td>' +
                        '<td align="right">' +
                            '<button>Done Adding</button>' +
                        '</td>' +
                    '</tr>' +
                '</table>' +
            '</div>';
        '</div>';
        
    var dismissUI = function() {
        editingContainer.parentNode.removeChild(editingContainer);
        shadeRemover();
    };
    var onDone = function() {
        for (var i = 0; i < rowRecords.length; i++) {
            var rowRecord = rowRecords[i];
            
            var hasInput = false;
            var ves = rowRecord.ves;
            for (var j = 0; j < ves.length; j++) {
                if (ves[j].hasInput()) {
                    hasInput = true;
                    break;
                }
            }
            
            if (!hasInput) {
                continue;
            }
            
            var cvtNode = { "create" : "unconditional", "type" : expectedType };
            var change = { "id" : topicID };
            change[path[0]] = cvtNode;
            
            for (var j = 0; j < ves.length; j++) {
                var valueEditor = ves[j];
                var node = { "connect" : "insert" };
                    
                if (valueEditor.topicID != null) {
                    node["id"] = valueEditor.topicID;
                } else if (valueEditor.topicName != null) {
                    node["create"] = "unless_exists";
                    node["id"] = null;
                    node["type"] = expectedType;
                    node["name"] = valueEditor.topicName;
                } else if (valueEditor.value != null) {
                    node["value"] = valueEditor.value;
                } else {
                    continue;
                }
                
                cvtNode[subProperties[j].id] = node;
            }
            
            ChangeManager.addChange(change);
        }
        dismissUI();
    };
    
    var buttons = editingContainer.getElementsByTagName("button");
    buttons[0].onclick = dismissUI;
    buttons[1].onclick = onDone;
    
    var createCell = function(rowIndex, columnIndex, td, subProperty) {
        var cellDiv = document.createElement("div");
        td.appendChild(cellDiv);
        
        var config = {
            ac_param: { type: subProperty.expected_type.id },
            soft: false,
            suggest_new: "Create new topic"
        };
        var ve = new ValueEditor(
            cellDiv, 
            function() {
                if (columnIndex + 1 < subProperties.length) {
                    rowRecords[rowIndex].ves[columnIndex + 1].focus();
                } else if (rowIndex + 1 < rowRecords.length) {
                    rowRecords[rowIndex + 1].ves[0].focus();
                } else {
                    createRow();
                }
            }, 
            config
        );
        return ve;
    };
    var createRow = function() {
        var index = rowRecords.length;
        
        var table = editingContainer.firstChild.firstChild;
        var tr = table.insertRow(table.rows.length);
        
        var ves = [];
        for (var i = 0; i < subProperties.length; i++) {
            var td = tr.insertCell(i);
            td.width = columnWidths[i];
            
            var ve = createCell(index, i, td, subProperties[i]);
            ves.push(ve);
        }
        rowRecords.push({ ves: ves });
        
        ves[0].focus();
    };
    
    createRow();
}

function createShade() {
    var divExtraSpace = document.createElement("div");
    divExtraSpace.style.height = "500px";
    divExtraSpace.innerHTML = "&nbsp;";
    document.body.appendChild(divExtraSpace);
    
    var bodyWidth = document.body.scrollWidth;
    var bodyHeight = document.body.scrollHeight;
    
    var shadeDiv = document.createElement("div");
    shadeDiv.style.position = "absolute";
    shadeDiv.style.top = "0px";
    shadeDiv.style.left = "0px";
    shadeDiv.style.width = bodyWidth + "px";
    shadeDiv.style.height = bodyHeight + "px";
    shadeDiv.style.background = "black";
    shadeDiv.style.opacity = 0.5;
    shadeDiv.style.zIndex = 100;
    document.body.appendChild(shadeDiv);
    
    return function() {
        document.body.removeChild(divExtraSpace);
        document.body.removeChild(shadeDiv);
    };
}

function createEditingContainer(elmt, marginLeftRight, marginTopBottom) {
    var c = SimileAjax.DOM.getPageCoordinates(elmt);
    
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.top = (c.top + elmt.offsetHeight) + "px";
    div.style.left = (c.left - marginLeftRight) + "px";
    div.style.width = (elmt.offsetWidth + 16 + 2 * marginLeftRight) + "px";
    div.style.height = (500 + 2 * marginTopBottom) + "px";
    div.style.overflow = "auto";
    div.style.zIndex = 200;
    document.body.appendChild(div);
    
    return div;
}

function ValueEditor(parentElmt, onCommit, config) {
    this.topicID = null;
    this.topicName = null;
    this.value = null;
    
    this._input = document.createElement("input");
    this._input.style.width = "100%";
    parentElmt.appendChild(this._input);
    
    var self = this;
    if (config.ac_param.type in SchemaUtil.nativeTypes) {
        this._input.onkeypress = function(evt) {
            self.value = self._input.value;
            if (evt.keyCode == 13) {
                onCommit();
            }
        };
    } else {
        $(this._input).freebaseSuggest(config)
            .bind('fb-select', function(e, data) { 
                self.topicID = data.id; 
                self.topicName = null; 
                //console.log('suggest: ', data.id); 
                onCommit();
            })
            .bind('fb-select-new', function(e, data) { 
                self.topicID = null;
                self.topicName = data.name; 
                //console.log('suggest new: ', data.name);
                onCommit();
            });
    }
}

ValueEditor.prototype.focus = function() {
    this._input.focus();
};

ValueEditor.prototype.hasInput = function() {
    return this.topicID != null || this.topicName != null || this.value != null;
};
