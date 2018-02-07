var openTabs = []
var closedTabs = []
var _activeTabId = null
var _urlVisited = []
var _activated = 0
var finalRatingArray = []
var _notVisited = [
  'chrome://newtab/',
  'https://www.facebook.com/',
  'https://messenger.com/'
]
var googled = []

var callback = (activeInfo) => {
  console.log(activeInfo);
  console.log(_urlVisited)
  console.log(openTabs, closedTabs);
  console.log(_activeTabId, _activated);
}

var saveChanges = (value) => {
// Get a value saved in a form.
// Check that there's some code there.
if (!value) {
  // message('Error: No value specified');
  return;
}
// Notify that we saved.
// Save it using the Chrome extension storage API.
chrome.storage.local.set(value, function() {
  l('Settings saved');
});
}

var getValues = (value) => {
  chrome.storage.local.get(value, function(item) {
    console.log(item);
    _urlVisited = _urlVisited.length !== 0 ? _urlVisited : item._urlVisited
  });
}

// callback('init');

var l = (stuff) => {
  console.log(stuff);
}

chrome.tabs.onCreated.addListener((tab) => {
  var date = new Date();
  tab.timeUp = date.getTime();
  tab.timeOpen = 0;
  tab.timeActive = 0;
  tab.topic = 'Particle';
  _activeTabId = tab.id;
  _activated = date.getTime();
  openTabs.push(tab);
  getValues();
  // callback('created');
})

chrome.tabs.onUpdated.addListener((tabId, data) => {
  console.log(data);

  if (data.url && data.status === 'loading' && data.url !== 'chrome://newtab/') {
  let myTab = _urlVisited.find(o => o.url === data.url);
    if(myTab) {
      myTab.count++;
    } else {
      _urlVisited.push({
        url: data.url,
        count: 1
      })
    }
  }
  var date = new Date();
  let timeDown = date.getTime()
  let obj = openTabs.find(o => o.id === tabId);
  // callback('updated')
  let index = openTabs.indexOf(obj);
  if (index > -1) {
      if (data.url && data.url !== 'chrome://newtab/' && data.url !== obj.url) {
          let temp = Object.assign({}, obj)
          if(obj.url !== 'chrome://newtab/') {
            temp.timeDown = timeDown
            temp.timeOpen = timeDown - temp.timeUp
            closedTabs.push(temp)
          }
          obj.url = data.url
          obj.timeActive = 0
          console.log(data.title, 'topic----');
          obj.topic = data.title ? data.title : obj.topic
      } else if (data.url && data.url !== 'chrome://newtab/') {
        obj.timeUp = date.getTime()
        obj.topic = data.topic ? data.topic : obj.topic
        // obj.tiem
        obj.url = data.url ? data.url : obj.url
      }
    openTabs[index] = obj
    // callback('updated');
  } else {
    var date = new Date();
    data.timeUp = date.getTime()
    data.timeOpen = 0
    data.timeActive = 0
    data.topic = 'Particle'
    _activeTabId = tabId
    _activated = date.getTime()
    openTabs.push(data)
    callback('added');
  }
})

chrome.tabs.onRemoved.addListener((tabId) => {
  var date = new Date();
  let timeDown = date.getTime()
  let obj = openTabs.find(o => o.id === tabId);
  let index = openTabs.indexOf(obj);
  if (index > -1) {
    openTabs.splice(index, 1);
    obj.timeDown = timeDown
    obj.timeOpen = timeDown - obj.timeUp
    closedTabs.push(obj)
}
  callback('removed');
  saveChanges({
    openTabs : openTabs,
    closedTabs : closedTabs,
    _urlVisited : _urlVisited,
  });
})

chrome.tabs.onActivated.addListener(function(tabs){
  let date = new Date();
  let time = date.getTime();
  let obj = openTabs.find(o => o.id === _activeTabId);
  if (_activeTabId !== tabs.tabId) {
    if (obj) {
      obj.timeActive += (date.getTime() - _activated)
    }
    _activated = time
    _activeTabId = tabs.tabId
  }
  callback('activated');
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    let obj = openTabs.find(o => o.id === sender.tab.id);
    // chrome.tabs.onActivated.addListener(callback)
    // chrome.tabs.onHighlighted.addListener(callback)
    var arrHeader = [];
    var arrPara = [];
    for(var k=0; k<request.content.paragraphs.length; k++) {
      var regex = /(<([^>]+)>)/ig
      ,   result = request.content.paragraphs[k].replace(regex, "");
      arrHeader.push(result)
    }
    for(var p=0; p<request.content.span.length; p++) {
      var regex = /(<([^>]+)>)/ig
      ,   result = request.content.span[p].replace(regex, "");
      arrHeader.push(result)
    }
    if (obj) {
      obj.content = arrHeader.join(' ');
    }
  });


