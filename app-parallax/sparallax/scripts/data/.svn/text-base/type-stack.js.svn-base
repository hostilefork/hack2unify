function TypeStack(queryNode, includeNativeTypes, useCVTsAsIs) {
    this._queryNode = queryNode;
    this._includeNativeTypes = (includeNativeTypes);
    this._useCVTsAsIs = (useCVTsAsIs);
    
    this._typeRecords = null;
    this._currentTypeRecord = 0;
    this._processedProperties = {};
}

TypeStack.prototype.dispose = function() {
    this._queryNode = null;
    this._typeRecords = null;
};

TypeStack.prototype.getTypeCount = function() {
    return this._typeRecords != null ? this._typeRecords.length : 0;
};

TypeStack.prototype.getAllDimensions = function() {
    var allDimensions = [];
    if (this._typeRecords != null) {
        for (var t = 0; t < this._typeRecords.length; t++) {
            allDimensions = allDimensions.concat(this._typeRecords[t].dimensions);
        }
    }
    return allDimensions;
}

TypeStack.prototype.runWhenInitialized = function(f) {
    if (this._typeRecords != null) {
        f();
        return false;
    } else {
        var self = this;
        var onDone2 = function(typeEntries) {
            self._buildTypeRecords(typeEntries || []);
            self._builtTypeRecords = true;
            f();
        };
        
        SchemaUtil.retrieveSchemas(this._queryNode, onDone2);
        return true;
    }
};

TypeStack.computeDimensions = function(
    dimensions, 
    rootTypeID, 
    fromTypeID, 
    propertyID, 
    previousPath, 
    previousLabel, 
    processedProperties, 
    includeNativeTypes,
    useCVTsAsIs
) {
    var propertyRecord = SchemaUtil.propertyRecords[propertyID];
    if (typeof propertyRecord != "object") {
        return;
    }
    
    if (propertyRecord.expectedType != null &&
        (includeNativeTypes || !(propertyRecord.expectedType in SchemaUtil.nativeTypes))) {
        
        if (!useCVTsAsIs && propertyRecord.expectedType.indexOf("/measurement_unit/") != 0 && propertyRecord.cvt) {
            
            var cvtTypeID = propertyRecord.expectedType;
            var cvtTypeRecord = SchemaUtil.typeRecords[cvtTypeID];
            if (cvtTypeRecord != null) {
                var path = [].concat(previousPath);
                path.push({ property: propertyID, forward: true });
                
                TypeStack._computeNestedDimensions(
                    dimensions, 
                    rootTypeID, 
                    cvtTypeID, 
                    propertyRecord.masterProperty, // to ignore
                    path, 
                    previousLabel + cvtTypeRecord.name + "/", 
                    processedProperties,
                    includeNativeTypes
                );
            }
            
            /*
             *  Exception: treat /location/mailing_address as first class, too.
             */
            if (propertyRecord.expectedType != "/location/mailing_address") {
                return;
            } // else, fall through
        }
        
        var path = [].concat(previousPath);
	
		
		
		if(propertyRecord.masterProperty!=null)
	{	
		
		path.push({ property: propertyID, forward: false});
		
		}
		else		
        path.push({ property: propertyID, forward: true});
        
        dimensions.push({
            path:               path,
            typeID:             rootTypeID,
            label:              propertyRecord.name,
            fullLabel:          previousLabel + propertyRecord.name,
            expectedType:       propertyRecord.expectedType,
            expectedTypeLabel:  propertyRecord.expectedTypeLabel,
            count:              0
        });
    }
	
};

