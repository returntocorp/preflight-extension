chrome.runtime.onMessage.addListener(function (msg, sender) {
  console.log("received message");
  console.log(msg);
  if (msg.subject === 'token') {
    if (msg.access_token) {
      chrome.storage.sync.set({
          'access_token': msg.access_token,
          'expires_at': msg.expires_at
      }, resetPopup);
    } else {
      chrome.storage.sync.remove(['access_token', 'expires_at'], resetPopup);
    }
  }
});

function onload() {
  console.log("bg script");
  // set default click handler for when we don't have a popup set
  chrome.browserAction.onClicked.addListener(function(tab) {
    var loginURL = "localhost:3000";
    chrome.tabs.create({ url: loginURL });
  });
}

function resetPopup() {
  console.log("resetting popup.");
  if (chrome.storage.sync.get(['access_token', 'expires_at'], function(res) {
    console.log("access token is: " + res.access_token);
    console.log("expires_at is: " + res.expires_at);
    if (res.access_token !== undefined && (new Date()).getTime() < res.expires_at) {
      chrome.browserAction.setPopup({popup: "scores_popup.html"});
    } else {
      chrome.browserAction.setPopup({popup: ""});
    }
  }));
}

onload();