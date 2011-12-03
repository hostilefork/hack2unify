var SchemaUtil = {
    typeRecords: {},
    propertyRecords: {},
    nativeTypes: {
        '/type/int': true,
        '/type/float': true,
        '/type/boolean': true,
        '/type/rawstring': true,
        '/type/uri': true,
        '/type/datetime': true,
        '/type/bytestring': true,
        //'/type/key': true,
        '/type/value': true,
        '/type/text': true,
        '/type/enumeration':true
    }
};

SchemaUtil.getContainingTypeOfProperty = function(propertyID) {
    var typeID = SchemaUtil.getContainingTypeIDOfProperty(propertyID);
    if (typeID != null && typeID in SchemaUtil.typeRecords) {
        return SchemaUtil.typeRecords[typeID];
    }
    return null;
};

SchemaUtil.getContainingTypeIDOfProperty = function(propertyID) {
    var slash = propertyID.lastIndexOf("/");
    if (slash > 0) {
        return propertyID.substr(0, slash);
    }
    return null;
};

SchemaUtil.retrieveSchemas = function(instanceQueryNode, onDone) {
    var types = [];
    var onDone2 = function() {
        onDone(types);
    };
    var gotTypeIDs = function(o) {
        var typesToFetch = [];
        for (var i = 0; i < o.result.length; i++) {
            var entry = o.result[i];
            if (typeof entry == "object") {
                var typeID = entry.id;
                
                types.push({
                    id:     typeID,
                    count:  ("/type/type/instance" in entry && entry["/type/type/instance"].length > 0) ?
                                entry["/type/type/instance"][0] : 0
                });
                
        //        if (!(typeID in SchemaUtil.typeRecords)) {
                    typesToFetch.push(typeID);
           //     }
            }
        }
        
        if (typesToFetch.length > 0) {
            SchemaUtil.getTypeSchemasInBatches(typesToFetch, onDone2);
        } else {
            onDone2();
        }
    };
    
    instanceQueryNode["return"] = "estimate-count";
    var query = [{ "type" : "/type/type", "id" : null, "/type/type/instance" : [instanceQueryNode] }];
   // alert(instanceQueryNode);
    JsonpQueue.queryOne(query, gotTypeIDs, function(s) { log(s); log(query); onDone(); });
}

SchemaUtil.getTypeSchemasInBatches = function(typeIDs, onDone) {
    var from = 0;
	
    var doNext = function() {
        if (from < typeIDs.length) {
            var to = Math.min(from + 1, typeIDs.length);
            var typeIDs2 = typeIDs.slice(from, to);
            from = to;
            
            SchemaUtil._getSchemas(typeIDs2, doNext);
        } else {
            onDone();
        }
    };
    doNext();
}

SchemaUtil._getSchemas = function(typeIDs, onDone) {
    //log("Getting schema data for " + typeIDs.length + " types");
    var query = [
        {
            "/type/type/properties" : [{
                "id" : null,
                "name" : null,
                "expected_type" : [{ "id" : null, "name" : null, "/freebase/type_hints/mediator" : null }],
                "master_property" : null,
                "unique" : null
            }],
            "!/user/dfhuynh/parallax/type_profile/profile_of" : [{
                "/user/dfhuynh/parallax/type_profile/pivot_suggestion" : [{ "path" : null, "optional" : true }],
                "/user/dfhuynh/parallax/type_profile/filter_suggestion" : [{ "path" : null, "optional" : true }],
                "optional" : true
            }],
            "id" :       typeIDs[0],
            "name" :    null,
            "id|=" :     typeIDs
        }
    ];
    JsonpQueue.queryOne(query, function(o) { SchemaUtil._gotSchemas(o, onDone); }, function(s) { log(s); onDone(); });
};

SchemaUtil._gotSchemas = function(o, onDone) {
    var moreTypesToFetch = {};
    
    var a = o.result;
    for (var i = 0; i < a.length; i++){
        var entry = a[i];
        var typeRecord = { 
            id:                 entry.id, 
            name:               entry.name, 
            properties:         [],
            pivotSuggestions:   [],
            filterSuggestions:  []
        };
	
        SchemaUtil.typeRecords[entry.id] = typeRecord;
        
        if ("!/user/dfhuynh/parallax/type_profile/profile_of" in entry &&
            entry["!/user/dfhuynh/parallax/type_profile/profile_of"] != null &&
            entry["!/user/dfhuynh/parallax/type_profile/profile_of"].length > 0) {
            
            var typeProfiles = entry["!/user/dfhuynh/parallax/type_profile/profile_of"];
            for (var j = 0; j < typeProfiles.length; j++) {
                var typeProfile = typeProfiles[j];
                if ("/user/dfhuynh/parallax/type_profile/pivot_suggestion" in typeProfile &&
                    typeProfile["/user/dfhuynh/parallax/type_profile/pivot_suggestion"] != null &&
                    typeProfile["/user/dfhuynh/parallax/type_profile/pivot_suggestion"].length > 0) {
                    
                    typeRecord.pivotSuggestions = typeProfile["/user/dfhuynh/parallax/type_profile/pivot_suggestion"];
                }
                if ("/user/dfhuynh/parallax/type_profile/filter_suggestion" in typeProfile &&
                    typeProfile["/user/dfhuynh/parallax/type_profile/filter_suggestion"] != null &&
                    typeProfile["/user/dfhuynh/parallax/type_profile/filter_suggestion"].length > 0) {
                    
                    typeRecord.filterSuggestions = typeProfile["/user/dfhuynh/parallax/type_profile/filter_suggestion"];
                }
            }
            console.log(typeRecord);
        }
        
        var properties = entry["/type/type/properties"];
        SchemaUtil._processPropertySchemas(properties, typeRecord, moreTypesToFetch);
    }
    
    SchemaUtil._fetchMoreTypes(moreTypesToFetch, onDone);
};

