function parallaxLoadCSS(bundleFile, files) {
    var debug = document.location.href.indexOf("debug=true") > 0;
    debug = true; // Not maintaining bundle at the moment.
    if (debug) {
        SimileAjax.includeCssFiles (document, "", files);
    } else {
        SimileAjax.includeCssFiles (document, "", [bundleFile]);
    }
}

function parallaxLoadJavascript(bundleFile, files) {
    var debug = document.location.href.indexOf("debug=true") > 0;
    debug = true; // Not maintaining bundle at the moment.
    if (debug) {
        SimileAjax.includeJavascriptFiles(document, "", files);
    } else {
        SimileAjax.includeJavascriptFiles(document, "", [bundleFile]);
    }
}
