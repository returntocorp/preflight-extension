if (window.browser == null) {
  /* chrome are jerks */ window.browser = window.chrome;
}

browser.runtime.onMessage.addListener(function(msg, sender) {
  if (msg.subject === "token") {
    if (msg.access_token) {
      browser.storage.local.set({
        access_token: msg.access_token,
        expires_at: msg.expires_at
      });
    }
  }
});

function onload() {
  // set default click handler
  browser.browserAction.onClicked.addListener(function(tab) {
    var loginURL = "https://app.secarta.io";
    browser.tabs.create({ url: loginURL });
  });
  browser.storage.local.clear();
}

onload();
