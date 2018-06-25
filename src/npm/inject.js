if (window.browser == null) {
  /* chrome are jerks */ window.browser = window.chrome;
}

const SECARTA_URL = "https://app.secarta.io";
const SECARTA_BADGE_ID = "secarta-score-badge";
const SECARTA_SCORE_ID = "secarta-score-score";

const LOCK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-4.138 9.975l-1.862-1.836-1.835 1.861-1.13-1.129 1.827-1.86-1.862-1.837 1.129-1.13 1.859 1.827 1.838-1.871 1.139 1.139-1.833 1.86 1.868 1.836-1.138 1.14zm-5.862-9.975v-4c0-2.206 1.795-4 4-4s4 1.794 4 4v4h-8z"/></svg>`;
const OUTDATED_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M8,0 C12.42,0 16,3.58 16,8 C16,12.06 12.98,15.4 9.06,15.92 C9.04,15.92 9.02,15.93 9,15.93 C8.67,15.97 8.34,16 8,16 C3.58,16 0,12.42 0,8 C0,7.45 0.45,7 1,7 C1.55,7 2,7.45 2,8 C2,11.31 4.69,14 8,14 C8.71,14 9.37,13.85 10,13.62 L10,13.63 C12.33,12.81 14,10.61 14,8 C14,4.69 11.31,2 8,2 C6.22,2 4.64,2.78 3.54,4 L5,4 C5.55,4 6,4.45 6,5 C6,5.55 5.55,6 5,6 L1,6 C0.45,6 0,5.55 0,5 L0,1 C0,0.45 0.45,0 1,0 C1.55,0 2,0.45 2,1 L2,2.74 C3.46,1.07 5.6,0 8,0 Z M9,12 L7,12 L7,10 L9,10 L9,12 Z M9,9 L7,9 L7,4 L9,4 L9,9 Z"/></svg>`;

const ACCESS_TOKEN_KEY = "access_token";
const EXPIRES_AT_KEY = "expires_at";

const INJECT_CSS_PATH =
  "#top > div.package__rightSidebar___9dMXo.w-third-ns.mt3.w-100.w-100-m.pt3.ph2.pv0-ns.order-1-ns.order-0 > div:nth-child(4)";
const REPO_NAME_CSS_PATH = "#top > div.w-100.ph0-ns.ph3 > h2 > span";
const REPO_NAME_ELEM = document.querySelector(REPO_NAME_CSS_PATH);
const PROJECT = REPO_NAME_ELEM.innerText;

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
    .catch(err => {
      console.log(err);
      return { statusCode: 401 };
    });
}

function fetchAndInjectBadge() {
  // We inject the main body of the badge as soon as possible to avoid visual flicker.
  const secartaElem = injectSecartaRightSidebarElem();

  if (secartaElem) {
    getProjectScore()
      .then(response => {
        const scoreElem = buildScoreElem();
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
 * @param {string} packageName
 * @param {string} token
 */
function fetchScore(packageName, token) {
  return fetch(buildApiScoreLinkForRepo(packageName), {
    method: "get",
    headers: new Headers({
      Authorization: token
    })
  }).then(response => response.json());
}

/**
 * @returns {HTMLElement | null}
 */
function injectSecartaRightSidebarElem() {
  const secartaElem = document.getElementById(SECARTA_BADGE_ID);

  if (secartaElem) {
    return secartaElem;
  } else {
    const injectBeforeSite = document.querySelector(INJECT_CSS_PATH);
    return injectBeforeSite.parentNode.insertBefore(
      buildContainerElem(),
      injectBeforeSite
    );
  }
}

/**
 * @returns {HTMLUListElement}
 */
function buildContainerElem() {
  const npmClasses = [
    "package__sidebarSection___2_OuR",
    "dib",
    "w-50",
    "bb",
    "b--black-10",
    "pr2"
  ];
  const container = buildElemWithClasses("div", [].concat(npmClasses));
  container.id = SECARTA_BADGE_ID;

  container.appendChild(buildH3Elem());
  container.appendChild(buildScoreElem());
  return container;
}

/**
 * @returns {HTMLAnchorElement}
 */
function buildH3Elem() {
  const npmClasses = [
    "package__sidebarHeader___1IKXc",
    "f5",
    "mt2",
    "pt2",
    "mb0",
    "black-50"
  ];
  const secartaClasses = ["secarta-score-h3"];
  const h3 = buildElemWithClasses("h3", [].concat(npmClasses, secartaClasses));
  h3.innerText = "secarta score";
  return h3;
}

/**
 * The innter text of the element is the score. Can be overwritten.
 * @returns {HTMLAnchorElement}
 */
function buildScoreElem() {
  const npmClasses = [
    "package__sidebarText___n8Z-E",
    "fw6",
    "mb3",
    "mt2",
    "truncate",
    "black-80",
    "f4"
  ];
  const secartaClasses = ["secarta-score-p"];

  const paragraph = buildElemWithClasses(
    "p",
    [].concat(npmClasses, secartaClasses)
  );
  paragraph.id = SECARTA_SCORE_ID;
  paragraph.innerText = "--";
  return paragraph;
}

/**
 * Build an HTML element with the specified classes
 * @param {string} elem
 * @param {string[]} classes
 * @returns {HTMLElement}
 */
function buildElemWithClasses(tag, classes) {
  const elem = document.createElement(tag);
  elem.className = classes.join(" ");
  return elem;
}

/**
 *
 * @param {string} packageName
 * @returns {string}
 */
function buildReportLinkForRepo(packageName) {
  return `${SECARTA_URL}/reports/npm/${packageName}`;
}

/**
 *
 * @param {string} packageName
 * @returns {string}
 */
function buildApiScoreLinkForRepo(packageName) {
  return `${SECARTA_URL}/api/packages/npm/${packageName}/score`;
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

fetchAndInjectBadge();
