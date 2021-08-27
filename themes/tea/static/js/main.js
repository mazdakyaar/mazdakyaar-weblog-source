"use strict";	// This lonely string triggers strict mode

//=============== View and controller of the top navigation =================

var sideBarController = null;

function setupTopNavigation(searchBarID, menuBarID, btnExpanMenuBarAgainID, btnClearSearchFieldID,
	searchFieldID, aWidth,
	aContainerElementID, aSitemapURL)
{
	sideBarController = {
		containerElementID: aContainerElementID,
		sitemapURL: aSitemapURL,
		searchField : document.getElementById(searchFieldID),
		
		onClearSearchFieldClick : function() {
			this.searchField.value = "";
		},
		
		onSearchAction : function() {
			if (topNavView.searchField.value.length>0)
				executeSearch(topNavView.searchField.value, this.sitemapURL, this.containerElementID);
		}		
	};
}

//=========================
function executeSearch(query, sitemapURL, containerElementID)
{
	loadDoc(sitemapURL, function(xmlhttp) {
		var urlset = xmlhttp.responseXML.getElementsByTagName("url");
		var count=urlset.length;
		var metadataList = new Array(count);
		for (var i=0;i<count;i++) {
			var metadata = {
				url: urlset[i].getElementsByTagName("loc")[0].firstChild.nodeValue,
				title: "",
				description: "",
				lastModification: new Date(urlset[i].getElementsByTagName("lastmod")[0].firstChild.nodeValue),
				keywords: []
			};
			
			var titleElements = urlset[i].getElementsByTagName("title");
			if (titleElements.length>0)
				metadata.title = titleElements[0].firstChild.nodeValue;
			
			var descriptionElements = urlset[i].getElementsByTagName("description");
			if (descriptionElements.length>0)
				metadata.description = descriptionElements[0].firstChild.nodeValue;
			
			var keywordsElement = urlset[i].getElementsByTagName("keywords")[0];
			if (keywordsElement!=undefined)
			{
				var kwItems = keywordsElement.getElementsByTagName("item");
				for (var j=0; j<kwItems.length; j++)
					metadata.keywords.push(kwItems[j].firstChild.nodeValue);
			}
			
			metadata.searchRelevance = calcSearchRelevance(metadata,query);
			
			metadataList[i] = metadata; 
		}
		
		// Sort URL's based on their relevance in a decreasing order
		metadataList.sort(function(u1,u2) {return u2.searchRelevance - u1.searchRelevance;});
		
		// Render results as a single list of links into the main container
		document.title = "نتایج جستجو برای "+query;
		var acceptableCount = Math.min(metadataList.length, 25);
		var html = '<h3>نتایج جستجو برای <i>'+query+'</i></h3>';
		if (metadataList[0].searchRelevance>1.0) {
			for (var i=0;i<acceptableCount;i++)
				if (metadataList[i].searchRelevance>1.0)
				{
					html += '<div class="row"><div class="col-sm-4 col-md-4 col-lg-4"><h5 style="text-align: left">'+
						convertDateToShamsi(metadataList[i].lastModification) + '</h5></div>' +
						'<div class="col-sm-8 col-md-8 col-lg-8"><h5 style="text-align: right"><strong><a href="'+
						metadataList[i].url+'">' + metadataList[i].title + '</a></strong></h5></div>'+
						'<div class="col-sm-12 col-md-12 col-lg-12"><p style="direction: rtl;text-align: right"><small>' +
						metadataList[i].description + '</small></p></div></div>';
				}
		}		
		else
			html += '<p style="direction: rtl;text-align: right">هیچ نتیجه ای پیدا نشد</p>'
		html += '</div></div>';
		
		document.getElementById(containerElementID).innerHTML = html;
	});
}

// Loads a resource using AJAX
function loadDoc(url, cFunction) {
  var xhttp;
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      cFunction(this);
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

// Calculates a relevance measure for a page and a query string
function calcSearchRelevance(metadata, query)
{
	// This measure consists of a linear weighted combination of several indices.
	
	// The first index is number of keywords present in the search query weighteg by their order
	var lowercaseQuery = query.toLowerCase();
	var presentKeywords=0;
	for (var i=0;i<metadata.keywords.length;i++)
		if (lowercaseQuery.indexOf(metadata.keywords[i].toLowerCase())>=0)
			presentKeywords += Math.pow(0.99,i);
	
	// The second index is newnesss : newer articles will get higher scores
	var TwoYears = 63072000000;
	var FirstDayOf2016 = 1454272200000;
	// This will give a measure between -1 and 1
	var newness = 2*Math.atan((metadata.lastModification.getTime()-FirstDayOf2016)/TwoYears)/Math.PI;
	 
	return presentKeywords+newness;
}

