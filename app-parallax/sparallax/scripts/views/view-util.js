var ViewUtil = {};

ViewUtil.renderViewSummary = function(collection, div) {
    var results = {};
    
    div.innerHTML = '<div class="status"><img src="images/progress-running.gif" /> Retrieving information...</div>';
    
    var gotAllCount = function(n) {
        results.allCount = n;
        collection.getRestrictedItemCount(gotRestrictedCount, genericErrorHandler);
    };
    
    var gotRestrictedCount = function(n) {
        results.restrictedCount = n;
        ViewUtil._tryRenderSummary(collection, div, results.restrictedCount, results.allCount);
    };
    
    collection.getAllItemCount(gotAllCount, genericErrorHandler);
};

ViewUtil._tryRenderSummary = function(collection, div, restrictedCount, allCount) {
    ViewUtil._renderSummary(div, null, restrictedCount, allCount);
    
    SchemaUtil.tryGetTypeLabel(collection.getDefinition(), function(label) {
        ViewUtil._renderSummary(div, label, restrictedCount, allCount);
    });
};

ViewUtil._renderSummary = function(div, typeLabel, restrictedCount, allCount) {
    var html = "";
    if (typeLabel != null) {
        html += '<span class="results-summary-type">' + typeLabel + '</span>: ';
    }
    
    if (restrictedCount == allCount) {
        html += '<span class="results-summary-count">' + allCount + ' topics</span>';
    } else {
        html +=
            '<span class="results-summary-count">' + restrictedCount + ' topics</span>' +
            ' filtered from ' +
            '<span results-summary-original-count>' + allCount + '</span>' +
            ' originally';
    }
    
    div.innerHTML = html;
}