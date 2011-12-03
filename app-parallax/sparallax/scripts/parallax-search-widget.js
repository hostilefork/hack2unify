var ParallaxSearchWidget = {};

ParallaxSearchWidget.create = function(input, queryHandler) {
    return new ParallaxSearchWidget._Impl(input, queryHandler);
};

ParallaxSearchWidget.defaultQueryHandler = function(query) {
    var params = [];
    if ("id" in query) {
        params.push("id=" + encodeURIComponent(query.id));
        params.push("label=" + encodeURIComponent(query.label));
    } else {
        params.push("type=" + encodeURIComponent(query.typeID));
    };
    if ("search" in query) {
        params.push("search=" + encodeURIComponent(query.search));
    }
	 params.push("dataset=" + encodeURIComponent(JSON.stringify(config)));
    window.location = window.ParallaxConfig.appendConfigParams("browse.html?" + params.join("&"));
};

ParallaxSearchWidget._Impl = function(input, queryHandler) {
    this._input = input;
    this._queryHandler = queryHandler;
    
    this._previousSearch = "";
    this._timerID = null;
    this._selectedLink = null;
    
    this._constructUI();
    this._registerEventHandlers();
    
    var self = this;
    $(window).click(function(evt) {
        self._hideAnyPanel(evt);
    });
    $(window).keyup(function(evt) { 
        if (evt.keyCode == 27) {
            self.hide();
        } 
    });
};

ParallaxSearchWidget._Impl.prototype.query = function(text) {
    this._input.value = text;
    this._input.focus();
    
    this._previousSearch = text;
    
    this._showResultPanel(false);
    this._showErrorPanel(false);
    this._clearResults();
    
    this._showStatusPanel(true);
    this._startQueryProcess(text);
};

ParallaxSearchWidget._Impl.prototype._constructUI = function() {
    var resultPanel = document.createElement("div");
    resultPanel.className = "parallax-search-widget-result-panel";
    resultPanel.innerHTML =
        '<div class="parallax-search-widget-result-section" style="border-top: none;">' +
            '<div class="parallax-search-widget-result-list"></div>' +
            '<div class="parallax-search-widget-result-show-more"><a href="javascript:{}" class="action">more collections about <span class="parallax-search-widget-result-highlight">blah</span></a></a></div>' +
        '</div>' +
        '<div class="parallax-search-widget-result-section">' +
            '<div class="parallax-search-widget-result-status">Trying to find more specific topics...</div>' +
            '<div class="parallax-search-widget-result-heading">Topics mentioning <span class="parallax-search-widget-result-highlight">blah</span> in their text content</div>' +
            '<div class="parallax-search-widget-result-list"></div>' +
            '<div class="parallax-search-widget-result-show-more"><a href="javascript:{}" class="action">more topics mentioning <span class="parallax-search-widget-result-highlight">blah</span></a></div>' +
        '</div>' +
        '<div class="parallax-search-widget-result-section">' +
            '<div class="parallax-search-widget-result-status">Trying to find more individual topics...</div>' +
            '<div class="parallax-search-widget-result-heading">Individual topics most resembling <span class="parallax-search-widget-result-highlight">blah</span></div>' +
            '<div class="parallax-search-widget-result-list"></div>' +
        '</div>';

    document.body.appendChild(resultPanel);
    
    this._resultPanelDom = { panel: resultPanel };
    
    this._resultPanelDom.generalResultSection = resultPanel.childNodes[0];
    this._resultPanelDom.generalResultList = this._resultPanelDom.generalResultSection.childNodes[0];
    this._resultPanelDom.generalResultShowMore = this._resultPanelDom.generalResultSection.childNodes[1];
    this._resultPanelDom.generalResultQueryText = this._resultPanelDom.generalResultShowMore.firstChild.getElementsByTagName("span")[0];
        
    this._resultPanelDom.specificResultSection = resultPanel.childNodes[1];
    this._resultPanelDom.specificResultStatus = this._resultPanelDom.specificResultSection.childNodes[0];
    this._resultPanelDom.specificResultHeading = this._resultPanelDom.specificResultSection.childNodes[1];
    this._resultPanelDom.specificResultList = this._resultPanelDom.specificResultSection.childNodes[2];
    this._resultPanelDom.specificResultShowMore = this._resultPanelDom.specificResultSection.childNodes[3];
    this._resultPanelDom.specificResultQueryText1 = this._resultPanelDom.specificResultHeading.getElementsByTagName("span")[0];
    this._resultPanelDom.specificResultQueryText2 = this._resultPanelDom.specificResultShowMore.firstChild.getElementsByTagName("span")[0];
    
    this._resultPanelDom.individualResultSection = resultPanel.childNodes[2];
    this._resultPanelDom.individualResultStatus = this._resultPanelDom.individualResultSection.childNodes[0];
    this._resultPanelDom.individualResultHeading = this._resultPanelDom.individualResultSection.childNodes[1];
    this._resultPanelDom.individualResultList = this._resultPanelDom.individualResultSection.childNodes[2];
    this._resultPanelDom.individualResultQueryText = this._resultPanelDom.individualResultHeading.getElementsByTagName("span")[0];
    
    var statusPanel = document.createElement("div");
    statusPanel.className = "parallax-search-widget-status-panel";
    statusPanel.innerHTML = 
        '<div class="parallax-search-widget-status-message">Working...</div>';
    document.body.appendChild(statusPanel);
        
    this._statusPanelDom = { panel: statusPanel };
    
    var errorPanel = document.createElement("div");
    errorPanel.className = "parallax-search-widget-error-panel";
    errorPanel.innerHTML = 
        '<div class="parallax-search-widget-error-title">Oops! Our web server is on strike...</div>' +
        '<div class="parallax-search-widget-error-message"></div>';
    document.body.appendChild(errorPanel);
        
    this._errorPanelDom = { panel: errorPanel };
    this._errorPanelDom.message = errorPanel.childNodes[1];
};

