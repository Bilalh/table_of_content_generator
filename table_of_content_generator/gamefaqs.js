function parseGameFaqs(o){
	var text = o.query.results.pre; 
	$(document).ready(function() {
		prettyifyGamefaqs(text);
		$('#toc').toc({});
	});
}

function getFaq(url){
	// var url = encodeURIComponent(url);
	var yql = "http://query.yahooapis.com/v1/public/yql?format=json&q=select%20%20*%20%20from%20html%20where%20url%3D%22"
 + url + 
 "%22%20and%20xpath%3D'%2F%2Fpre'"
	
	$.getJSON(yql,
		function(data) {
			parseGameFaqs(data);
		}
	);
}


function prettyifyGamefaqs (faq) {
	$('div#temp').remove();
	// must have a lest 3 chars of the form  
	var tocIdsRegex = /^[ \t]*\[\w[\w&_.-]{2,}?\]|[ \t]*\[\w[\w&_.-]{1,}?\][\t |]*$/gm
	var tocIds      = faq.match(tocIdsRegex)
	
	if (! tocIds || tocIds.length <= 0){
		console.log("No toc found");
		tocIdsRegex = /^[ \t]*\*\*\w[\w&_.-]{2,}?\*\*|[ \t]*\*\*\w[\w&_.-]{1,}?\*\*[\t |]*$/gm
		tocIds      = faq.match(tocIdsRegex)
		if (! tocIds || tocIds.length <= 0){
			console.log("Still No toc found");
			return;
		}
	}	
	tocIds = tocIds.map(function(ele){
		return ele.replace('|','').trim();
	});
	
	// console.log(tocIds);
	// console.log("length: " + tocIds.length);
	
	if (tocIds[0] == tocIds[1]){
		tocIds.splice(0,2)
		// console.log("Removed " + tocIds.splice(0,2) );
	}
	
	tocIdsUniq = getElementsThatOccur(2,tocIds);
	// console.log(tocIdsUniq);
	// console.log("length: " + tocIdsUniq.length);
	
	if (tocIdsUniq.length <= 0){
		console.log("No toc left");
		$('div#content').append('<pre>'  + faq + '</pre>');
		return;
	}
	
	// console.log(tocIdsUniq);
	// console.log("length: " + tocIdsUniq.length);
		
	// at the end of the line of the first section of the faq
	var start_of_faq = faq.lastIndexOf(tocIdsUniq[0] );

	var newStart = getNewStartingPoint(faq,start_of_faq);
	topStuff = faq.slice(0,newStart);
	faq = faq.slice(newStart);
	
	
	tocIdsUniq = tocIdsUniq.filter(function(ele){
		return faq.indexOf(ele) == faq.lastIndexOf(ele);
	});

	// console.log(tocIdsUniq);
	// console.log("length: " + tocIdsUniq.length);
	
	section_indexes = tocIdsUniq.slice(1).map(function(ele){
		var start_of_section = faq.indexOf(ele);
		var new_start = getNewStartingPoint(faq,start_of_section)
		return new_start;
	});
	
	
	section_indexes.unshift(0);
	section_indexes.push(faq.length)
	
	// console.log(section_indexes);

	//Sections containing the data
	var sections = new Array(section_indexes.length-1)
	for (var i=0; i < section_indexes.length -1; i++) {
		sections[i] = faq.slice(section_indexes[i],section_indexes[i+1])
	};
	
	
	tocIdsUniq.forEach(function(ele,index){
		var url = '</pre><a class="noSpacing right" href="#toc' + index  +'">' +  ele +  '</a><pre class="">'
		topStuff = topStuff.replace(ele,url)
	});
	
	$('div#content').append('<pre>'  + topStuff + '</pre>');
	
	
	sections.forEach(function(ele,index){
		var pre = document.createElement('pre');
		pre.appendChild(document.createTextNode(ele));
		
		var heading = document.createElement('h1');
		heading.appendChild(document.createTextNode( getSectionName(ele,tocIdsUniq[index]) ));
				
		$('div#content').append(heading);
		$('div#content').append(pre);

	});
	
}

function getSectionName(text,shortName){
	var titlePart = text.slice(0,text.indexOf(shortName) )
	titlePart = titlePart.trim();
	
	var index = 0;
	while (text[index] == '=' || text[index] == '*' || 
	       text[index] == '#' || text[index] == '-' || text[index] == '_' ){
		index++;
	}
	titleRes = titlePart.slice(index)
	
	// console.log(shortName)
	// console.log(titleRes);
	if (titleRes.length < 3 || !titleRes.match(/[a-z]/gi) ){
		return shortName;
	}
	
	titleRes= titleRes.replace(/[_().|]+/g,"")
	
	if (titleRes.toUpperCase() == titleRes){
		return(toTitleCase(titleRes));
	}

	
	return titleRes;
}


function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}

function getNewStartingPoint(faq,start){	
	// Go the end of the last line excluding the \n
	while (faq[start] != '\n'){
		start--;
	}
	start--;
	
	
	// Go before decoration e.g  ===  above the line
	var c = faq[start];
	if (c == '=' || c == '*' || c == '#' || c == '-' || c == '_' ){
		var index = start;
		var d = c;
		while ( (d = faq[index]) != '\n'){
			index--;
			if ( !(d == c || d == ' '  || d == '\t' || d == '\n') ){
				break;
			}
		}
		if (d == '\n' ){
			start = index+1;
		}
	}
	
	return start;
}


function getElementsThatOccur(count,arr){
	var  counts = {};
	arr.forEach(function(ele){
		if (ele in counts){
			counts[ele]++;
		}else{
			counts[ele] = 1;
		};
	});
	
	return arr.filter(function(ele) {
		if (counts[ele] == count){
			delete counts[ele];
			return true;
		};
		return false;
	});
	
}

function getDistinctArray(arr) {
    var dups = {};
    return arr.filter(function(el) {
        var hash = el.valueOf();
        var isDup = dups[hash];
        dups[hash] = true;
        return !isDup;
    });
}

function getURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}