TypeStack._computeNestedDimensions = function(
    dimensions, 
    rootTypeID, 
    typeID, 
    ignorePropertyID, 
    previousPath, 
    previousLabel, 
    processedProperties, 
    includeNativeTypes
) {
    var propertyIDs = SchemaUtil.typeRecords[typeID].properties;
    for (var i = 0; i < propertyIDs.length; i++) {
        var propertyID = propertyIDs[i];
        var propertyRecord = SchemaUtil.propertyRecords[propertyID];
        var unique = propertyRecord != null && propertyRecord.unique;
        
        if (propertyID in processedProperties ||
            (propertyID == ignorePropertyID && unique)) {
            continue;
        }
        
        processedProperties[propertyID] = true;
        TypeStack.computeDimensions(
            dimensions, 
            rootTypeID, 
            typeID, 
            propertyID, 
            previousPath, 
            previousLabel, 
            processedProperties, 
            includeNativeTypes,
            true
        );
    }
};

TypeStack.buildTypeRecord = function(typeID, dimensions, processedProperties, includeNativeTypes, useCVTsAsIs) {
    var typeRecord = SchemaUtil.typeRecords[typeID];
	    if (typeRecord) {
        var propertyIDs = typeRecord.properties;
        for (var i = 0; i < propertyIDs.length; i++) {
            var propertyID = propertyIDs[i];
           if (!(propertyID in processedProperties)) {
                processedProperties[propertyID] = true;
                TypeStack.computeDimensions(dimensions, typeID, typeID, propertyID, [], "", processedProperties, includeNativeTypes, useCVTsAsIs);
            }
        }
    }
};

TypeStack.prototype._buildTypeRecords = function(typeEntries) {
    this._typeRecords = [];
    for (var i = 0; i < typeEntries.length; i++) {
        var typeEntry = typeEntries[i];
       if ((typeEntry.id in SchemaUtil.typeRecords) && 
            (typeEntry.id != "/common/topic")) {
            
            var typeRecord = { typeID: typeEntry.id, count: typeEntry.count, dimensions: [], processedDimensions: 0 };
            
            TypeStack.buildTypeRecord(typeEntry.id, typeRecord.dimensions, this._processedProperties, this._includeNativeTypes, this._useCVTsAsIs);
            if (typeRecord.dimensions.length > 0) {
                this._typeRecords.push(typeRecord);
            }
        }
    }
    
    this._typeRecords.sort(function(a, b) {
        var c = b.count - a.count;
        if (c == 0) {
            c = a.typeID.localeCompare(b.typeID);
        }
        return c;
    });
};

TypeStack.prototype.runOnDimensionsOfNextType = function(f) {
    var self = this;
    if (this._typeRecords != null) {
        return this._internalRunOnDimensionsOfNextType(f);
    } else {
        this.runWhenInitialized(function() {
            self._internalRunOnDimensionsOfNextType(f);
        });
        return true;
    }
};

TypeStack.prototype._internalRunOnDimensionsOfNextType = function(f) {
    if (this._currentTypeRecord < this._typeRecords.length) {
        var typeRecord = this._typeRecords[this._currentTypeRecord];
        
        var self = this;
        var baseQueryNode = this._queryNode;
        
        var doneADimension = function() {
            typeRecord.processedDimensions++;
            if (typeRecord.processedDimensions >= typeRecord.dimensions.length) {
                self._currentTypeRecord++;
                f(typeRecord, typeRecord.dimensions);
            }
        };
        
        var processDimension = function(dimension) {
            var queryNode = clone(baseQueryNode);
            
            var path = dimension.path;
            for (var i = 0; i < path.length; i++) {
                var pathNode = path[i];
                var newQueryNode = {};
			    newQueryNode[backwardPathSegment(pathNode)] = [queryNode];
			
                queryNode = newQueryNode;
				
			     }
            queryNode["return"] = typeRecord.count > 1000 ? "estimate-count" : "count";

            JsonpQueue.queryOne(
                [queryNode],
                function(o) {
                    dimension.count = o.result[0];
                    doneADimension();
                }, 
                doneADimension
            );
        };
        for (var i = 0; i < typeRecord.dimensions.length; i++) {
            processDimension(typeRecord.dimensions[i]);
        }
        
        return true;
    } else {
        return false;
    }
};