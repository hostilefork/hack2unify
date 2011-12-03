function createPopupMenuDom(element) {
    var div = document.createElement("div");
    div.className = "menu-popup";
    div.innerHTML = '<div class="menu-popup-body"></div>';
    
    var dom = {
        elmt: div,
        bodyDiv: div.firstChild,
        close: function() {
            document.body.removeChild(this.elmt);
        },
        open: function() {
            var self = this;
            this.layer = SimileAjax.WindowManager.pushLayer(function() { self.close(); }, true, div);
                
            var docWidth = document.body.offsetWidth;
            var docHeight = document.body.offsetHeight;
        
            var coords = SimileAjax.DOM.getPageCoordinates(element);
            div.style.top = (coords.top + element.scrollHeight) + "px";
            div.style.right = (docWidth - (coords.left + element.scrollWidth)) + "px";
        
            document.body.appendChild(this.elmt);
        },
        appendMenuItem: function(label, icon, onClick) {
            var self = this;
            var a = document.createElement("a");
            a.className = "menu-item";
            a.href = "javascript:";
            SimileAjax.WindowManager.registerEvent(a, "click", function(elmt2, evt, target) {
                onClick(elmt2, evt, target);
                SimileAjax.WindowManager.popLayer(self.layer);
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            });
            
            var divItem = document.createElement("div");
            a.appendChild(divItem);
            
            divItem.appendChild(SimileAjax.Graphics.createTranslucentImage(
                icon != null ? icon : "images/blank-16x16.png"));
                
            if (typeof label == "string") {
                divItem.appendChild(document.createTextNode(label));
            } else {
                divItem.appendChild(label);
            }
            
            this.bodyDiv.appendChild(a);
            
            return a;
        },
        appendSection: function(label) {
            var sectionDiv = document.createElement("div");
            sectionDiv.className = "menu-section";
            sectionDiv.innerHTML = label;
            
            this.bodyDiv.appendChild(sectionDiv);
            
            return sectionDiv;
        },
        appendSeparator: function() {
            var hr = document.createElement("hr");
            this.bodyDiv.appendChild(hr);
        }
    };
    return dom;
}

SimileAjax.WindowManager.cancelPopups = function(evt) {
    var evtCoords = (evt) ? SimileAjax.DOM.getEventPageCoordinates(evt) : { x: -1, y: -1 };
    
    var i = SimileAjax.WindowManager._layers.length - 1;
    while (i > 0 && SimileAjax.WindowManager._layers[i].ephemeral) {
        var layer = SimileAjax.WindowManager._layers[i];
        if (layer.elmt != null) { // if event falls within main element of layer then don't cancel
            var elmt = layer.elmt;
            var elmtCoords = SimileAjax.DOM.getPageCoordinates(elmt);
            elmtCoords.top += elmt.scrollTop;
            elmtCoords.left += elmt.scrollLeft;
            if (evtCoords.x >= elmtCoords.left && evtCoords.x < (elmtCoords.left + elmt.offsetWidth) &&
                evtCoords.y >= elmtCoords.top && evtCoords.y < (elmtCoords.top + elmt.offsetHeight)) {
                break;
            }
        }
        i--;
    }
    SimileAjax.WindowManager._popToLayer(i);
};

function showLightboxForThumbnail(evt, url) {
    var shadeDiv = document.createElement("div");
    shadeDiv.style.position = "fixed";
    shadeDiv.style.top = "0px";
    shadeDiv.style.left = "0px";
    shadeDiv.style.width = "100%";
    shadeDiv.style.height = "100%";
    shadeDiv.style.background = "black";
    shadeDiv.style.opacity = 0.5;
    shadeDiv.style.zIndex = 1000;
    document.body.appendChild(shadeDiv);
    
    var pictureDiv = document.createElement("div");
    pictureDiv.style.position = "fixed";
    pictureDiv.style.top = "0px";
    pictureDiv.style.left = "0px";
    pictureDiv.style.width = "100%";
    pictureDiv.style.height = "100%";
    pictureDiv.style.zIndex = 1001;
    pictureDiv.style.textAlign = "center"
    document.body.appendChild(pictureDiv);
    
    var height = pictureDiv.offsetHeight;
    var maxsize = Math.max(1, Math.floor(height / 100) - 1) * 100;
    
    var href = (typeof url == "string") ? url : this.src;
    var q = href.indexOf("?");
    href = href.substr(0, q) + "?mode=fill&maxheight=" + maxsize;
    
    pictureDiv.innerHTML = '<img src="' + href + '" style="margin-top: 50px; padding: 10px; border: 1px solid #aaa;" />';
    pictureDiv.onclick = function() {
        document.body.removeChild(pictureDiv);
        document.body.removeChild(shadeDiv);
    };
    
    if (evt) {
        SimileAjax.DOM.cancelEvent(evt);
        return null;
    }
};

function padNumber(n) {
    if (n < 10) {
        return "00" + n;
    } else if (n < 100) {
        return "0" + n;
    } else {
        return n;
    }
};

function formatNumberWithSeparators(n) {
    if (n < 1) {
        return n;
    } else {
        var a = [];
        while (n > 1000) {
            a.unshift(padNumber(n % 1000));
            n = Math.floor(n / 1000);
        }
        a.unshift(n);
        return a.join(",");
    }
};

function formatNumberWithSuffix(x) {
    if (x > 1e9) {
        return (Math.floor(x / 1e8) / 10) + "B";
    } else if (x > 1e6) {
        return (Math.floor(x / 1e5) / 10) + "M";
    } else if (x > 1e3) {
        return (Math.floor(x / 1e2) / 10) + "K";
    } else if (x > 1) {
        return x;
    } else if (x > 1e-3) {
        return (Math.floor(x / 1e-4) / 10) + "m";
    } else if (x > 1e-6) {
        return (Math.floor(x / 1e-7) / 10) + "u";
    } else {
        return x;
    }
};
