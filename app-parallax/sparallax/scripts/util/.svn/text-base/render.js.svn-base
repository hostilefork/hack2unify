var encodeHTML = function(s) {
    return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
};

function renderItem(itemID, div, onDone, onFocus) {
    var gotJSON = function(o) {
        var name = o.name;
        var description = null;
        if ("description" in o) {
            var fragments = o.description.split("\\n");
            for (var i = fragments.length - 1; i >= 0; i--) {
                var fragment = fragments[i];
                if (fragment.length == 0) {
                    fragments.splice(i, 1);
                }
            }

            if (fragments.length > 0) {
                description = "";
                for (var i = 0; i < fragments.length; i++) {
                    var fragment = fragments[i];
                    if (i == fragments.length - 1) {
                        fragment += " ...";
                    }
                    description += "<p>" + encodeHTML(fragment) + "</p>";
                }
            }
        }
		
		var url = ParallaxConfig.corpusBaseUrl + "view" + itemID;

        div.innerHTML = 
            "<div class='freebase-hotshot-container'><table><tr valign='top'>" +
                "<td>" +
                    "<div>" +
                        ("name" in o ?
                            ("<h1 class='freebase-hotshot-name'><a href='" + url + "'>" + name + "</a></h1>") :
                            ("<h1 class='freebase-hotshot-id'><a href='" + url + "'>" + itemID + "</a></h1>")) +
                    "</div>" +
                    ((description != null) ? ("<div class='freebase-hotshot-blurb'>" + description + "</div>") : "") +
                "</td>" +
                "<td></td>" +
            "</tr></table></div>";
		
		$(div.firstChild.firstChild.rows[0].cells[0].childNodes[0].childNodes[0]).click(function(evt) {
            try {
                window.top.Logging.log("thumbnail-to-topic", { "id" : itemID });
            } catch (e) { /* if we are embedded in another site, this doesn't work */ }
            onFocus(itemID, name);
			
			evt.preventDefault();
        });

        if ("thumbnails" in o) {
            var thumbnails = o.thumbnails;
            
            var secondTD = div.firstChild.firstChild.rows[0].cells[1];
            for (var i = 0; i < thumbnails.length; i++) {
                var entry = thumbnails[i];
                var thumbnailDiv = document.createElement("div");
                thumbnailDiv.className = "freebase-hotshot-thumbnail";
                thumbnailDiv.innerHTML = "<img src='" + entry.url + "' title='" + entry.title + "'  width=\"100\" height=\"100\"/>";
                thumbnailDiv.firstChild.onclick = showLightboxForThumbnail;
                secondTD.appendChild(thumbnailDiv);
            }
        }
        
        if (typeof onDone == "function") {
            onDone();
        }
    };
    var query=[{}];
	query[0].abstractid=itemID;
  //  var url = "http://hotshot.dfhuynh.user.dev." + window.ParallaxConfig.appBaseUrl + "acre/json?id=" + encodeURIComponent(itemID);
    JsonpQueue.queryOne(query, gotJSON, genericErrorHandler);
}