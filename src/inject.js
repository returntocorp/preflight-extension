var project_name_element = document.querySelector(
  "#js-repo-pjax-container > div.pagehead.repohead.instapaper_ignore.readability-menu.experiment-repo-nav > div > h1 > strong > a"
);
var project_name = project_name_element.attributes
  .getNamedItem("href")
  .value.substr(1);

var badge_html;

browser.storage.sync.get(["access_token", "expires_at"], function(res) {
  var badge_xhr = new XMLHttpRequest();
  badge_xhr.open(
    "GET",
    "https://app.returntocorp.com/api/packages/github.com/" +
      project_name +
      "/badge",
    true
  );

  var score_xhr = new XMLHttpRequest();
  score_xhr.open(
    "GET",
    "https://app.returntocorp.com/api/packages/github.com/" +
      project_name +
      "/score",
    true
  );

  badge_xhr.onload = function(e) {
    if (badge_xhr.readyState === 4) {
      if (badge_xhr.status === 200) {
        var badge = makeBadgeElem();
        badge.innerHTML = `<img src='data:image/svg+xml;utf8,${
          badge_xhr.responseText
        }' />`;
        injectElem(badge);
        badge_html = badge.outerHTML;

        // add badge to storage for popup
        browser.storage.sync.set({ badge_html: badge.outerHTML });

        // also grab score for popup
        score_xhr.setRequestHeader("Authorization", res.access_token);
        score_xhr.send(null);
      } else {
        handleFailure(badge_xhr.status);
      }
    }
  };

  score_xhr.onload = function(e) {
    if (score_xhr.readyState === 4) {
      if (score_xhr.status === 200) {
        console.log("got responseText:");
        console.log(score_xhr.responseText);

        browser.storage.sync.set(
          {
            project_name: project_name,
            score: JSON.parse(score_xhr.responseText).result
          },
          function() {
            console.log("set the score in storage.");
          }
        );
      } else {
        console.error("error getting score breakdown");
        browser.storage.sync.remove("score");
      }
    }
  };

  badge_xhr.setRequestHeader("Authorization", res.access_token);
  badge_xhr.send(null);
});

function injectElem(elem) {
  injection_element = document.querySelector(
    ".repohead-details-container.clearfix.container > h1"
  );
  injection_element.insertAdjacentElement("afterEnd", elem);
  console.log("injected into");
  console.log(injection_element);
}

function makeBadgeElem() {
  var badge = document.createElement("a");
  badge.href = `https://app.returntocorp.com/reports/repos/github.com/${project_name}`;
  badge.className = "button special-plugin-button";
  badge.style.marginLeft = "10px";
  return badge;
}

// unsafe!
function makeFailureElem(text) {
  var elem = document.createElement("div");
  elem.style.marginLeft = "10px";
  elem.innerHTML = text;
  return elem;
}

function handleFailure(status) {
  var elem;
  if (status === 401) {
    console.error(
      "You need to be logged in to see the Secarta badge for this project"
    );
    elem = makeFailureElem("Badge fetch error. Log in?");
  } else {
    console.error("Badge fetch error. Analyzed?");
    elem = makeFailureElem("Badge fetch error. Analyzed?");
  }

  browser.storage.sync.remove(["score", "project_name"]);
  injectElem(elem);
}
