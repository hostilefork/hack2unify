/*
   Copyright 2009 DERI,NUIG

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software   distributed under the License is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and limitations under the License.

*/
var translator ={};

translator.translatequery=function(query,onDone5){

	var startofstatements="var id_ace=0;var flag =0;var modified={};modified.code= \"/api/status/ok\"; 		modified.q1={};modified.q1.code=\"/api/status/ok\";modified.q1.result=[];try{for(var i = 0; i<o.results.bindings.length;i++){if(typeof(modified.q1.result[id])==\"undefined\")modified.q1.result[id]={};";
	var statements="";
	var endofstatements="if(flag==0) id++;flag=0;}}catch(e){}onDone2(modified);";
	var substitute=[];




	var objectelement=function(){
		this.selectclause=[];
		this.whereclause={s:[],p:[],o:[],filter:[],optional:null,union:null,subquery:[],unionstmt:[],textsearch:[]};
		this.modifierclause={limit:"",orderby:[]};
		this.statements="";
		this.child=[];
		this.unique=[];
	};

	var globalquery= new objectelement();
	globalquery.whereclause.union=new objectelement();
	var findtype = function(o)
	{
		//placeholder classification :not present=0 null=1, []=2, {}=3, [{}]=4,{structure}=5,[{structure}]=6  value=7 [value]=8

		if(typeof(o)=="undefined")
			return 0;
		if(typeof(o)=="string" || typeof(o)=="number")
			return 7;
		if(o==null)
			return 1;

		if(isarray(o))
		{if(typeof(o[0])=="object")
		{for(var i in o[0])
		{
			return 6;}
		return 4;}
		if(typeof(o[0])=="undefined")
			return 2;
		if(typeof(o[0])=="string" || typeof(o[0])=="number")
			return 8;
		}
		if(typeof(o)=="object")
		{for(var i in o)
		{
			return 5;}
		return 3;
		}

	}
	var isarray= function (testobject)
	{	return testobject.constructor== Array;

	};
	var searchproperty = function(object, property){
		//prefix search

		//operator search


	}
	;

	var typeofobject= function(queryobject,id,objectstruct,mqlpointer,resultpath){

		for(var i in mqlpointer)
		{

		}
		if(queryobject["type"]=="/type/property")
		{	if(findtype(queryobject["master_property"])==1){

			var temppath1=resultpath+"[\"master_property\"]";
			objectstruct.statements+="if(o.results.bindings[i]."+id.substring(1,id.length)+"_master.value==o.results.bindings[i]."+id.substring(1,id.length)+"_rel.value)"+temppath1 +"=o.results.bindings[i]."+id.substring(1,id.length)+"_master.value;else "+temppath1 +"=null;";
			objectstruct.selectclause.push(id+"*>rdfs:domain as "+id+"_master" );
		}
		if(findtype(queryobject["expected_type"])==6){
			var temp=[];
			for(var i in mqlpointer)temp.push(mqlpointer[i]);
			temp.push("expected_type");
			temp.push("0");
			var temppath=resultpath+"[\"expected_type\"]";
			objectstruct.statements+=temppath +"=[];"+temppath+"["+id.substring(1,id.length)+"_rel]={};";
			objectstruct.child.push(id.substring(1,id.length)+"_rel");
			parseobject(temp,id.substring(1,id.length),id.substring(1,id.length)+"_rel",temppath);

		}

		}

		else if(queryobject["type"]=="/type/type")
		{ 

			objectstruct.whereclause.s.push(id);
			objectstruct.whereclause.p.push(config.type);
			objectstruct.whereclause.o.push(config.classtype);

			if(findtype(queryobject["/freebase/type_profile/instance_count"])!=0)
			{ queryobject["/type/type/instance"]=[];
			queryobject["/type/type/instance"][0]={};
			queryobject["/type/type/instance"][0].count=null;
			var temppath=resultpath+"[\"/freebase/type_profile/instance_count\"]";
			objectstruct.statements+=temppath +"= o.results.bindings[i]."+id.substring(1,id.length)+"_inst_count.value;";
			/*	objectstruct.selectclause.push("  count(distinct "+id+"_inst) as "+id+"_inst_count ");
				var temppath=resultpath+"[\"/freebase/type_profile/instance_count\"]";
				objectstruct.statements+=temppath +"= o.results.bindings[i]."+id.substring(1,id.length)+"_inst_count.value;";
				objectstruct.whereclause.s.push(id+"_inst");
				objectstruct.whereclause.p.push(config.type);
				objectstruct.whereclause.o.push(id);
			 */
			}

			if(findtype(queryobject["/type/type/properties"])!=0)
			{
				if(findtype(queryobject["/type/type/properties"])==6)
				{var temp=[];
				for(var i in mqlpointer)temp.push(mqlpointer[i]);
				if(findtype(queryobject["/type/type/properties"][0]["type"])==0)
					queryobject["/type/type/properties"][0]["type"]="/type/property";//:P
				temp.push("/type/type/properties");
				temp.push("0");
				objectstruct.statements+="modified.q1.result[i][\"/type/type/properties\"]=[];";
				objectstruct.whereclause.s.push(id+"_prop");
				objectstruct.whereclause.p.push("rdfs:domain");
				objectstruct.whereclause.o.push(id);
				objectstruct.whereclause.s.push(id+"_prop");
				objectstruct.whereclause.p.push("rdfs:range");
				objectstruct.whereclause.o.push(id+"_prop_rel");
				parseobject(temp,id.substring(1,id.length),id.substring(1,id.length)+"_prop");}
			}	

			if(findtype(queryobject["/type/type/instance"])!=0)
			{if(findtype(queryobject["/type/type/instance"])==6)
			{var temp=[];
			for(var i in mqlpointer)temp.push(mqlpointer[i]);
			temp.push("/type/type/instance");
			temp.push("0");
			startofstatements+="if(typeof("+resultpath+"[\"/type/type/instance\"])==\"undefined\")"+resultpath+"[\"/type/type/instance\"]=[];"+resultpath+"[\"/type/type/instance\"]["+id.substring(1,id.length)+"_inst]={};";
			//objectstruct.statements+=resultpath+"[\"/type/type/instance\"]=[];";
			globalquery.whereclause.s.push(id+"_inst");
			globalquery.whereclause.p.push(config.type);
			globalquery.whereclause.o.push(id);
			objectstruct.child.push(id.substring(1,id.length)+"_inst");
			parseobject(temp,id.substring(1,id.length),id.substring(1,id.length)+"_inst",resultpath+"[\"/type/type/instance\"]");}
			}
		}
		else
		{
			objectstruct.whereclause.s.push(id);
			objectstruct.whereclause.p.push(config.type);
			objectstruct.whereclause.o.push("  <" +  queryobject["type"]+">");}

	};

	var nameofobject= function(queryobject,id,objectstruct,resultpath){
		var expec_type=findtype(queryobject["name"]);
		if(expec_type==1)
		{	objectstruct.selectclause.push(" "+id+"_name");
		objectstruct.unique.push({mqlid:"name",sparqlid:id.substring(1,id.length)+"_name"});
		objectstruct.whereclause.s.push(id);
		objectstruct.whereclause.p.push(config.name);
		objectstruct.whereclause.o.push(id+"_name ");
		objectstruct.modifierclause.orderby.push(id+"_name");


		var temppath=resultpath +".name";
		objectstruct.statements+=""+temppath +"= o.results.bindings[i]."+id.substring(1,id.length)+"_name.value;";
		}


	};		

	var namefilter= function(queryobject,id,objectstruct)
	{ var expec_type=findtype(queryobject["name~="]);
	if(expec_type==7)
	{ 
		if(findtype(queryobject["name"])!=1)
		{
			objectstruct.whereclause.s.push(id);
			objectstruct.whereclause.p.push(config.name);
			objectstruct.whereclause.o.push(id+"_name");
		}
		var textsearchstmt="";
		textsearchstmt+=id+"_name bif:contains";
		//objectstruct.whereclause.s.push(id+"_name");
		//objectstruct.whereclause.p.push("bif:contains");

		if(queryobject["name~="].lastIndexOf("*")==queryobject["name~="].length-1)
			if(queryobject["name~="].indexOf("*")==0)
				textsearchstmt+=" '\""+queryobject["name~="].substring(1,queryobject["name~="].length-1) +"\"'.";//objectstruct.whereclause.o.push("'\""+queryobject["name~="].substring(1,queryobject["name~="].length-1) +"\"'");
			else
				textsearchstmt+=" '\""+queryobject["name~="].substring(0,queryobject["name~="].length-1) +"\"' .";
		//objectstruct.whereclause.o.push("'\""+queryobject["name~="].substring(0,queryobject["name~="].length-1) +"\"'");
		//objectstruct.whereclause.filter.push(" FILTER regex("+id+"_name,\""+queryobject["name~="].substring(1,queryobject["name~="].length-1)+"\",\"i\").");
		objectstruct.whereclause.textsearch.push(textsearchstmt);
	}
	};

	var addreturndirective= function(queryobject,id,objectstruct,resultpath)
	{

		var expec_type=findtype(queryobject["return"]);
		if(expec_type==7)
		{ 	
			objectstruct.selectclause=[];
			objectstruct.selectclause.push("count(distinct "+id+") as "+id+"_count");
			objectstruct.modifierclause.orderby=[];
			var temppath=resultpath ;

			objectstruct.statements=""+temppath +"= o.results.bindings[i]."+id.substring(1,id.length)+"_count.value;";
		}


	}
	var addcountdirective= function(queryobject,id,objectstruct)
	{  var expec_type;
	expec_type=findtype(queryobject["count"]);
	if(expec_type==0)
		expec_type=findtype(queryobject["estimate-count"]);
	if(expec_type==1)
	{ 

		objectstruct.selectclause.push("count(distinct "+id+") as "+id+"_count");
	}


	}

	var addlimitdirective = function(queryobject,id)
	{var expec_type=findtype(queryobject["limit"]);
	if(expec_type==7)
	{ globalquery.modifierclause.limit=" limit "+ queryobject["limit"];
	}
	}

	var addobjecttoquery= function(objectstruct)
	{if(objectstruct.whereclause.filter.length!=0)
	{
		var subquery= "Select ";
		/*for(var i in objectstruct.selectclause)
				{subquery+= " "+objectstruct.selectclause[i];}*/

		for(var i in objectstruct.whereclause.s )
		{if(objectstruct.whereclause.s[i].indexOf('?')==0)
		{for(var j=0 ;j<i;j++ )
		{if(objectstruct.whereclause.s[i]!==objectstruct.whereclause.s[j])
			continue;
		}
		if(j==i)
			subquery+= " "+objectstruct.whereclause.s[i];
		}
		if(objectstruct.whereclause.o[i].indexOf('?')==0)
		{for(var j=0 ;j<i;j++ )
		{if(objectstruct.whereclause.o[i]!==objectstruct.whereclause.o[j])
			continue;
		}
		if(j==i)
			subquery+= " "+objectstruct.whereclause.o[i];
		}}
		subquery+= "  where {";
		for(var i in objectstruct.whereclause.s ){
			for(var j in substitute)
				if (objectstruct.whereclause.s[i]==substitute[j].id)
					objectstruct.whereclause.s[i]=substitute[j].newid;
				else if (objectstruct.whereclause.o[i]==substitute[j].id)
					objectstruct.whereclause.o[i]=substitute[j].newid;
			//	else
			subquery+="  " + objectstruct.whereclause.s[i]+"  " +objectstruct.whereclause.p[i]+"  " +objectstruct.whereclause.o[i]+".";
		}
		for(var i in objectstruct.whereclause.filter)
		{subquery+=objectstruct.whereclause.filter;
		}
		for(var i in objectstruct.whereclause.unionstmt)
		{

			subquery+=objectstruct.whereclause.unionstmt[i];

		}
		subquery+="}";
		globalquery.whereclause.subquery.push(subquery);

	}
	else{
		for(var i in objectstruct.whereclause.s)
		{
			globalquery.whereclause.s.push(objectstruct.whereclause.s[i]);	
			globalquery.whereclause.p.push(objectstruct.whereclause.p[i]);
			globalquery.whereclause.o.push(objectstruct.whereclause.o[i]);
		}
		for(var i in objectstruct.whereclause.filter)	
			globalquery.whereclause.filter.push(objectstruct.whereclause.filter[i]);	

		for(var i in objectstruct.whereclause.unionstmt)	
		{
			globalquery.whereclause.unionstmt.push(objectstruct.whereclause.unionstmt[i]);

		}	
		for(var i in objectstruct.whereclause.textsearch)
			globalquery.whereclause.textsearch.push(objectstruct.whereclause.textsearch[i]);	}

	for(var i in objectstruct.modifierclause.orderby)
		globalquery.modifierclause.orderby.unshift(objectstruct.modifierclause.orderby[i]);
	for(var i in objectstruct.selectclause)
		globalquery.selectclause.push(objectstruct.selectclause[i]);	
	var tempstatements=statements;
	statements=objectstruct.statements+tempstatements;
	/*	if(objectstruct.whereclause.filter.length!=0)
		{
				var subquery= "Select ";
				for(var i in globalquery.selectclause)
				{subquery+= " "+globalquery.selectclause[i];}
				subquery+= "  where {";
				for(var i in globalquery.whereclause.s )
				{for(var j in substitute)
				if (globalquery.whereclause.s[i]==substitute[j].id)
					globalquery.whereclause.s[i]=substitute[j].newid;
				else if (globalquery.whereclause.o[i]==substitute[j].id)
					globalquery.whereclause.o[i]=substitute[j].newid;
			//	else
				subquery+="  " + globalquery.whereclause.s[i]+"  " +globalquery.whereclause.p[i]+"  " +globalquery.whereclause.o[i]+".";
				}
				for(var i in globalquery.whereclause.filter)
				{subquery+=globalquery.whereclause.filter;
				}
				for(var i in globalquery.whereclause.union.whereclause.s)
				{
				if(i==0)
				subquery+=" {";
				else 
				subquery+=" union {"
				 	subquery+="  " + globalquery.whereclause.union.whereclause.s[i]+"  " +globalquery.whereclause.union.whereclause.p[i]+"  " +globalquery.whereclause.union.whereclause.o[i]+".}";
				}
				subquery+="}";
			alert(subquery);
		}*/
	};
	var addobjecttoqueryoptional= function(objectstruct)
	{for(var i in objectstruct.selectclause)
		globalquery.selectclause.push(objectstruct.selectclause[i]);
	objectstruct.whereclause.optional= new objectelement();

	for(var i in objectstruct.whereclause.s)
	{
		globalquery.whereclause.s.push(objectstruct.whereclause.s[i]);	
		globalquery.whereclause.p.push(objectstruct.whereclause.p[i]);
		globalquery.whereclause.o.push(objectstruct.whereclause.o[i]);
	}
	for(var i in objectstruct.modifierclause.orderby)
		globalquery.modifierclause.orderby.unshift(objectstruct.modifierclause.orderby[i]);

	for(var i in objectstruct.whereclause.filter)	
		globalquery.whereclause.filter.push(objectstruct.whereclause.filter[i]);	

	}
	var orderquerywhereclause= function()
	{//make statements out of the spo and filter and optional and reaggrange them or this can be done at object level, then at this level only inter object needs to be catered
	};

	var getabstract= function(id)
	{
		globalquery.selectclause.push(" ?description ?name ?image");
		globalquery.whereclause.s.push(" <"+ id +"> ");	
		globalquery.whereclause.p.push(config.abstractprop);
		globalquery.whereclause.o.push("?description");
		globalquery.whereclause.s.push(" <"+ id +"> ");	
		globalquery.whereclause.p.push(config.name);
		globalquery.whereclause.o.push("?name");
		globalquery.whereclause.s.push("optional { <"+ id +"> ");	
		globalquery.whereclause.p.push(config.image);
		globalquery.whereclause.o.push("?image }");

		statements= "modified.q1.name=o.results.bindings[0].name.value; modified.q1.description=o.results.bindings[0].description.value;modified.q1.id= \"<"+ id +"> \"; if(o.results.bindings[0].image.value!=\"\")   {modified.q1.thumbnails=[];modified.q1.thumbnails[0]={};modified.q1.thumbnails[0].url=o.results.bindings[0].image.value;modified.q1.thumbnails[0].title=o.results.bindings[0].name.value;}";

	};

	var dosearch= function(text)
	{  var subquery="select ?id ?name where{?id "+config.name+" ?name .?name bif:contains '\""+text+"\"' option(score ?scr)}  order by desc(?scr) limit 3";

	globalquery.selectclause.push("?id ?name ?id_type ?id_type_name");
	globalquery.whereclause.subquery.push(subquery);
	globalquery.whereclause.s.push("optional{ ?id ");	
	globalquery.whereclause.p.push(config.type);
	globalquery.whereclause.o.push(" ?id_type ");
	globalquery.whereclause.s.push(" ?id_type ");	
	globalquery.whereclause.p.push(config.name);
	globalquery.whereclause.o.push(" ?id_type_name }");
	startofstatements="var id_type=0;var id=0;"+ "var flag =0;var modified={};modified.code= \"/api/status/ok\"; modified.q1={};modified.q1.code=\"/api/status/ok\";modified.q1.result=[];try{for(var i = 0; i<o.results.bindings.length;i++){";
	statements="if(typeof(modified.q1.result[id])==\"undefined\")modified.q1.result[id]={};modified.q1.result[id].id=o.results.bindings[i].id.value;modified.q1.result[id].name=o.results.bindings[i].name.value;if(typeof(modified.q1.result[id].type)==\"undefined\")modified.q1.result[id].type=[];modified.q1.result[id].type[id_type]={};if(typeof(o.results.bindings[i].id_type)!=\"undefined\"){modified.q1.result[id].type[id_type].id=o.results.bindings[i].id_type.value;modified.q1.result[id].type[id_type].name=o.results.bindings[i].id_type_name.value;}if(flag==0&&modified.q1.result[id].id!=o.results.bindings[i+1].id.value&&i!=o.results.bindings.length){id++;id_type=0;flag=1}else {id_type++; flag=1; }";
	}
	var getindividualtopic= function(id)
	{

		globalquery.selectclause.push("  ?name ?type  ?prop ?prop_value ?type_name ?prop_name ?expec_type_name ?expec_type ?prop_id");
		//	globalquery.whereclause.s.push(" <"+ id +"> ");	
		//	globalquery.whereclause.p.push(config.abstractprop);
		//	globalquery.whereclause.o.push("?description");
		globalquery.whereclause.s.push(" <"+ id +"> ");	
		globalquery.whereclause.p.push(config.name);
		globalquery.whereclause.o.push("?name");
		globalquery.whereclause.s.push(" <"+ id +"> ");	
		globalquery.whereclause.p.push(config.type);
		globalquery.whereclause.o.push("?type");
		//	globalquery.whereclause.s.push("?type");	
		//globalquery.whereclause.p.push(config.type);
		//	globalquery.whereclause.o.push("?domain");
		globalquery.whereclause.s.push("?type");	
		globalquery.whereclause.p.push(config.name);
		globalquery.whereclause.o.push("?type_name");
		/*	globalquery.whereclause.s.push("{ ?prop");	
		globalquery.whereclause.p.push("rdfs:domain");
		globalquery.whereclause.o.push("?type");
		globalquery.whereclause.s.push("?prop");	
		globalquery.whereclause.p.push("rdfs:range");
		globalquery.whereclause.o.push("?expec_type }");
			globalquery.whereclause.s.push("union {?prop");	
		globalquery.whereclause.p.push("rdfs:range");
		globalquery.whereclause.o.push("?type");
		globalquery.whereclause.s.push("?prop");	
		globalquery.whereclause.p.push("rdfs:domain");
		globalquery.whereclause.o.push("?expec_type }");*/
		globalquery.whereclause.s.push("?expec_type");	
		globalquery.whereclause.p.push(config.name);
		globalquery.whereclause.o.push("?expec_type_name");
		globalquery.whereclause.s.push("?prop");	
		globalquery.whereclause.p.push(config.name);
		globalquery.whereclause.o.push("?prop_name");
		//		globalquery.whereclause.s.push(" <"+ id +"> ");	
		//	globalquery.whereclause.p.push("?prop");
		//	globalquery.whereclause.o.push("?prop_id");
		globalquery.whereclause.s.push("?prop_id");	
		globalquery.whereclause.p.push(config.name);
		globalquery.whereclause.o.push("?prop_value");
		globalquery.whereclause.unionstmt.push("{?prop rdfs:domain ?type. ?prop rdfs:range ?expec_type. <"+ id +"> ?prop ?prop_id} union {?prop rdfs:range ?type. ?prop rdfs:domain ?expec_type. ?prop_id ?prop <"+ id +">  }");
		//	globalquery.whereclause.s.push("optional { <"+ id +"> ");	
		//	globalquery.whereclause.p.push(config.image);
		//	globalquery.whereclause.o.push("?image }");
		startofstatements="var data=0;var prop=0;var id=0;"+ "var flag =0;var modified={};modified.code= \"/api/status/ok\"; 		modified.q1={};modified.q1.code=\"/api/status/ok\";if(typeof(o.results.bindings[0])==\"undefined\")alert(\"sorry nothing can be displayed\");modified.q1.name=o.results.bindings[0].name.value; modified.q1.id= \"<"+ id +"> \";modified.q1.domains=[];modified.q1.domains[0]={};modified.q1.domains[0].id=\"class\";modified.q1.domains[0].types=[];try{for(var i = 0; i<o.results.bindings.length;i++){";
		statements= "if(typeof(modified.q1.domains[0].types[id])==\"undefined\"){modified.q1.domains[0].types[id]={};}modified.q1.domains[0].types[id].id=o.results.bindings[i].type.value;modified.q1.domains[0].types[id].name=o.results.bindings[i].type_name.value;if(typeof(modified.q1.domains[0].types[id].properties)==\"undefined\"){modified.q1.domains[0].types[id].properties=[];}modified.q1.domains[0].types[id].properties[prop]={};modified.q1.domains[0].types[id].properties[prop].id=o.results.bindings[i].prop.value;modified.q1.domains[0].types[id].properties[prop].name=o.results.bindings[i].prop_name.value;modified.q1.domains[0].types[id].properties[prop].expected_type={};modified.q1.domains[0].types[id].properties[prop].expected_type.id=o.results.bindings[i].expec_type.value;modified.q1.domains[0].types[id].properties[prop].expected_type.name=o.results.bindings[i].expec_type_name.value;modified.q1.domains[0].types[id].properties[prop].data=[];modified.q1.domains[0].types[id].properties[prop].data[data]={};modified.q1.domains[0].types[id].properties[prop].data[data].name=o.results.bindings[i].prop_value.value;modified.q1.domains[0].types[id].properties[prop].data[data].id=o.results.bindings[i].prop_id.value;if(flag==0&&i!=o.results.bindings.length)if(modified.q1.domains[0].types[id].id!=o.results.bindings[i+1].type.value){id++;prop=0;flag=1;}if(flag==0&&i!=o.results.bindings.length)if(modified.q1.domains[0].types[id].properties[prop].id!=o.results.bindings[i+1].prop.value){prop++;flag=1;data=0;}if(flag==0&&i!=o.results.bindings.length)if(modified.q1.domains[0].types[id].properties[prop].data[data].value!=o.results.bindings[i+1].prop_value.value){prop++;flag=1;data=0;}";
	}
	var parseproperties = function(id,objectstruct,mqlpointer,resultpath){
		var queryobject=query;

		for(var i in mqlpointer)
		{
			queryobject=queryobject[mqlpointer[i]];


		}
		if(findtype(queryobject["/type/type/properties"])!=0)
		{
			if(findtype(queryobject["/type/type/properties"])==6)
			{var temp=[];
			for(var i in mqlpointer)temp.push(mqlpointer[i]);
			if(findtype(queryobject["/type/type/properties"][0]["type"])==0)
				queryobject["/type/type/properties"][0]["type"]="/type/property";//:P

			temp.push("/type/type/properties");
			temp.push("0");
			resultpath=resultpath+"[\"/type/type/properties\"]";
			objectstruct.statements+="modified.q1.result[id][\"!/user/dfhuynh/parallax/type_profile/profile_of\"]=[];if(typeof(modified.q1.result[id][\"/type/type/properties\"])==\"undefined\")modified.q1.result[id][\"/type/type/properties\"]=[];modified.q1.result[id][\"/type/type/properties\"][id_prop]={};";
			/*	objectstruct.whereclause.s.push(id+"_prop");
				objectstruct.whereclause.p.push("rdfs:domain");
				objectstruct.whereclause.o.push(id);
				objectstruct.whereclause.s.push(id+"_prop");
				objectstruct.whereclause.p.push("rdfs:range");
				objectstruct.whereclause.o.push(id+"_prop_rel");*/
			var unionstmt="";var org_id="";
			for(var m in substitute)
			{if(substitute[m].id==id)
				var org_id=substitute[m].newid ;
			}
			unionstmt="{  "+id+"_prop  rdfs:domain  "+ org_id+" ."+id+"_prop"+" rdfs:range "+ id+"_prop_rel  }";
			objectstruct.whereclause.unionstmt.push(unionstmt);
			unionstmt="union{  "+id+"_prop  rdfs:range  "+ org_id+"."+id+"_prop"+" rdfs:domain "+ id+"_prop_rel  }";
			objectstruct.whereclause.unionstmt.push(unionstmt);
			/*objectstruct.whereclause.s.push(id);
			objectstruct.whereclause.p.push(id+"_prop");
			objectstruct.whereclause.o.push(id+"_prop_rel");*/
			objectstruct.child.push(id.substring(1,id.length)+"_prop");
			parseobject(temp,id.substring(1,id.length),id.substring(1,id.length)+"_prop",resultpath);}
		}
		for(var i in queryobject)
		{
			if(i.indexOf('!h')==0)
			{ 
				var temp=[];
				for(var j in mqlpointer){temp.push(mqlpointer[j]);};
				objectstruct.whereclause.s.push(id+"_"+i.substring(i.length-3,i.length));
				objectstruct.whereclause.p.push("<"+i.substring(1,i.length)+">");
				objectstruct.whereclause.o.push(id);

				temp.push(i);
				temp.push("0");
				resultpath=resultpath+"[\""+i+"\"]";
				startofstatements+="if(typeof("+resultpath+")==\"undefined\")"+resultpath+"=[];"+resultpath+"["+id.substring(1,id.length)+"_"+i.substring(i.length-3,i.length)+"]={};";
				objectstruct.child.push(id.substring(1,id.length)+"_"+i.substring(i.length-3,i.length));
				parseobject(temp,id.substring(1,id.length),id.substring(1,id.length)+"_"+i.substring(i.length-3,i.length),resultpath);
			}
			if(i.indexOf('http')==0)
			{ 
				var temp=[];
				for(var j in mqlpointer){temp.push(mqlpointer[j]);};
				objectstruct.whereclause.s.push(id);
				objectstruct.whereclause.p.push("<"+i.substring(0,i.length)+">");
				objectstruct.whereclause.o.push(id+"_"+i.substring(i.length-3,i.length));

				temp.push(i);
				temp.push("0");
				resultpath=resultpath+"[\""+i+"\"]";
				startofstatements+="if(0||typeof("+resultpath+")==\"undefined\")"+resultpath+"=[];"+resultpath+"["+id.substring(1,id.length)+"_"+i.substring(i.length-3,i.length)+"]={};";
				objectstruct.child.push(id.substring(1,id.length)+"_"+i.substring(i.length-3,i.length));
				parseobject(temp,id.substring(1,id.length),id.substring(1,id.length)+"_"+i.substring(i.length-3,i.length),resultpath);
			}

			if(i.indexOf('f:h')==0)

			{
				var unionstmt="";

				for (var j in queryobject[i][0]["id|="])
				{




					if(j==0)
						unionstmt+=" {";
					else 
						unionstmt+=" union {";
					unionstmt+="  " + id+"  <"+i.substring(2,i.length)+">  " +"<"+queryobject[i][0]["id|="][j]+">"+".}";
				}
				objectstruct.whereclause.unionstmt.push(unionstmt);
			}
			if(i.indexOf('f:!h')==0)

			{
				var unionstmt="";

				for (var j in queryobject[i][0]["id|="])
				{




					if(j==0)
						unionstmt+=" {";
					else 
						unionstmt+=" union {";
					unionstmt+="  " + "<"+queryobject[i][0]["id|="][j]+">"+"  <"+i.substring(3,i.length)+">  " +id+".}";
				}
				objectstruct.whereclause.unionstmt.push(unionstmt);
			}


		}


	};
	var parseobject= function(mqlpointer,sparqlparent,id,resultpath){
		var backresultpath=resultpath;
		var queryobject=query;

		for(var i in mqlpointer)
		{
			queryobject=queryobject[mqlpointer[i]];


		}

		startofstatements="var "+id+"=0;" +startofstatements;
		var objectstruct =new objectelement();
		objectstruct.whereclause.union=new objectelement();
		resultpath =resultpath +"["+id+"]";

		if(findtype(queryobject["id"])==7)
		{ //id="<"+queryobject["id"]+">";
		var subs ={"id":"?"+id,"newid":"<"+queryobject["id"]+">"};
		substitute.push(subs);

		var temppath=resultpath+".id";

		objectstruct.statements+=temppath+"=\""+queryobject["id"]+"\";";
		}
		id="?"+id; 

		if(findtype(queryobject["id"])==1)
		{ objectstruct.selectclause.push(id);
		objectstruct.unique.push({mqlid:"id",sparqlid:id.substring(1,id.length)});
		objectstruct.modifierclause.orderby.push(id);
		var temppath=resultpath +".id";
		objectstruct.statements+=temppath +"= o.results.bindings[i]."+id.substring(1,id.length)+".value;";
		} 

		//search property(queryobject,type)
		//search property(queryobject,name)
		for(var i in queryobject)
		{ 	 switch(i)

			{   /*	case "abstractid":
		getabstract(object[i]); 
		break;	
		*/
			case "search":
				dosearch(queryobject[i]);
				break;
			case "showtopicid":
				getindividualtopic(queryobject[i]);
				break;
			case "abstractid":
				getabstract(queryobject[i]); 
				break;	
			case "type":
				typeofobject(queryobject,id,objectstruct,mqlpointer,resultpath);

				break;
			case "name":
				nameofobject(queryobject,id,objectstruct,resultpath);

				break;
			case "name~=":
				namefilter(queryobject,id,objectstruct);
				break;	



			};
		}
		parseproperties(id,objectstruct,mqlpointer,resultpath);

		if(findtype(queryobject["limit"])!=0)
		{addlimitdirective(queryobject,id);
		}
		if(findtype(queryobject["count"])!=0||findtype(queryobject["estimate-count"])!=0)
		{addcountdirective(queryobject,id,objectstruct);
		}
		if(findtype(queryobject["return"])!=0)
		{addreturndirective(queryobject,id,objectstruct,resultpath);
		}

		if(findtype(queryobject["optional"])==0)
			addobjecttoquery(objectstruct);
		else 
			addobjecttoqueryoptional(objectstruct);
		ifclause="";
		for(var k in objectstruct.unique)
		{ifclause+="||"+backresultpath+"["+id.substring(1,id.length)+"]."+objectstruct.unique[k]["mqlid"]+"!="+"o.results.bindings[i+1]."+objectstruct.unique[k]["sparqlid"]+".value";
		}
		if(ifclause!="")
		{	
			var tempstmnt="if(flag==0&&i!=o.results.bindings.length)if(0"+ifclause+"){flag=1;"+id.substring(1,id.length)+"++;";
			for(var j in objectstruct.child)
				tempstmnt+=objectstruct.child[j]+"=0;";
			tempstmnt+="}";
			endofstatements=tempstmnt+endofstatements;
		}



	}; 



	parseobject(["0"],"","id","modified.q1.result");

	//Final query formation

	var finalquery= "Select distinct";
	for(var i in globalquery.selectclause)
	{finalquery+= " "+globalquery.selectclause[i];}
	finalquery+= "  where {";
	for(var i in globalquery.whereclause.s )
	{for(var j in substitute)
		if (globalquery.whereclause.s[i]==substitute[j].id)
			globalquery.whereclause.s[i]=substitute[j].newid;
		else if (globalquery.whereclause.o[i]==substitute[j].id)
			globalquery.whereclause.o[i]=substitute[j].newid;
	//	else
	finalquery+="  " + globalquery.whereclause.s[i]+"  " +globalquery.whereclause.p[i]+"  " +globalquery.whereclause.o[i]+".";
	}
	for(var i in globalquery.whereclause.filter)
	{finalquery+=globalquery.whereclause.filter;
	}
	for(var i in globalquery.whereclause.unionstmt)
	{

		finalquery+=globalquery.whereclause.unionstmt[i];

	}
	for(var i in globalquery.whereclause.textsearch)
	{finalquery+=globalquery.whereclause.textsearch[i];
	}
	for(var i in globalquery.whereclause.subquery)
	{finalquery+="{" + globalquery.whereclause.subquery[i] +"}";
	}
	finalquery+="}"; //or any extra clause
	if(globalquery.modifierclause.orderby.length!=0)
		finalquery+=" order by "
			for (var i in globalquery.modifierclause.orderby)
				finalquery+= "  "+globalquery.modifierclause.orderby[i];
	finalquery+=globalquery.modifierclause.limit;

	statements=startofstatements+statements+endofstatements;

	var funcID = new Date().getTime() + "x" + Math.floor(Math.random() * 1000);
	var funcname="fn"+funcID;

	window[funcname]=new Function("o,onDone2",statements);

	onDone5(funcname,finalquery);
};

//translator.translatequery(query,onDone5);
