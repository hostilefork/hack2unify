(function() {
	window.ParallaxConfig = {
			sandbox:        false,
			corpusBaseUrl:  "http://sparallax.deri.ie/scripts/proxy.php?proxy_url=",//http://www.freebase.com/",
			appBaseUrl:     "freebaseapps.com/",
			appendConfigParams: function(url) { return url; }
	};
	window.endpointconfig = {
			url: "http://virtuoso.deri.ie:8080",
			dataset: "dbpedia" ,
			mapping : {},
	};
	window.userconfig={};
	window.config={};



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
function selectdataset(selectedval)
{document.getElementById("explore-input").value="";
var xmlfile="scripts/";	
if(selectedval=="lmdb"||selectedval=="dbpedia")
{if(selectedval=="lmdb")
{xmlfile+="configlmdb.xml";

}
else if(selectedval=="dbpedia")
{xmlfile+="config.xml"
}
$.ajax({
	type: "GET",
	url: xmlfile,
	dataType: "xml",
	cache: false,
	async: false,
	success: function(xml) {
	config.name=xml.getElementsByTagName("labelprop")[0].childNodes[0].nodeValue;
	config.type=xml.getElementsByTagName("typeprop")[0].childNodes[0].nodeValue;
	config.classtype=xml.getElementsByTagName("classtype")[0].childNodes[0].nodeValue;
	config.result=xml.getElementsByTagName("result")[0].childNodes[0].nodeValue;
	config.abstractprop=xml.getElementsByTagName("abstractprop")[0].childNodes[0].nodeValue;
	config.image=xml.getElementsByTagName("imageprop")[0].childNodes[0].nodeValue;
	config.dataset=xml.getElementsByTagName("dataset")[0].childNodes[0].nodeValue;
	config.graph=xml.getElementsByTagName("graph")[0].childNodes[0].nodeValue;
	config.endpoint=xml.getElementsByTagName("endpoint")[0].childNodes[0].nodeValue;
	// alert(xml.getElementsByTagName("imageprop")[0].childNodes[0].nodeValue);
},
error: function() {
	// handle error

}

});}
else
{config.name="rdfs:label";
config.type="rdf:type";
config.classtype="rdfs:Class";
config.result="o.results.bindings[i]";
config.abstractprop=userconfig.abstractprop;
config.image=userconfig.image;
config.dataset=userconfig.dataset;
config.graph=userconfig.graph;
config.endpoint=userconfig.endpoint;
}
};
function makeformvisible()
{var user=document.getElementById("userconfig");
user.style.display  = "block";
}

function getuserconfiguration(form)
{
	var user=document.getElementById("userconfig");
	userconfig.endpoint=form.endpoint.value;
	userconfig.graph=form.graph.value;
	userconfig.dataset=form.dataset.value;
	userconfig.image="<"+form.imageprop.value+">";
	userconfig.abstractprop="<"+form.abstractprop.value+">";
	selectdataset(userconfig.dataset); 
	user.style.display="none";    
	var select=document.getElementById("Selectdataset");
	select.options[2]=new Option(userconfig.dataset,userconfig.dataset,false,true);
}
