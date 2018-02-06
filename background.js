var openTabs = []
var closedTabs = []
var _urlVisited = []
var _activeTabId = null
var _activated = 0

var callback = (activeInfo) => {
  console.log(activeInfo);
  console.log(openTabs);
  console.log(_activeTabId, _activated);
}

// callback('init');

var l = (stuff) => {
  console.log(stuff);
}

chrome.tabs.onCreated.addListener((tab) => {
  var date = new Date();
  tab.timeUp = date.getTime()
  tab.timeOpen = 0
  tab.timeActive = 0
  tab.title = 'Particle'
  _activeTabId = tab.id
  _activated = date.getTime()
  openTabs.push(tab)
  callback('created');
})

chrome.tabs.onUpdated.addListener((tabId, data) => {
  var date = new Date();
  console.log(tabId);
  let timeDown = date.getTime()
  let obj = openTabs.find(o => o.id === tabId);
  let index = openTabs.indexOf(obj);
  if (index > -1) {
      if (data.url && data.url !== 'chrome://newtab/' && data.url !== obj.url) {
        let temp = Object.assign({}, obj)
        obj.url = data.url
        obj.timeActive = 0
        obj.title = data.title ? data.title : obj.title
        temp.timeDown = timeDown
        temp.timeOpen = timeDown - temp.timeUp
        closedTabs.push(temp)
      } else if (data.url && data.url !== 'chrome://newtab/') {
        obj.timeUp = date.getTime()
        obj.title = data.title ? data.title : obj.title
        // obj.tiem
        obj.url = data.url ? data.url : obj.url
      }
    openTabs[index] = obj
    callback('updated');
  } else {
    var date = new Date();
    tab.timeUp = date.getTime()
    tab.timeOpen = 0
    tab.timeActive = 0
    tab.title = 'Particle'
    _activeTabId = tab.id
    _activated = date.getTime()
    openTabs.push(tab)
    callback('added');
  }
})

chrome.tabs.onRemoved.addListener((tabId) => {
  var date = new Date();
  console.log(tabId);
  let timeDown = date.getTime()
  let obj = openTabs.find(o => o.id === tabId);
  let index = openTabs.indexOf(obj);
  if (index > -1) {
    openTabs.splice(index, 1);
    console.log(index, obj);
    obj.timeDown = timeDown
    obj.timeOpen = timeDown - obj.timeUp
    closedTabs.push(obj)
}
  // callback('removed');
})

// chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
//   console.log(tabs, 'query');
//   let obj = openTabs.find(o => o.id === tabs.tabId);
// });

chrome.tabs.onActivated.addListener(function(tabs){
  console.log(tabs, 'active');
  let date = new Date();
  let time = date.getTime();
  let obj = openTabs.find(o => o.id === _activeTabId);
  if (_activeTabId !== tabs.tabId) {
    if (obj) {
      obj.timeActive += (date.getTime() - _activated)
    }
    _activated = time
    _activeTabId = tabs.tabId
    console.log(obj);
    // callback('activated');
  }
  // setTimeout(() => {
  //
  // },1000)

})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(openTabs);
    var tabArray = []
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      var date = new Date()
      if (tabArray.includes(tabs[0].id)) {
        tabArray.push({
          id: tabs[0].id,
          date: date.getTime()
        })
      }
    });
    // var callback = (activeInfo) => {
    //   console.log(activeInfo);
    //   console.log(openTabs);
    // }
    // chrome.tabs.onActivated.addListener(callback)
    // chrome.tabs.onHighlighted.addListener(callback)
    console.log(tabArray);
    var arrHeader = [];
    var arrPara = [];
    console.log(request);
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
    // console.log(arrHeader.join(''));
  function saveChanges() {
  // Get a value saved in a form.
  var theValue = arrHeader.join('');
  // Check that there's some code there.
  if (!theValue) {
    message('Error: No value specified');
    return;
  }
  // Save it using the Chrome extension storage API.
  chrome.storage.sync.set({'value': theValue}, function() {
    // Notify that we saved.
    l('Settings saved');
  });
}
  saveChanges();
  });