ParallaxSearchWidget._Impl.prototype._registerEventHandlers = function() {
    var self = this;
    
    this._input.onkeyup = function(event) { return self._inputOnKeyUp(event); };
    this._input.onkeydown = function(event) { return self._inputOnKeyDown(event); };
    
    this._resultPanelDom.generalResultShowMore.firstChild.onclick = function(event) { return self._showMoreGeneralResults(event); };
    this._resultPanelDom.specificResultShowMore.firstChild.onclick = function(event) { return self._showMoreSpecificResults(event); };
};

ParallaxSearchWidget._Impl.prototype._inputOnKeyUp = function(event) {
    var text = this._input.value;
    if (text != this._previousSearch||event.keyCode==13) {
	
        this._previousSearch = text;
        
        if (this._timerID != null) {
            window.clearTimeout(this._timerID);
            this._timerID = null;
        }
        
        this._showResultPanel(false);
        this._showErrorPanel(false);
        
        this._clearResults();
		
		if(event.keyCode==13 )
        if (text.length >= 1) {
            this._scheduleQueryProcess(text);
        }
    }
}

ParallaxSearchWidget._Impl.prototype._inputOnKeyDown = function(event) {
//alert(event.keyCode);
    if (event.keyCode == 38) { // up
        this._selectPreviousResult();
    } else if (event.keyCode == 40) { // down
        this._selectNextResult();
    } else if (event.keyCode == 13) { // enter
        this._invokeCurrentExploreLink(event);
    } else if (event.keyCode == 27) { // esc
        this.hide();
    } else {
        return true;
    }
    return ParallaxSearchWidget._cancelEvent(event);
};

ParallaxSearchWidget._Impl.prototype.hide = function() {
    this._showResultPanel(false);
    this._showErrorPanel(false);
};

ParallaxSearchWidget._Impl.prototype._scheduleQueryProcess = function(text) {
    this._showStatusPanel(true);
    
    var self = this;
    window.setTimeout(function() { self._startQueryProcess(text); }, 300);
};

ParallaxSearchWidget._Impl.prototype._showStatusPanel = function(show) {
    this._showFloatingPanel(this._statusPanelDom.panel, show);
};

ParallaxSearchWidget._Impl.prototype._showErrorPanel = function(show, s) {
    if (show) {
        this._errorPanelDom.message.innerHTML = s;
    }
    this._showFloatingPanel(this._errorPanelDom.panel, show);
};

ParallaxSearchWidget._Impl.prototype._showResultPanel = function(show) {
    this._showFloatingPanel(this._resultPanelDom.panel, show);
};

ParallaxSearchWidget._Impl.prototype._hideAnyPanel = function(evt) {
    if (this._hidePanelIfShown(this._resultPanelDom.panel)) return;
    if (this._hidePanelIfShown(this._statusPanelDom.panel)) return;
    if (this._hidePanelIfShown(this._errorPanelDom.panel)) return;
};

