function RootTypeCollectionDefinition(typeID, textSearch) {
    this._typeID = typeID;
    this._textSearch = (typeof textSearch == "string") ? textSearch : null;
    this._ownerCollection = null;
}

RootTypeCollectionDefinition.prototype.dispose = function() {
    this._ownerCollection = null;
};

RootTypeCollectionDefinition.prototype.getTypeID = function() {
    return this._typeID;
};

RootTypeCollectionDefinition.prototype.setOwnerCollection = function(collection) {
    this._ownerCollection = collection;
};

RootTypeCollectionDefinition.prototype.addRestrictions = function(queryNode) {
    queryNode["type"] = this._typeID;
    if (this._textSearch != null) {
        queryNode["name~="] = this._textSearch + "*";
    }
};

RootTypeCollectionDefinition.prototype.getLabel = function() {
    var typeRecord = SchemaUtil.typeRecords[this._typeID];
    return (typeof typeRecord == "object") ? typeRecord.name : this._typeID;
};

RootTypeCollectionDefinition.prototype.isSingular = function() {
    return false;
};

RootTypeCollectionDefinition.prototype.hasBaseCollection = function() {
    return false;
};

RootTypeCollectionDefinition.prototype.getState = function() {
    var r = {
        t: this._typeID
    };
    if (this._textSearch != null) {
        r.s = this._textSearch;
    }
    return r;
};

function PivotedCollectionDefinition(baseCollection, path, label) {
    this._baseCollection = baseCollection;
    this._ownerCollection = null;
    this._path = path;
    this._label = label;
    this._baseCollection.addListener(this);
}

PivotedCollectionDefinition.prototype.dispose = function() {
    this._baseCollection.removeListener(this);
    this._baseCollection = null;
    this._ownerCollection = null;
};

PivotedCollectionDefinition.prototype.getTypeID = function() {
    var lastSegment = this._path[this._path.length - 1];
    var propertyID = lastSegment.property;
    if (propertyID in SchemaUtil.propertyRecords) {
        return SchemaUtil.propertyRecords[propertyID].expectedType;
    } else {
        return null;
    }
};

PivotedCollectionDefinition.prototype.setOwnerCollection = function(collection) {
    this._ownerCollection = collection;
};

PivotedCollectionDefinition.prototype.addRestrictions = function(queryNode, augmentBaseResults) {
    for (var i = this._path.length - 1; i >= 0; i--) {
        var pathNode = this._path[i];
        var newQueryNode = {};
        queryNode[backwardPathSegment(pathNode)] = [newQueryNode];
        
        queryNode = newQueryNode;
    }
    this._baseCollection.addRestrictions(queryNode);
    
    if (typeof augmentBaseResults == "object") {
        for (var n in augmentBaseResults) {
            if (augmentBaseResults.hasOwnProperty(n) && !(n in queryNode)) {
                queryNode[n] = augmentBaseResults[n];
            }
        }
    }
};

PivotedCollectionDefinition.prototype.onItemsChanged = function() {
    if (this._ownerCollection != null) {
        this._ownerCollection.onRootItemsChanged();
    }
};

PivotedCollectionDefinition.prototype.getLabel = function() {
    return this._label;
};

PivotedCollectionDefinition.prototype.isSingular = function() {
    return false;
};

PivotedCollectionDefinition.prototype.hasBaseCollection = function() {
    return true;
};

PivotedCollectionDefinition.prototype.getBaseNodeIterator = function() {
    var backwardSegments = [];
    for (var i = this._path.length - 1; i >= 0; i--) {
        var pathNode = this._path[i];
        backwardSegments.push(backwardPathSegment(pathNode));
    }
    
    var iterate = function(queryNode, index, f) {
        var s = backwardSegments[index];
        if (s in queryNode) {
            var a = queryNode[s];
            if (index < backwardSegments.length - 1) {
                for (var i = 0; i < a.length; i++) {
                    iterate(a[i], index + 1, f);
                }
            } else {
                for (var i = 0; i < a.length; i++) {
                    f(a[i]);
                }
            }
        }
    };
    
    return function(queryNode, f) {
        iterate(queryNode, 0, f);
    };
};

PivotedCollectionDefinition.prototype.getState = function() {
    return {
        p: compressPath(this._path),
        l: this._label
    };
};

function SingleTopicCollectionDefinition(id, name) {
    this._id = id;
    this._name = name;
    this._ownerCollection = null;
}

SingleTopicCollectionDefinition.prototype.dispose = function() {
    this._ownerCollection = null;
};

SingleTopicCollectionDefinition.prototype.setOwnerCollection = function(collection) {
    this._ownerCollection = collection;
};

SingleTopicCollectionDefinition.prototype.addRestrictions = function(queryNode) {
    queryNode["id"] = this._id;
};

SingleTopicCollectionDefinition.prototype.getLabel = function() {
    return this._name;
};

SingleTopicCollectionDefinition.prototype.isSingular = function() {
    return true;
};

SingleTopicCollectionDefinition.prototype.hasBaseCollection = function() {
    return false;
};

SingleTopicCollectionDefinition.prototype.getTopicID = function() {
    return this._id;
};

SingleTopicCollectionDefinition.prototype.getState = function() {
    return {
        i: this._id,
        n: this._name
    };
};
