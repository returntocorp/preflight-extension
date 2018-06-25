if (window.browser == null) {
  /* chrome are jerks */ window.browser = window.chrome;
}

const SECARTA_URL = "https://app.secarta.io";
const SECARTA_BADGE_ID = "secarta-score-badge";

const ACCESS_TOKEN_KEY = "access_token";
const EXPIRES_AT_KEY = "expires_at";

const INJECT_CSS_PATH = ".package__sidebarSection___2_OuR";
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
  injectSecartaRightSidebarElem(buildSecartaElem("--"));

  getProjectScore()
    .then(response => {
      switch (response.statusCode) {
        // success
        case 200:
          const score = response.result.score;
          return buildSecartaElem(`${score} pts`, [getScoreClassName(score)]);
        // unauthorized
        case 401:
          // scoreElem.innerHTML = LOCK_ICON;
          // scoreElem.setAttribute(
          //   "title",
          //   "You must be logged in to Secarta to see scores for projects. Click through to log in"
          // );
          return buildSecartaElem("unauthed", ["secarta-locked"]);
        // missing score, which happens if we haven't analyzed the project before
        case 404:
          // scoreElem.innerHTML = OUTDATED_ICON;
          // scoreElem.setAttribute(
          //   "title",
          //   "Couldn't retrieve project score. Click through to trigger analysis"
          // );

          return buildSecartaElem("missing", ["secarta-unanalyzed"]);
        // unknown
        default:
          // scoreElem.innerText = "?";
          // scoreElem.setAttribute(
          //   "title",
          //   "Unknown error. Please try refreshing the page"
          // );
          return buildSecartaElem("?");
      }
    })
    .then(secartaElem => {
      injectSecartaRightSidebarElem(secartaElem);
    });
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
function injectSecartaRightSidebarElem(secartaElem) {
  const existingSecartaElem = document.getElementById(SECARTA_BADGE_ID);

  if (existingSecartaElem) {
    existingSecartaElem.parentElement.replaceChild(
      secartaElem,
      existingSecartaElem
    );
    return secartaElem;
  } else {
    // Get the first matching element, and insert the secarta score before it
    const injectBeforeSite = document.querySelector(INJECT_CSS_PATH);
    const injectedElem = injectBeforeSite.parentNode.insertBefore(
      secartaElem,
      injectBeforeSite
    );

    // NPM adds a w-100 (width 100%) classname to the last child. We add / remove this based on if we've made the number of children even / odd.
    const sideBarElements = document.querySelectorAll(INJECT_CSS_PATH);

    if (sideBarElements.length <= 0) {
      throw "Expected sidebar elements, but found none";
    }

    const length = sideBarElements.length;
    const lastSidebarElement = sideBarElements[length - 1];
    const WIDTH_CLASS = "w-100";
    if (length % 2) {
      // odd number of elements
      lastSidebarElement.classList.add(WIDTH_CLASS);
    } else {
      // even number of elements
      lastSidebarElement.classList.remove(WIDTH_CLASS);
    }

    return injectedElem;
  }
}

/**
 *
 * @param {string} scoreText
 * @param {string[] | null} additionalClasses
 * @returns {HTMLUListElement}
 */
function buildSecartaElem(scoreText, additionalClasses) {
  const secartaClasses = additionalClasses ? additionalClasses : [];
  const npmClasses = [
    "package__sidebarSection___2_OuR",
    "dib",
    "w-50",
    "bb",
    "b--black-10",
    "pr2"
  ];
  const container = buildElemWithClasses(
    "div",
    [].concat(npmClasses, secartaClasses)
  );
  container.id = SECARTA_BADGE_ID;

  container.appendChild(buildH3Elem());
  container.appendChild(buildScoreElem(scoreText));
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
 * @returns {HTMLAnchorElement}
 */
function buildScoreElem(scoreText) {
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
  paragraph.appendChild(buildLinkElem(scoreText));
  return paragraph;
}

function buildLinkElem(scoreText) {
  const npmClasses = [
    "package__sidebarLink___zE7yA",
    "package__sidebarText___n8Z-E",
    "fw6",
    "mb3",
    "mt2",
    "truncate",
    "black-80",
    "f4",
    "link"
  ];
  const link = buildElemWithClasses("a", npmClasses);

  link.innerText = scoreText;
  link.setAttribute("href", buildReportLinkForRepo(PROJECT));
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");

  return link;
  debugger;
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
