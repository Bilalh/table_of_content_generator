$(document).ready(function() {
	prettyifyGamefaqs();
	$('#toc').toc();
});

function prettyifyGamefaqs () {
	console.log("testing");
	var faq = $('pre').text();
	$('div#temp').remove();


	// must have a lest 2 chars
	var tocIdsRegex = /^[ \t]*\[\w[\w_-]{1,}?\]|[ \t]*\[\w[\w_-]{1,}?\][ \t]*$/gm
	var tocIds      = faq.match(tocIdsRegex)
	
	 if (tocIds.length <= 0){
		console.log("No toc found");
		return;
	}
	
	// console.log(tocIds);
	// return;
	
	tocIds = tocIds.map(function(ele){
		return ele.trim();
	});
	
	
	if (tocIds[0] == tocIds[1]){
		console.log("Removed " + tocIds.splice(0,2) );
	}
	
	tocIdsUniq = getElementsThatOccur(2,tocIds);
	
	console.log(tocIdsUniq);
	console.log("length: " + tocIdsUniq.length);
		
	// at the end of the line of the first section of the faq
	var start_of_faq = faq.lastIndexOf(tocIdsUniq[0] );

	var newStart = getNewStartingPoint(faq,start_of_faq);
	faq = faq.slice(newStart)

	tocIdsUniq = tocIdsUniq.filter(function(ele){
		return faq.indexOf(ele) == faq.lastIndexOf(ele);
	});


	console.log("\n\n\n")
	section_indexes = tocIdsUniq.slice(1).map(function(ele){
		var start_of_section = faq.indexOf(ele);
		var new_start = getNewStartingPoint(faq,start_of_section)
		return new_start;
	});
	
	
	section_indexes.unshift(0);
	section_indexes.push(faq.length)
	
	console.log("\n\n");
	console.log(section_indexes);

	//Sections containing the data
	var sections = new Array(section_indexes.length-1)
	for (var i=0; i < section_indexes.length -1; i++) {
		sections[i] = faq.slice(section_indexes[i],section_indexes[i+1])
	};
	
	
	
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
	while (text[index] == '=' || text[index] == '*' || text[index] == '#' || text[index] == '-' ){
		index++;
	}
	titleRes = titlePart.slice(index)
	
	// console.log(shortName)
	// console.log(titleRes);
	if (titleRes.length < 3 ){
		return shortName;
	}
	
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
	if (c == '=' || c == '*' || c == '#' || c == '-' ){
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