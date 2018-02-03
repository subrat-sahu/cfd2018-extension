let H1ofthepage = document.getElementsByTagName('h1');
let Pofthepage = document.getElementsByTagName('p');

let arrh1 = []
let arrp = []
for(var k=0; k<H1ofthepage.length; k++) {
  arrh1.push(H1ofthepage[k].innerHTML);
  arrp.push(Pofthepage[k].innerHTML);
}
//
// H1ofthepage.map((H) => {
// })
console.log(arrh1, arrp);
