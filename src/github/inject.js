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
const OUTDATED_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M8,0 C12.42,0 16,3.58 16,8 C16,12.06 12.98,15.4 9.06,15.92 C9.04,15.92 9.02,15.93 9,15.93 C8.67,15.97 8.34,16 8,16 C3.58,16 0,12.42 0,8 C0,7.45 0.45,7 1,7 C1.55,7 2,7.45 2,8 C2,11.31 4.69,14 8,14 C8.71,14 9.37,13.85 10,13.62 L10,13.63 C12.33,12.81 14,10.61 14,8 C14,4.69 11.31,2 8,2 C6.22,2 4.64,2.78 3.54,4 L5,4 C5.55,4 6,4.45 6,5 C6,5.55 5.55,6 5,6 L1,6 C0.45,6 0,5.55 0,5 L0,1 C0,0.45 0.45,0 1,0 C1.55,0 2,0.45 2,1 L2,2.74 C3.46,1.07 5.6,0 8,0 Z M9,12 L7,12 L7,10 L9,10 L9,12 Z M9,9 L7,9 L7,4 L9,4 L9,9 Z"/></svg>`;

const ACCESS_TOKEN_KEY = "access_token";
const EXPIRES_AT_KEY = "expires_at";

const REPO_NAME_ELEM = document.querySelector(REPO_NAME_CSS_PATH);
const PROJECT = REPO_NAME_ELEM.attributes.getNamedItem("href").value.substr(1);

// We cache the score response to reduce jitter / flicker as users navigate around the GitHub project page
let CACHED_SCORE_RESPONSE = undefined;

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
 * @returns {Promise<any>}
 */
function getProjectScore() {
  if (CACHED_SCORE_RESPONSE) {
    return Promise.resolve(CACHED_SCORE_RESPONSE);
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
        return fetchScore(PROJECT, storage[ACCESS_TOKEN_KEY]);
      })
      .then(response => {
        // true if score is present or analysis is in progress
        if (response.success) {
          CACHED_SCORE_RESPONSE = response;
        }
        return response;
      })
      .catch(err => {
        console.log(err);
        return { statusCode: 401 };
      });
  }
}

function fetchAndInjectBadge() {
  // We inject the main body of the badge as soon as possible to avoid visual flicker.
  const secartaElem = injectSecartaPageHeadActionElem();

  if (secartaElem) {
    getProjectScore()
      .then(response => {
        const scoreElem = buildCountElem();

        switch (response.statusCode) {
          // success
          case 200:
            const score = response.result.score;
            scoreElem.innerText = `${score} pts`;
            return {
              scoreElem,
              secartaElemClassName: getScoreClassName(score)
            };
          // unauthorized
          case 401:
            scoreElem.innerHTML = LOCK_ICON;
            scoreElem.setAttribute(
              "title",
              "You must be logged in to Secarta to see scores for projects. Click through to log in"
            );
            return {
              scoreElem,
              secartaElemClassName: "secarta-locked"
            };
          // missing score, which happens if we haven't analyzed the project before
          case 404:
            scoreElem.innerHTML = OUTDATED_ICON;
            scoreElem.setAttribute(
              "title",
              "Couldn't retrieve project score. Click through to trigger analysis"
            );
            return {
              scoreElem,
              secartaElemClassName: "secarta-unanalyzed"
            };
          // unknown
          default:
            scoreElem.innerText = "?";
            scoreElem.setAttribute(
              "title",
              "Unknown error. Please try refreshing the page"
            );
            return {
              scoreElem,
              secartaElemClassName: ""
            };
        }
      })
      .then(({ scoreElem, secartaElemClassName }) => {
        // N.B. Calling #getElementById immediately before #replaceChild reduces the number of #replaceChild failures,
        //      likely because of how GitHub reloads the project page
        secartaElem.replaceChild(
          scoreElem,
          document.getElementById(SECARTA_SCORE_ID)
        );
        secartaElem.className = secartaElemClassName;
      });
  }
}

/**
 * @param {string} repoName
 * @param {string} token
 */
function fetchScore(repoName, token) {
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
