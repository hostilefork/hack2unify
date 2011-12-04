var Logging = {
    service: "http://mqlx.com:5555/parallax-logger",
    _pad2: function(n) {
        return (n < 10) ? ("0" + n) : n;
    }
};

(function() {
    Logging.id = "id" + new Date().getTime() + "x" + Math.floor(1000000 * Math.random());
})();

Logging.log = function(event, payload) {
	/*
    var d = new Date();
    var ds = "" + d.getUTCFullYear() + "-" + Logging._pad2(d.getUTCMonth() + 1) + "-" + Logging._pad2(d.getUTCDate()) + "T" +
        Logging._pad2(d.getUTCHours()) + ":" + Logging._pad2(d.getUTCMinutes()) + ":" + Logging._pad2(d.getUTCSeconds()) + "Z";
        
    var params = [
        "id=" + encodeURIComponent(Logging.id),
        "time=" + encodeURIComponent(ds),
        "event=" + encodeURIComponent(event),
        "payload=" + encodeURIComponent(JSON.stringify(payload)),
        "env=" + encodeURIComponent(JSON.stringify(SimileAjax.Platform.browser.isIE ?
            { w: document.body.scrollWidth, h: document.body.offsetHeight, y: document.body.scrollTop, bh: document.body.scrollHeight } :
            { w: window.innerWidth, h: window.innerHeight, y: window.scrollY, bh: document.body.offsetHeight }
        ))
    ];
    
    var script = document.createElement("script");
    script.setAttribute('src', Logging.service + "?" + params.join("&"));
    document.getElementsByTagName("head")[0].appendChild(script);
    
    window.setTimeout(function() { script.parentNode.removeChild(script); }, 1000);
    */
};
