var JsonpQueue = {
    pendingCallIDs: {},
    callInProgress: 0
};

JsonpQueue.cancelAll = function() {
    JsonpQueue.pendingCallIDs = {};
};

JsonpQueue.call = function(url, onDone, onError, debug) {
    if (JsonpQueue.callInProgress == 0) {
        document.body.style.cursor = "progress";
    }
    JsonpQueue.callInProgress++;
    
    var callbackID = new Date().getTime() + "x" + Math.floor(Math.random() * 1000);
    var script = document.createElement("script");
    script.setAttribute('onerror', 'err' + callbackID + '();');
    
    url += (url.indexOf("?") < 0 ? "?" : "&") + "callback=cb" + callbackID;
    script.setAttribute('src', url);
    
    var cleanup = function() {
        JsonpQueue.callInProgress--;
        if (JsonpQueue.callInProgress == 0) {
            document.body.style.cursor = "auto";
        }
        
		if (!(debug)) {
			script.parentNode.removeChild(script);
		}
		
        try {
            delete window["cb" + callbackID];
            delete window["err" + callbackID];
        } catch (e) {
            // IE doesn't seem to allow calling delete on window
            window["cb" + callbackID] = undefined;
            window["err" + callbackID] = undefined;
        }
        
        if (callbackID in JsonpQueue.pendingCallIDs) {
            delete JsonpQueue.pendingCallIDs[callbackID];
            return true;
        } else {
            return false;
        }
    };
    
    var callback = function(o) {
        if (cleanup()) {
            try {
                onDone(o);
            } catch (e) {
                log(e);
            }
        }
    };
    var error = function() {
        if (cleanup()) {
            if (typeof onError == "function") {
                try {
                    onError(url);
                } catch (e) {
                    log(e);
                }
            }
        }
    };
    
    window["cb" + callbackID] = callback;
    window["err" + callbackID] = error;
    
    JsonpQueue.pendingCallIDs[callbackID] = true;
    document.getElementsByTagName("head")[0].appendChild(script);
};

JsonpQueue.queryOne = function(query, onDone, onError, debug) {
    var q = JSON.stringify({ "q1" : { "query" : query } });
    var url = ParallaxConfig.corpusBaseUrl + 'api/service/mqlread?queries=' + encodeURIComponent(q);
    var onDone2 = function(o) {
        if (o.q1.code == "/api/status/error") {
            if (typeof onError == "function") {
                onError(o.q1.messages[0].message, query);
            }
        } else {
            onDone(o.q1);
        }
    };
    var onError2 = function() {
        if (typeof onError == "function") {
            onError("Unknown", query);
        }
    }
    JsonpQueue.call(url, onDone2, onError2, debug);
};
