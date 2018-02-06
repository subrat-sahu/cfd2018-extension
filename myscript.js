// alert(document.location);
// if(document.location !== 'http://subratsahu.me' || document.location !== 'https://cognizance.org.in' )
// window.location = 'http://subratsahu.me'


var url = document.location;
var arr = []
var arr1 = []
var arr2 = []
var content = {}
var _para = []
var _title = null
var _Head = []


// if (document.location.toLowerCase().includes('news')) {
console.log('_para')
_para = document.getElementsByTagName('p');
_Head = document.getElementsByTagName('h1');
_title = document.getElementsByTagName('title')
_span = document.getElementsByTagName('span')
// for (var k =0; k<_para.length; k++)
//   arr.push(_para[k].innerHTML);
// })
// for (var l =0; k<_Head.length; k++)
//   arr.push(_Head[l].innerHTML);
// })


for (var m=0; m<_para.length; m++) {
  arr.push(_para[m].innerHTML)
}
for (var m=0; m<_Head.length; m++) {
  arr1.push(_Head[m].innerHTML)
}
for (var m=0; m<_span.length; m++) {
  arr2.push(_span[m].innerHTML)
}

console.log(arr);
content.title = _title[0].innerHTML
content.paragraphs  =  arr
content.Head = arr1
content.span = arr2

chrome.runtime.sendMessage({
  location: document.location,
  content: content
}, function(response) {
  // console.log(response.farewell);
});