SchemaUtil.retrievePropertySchemas = function(propertyIDs, onDone) {
    var from = 0;
    var doNext = function() {
        if (from < propertyIDs.length) {
            var to = Math.min(from + 10, propertyIDs.length);
            var propertyIDs2 = propertyIDs.slice(from, to);
            from = to;
            
            SchemaUtil._getPropertySchemas(propertyIDs2, doNext);
        } else {
            onDone();
        }
    };
    doNext();
};

SchemaUtil._getPropertySchemas = function(propertyIDs, onDone) {
    var query = [{
        "id" : propertyIDs,
        "name" : null,
        "expected_type" : [{ "id" : null, "name" : null, "/freebase/type_hints/mediator" : null }],
        "master_property" : null,
        "unique" : null
    }];
    JsonpQueue.queryOne(query, function(o) { SchemaUtil._gotPropertySchemas(o, onDone); }, function(s) { log(s); onDone(); });
};

SchemaUtil._gotPropertySchemas = function(o, onDone) {
    var moreTypesToFetch = {};
    
    SchemaUtil._processPropertySchemas(o.result, {}, moreTypesToFetch);
    SchemaUtil._fetchMoreTypes(moreTypesToFetch, onDone);
};

SchemaUtil._processPropertySchemas = function(properties, typeRecord, moreTypesToFetch) {
    for (var j = 0; j < properties.length; j++) {
        var propertyEntry = properties[j];
        var propertyRecord = {
            id:                 propertyEntry.id,
            name:               propertyEntry.name,
            cvt:                false,
            expectedType:       null,
            expectedTypeLabel:  null,
            masterProperty:     propertyEntry.master_property,
            unique:             false
        };
		if(propertyRecord.masterProperty!=null)
		{propertyRecord.name+=" of ";
		}
        SchemaUtil.propertyRecords[propertyEntry.id] = propertyRecord;
        typeRecord.properties.push(propertyEntry.id);
        
        if ("unique" in propertyEntry) {
            propertyRecord.unique = propertyEntry.unique;
        }
       if ("expected_type" in propertyEntry && propertyEntry.expected_type.length > 0) {
            var expectedTypeEntry = propertyEntry.expected_type[0];
            propertyRecord.expectedType = expectedTypeEntry.id;
            propertyRecord.expectedTypeLabel = expectedTypeEntry.name;
            propertyRecord.cvt = expectedTypeEntry["/freebase/type_hints/mediator"] == true;
            
            if (!(expectedTypeEntry.id in SchemaUtil.typeRecords) && propertyRecord.cvt) {
                moreTypesToFetch[expectedTypeEntry.id] = true;
            }
        }
    }
};

SchemaUtil._fetchMoreTypes = function(moreTypesToFetch, onDone) {
    var moreTypesToFetchA = [];
    for (var n in moreTypesToFetch) {
        moreTypesToFetchA.push(n);
    }
    
    if (moreTypesToFetchA.length > 0) {
        SchemaUtil._getSchemas(moreTypesToFetchA, onDone);
    } else {
        onDone();
    }
};

SchemaUtil.tryGetTypeLabel = function(collectionDefinition, onGotLabel) {
    if ("getTypeID" in collectionDefinition) {
        var tryGetTypeLabelCount = 5;
        var typeID = null;
        
        var tryGetTypeLabel = function() {
            if (typeID in SchemaUtil.typeRecords) {
                var label = SchemaUtil.typeRecords[typeID].name;
                onGotLabel(label);
            } else {
                tryGetTypeLabelCount--;
                if (tryGetTypeLabelCount > 0) {
                    window.setTimeout(tryGetTypeLabel, 1000);
                } else {
                    // give up
                }
            }
        };
        
        var tryGetTypeIDCount = 5;
        var tryGetTypeID = function() {
            typeID = collectionDefinition.getTypeID();
            if (typeID != null) {
                tryGetTypeLabel();
            } else {
                tryGetTypeIDCount--;
                if (tryGetTypeIDCount > 0) {
                    window.setTimeout(tryGetTypeID, 1000);
                } else {
                    // give up
                }
            }
        };
        tryGetTypeID();
    }
};

SchemaUtil.tryGetPropertyLabel = function(propertyID, onGotLabel) {
    if (propertyID in SchemaUtil.propertyRecords) {
        onGotLabel(SchemaUtil.propertyRecords[propertyID].name);
    } else {
        JsonpQueue.queryOne([{ "id" : propertyID, "name" : null }], function(o) {
            onGotLabel(o.result[0].name); 
        }, genericErrorHandler);
    }
};
