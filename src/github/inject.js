console.log("Injecting");

const SECARTA_BADGE_ID = "secarta-score-badge";
const INJECT_CSS_PATH = "div.repohead-details-container ul.pagehead-actions";
const REPO_NAME_CSS_PATH =
  "#js-repo-pjax-container > div.pagehead.repohead.instapaper_ignore.readability-menu.experiment-repo-nav > div > h1 > strong > a";

var repoNameElem = document.querySelector(REPO_NAME_CSS_PATH);
var repoName = repoNameElem.attributes.getNamedItem("href").value.substr(1);

browser.storage.sync.get(["access_token", "expires_at"]).then(res => {
  console.log("Starting fetch");
  fetch(buildApiScoreLinkForRepo(repoName), {
    method: "get",
    headers: new Headers({
      Authorization: res.access_token
    })
  })
    .then(response => response.json())
    .then(response => {
      console.log("Received score!", response);
      browser.storage.sync.get("projects").then(prevState =>
        browser.storage.sync.set({
          projects: {
            ...prevState.projects,
            [repoName]: {
              score: response
            }
          }
        })
      );

      return response;
    })
    .then(response => tryInjectBadge(response))
    .catch(err => {
      console.error("error getting score breakdown", err);
      browser.storage.sync.remove("score");
    });
});

function tryInjectBadge(response) {
  if (document.querySelector(`#${SECARTA_BADGE_ID}`) == null) {
    const injectSite = document.querySelector(INJECT_CSS_PATH);
    const payload = buildContainer(response);
    injectSite.insertAdjacentElement("afterbegin", payload);
  }
}

/**
 *
 * @param {*} response
 * @returns {HTMLUListElement}
 */
function buildContainer(response) {
  const container = document.createElement("li");

  container.id = SECARTA_BADGE_ID;
  container.appendChild(buildButton(response));
  container.appendChild(buildCount(response));

  return container;
}

/**
 *
 * @param {*} response
 * @returns {HTMLAnchorElement}
 */
function buildButton(response) {
  const githubClasses = ["btn", "btn-sm", "btn-with-count"];
  const secartaClasses = ["secarta-injected-button", "secarta-score-button"];

  const link = buildElemWithClasses(
    "a",
    [...githubClasses, ...secartaClasses],
    "Secarta"
  );

  link.setAttribute("href", buildReportLinkForRepo(repoName));

  return link;
}

/**
 * @param {*} response
 * @returns {HTMLAnchorElement}
 */
function buildCount(response) {
  const githubClasses = ["social-count"];
  const secartaClasses = ["secarta-injected-count", "secarta-score-count"];

  const link = buildElemWithClasses(
    "a",
    [...githubClasses, ...secartaClasses],
    response.success ? response.result.score : "?"
  );

  link.setAttribute("href", buildReportLinkForRepo(repoName));

  return link;
}

/**
 * Build an HTML element with the specified classes
 * @param {string} elem
 * @param {string[]} classes
 * @param {string} textContent
 * @returns {HTMLElement}
 */
function buildElemWithClasses(tag, classes, textContent) {
  const elem = document.createElement(tag);
  elem.className = classes.join(" ");
  elem.innerText = textContent;
  return elem;
}

/**
 *
 * @param {string} repoName
 * @returns {string}
 */
function buildReportLinkForRepo(repoName) {
  return `https://app.returntocorp.com/reports/github.com/${repoName}`;
}

/**
 *
 * @param {string} repoName
 * @returns {string}
 */
function buildApiScoreLinkForRepo(repoName) {
  return `https://app.returntocorp.com/api/packages/github.com/${repoName}/score`;
}

// function makeBadgeElem() {
//   var badge = document.createElement("a");
//   badge.href = `https://app.returntocorp.com/reports/github.com/${repoName}`;
//   badge.className = "button special-plugin-button";
//   badge.style.marginLeft = "10px";
//   return badge;
// }

// // unsafe!
// function makeFailureElem(text) {
//   var elem = document.createElement("div");
//   elem.style.marginLeft = "10px";
//   elem.innerHTML = text;
//   return elem;
// }

// function handleFailure(status) {
//   var elem;
//   if (status === 401) {
//     console.error(
//       "You need to be logged in to see the Secarta badge for this project"
//     );
//     elem = makeFailureElem("Badge fetch error. Log in?");
//   } else {
//     console.error("Badge fetch error. Analyzed?");
//     elem = makeFailureElem("Badge fetch error. Analyzed?");
//   }

//   browser.storage.sync.remove(["score", "repoName"]);
//   injectElem(elem);
// }
