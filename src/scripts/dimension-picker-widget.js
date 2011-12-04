var DimensionPickerWidget = {};

DimensionPickerWidget.show = function(elmt, dimensions, onPick, staticChoices) {
    var popupDom = createPopupMenuDom(elmt);
    popupDom.bodyDiv.style.overflow = "auto";
    popupDom.bodyDiv.style.height = "400px";
    
    for (var i = 0; i < staticChoices.length; i++) {
        var staticChoice = staticChoices[i];
        popupDom.appendMenuItem(
            staticChoice.label,
            staticChoice.icon,
            staticChoice.onclick
        );
    }
    
    var typeGroupMap = {};
    var typeGroupArray = [];
    for (var i = 0; i < dimensions.length; i++) {
        var dimension = dimensions[i];
        var typeGroup;
        if (dimension.expectedType in typeGroupMap) {
            typeGroup = typeGroupMap[dimension.expectedType];
        } else {
            typeGroup = typeGroupMap[dimension.expectedType] = {
                dimensions: [],
                label: "To " + dimension.expectedTypeLabel
            };
            typeGroupArray.push(typeGroup);
        }
        typeGroup.dimensions.push(dimension);
    }
    typeGroupArray.sort(function(a, b) {
        return b.dimensions.length - a.dimensions.length;
    });
    
    var dimensionSorter = function(a, b) {
        var c = a.label.localeCompare(b.label);
        if (c == 0) {
            c = a.fullLabel.localeCompare(b.fullLabel);
        }
        return c;
    };
    var processDimension = function(dimension) {
        var path = dimension.path;
        var lastSegment = path[path.length - 1];
        
        var searchText = dimension.label;
        
        var labelSpan = document.createElement("span");
        
        var propertySpan = document.createElement("span");
        propertySpan.title = lastSegment.property;
        propertySpan.innerHTML = dimension.label;
        labelSpan.appendChild(propertySpan);
        
        var typeRecord = SchemaUtil.getContainingTypeOfProperty(lastSegment.property);
        if (typeRecord != null) {
            var hint = (typeof typeRecord.name == "string") ? typeRecord.name : typeRecord.id;
            var hintSpan = document.createElement("span");
            hintSpan.className = "pivot-choice-menu-hint";
            hintSpan.innerHTML = " (" + hint + ")";
            hintSpan.title = typeRecord.id;
            labelSpan.appendChild(hintSpan);
            
            searchText += " " + hint;
        }
        
        var elmt = popupDom.appendMenuItem(
            labelSpan,
            null,
            function() { onPick(dimension); }
        );
        elmt.setAttribute("searchText", searchText.toLowerCase());
    };
    
    for (var i = 0; i < typeGroupArray.length; i++) {
        var typeGroup = typeGroupArray[i];
        if (typeGroup.dimensions.length < 3) {
            break;
        }
        
        popupDom.appendSection(typeGroup.label);
        
        typeGroup.dimensions.sort(dimensionSorter);
        for (var j = 0; j < typeGroup.dimensions.length; j++) {
            processDimension(typeGroup.dimensions[j]);
        }
    }
    
    if (i < typeGroupArray.length - 1) {
        var remainingDimensions = [];
        for (; i < typeGroupArray.length; i++) {
            var typeGroup = typeGroupArray[i];
            remainingDimensions = remainingDimensions.concat(typeGroup.dimensions);
        }
        
        popupDom.appendSection("To Other Types of Topic");
        
        remainingDimensions.sort(dimensionSorter);
        for (var i = 0; i < remainingDimensions.length; i++) {
            processDimension(remainingDimensions[i]);
        }
    }
    
    var quickFilterDiv = document.createElement("div");
    quickFilterDiv.className = "dimension-picker-widget-quick-filter-section";
    quickFilterDiv.innerHTML = 
        '<div class="dimension-picker-widget-quick-filter-section-heading">Quick search:</div>' +
        '<div class="dimension-picker-widget-quick-filter-section-input"><input></input></div>';
        
    var input = quickFilterDiv.childNodes[1].childNodes[0];
    input.onkeyup = function() {
        var text = input.value.trim().toLowerCase();
        var childNodes = popupDom.bodyDiv.childNodes;
        if (text.length == 0) {
            for (var i = 0; i < childNodes.length; i++){
                childNodes[i].style.display = "block";
            }
        } else {
            var sectionHeading = null;
            var sectionCount = 0;
            for (var i = 0; i < childNodes.length; i++){
                var childNode = childNodes[i];
                if (childNode.className == "menu-section") {
                    if (sectionHeading != null) {
                        sectionHeading.style.display = sectionCount > 0 ? "block" : "none";
                    }
                    sectionHeading = childNode;
                    sectionCount = 0;
                } else {
                    var searchText = childNode.getAttribute("searchText");
                    if (searchText == null || searchText.length == 0 || searchText.indexOf(text) >= 0) {
                        childNode.style.display = "block";
                        sectionCount++;
                    } else {
                        childNode.style.display = "none";
                    }
                }
            }
            
            if (sectionHeading != null) {
                sectionHeading.style.display = sectionCount > 0 ? "block" : "none";
            }
        }
    };
    
    popupDom.elmt.insertBefore(quickFilterDiv, popupDom.bodyDiv);

    popupDom.open();
    input.focus();
};
