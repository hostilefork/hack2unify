var log = (window.console) ? function(s) { window.console.log(s); } : /*window.alert*/ function() {};

var widget;
function onLoad() {
	var exploreInput = document.getElementById("explore-input");
	exploreInput.focus();
	
	widget = ParallaxSearchWidget.create(exploreInput, ParallaxSearchWidget.defaultQueryHandler);
}

function doExample(text) {
	widget.query(text);
}

function tellMeMore() {
    document.getElementById('explanation').style.display = "block";
}