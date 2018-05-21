if (window.browser == null) {
  /* chrome are jerks */ window.browser = window.chrome;
}

browser.runtime.onMessage.addListener(function(msg, sender) {
  console.log("received message");
  console.log(msg);
  if (msg.subject === "token") {
    if (msg.access_token) {
      browser.storage.sync.set(
        {
          access_token: msg.access_token,
          expires_at: msg.expires_at
        },
        resetPopup
      );
    } else {
      browser.storage.sync.remove(["access_token", "expires_at"], resetPopup);
    }
  }
});

function onload() {
  // set default click handler for when we don't have a popup set
  browser.browserAction.onClicked.addListener(function(tab) {
    var loginURL = "https://app.returntocorp.com";
    browser.tabs.create({ url: loginURL });
    browser.storage.sync.clear();
  });
}

function resetPopup() {
  console.log("resetting popup.");
  if (
    browser.storage.sync.get(["access_token", "expires_at"], function(res) {
      if (
        res.access_token !== undefined &&
        new Date().getTime() < res.expires_at
      ) {
        browser.browserAction.setPopup({
          popup: "src/popup/scores_popup.html"
        });
      } else {
        browser.browserAction.setPopup({ popup: "" });
      }
    })
  );
}

onload();
