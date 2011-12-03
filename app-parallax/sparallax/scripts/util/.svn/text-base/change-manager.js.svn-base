var ChangeManager = {
	_changes: [],
	_div: null
};

ChangeManager.addChange = function(change) {
	if (ChangeManager._changes.length == 0) {
		ChangeManager._addUI();
	}
	ChangeManager._changes.push(change);
};

ChangeManager.hasChanges = function() {
	return ChangeManager._changes.length > 0;
};

ChangeManager._submitData = function() {
    Logging.log("write", ChangeManager._changes);
    ChangeManager._changes = [];
    ChangeManager._removeUI();
};

ChangeManager._discardData = function() {
	if (window.confirm("Discard all of your data contributions?")) {
		ChangeManager._changes = [];
		ChangeManager._removeUI();
	}
};

ChangeManager._addUI = function() {
	var div = document.createElement("div");
	div.className = "change-popup";
	div.innerHTML =
		'<div>Thank you for your data contributions!</div>' +
		'<div>They are currently not sent in yet. You can continue to contribute more before sending. Or you can send them in now.</div>' +
		'<div><button>Send Now</button> <button>Discard All</button></div>';
	
	var buttons = div.getElementsByTagName("button");
	buttons[0].onclick = ChangeManager._submitData;
	buttons[1].onclick = ChangeManager._discardData;
	
	ChangeManager._div = div;
	
	document.body.appendChild(div);
	
	var count = 0;
	var timerID = window.setInterval(function() {
		if (count % 2 == 0) {
			div.style.display = "none";
		} else {
			div.style.display = "block";
		}
		if (count > 4) {
			window.clearInterval(timerID);
		} else {
			count++;
		}
	}, 200);
};

ChangeManager._removeUI = function() {
	document.body.removeChild(ChangeManager._div);
	ChangeManager._div = null;
};

window.onbeforeunload = function(evt) {
	if (ChangeManager.hasChanges()) {
		evt.returnValue = "Your data contributions have not been submitted. (Look at the bottom right corner of the window.)";
		return false;
	}
};
