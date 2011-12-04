(function() {
    window.ParallaxConfig = {
        sandbox:        false,
        corpusBaseUrl:  "http://www.freebase.com/",
        appBaseUrl:     "freebaseapps.com/",
        appendConfigParams: function(url) { return url; }
    };
    
    var url = window.location.href;
    if (url.indexOf("-sandbox/") >= 0 || url.indexOf("sandbox=1") >= 0) {
        window.ParallaxConfig.sandbox = true;
        window.ParallaxConfig.corpusBaseUrl = "http://sandbox.freebase.com/";
        window.ParallaxConfig.appBaseUrl = "sandbox-freebaseapps.com/";
        
        if (url.indexOf("sandbox=1") >= 0) {
            window.ParallaxConfig.appendConfigParams = function(url) {
                if (url.indexOf("?") < 0) {
                    return url + "?sandbox=1";
                } else {
                    return url + "&sandbox=1";
                }
            };
        }
    }
})();