ParallaxSearchWidget._Impl.prototype._hidePanelIfShown = function(panel, evt) {
    if (panel.style.display == "none") {
        return false;
    }
    
    if (evt) {
        var coords = SimileAjax.DOM.getEventRelativeCoordinates(evt, panel);
        if (coords.x > 0 && coords.y > 0 &&
            coords.x < panel.offsetWidth && coords.y < panel.offsetHeight) {
            
            return false;
        }
    }
    this._showFloatingPanel(panel, false);
    return true;
};

ParallaxSearchWidget._Impl.prototype._showFloatingPanel = function(panel, show) {
    panel.style.display = show ? "block" : "none";
    
    var bodyWidth = document.body.scrollWidth;
    var panelWidth = panel.offsetWidth;
    var c = ParallaxSearchWidget._getPageCoordinates(this._input);
    
    if (show) {
        if (c.left + panelWidth > bodyWidth) {
            panel.style.left = (c.left + this._input.offsetWidth - panelWidth) + "px";
        } else {
            panel.style.left = c.left + "px";
        }
        panel.style.top = (c.top - 1 + this._input.offsetHeight) + "px";
    }
};

ParallaxSearchWidget._Impl.prototype._clearResults = function() {
    this._selectLink();
    
    this._resultPanelDom.generalResultList.innerHTML = "";
    
    this._resultPanelDom.specificResultSection.style.display = "block";
    this._resultPanelDom.specificResultStatus.style.display = "block";
    
    this._resultPanelDom.specificResultList.innerHTML = "";
    this._resultPanelDom.specificResultHeading.style.display = "none";
    this._resultPanelDom.specificResultShowMore.style.display = "none";
    
    this._resultPanelDom.individualResultList.innerHTML = "";
    this._resultPanelDom.individualResultSection.style.display = "none";
};

ParallaxSearchWidget._Impl.prototype._makeErrorHandler = function() {
    var self = this;
    return function(s) {
        self._showStatusPanel(false);
        self._showErrorPanel(true, s);
    };
};

ParallaxSearchWidget._Impl.prototype._startQueryProcess = function(text) {try {
    this._resultPanelDom.generalResultQueryText.innerHTML = text;
    this._resultPanelDom.specificResultQueryText1.innerHTML = text;
    this._resultPanelDom.specificResultQueryText2.innerHTML = text;
    this._resultPanelDom.individualResultQueryText.innerHTML = text;
    
    var self = this;
	
    JsonpQueue.queryOne(
        [{  "id" : null,
            "name" : null,
            "name~=" : "*" + text + "*",
            "type" : "/type/type",
            "/freebase/type_profile/instance_count" : null
        }],
        function(o) { self._onQueryTypeDone(text, o); self._showStatusPanel(false); }, 
        this._makeErrorHandler()
    );this._querySpecificTopics(text);} catch (e) { log(e) }
	
};

ParallaxSearchWidget._Impl.prototype._onQueryTypeDone = function(text, o) {
    try { 
        if (text != this._previousSearch) {
            return;
        }

        var results = o.result;
        for (var i = results.length - 1; i >= 0; i--) {
            var typeEntry = results[i];
            if (typeEntry["/freebase/type_profile/instance_count"] == null) {
                results.splice(i, 1);
            } else {
                typeEntry.fromUser = typeEntry.id.indexOf("/user/") == 0 ? 1 : 0;
                
                typeEntry.lName = typeEntry.name.toLowerCase();
                
                var start = typeEntry.lName.indexOf(text);
                if (start == 0) {
                    typeEntry.distance = 0;
                } else if (start > 0) {
                    var s = typeEntry.lName.substr(0, start);
                    var nonSpace = s.lastIndexOf(" ") + 1;
                    typeEntry.distance = s.length - nonSpace;
                } else {
                    typeEntry.distance = Number.POSITIVE_INFINITY;
                }
            }
        }

        results.sort(function(a, b) {
            var aName = a.lName;
            var bName = b.lName;
            var c = a.fromUser - b.fromUser;
            if (c == 0) {
                c = a.distance - b.distance;
                if (c == 0) {
                    c = aName.length - bName.length;
                    if (c == 0) {
                        c = b["/freebase/type_profile/instance_count"] - a["/freebase/type_profile/instance_count"];
                        if (c == 0) {
                            c = a.id.localeCompare(b.id);
                        }
                    }
                }
            }
            return c;
        });

        var generalResultList = this._resultPanelDom.generalResultList;
        generalResultList.innerHTML = "";

        var self = this;
        var processType = function(typeEntry, show) {
            var start = typeEntry.lName.indexOf(text);
            var html = 
                (start >= 0 ? 
                    (typeEntry.name.substr(0, start) + "<span class='parallax-search-widget-result-highlight'>" + 
                        typeEntry.name.substr(start, text.length) + "</span>" + 
                        typeEntry.name.substr(start + text.length)) :
                    typeEntry.name
                ) + 
                " collection (" + typeEntry["/freebase/type_profile/instance_count"] + " topics)";
                    
            var a = self._makeLink(
                html,
                typeEntry.id,
                (typeEntry.fromUser == 1),
                show
            );
            a.onclick = function() { self._queryHandler({ typeID: typeEntry.id }); };
            
            generalResultList.appendChild(a);
            
            return a;
        };

        for (var i = 0; i < results.length; i++) {
            var a = processType(results[i], i < 5);
            if (i == 0) {
                a.className += " parallax-search-widget-result-row-selected";
                this._selectedLink = a;
            }
        }

        this._resultPanelDom.generalResultShowMore.style.display = results.length > 5 ? "block" : "none";

        this._showResultPanel(true);
        
    } catch (e) { log(e); }
};

