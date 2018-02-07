const ROOT_URL = 'https://api.cognitive.microsoft.com/bing/v7.0/news/';
var recv;
var obj;

function bingNewsSearch() {
	
	let request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			recv = this.responseText;
			obj = JSON.parse(recv);
			addNews();
		}
	}
	request.open("GET", ROOT_URL, true);
	request.setRequestHeader('Ocp-Apim-Subscription-Key','248fdd6665c5432294922d48e0ec5b3f');
	request.send();
}
bingNewsSearch();

function addNews() {

	var newsdiv = document.getElementById("news");
	for (i=0; i<1; i++) {
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
			
			var h6 = document.createElement("h6");
			h6.innerHTML = obj.value[i].name;
			
			var a = document.createElement("a");
			a.setAttribute("href", obj.value[i].url);
			
			var p1 = document.createElement("p");
			a.innerHTML = "Read More..";
			a.addEventListener("click", function() {
				window.open(obj.value[i].url, '_blank');
			});
			
			newsdiv.appendChild(div0);
			div0.appendChild(div00);
			div00.appendChild(div000);
			div000.appendChild(img);
			div00.appendChild(div001);
			div001.appendChild(h6);
			div001.appendChild(p1);
			p1.appendChild(a);
		}
		finally {
			continue;
		}
	}
}

document.getElementById("showmore").addEventListener("click", function() {
	window.open('bing.html','_blank');
});