var SendData = (dataParam) => {
  var data = {
     openTabs: openTabs,
     closedTabs: closedTabs,
     urlVisited: _urlVisited,
     finalRatingArray: finalRatingArray
  };
  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
  xhr.open('POST', 'http://localhost:4000/api/testing/');
  xhr.onreadystatechange = function() {
      if (xhr.readyState > 3 && xhr.status==200) {
        saveChanges({
          finalRatingArray: finalRatingArray});
        console.log(xhr.responseText);
      }
  };
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(data));
  return xhr;
}


var finalRatingArrayFunc = () => {
  finalRatingArray = []
  chrome.storage.local.get(function(value) {
  console.log(value);
  let date = new Date();
  let timeDown = date.getTime()
  let allTabs = []
  for (let tab = 0; tab < value.openTabs.length; tab++) {
    let tempObj  = Object.assign({}, value.openTabs[tab])
    tempObj.timeDown = timeDown
    tempObj.timeOpen = timeDown - tempObj.timeUp
    allTabs.push(tempObj)
  }
  allTabs = allTabs.concat(value.closedTabs)
  // Make a function to get The Values Added and stored in a single Array
  for (let i = 0, len = value._urlVisited.length; i < len; i++) {
    let tempObj = null
    allTabs.map((tab) => {
      if(tab .url && tab.url.includes('https://www.google.co.in/search?q=')) {
        var url_string = tab.url; //window.location.href
        var url = new URL(url_string);
        var c = url.searchParams.get("q");
        console.log(c);
      }
      console.log(tab.url === value._urlVisited[i].url);
      if (tab.url === value._urlVisited[i].url) {
        console.log('match');
        if (!tempObj){ tempObj = Object.assign({}, tab) }
        else {
          tempObj.timeActive += tab.timeActive;
          tempObj.timeOpen += tab.timeOpen;
        }
      }
    })
    if(tempObj) {
      tempObj.count = value._urlVisited[i].count;
      finalRatingArray.push(tempObj);
    }
  }
  console.log(finalRatingArray);
  // return finalRatingArray
});
}

callback('test');

var changeMinutes = (milliseconds) => {
  let day, hour, minute, seconds;
  console.log(milliseconds);
seconds = Math.floor(milliseconds / 1000);
console.log(seconds);
minute = Math.floor(seconds / 60);
seconds = seconds % 60;
// hour = Math.floor(minute / 60);
minute = minute % 60;
// day = Math.floor(hour / 24);
// hour = hour % 24;
console.log(minute);
return Number(seconds);
}

var getRating = () => {
  finalRatingArrayFunc();
  setTimeout(() => {
    for (let i = 0, len = finalRatingArray.length; i < len; i++) {
      let timeActiveMinutes = changeMinutes(finalRatingArray[i].timeActive);
      let timeOpenMinutes = changeMinutes(finalRatingArray[i].timeOpen);
      let count = finalRatingArray[i].count;
      console.log((timeActiveMinutes) , (timeOpenMinutes),(count));
      finalRatingArray[i].rating = Math.ceil((timeRating(timeActiveMinutes)*3 + /*(timeOpenMinutes/100)*/ countrating(count))/4.0)
    }
    console.log(finalRatingArray);
  }, 3000)
}

var timeRating = (t)=>{
  x = Math.ceil(t/2);
  if(x>5)
  return 5;
  return x;
}

var countrating = (c)=>{
  if(c==1)
  return 2;
  if(c==2)
  return 4;
  return 5;
}
setInterval(() => finalRatingArrayFunc(), 10000)

setInterval(() => {
  var Promise1 = new Promise(() => {
    SendData({
      openTabs: openTabs,
      closedTabs: closedTabs,
      urlVisited: _urlVisited,
      finalRatingArray: finalRatingArray
    })
  })

  // var Promise2 = new Promise(
  //   SendData({
  //     openTabs: openTabs,
  //     closedTabs: closedTabs,
  //     urlVisited: _urlVisited,
  //     finalRatingArray: finalRatingArray
  //   }))

    Promise1.then((response) => {
      console.log(response);
    }).catch((err) => {
      console.log(err);
    })
    // Promise1.then((response) => {
    //   console.log(response);
    // }).catch((err) => {
    //   alert(err);
    // });
}, 20000);
