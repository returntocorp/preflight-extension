if (window.browser == null) {
  /* chrome are jerks */ window.browser = window.chrome;
}

const SECARTA_BADGE_ID = "secarta-score-badge";
const INJECT_CSS_PATH = "div.repohead-details-container ul.pagehead-actions";
const REPO_NAME_CSS_PATH =
  "#js-repo-pjax-container > div.pagehead.repohead.instapaper_ignore.readability-menu.experiment-repo-nav > div > h1 > strong > a";
const CACHE_STALE_THRESHOLD = 1000 * 60 * 60 * 24; // 1 day
const SECARTA_URL = "https://app.secarta.io";

const SHIELD_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 0c-3.371 2.866-5.484 3-9 3v11.535c0 4.603 3.203 5.804 9 9.465 5.797-3.661 9-4.862 9-9.465v-11.535c-3.516 0-5.629-.134-9-3zm-7 14.535v-2.535h7v-9.456c2.5 1.805 4.554 2.292 7 2.416v7.04h-7v9.643c-5.31-3.278-7-4.065-7-7.108z"/></svg>`;
const LOCK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-4.138 9.975l-1.862-1.836-1.835 1.861-1.13-1.129 1.827-1.86-1.862-1.837 1.129-1.13 1.859 1.827 1.838-1.871 1.139 1.139-1.833 1.86 1.868 1.836-1.138 1.14zm-5.862-9.975v-4c0-2.206 1.795-4 4-4s4 1.794 4 4v4h-8z"/></svg>`;

var repoNameElem = document.querySelector(REPO_NAME_CSS_PATH);
var repoName = repoNameElem.attributes.getNamedItem("href").value.substr(1);

/**
 *
 * @param {string | string[]} param
 * @returns {Promise<any>}
 */
function promisifyBrowserStorageGet(param) {
  return new Promise((resolve, reject) => {
    browser.storage.local.get(param, res => resolve(res));
  });
}

/**
 *
 * @param {string} repoName
 * @returns {Promise<any>}
 */
function fetchCached(repoName) {
  return promisifyBrowserStorageGet([
    "access_token",
    "expires_at",
    "projects"
  ]).then(({ access_token: token, expires_at: expiresAt, projects }) => {
    if (token == null || expiresAt == null) {
      throw new Error("No access_token found");
    }

    const currentDate = new Date();
    const currentRepo = projects != null ? projects[repoName] : null;
    if (
      currentRepo == null ||
      currentRepo.fetched == null ||
      currentDate.valueOf() - currentRepo.fetched > CACHE_STALE_THRESHOLD
    ) {
      console.log("Cache miss, will fetch");
      // Write through cache
      return fetchRepo(repoName, token).then(response => {
        console.log("Received score!", response);
        const fetched = new Date();
        browser.storage.local.set({
          projects: Object.assign({}, projects, {
            [repoName]: {
              score: response,
              fetched: fetched.valueOf()
            }
          })
        });
        return response;
      });
    } else {
      console.log("Found in cache");
      return Promise.resolve(currentRepo.score);
    }
  });
}

function fetchAndInjectBadge() {
  if (document.getElementById(SECARTA_BADGE_ID) == null) {
    fetchCached(repoName)
      .then(response => tryInjectBadge(buildContainer(response)))
      .catch(err => {
        console.warn("couldn't get score breakdown:", err);
        tryInjectBadge(buildContainer(null, err));
      });
  }
}

/**
 *
 * @param {string} repoName
 * @param {string} token
 */
function fetchRepo(repoName, token) {
  return fetch(buildApiScoreLinkForRepo(repoName), {
    method: "get",
    headers: new Headers({
      Authorization: token
    })
  }).then(response => response.json());
}

function tryInjectBadge(payload) {
  if (document.querySelector(`#${SECARTA_BADGE_ID}`) == null) {
    const injectSite = document.querySelector(INJECT_CSS_PATH);
    injectSite.insertAdjacentElement("afterbegin", payload);
  }
}

/**
 *
 * @param {*} response
 * @returns {HTMLUListElement}
 */
function buildContainer(response, err) {
  const container = document.createElement("li");

  container.id = SECARTA_BADGE_ID;
  container.className =
    err == null ? getScoreBucket(response) : "secarta-error";

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
    [].concat(githubClasses, secartaClasses)
  );

  link.innerHTML = `${SHIELD_ICON} Secarta`;
  link.setAttribute("href", buildReportLinkForRepo(repoName));
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");

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
    [].concat(githubClasses, secartaClasses)
  );

  if (response != null) {
    link.innerText = response.success ? response.result.score + " pts" : "?";
  } else {
    link.innerHTML = LOCK_ICON;
    link.setAttribute(
      "title",
      "You must be logged into Secarta to see scores for projects"
    );
  }

  link.setAttribute("href", buildReportLinkForRepo(repoName));
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");

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
  return `${SECARTA_URL}/reports/github.com/${repoName}`;
}

/**
 *
 * @param {string} repoName
 * @returns {string}
 */
function buildApiScoreLinkForRepo(repoName) {
  return `${SECARTA_URL}/api/packages/github.com/${repoName}/score`;
}

/**
 *
 * @param {*} response
 * @returns {string}
 */
function getScoreBucket(response) {
  if (
    response != null &&
    response.result != null &&
    response.result.score != null
  ) {
    const score = response.result.score;
    if (score > 75) {
      return "score-good";
    } else if (score < 40) {
      return "score-bad";
    } else {
      return "score-average";
    }
  } else {
    return "score-indeterminate";
  }
}

var observer = new MutationObserver(() => fetchAndInjectBadge());
var applicationMainNode = document.getElementsByClassName(
  "application-main"
)[0];

if (applicationMainNode != null) {
  var config = { childList: true, subtree: true };
  observer.observe(applicationMainNode, config);

  // Ensure badge loads on initial page load
  fetchAndInjectBadge();
}
