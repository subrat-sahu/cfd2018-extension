var openTabs = []
var closedTabs = []
var _activeTabId = null
var _urlVisited = []
var _activated = 0
var _notVisited = [
  'chrome://newtab/',
  'https://www.facebook.com/'
]

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
  message('Error: No value specified');
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
    _urlVisited = _urlVisited ? _urlVisited : value._urlVisited
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
  tab.title = 'Particle';
  _activeTabId = tab.id;
  _activated = date.getTime();
  openTabs.push(tab);
  getValues();
  // callback('created');
})

chrome.tabs.onUpdated.addListener((tabId, data) => {
  // console.log(data);
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
  callback('updated')
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
          obj.title = data.title ? data.title : obj.title
      } else if (data.url && data.url !== 'chrome://newtab/') {
        obj.timeUp = date.getTime()
        obj.title = data.title ? data.title : obj.title
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
    data.title = 'Particle'
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
  // callback('removed');
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


var SendData = () => {
  var data = {
     openTabs: openTabs,
     closedTabs: closedTabs,
     _urlVisited: _urlVisited
  };

  fetch('http://localhost:3000/api/testing',
  {
      method: "POST",
      body: JSON.stringify(data)
  })
  .then(function(res){ return res.json(); })
  .then(function(data){ alert( JSON.stringify( data ) ) })
}

var finalRatingArrayFunc = () => {
  chrome.storage.local.get(function(value) {
  console.log(value);
  let date = new Date();
  let timeDown = date.getTime()
  let allTabs = []
  let finalRatingArray = []
  for (let tab = 0; tab < value.openTabs.length; tab++) {
    let tempObj  = Object.assign({}, value.openTabs[tab])
    tempObj.timeDown = timeDown
    tempObj.timeOpen = timeDown - tempObj.timeUp
    allTabs.push(tempObj)
  }
  allTabs = allTabs.concat(value.closedTabs)
  console.log(allTabs);
  // Make a function to get The Values Added and stored in a single Array
  for (let i = 0, len = value._urlVisited.length; i < len; i++) {
    let tempObj = null
    allTabs.map((tab) => {
      // console.log(tab.url === value._urlVisited[i].url);
      if (tab.url === value._urlVisited[i].url) {
        console.log('match');
        if (!tempObj){ tempObj = Object.assign({}, tab) }
        else {
          tempObj.timeActive += tab.timeActive;
          tempObj.timeOpen += tab.timeOpen;
        }
      }
    })
    tempObj.count = value._urlVisited[i].count;
    getRating();
    finalRatingArray.push(tempObj);
  }
  console.log(finalRatingArray);
});
}