ParallaxSearchWidget._Impl.prototype._showMoreGeneralResults = function(event) {
    var generalResultList = this._resultPanelDom.generalResultList;
    var childNodes = generalResultList.childNodes;
    for (var i = 0; i < childNodes.length; i++) {
        childNodes[i].style.display = "block";
    }
    this._resultPanelDom.generalResultShowMore.style.display = "none";
    
    SimileAjax.DOM.cancelEvent(event);
    return false;
};

ParallaxSearchWidget._Impl.prototype._querySpecificTopics = function(text) {
    var self = this;
    JsonpQueue.queryOne(
        [{  "/type/type/instance" : [{
                "name~=" :"*" +text + "*",
                "return" : "count"
            }],
            "id" : null,
            "name" : null,
            "type" : "/type/type"
        }],
        function(o) { self._onQuerySpecificTopicsDone(text, o); },
        function(o) { self._onQuerySpecificTopicsFailed(text); }
    );
};

ParallaxSearchWidget._Impl.prototype._onQuerySpecificTopicsDone = function(text, o) {

    if (text != this._previousSearch) {
        return;
    }

    var results = o.result;
    for (var i = results.length - 1; i >= 0; i--) {
        var typeEntry = results[i];
        if (typeEntry.id.indexOf("/common/") == 0 ||
            typeEntry.id.indexOf("/type/") == 0) {
            results.splice(i, 1);
        } else {
            typeEntry.fromUser = typeEntry.id.indexOf("/user/") == 0 ? 1 : 0;
            typeEntry.count = typeEntry["/type/type/instance"][0];
        }
    }
    
    results.sort(function(a, b) {
        var c = a.fromUser - b.fromUser;
        if (c == 0) {
            c = b.count - a.count;
            if (c == 0) {
                c = a.name.localeCompare(b.name);
                if (c == 0) {
                    c = a.id.localeCompare(b.id);
                }
            }
        }
        return c;
    });
    
    var specificResultList = this._resultPanelDom.specificResultList;
    specificResultList.innerHTML = "";
    
    var self = this;
    var processType = function(typeEntry, show) {
        var a = self._makeLink(
            "... in " + typeEntry.name + " collection (" + typeEntry.count + ")",
            typeEntry.id,
            (typeEntry.fromUser == 1),
            show
        );
        a.onclick = function() { self._queryHandler({ typeID: typeEntry.id, search: text }); };
        
        specificResultList.appendChild(a);
        
        return a;
    };
    
    for (var i = 0; i < results.length; i++) {
        var a = processType(results[i], i < 5);
        if (this._selectedLink == null && i == 0) {
            a.className += " parallax-search-widget-result-row-selected";
            this._selectedLink = a;
        }
    }
    
    this._resultPanelDom.specificResultStatus.style.display = "none";
    this._resultPanelDom.specificResultHeading.style.display = "block";
    this._resultPanelDom.specificResultSection.style.display = "block";
    this._resultPanelDom.specificResultShowMore.style.display = results.length > 5 ? "block" : "none";
    
    this._queryIndividualTopics(text);
};

