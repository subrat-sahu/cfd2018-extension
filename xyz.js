const ROOT_URL = 'https://api.cognitive.microsoft.com/bing/v7.0/news/search?q=';
var recv;
var obj;
var search = 'cricket';

function bingNewsSearch(query) {
	
	let request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			recv = this.responseText;
			obj = JSON.parse(recv);
			addNews();
			document.getElementById("search").innerHTML = search;
		}
	}
	request.open("GET", ROOT_URL+query, true);
	request.setRequestHeader('Ocp-Apim-Subscription-Key','248fdd6665c5432294922d48e0ec5b3f');
	request.send();
}
bingNewsSearch(encodeURI(search));

function addNews() {

	var newsdiv = document.getElementById("news");
	for (i=0; i<obj.value.length; i++) {
		try {
			var div0 = document.createElement("div");
			div0.classList.add("card-panel");
			
			var div00 = document.createElement("div");
			div00.classList.add("row");
			
			var div000 = document.createElement("div");
			div000.classList.add("col");
			div000.classList.add("s4");
			
			var img = document.createElement("img");
			img.setAttribute("src", obj.value[i].image.thumbnail.contentUrl);
			img.setAttribute("width", "50%");
			
			var div001 = document.createElement("div");
			div001.classList.add("col");
			div001.classList.add("s8");
			
			var h4 = document.createElement("h5");
			h4.innerHTML = obj.value[i].name;
			
			var p = document.createElement("p");
			p.innerHTML = obj.value[i].description;
			
			var a = document.createElement("a");
			a.setAttribute("href", obj.value[i].url);
			
			var p1 = document.createElement("p");
			a.innerHTML = "Read More..";
			
			newsdiv.appendChild(div0);
			div0.appendChild(div00);
			div00.appendChild(div000);
			div000.appendChild(img);
			div00.appendChild(div001);
			div001.appendChild(h4);
			div001.appendChild(p);
			div001.appendChild(p1);
			p1.appendChild(a);
		}
		finally {
			continue;
		}
	}
}