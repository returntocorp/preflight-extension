var project_name_element = document.querySelector('#js-repo-pjax-container > div.pagehead.repohead.instapaper_ignore.readability-menu.experiment-repo-nav > div > h1 > strong > a')
var project_name = project_name_element.attributes.getNamedItem("href").value.substr(1)

chrome.storage.sync.get(['access_token', 'expires_at'], function(res) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "http://127.0.0.1:3000/api/packages/repos/github.com/" + project_name + "/badge", true);
  
  xhttp.onload = function (e) {
    if (xhttp.readyState === 4) {
      if (xhttp.status === 200) {        
        var badge = makeBadgeElem();
        badge.innerHTML = `<img src='data:image/svg+xml;utf8,${xhttp.responseText}' />`;
        injectElem(badge);
      } else {
        var elem;
        if (xhttp.status === 401) {
          console.error("You need to be logged in to see the Secarta badge for this project");
          elem = makeFailureElem("Badge fetch error. Log in?");
        } else {
          console.error("Badge fetch error. Analyzed?");
          elem = makeFailureElem("Badge fetch error. Analyzed?");
        }
         
        injectElem(elem);
      }
    }
  };

  xhttp.setRequestHeader("Authorization", res.access_token)
  xhttp.send(null);
});


function injectElem(elem) {
  injection_element = document.querySelector('.repohead-details-container.clearfix.container > h1')
  injection_element.insertAdjacentElement('afterEnd', elem);
  console.log("injected into");
  console.log(injection_element);
}

function makeBadgeElem() {
  var badge = document.createElement('a');
  badge.href = `http://127.0.0.1:3000/reports/repos/github.com/${project_name}`;
  badge.className = "button special-plugin-button";
  badge.style.marginLeft = "10px";
  return badge;
}

function makeFailureElem(text) {
  var elem = document.createElement('div');
  elem.style.marginLeft = "10px";
  elem.innerHTML = `${text}`;
  return elem;
}