ParallaxSearchWidget._Impl.prototype._showMoreSpecificResults = function(event) {
    var specificResultList = this._resultPanelDom.specificResultList;
    var childNodes = specificResultList.childNodes;
    for (var i = 0; i < childNodes.length; i++) {
        childNodes[i].style.display = "block";
    }
    this._resultPanelDom.specificResultShowMore.style.display = "none";
    
    SimileAjax.DOM.cancelEvent(event);
    return false;
};

ParallaxSearchWidget._Impl.prototype._onQuerySpecificTopicsFailed = function(text) {
    this._resultPanelDom.specificResultSection.style.display = "none";
    this._queryIndividualTopics(text);
};

ParallaxSearchWidget._Impl.prototype._queryIndividualTopics = function(text) {
    var url = ParallaxConfig.corpusBaseUrl + encodeURIComponent("api/service/search?strict=false&explain=false&limit=3&query=") + encodeURIComponent(text);
    var self = this;

    this._resultPanelDom.individualResultSection.style.display = "block";
    this._resultPanelDom.individualResultList.innerHTML = "";
	var query=[{}];
	query[0].search=text;
	 JsonpQueue.queryOne(query,function(o) { self._onQueryIndividualTopicsDone(text, o); },
        function() { self._onQueryIndividualTopicsFailed(text); });
  /*  JsonpQueue.call(
        url, 
        function(o) { self._onQueryIndividualTopicsDone(text, o); },
        function() { self._onQueryIndividualTopicsFailed(text); }
    );*/
};

ParallaxSearchWidget._Impl.prototype._onQueryIndividualTopicsDone = function(text, o) {
    if (text != this._previousSearch) {
        return;
    }
    
    this._resultPanelDom.individualResultStatus.style.display = "none";
    this._resultPanelDom.individualResultHeading.style.display = "block";
    this._resultPanelDom.individualResultList.style.display = "block";
    
    var self = this;
    var individualResultList = this._resultPanelDom.individualResultList;
    var createEntry = function(entry) {
        var a = document.createElement("a");
        a.className = "parallax-search-widget-result-row";
        a.innerHTML = '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr valign="top"></tr></table>';
        a.onmouseover = function(event) { return self._onMouseOverLink(this, event); };;
        a.onclick = function() { self._queryHandler({ id: entry.id, label: entry.name }); };
        a.href = "javascript:{}";
        a.style.display = "block";
        
        var table = a.firstChild;
        var td0 = table.rows[0].insertCell(0);
        
        var divName = document.createElement("div");
        divName.className = "parallax-search-widget-result-topic-name";
        divName.innerHTML = entry.name;
        td0.appendChild(divName);
        
        var typeNames = [];
        for (var i = 0; i < entry.type.length && typeNames.length < 3; i++) {
            var type = entry.type[i];
            if (type.id != "/common/topic") {
                typeNames.push(type.name);
            }
        }
        if (i < entry.type.length) {
            typeNames.push("...");
        }
        
        var divTypes = document.createElement("div");
        divTypes.className = "parallax-search-widget-result-topic-types";
        divTypes.innerHTML = typeNames.join(", ");
        td0.appendChild(divTypes);
        
        try {
            var imageID = entry.image.id;
            if (typeof imageID == "string") {
                var td1 = table.rows[0].insertCell(1);
                td1.setAttribute("width", "1");
                
                var img = document.createElement("img");
                img.className = "parallax-search-widget-result-topic-image";
                img.src = ParallaxConfig.corpusBaseUrl + "api/trans/image_thumb" + imageID +
                    "?" + [ 
                        "mode=fillcrop",
                        "maxheight=40",
                        "maxwidth=40"
                    ].join("&");
                td1.appendChild(img);
            }
        } catch (e) {}
        
        individualResultList.appendChild(a);
        return a;
    };
    
    var entries = o.result;
    for (var i = 0; i < entries.length; i++) {
        var a = createEntry(entries[i]);
        if (this._selectedLink == null && i == 0) {
            a.className += " parallax-search-widget-result-row-selected";
            this._selectedLink = a;
        }
    }
};

ParallaxSearchWidget._Impl.prototype._onQueryIndividualTopicsFailed = function(text) {
    if (text != this._previousSearch) {
        return;
    }
    
    this._resultPanelDom.individualResultSection.style.display = "none";
};

