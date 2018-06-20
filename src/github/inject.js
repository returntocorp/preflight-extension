if (window.browser == null) {
  /* chrome are jerks */ window.browser = window.chrome;
}

const SECARTA_BADGE_ID = "secarta-score-badge";
const SECARTA_SCORE_ID = "secarta-score-score";

const INJECT_CSS_PATH = "div.repohead-details-container ul.pagehead-actions";
const REPO_NAME_CSS_PATH =
  "#js-repo-pjax-container > div.pagehead.repohead.instapaper_ignore.readability-menu.experiment-repo-nav > div > h1 > strong > a";

const SECARTA_URL = "https://app.secarta.io";

const SHIELD_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 0c-3.371 2.866-5.484 3-9 3v11.535c0 4.603 3.203 5.804 9 9.465 5.797-3.661 9-4.862 9-9.465v-11.535c-3.516 0-5.629-.134-9-3zm-7 14.535v-2.535h7v-9.456c2.5 1.805 4.554 2.292 7 2.416v7.04h-7v9.643c-5.31-3.278-7-4.065-7-7.108z"/></svg>`;
const LOCK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-4.138 9.975l-1.862-1.836-1.835 1.861-1.13-1.129 1.827-1.86-1.862-1.837 1.129-1.13 1.859 1.827 1.838-1.871 1.139 1.139-1.833 1.86 1.868 1.836-1.138 1.14zm-5.862-9.975v-4c0-2.206 1.795-4 4-4s4 1.794 4 4v4h-8z"/></svg>`;

const ACCESS_TOKEN_KEY = "access_token";
const EXPIRES_AT_KEY = "expires_at";

const REPO_NAME_ELEM = document.querySelector(REPO_NAME_CSS_PATH);
const PROJECT = REPO_NAME_ELEM.attributes.getNamedItem("href").value.substr(1);

// We cache the score to reduce jitter / flicker as users navigate around the GitHub project page
var CACHED_SCORE = undefined;

/**
 *
 * @param {string | string[]} param
 * @returns {Promise<any>}
 */
function getBrowserStorage(param) {
  return new Promise((resolve, reject) => {
    browser.storage.local.get(param, res => resolve(res));
  });
}

/**
 * @returns {Promise<number>}
 */
function getProjectScore() {
  if (CACHED_SCORE) {
    return Promise.resolve(CACHED_SCORE);
  } else {
    return getBrowserStorage([ACCESS_TOKEN_KEY, EXPIRES_AT_KEY])
      .then(storage => {
        if (
          storage[ACCESS_TOKEN_KEY] == null ||
          storage[EXPIRES_AT_KEY] == null
        ) {
          throw new Error("missing Secarta access_token, log in to Secarta");
        } else if (storage[EXPIRES_AT_KEY] < new Date().getTime()) {
          throw new Error("expired Secarta access_token");
        }
        return storage;
      })
      .then(storage => {
        return fetchSecartaScore(PROJECT, storage[ACCESS_TOKEN_KEY]);
      })
      .then(response => {
        if (response.success) {
          var score;
          score = CACHED_SCORE = response.result.score;
          return score;
        } else {
          throw new Error("invalid response");
        }
      });
  }
}

function fetchAndInjectBadge() {
  // We inject the main body of the badge as soon as possible to avoid visual flicker.
  const secartaElem = injectSecartaPageHeadActionElem();

  if (secartaElem) {
    const existingScoreElem = document.getElementById(SECARTA_SCORE_ID);

    getProjectScore()
      .then(score => {
        secartaElem.className = getScoreClassName(score);
        const scoreElem = buildCountElem();
        scoreElem.innerText = score + " pts";
        secartaElem.replaceChild(scoreElem, existingScoreElem);
      })
      .catch(err => {
        secartaElem.className = "secarta-error";
        const scoreElem = buildCountElem();
        scoreElem.innerHTML = LOCK_ICON;
        secartaElem.replaceChild(scoreElem, existingScoreElem);

        // TODO (dlukeomalley): This title is misleading because we may be catching errors that aren't just auth related
        scoreElem.setAttribute(
          "title",
          "You must be logged into Secarta to see scores for projects"
        );

        console.warn(err);
      });
  }
}

/**
 * @param {string} repoName
 * @param {string} token
 */
function fetchSecartaScore(repoName, token) {
  return fetch(buildApiScoreLinkForRepo(repoName), {
    method: "get",
    headers: new Headers({
      Authorization: token
    })
  }).then(response => response.json());
}

/**
 * @returns {HTMLElement | null}
 */
function injectSecartaPageHeadActionElem() {
  const secartaElem = document.getElementById(SECARTA_BADGE_ID);

  if (secartaElem) {
    return secartaElem;
  } else {
    const injectSite = document.querySelector(INJECT_CSS_PATH);
    return injectSite.insertAdjacentElement("afterbegin", buildContainerElem());
  }
}

/**
 * @returns {HTMLUListElement}
 */
function buildContainerElem() {
  const container = document.createElement("li");
  container.id = SECARTA_BADGE_ID;
  container.appendChild(buildButtonElem());
  container.appendChild(buildCountElem());
  return container;
}

/**
 * @returns {HTMLAnchorElement}
 */
function buildButtonElem() {
  const githubClasses = ["btn", "btn-sm", "btn-with-count"];
  const secartaClasses = ["secarta-score-button"];

  const link = buildElemWithClasses(
    "a",
    [].concat(githubClasses, secartaClasses)
  );

  link.innerHTML = `${SHIELD_ICON} Secarta`;
  link.setAttribute("href", buildReportLinkForRepo(PROJECT));
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");

  return link;
}

/**
 * @returns {HTMLAnchorElement}
 */
function buildCountElem() {
  const githubClasses = ["social-count"];
  const secartaClasses = ["secarta-score-count"];

  const link = buildElemWithClasses(
    "a",
    [].concat(githubClasses, secartaClasses)
  );

  link.setAttribute("href", buildReportLinkForRepo(PROJECT));
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");
  link.id = SECARTA_SCORE_ID;
  link.innerText = "--";

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
function getScoreClassName(score) {
  if (score > 75) {
    return "score-good";
  } else if (score < 40) {
    return "score-bad";
  } else {
    return "score-average";
  }
}

const mutationObserver = new MutationObserver(mutations => {
  const validMutations = mutations.filter(
    mutation =>
      mutation.target.id != SECARTA_BADGE_ID &&
      mutation.target.id != SECARTA_SCORE_ID
  );

  // If we don't filter the badge mutation we get cyclic behavior and Chrome crashes
  if (validMutations.length > 0) {
    fetchAndInjectBadge();
  }
});

const mainNode = document.querySelector(".application-main");

if (mainNode != null) {
  // Ensure badge loads on initial page load
  fetchAndInjectBadge();

  const options = {
    subtree: true,
    childList: true
  };

  mutationObserver.observe(mainNode, options);
}
