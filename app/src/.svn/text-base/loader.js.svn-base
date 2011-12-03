function parallaxLoadCSS(bundleFile, files) {
    var debug = document.location.href.indexOf("debug=true") > 0;
    if (debug) {
        SimileAjax.includeCssFiles (document, "", files);
    } else {
        SimileAjax.includeCssFiles (document, "", [bundleFile]);
    }
}

function parallaxLoadJavascript(bundleFile, files) {
    var debug = document.location.href.indexOf("debug=true") > 0;
    if (debug) {
        SimileAjax.includeJavascriptFiles(document, "", files);
    } else {
        SimileAjax.includeJavascriptFiles(document, "", [bundleFile]);
    }
}