ParallaxSearchWidget._Impl.prototype._makeLink = function(text, tooltip, fromUser, show) {
    var self = this;
    var a = document.createElement("a");
    if (fromUser) {
        a.className = "parallax-search-widget-result-user-type parallax-search-widget-result-row";
    } else {
        a.className = "parallax-search-widget-result-row";
    }
    
    a.innerHTML = text;
    a.title = tooltip;
    a.href = "javascript:{}";
    a.style.display = show ? "block" : "none";
    a.onmouseover = function(event) { return self._onMouseOverLink(this, event); };;

    return a;
};

ParallaxSearchWidget._Impl.prototype._onMouseOverLink = function(a, event) {
    this._selectLink(a);
};

ParallaxSearchWidget._Impl.prototype._selectLink = function(a) {
    if (this._selectedLink != null) {
        this._unStyleSelectedLink(this._selectedLink);
        this._selectedLink = null;
    }
    
    if (a) {
        this._styleSelectedLink(a);
        this._selectedLink = a;
    }
};

ParallaxSearchWidget._Impl.prototype._unStyleSelectedLink = function(a) {
    a.className = a.className.replace(/ parallax\-search\-widget\-result\-row\-selected/, "");
};

ParallaxSearchWidget._Impl.prototype._styleSelectedLink = function(a) {
    a.className += " parallax-search-widget-result-row-selected";
};

ParallaxSearchWidget._Impl.prototype._selectPreviousResult = function() {
    var elmt = this._selectedLink;
    if (elmt != null) {
        if (elmt.previousSibling != null) {
            this._selectLink(elmt.previousSibling);
        } else {
            var parent = elmt.parentNode;
            if (parent == this._resultPanelDom.specificResultList) {
                var generalResult = this._resultPanelDom.generalResultList.lastChild;
                while (generalResult != null) {
                    if (generalResult.style.display == "block") {
                        this._selectLink(generalResult);
                        break;
                    }
                    generalResult = generalResult.previousSibling;
                }
            } else if (parent == this._resultPanelDom.individualResultList) {
                var specificResult = this._resultPanelDom.specificResultList.lastChild;
                while (specificResult != null) {
                    if (specificResult.style.display == "block") {
                        this._selectLink(specificResult);
                        break;
                    }
                    specificResult = specificResult.previousSibling;
                }
            }
        }
    }
};

ParallaxSearchWidget._Impl.prototype._selectNextResult = function() {
    var elmt = this._selectedLink;
    if (elmt != null) {
        if (elmt.nextSibling != null && elmt.nextSibling.style.display == "block") {
            this._selectLink(elmt.nextSibling);
        } else {
            var parent = elmt.parentNode;
            if (parent == this._resultPanelDom.generalResultList) {
                if (this._resultPanelDom.specificResultList.firstChild != null) {
                    this._selectLink(this._resultPanelDom.specificResultList.firstChild);
                }
            } else if (parent == this._resultPanelDom.specificResultList) {
                if (this._resultPanelDom.individualResultList.firstChild != null) {
                    this._selectLink(this._resultPanelDom.individualResultList.firstChild);
                }
            }
        }
    }
};

ParallaxSearchWidget._Impl.prototype._invokeCurrentExploreLink = function(event) {
    if (this._selectedLink != null) {
        if (this._selectedLink.href == "javascript:{}") {
            var elmt = this._selectedLink;
            window.setTimeout(function() { elmt.onclick(); }, 100);
        } else {
            window.location.href = this._selectedLink.href;
        }
    }
};

ParallaxSearchWidget._getPageCoordinates = function(elmt) {
    var left = 0;
    var top = 0;
    
    if (elmt.nodeType != 1) {
        elmt = elmt.parentNode;
    }
    
    var elmt2 = elmt;
    while (elmt2 != null) {
        left += elmt2.offsetLeft;
        top += elmt2.offsetTop;
        elmt2 = elmt2.offsetParent;
    }
    
    var body = document.body;
    while (elmt != null && elmt != body) {
        if ("scrollLeft" in elmt) {
            left -= elmt.scrollLeft;
            top -= elmt.scrollTop;
        }
        elmt = elmt.parentNode;
    }
    
    return { left: left, top: top };
};

ParallaxSearchWidget._cancelEvent = function(evt) {
    if (evt) {
        evt.returnValue = false;
        evt.cancelBubble = true;
        if ("preventDefault" in evt) {
            evt.preventDefault();
        }
    }
    return false;
};
