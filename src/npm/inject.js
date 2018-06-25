if (window.browser == null) {
  /* chrome are jerks */ window.browser = window.chrome;
}

const SECARTA_URL = "https://app.secarta.io";
const SECARTA_BADGE_ID = "secarta-score-badge";

const ACCESS_TOKEN_KEY = "access_token";
const EXPIRES_AT_KEY = "expires_at";

const INJECT_CSS_PATH = ".package__sidebarSection___2_OuR";
const PACKAGE_NAME_CSS_PATH = "#top > div.w-100.ph0-ns.ph3 > h2 > span";

const RIGHT_SIDEBAR_CLASS = "package__rightSidebar___9dMXo";

function getProjectName() {
  // retrieve the project name every time. NPM is a SPA and the title can change between calls
  return document.querySelector(PACKAGE_NAME_CSS_PATH).innerText;
}

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
      return fetchScore(this.getProjectName(), storage[ACCESS_TOKEN_KEY]);
    })
    .catch(err => {
      console.log(err);
      return { statusCode: 401 };
    });
}

function fetchAndInjectBadge() {
  // N.B. We load our extension for NPM broadly, and must check that the element we mutate exists
  //      The broad loading is to ensure the extension is loaded given NPMs SPA
  const rightSidebar = document.getElementsByClassName(RIGHT_SIDEBAR_CLASS);

  if (rightSidebar.length > 0) {
    // We inject the main body of the badge as soon as possible to avoid visual flicker.
    injectSecartaRightSidebarElem(
      buildSecartaElem("--", [], "Loading score...")
    );

    getProjectScore()
      .then(response => {
        let titleText;
        switch (response.statusCode) {
          // success
          case 200:
            const score = response.result.score;
            return buildSecartaElem(`${score} pts`);
          // unauthorized
          case 401:
            titleText =
              "You must be logged in to Secarta to see scores for projects. Click through to log in";
            return buildSecartaElem(
              "missing login",
              ["secarta-locked"],
              titleText
            );
          // missing score, which happens if we haven't analyzed the project before
          case 404:
            titleText =
              "Couldn't retrieve project score. Click through to trigger analysis";
            return buildSecartaElem("n/a", ["secarta-unanalyzed"], titleText);
          // unknown
          default:
            titleText = "Unknown error. Please try refreshing the page";
            return buildSecartaElem("?", [], titleText);
        }
      })
      .then(secartaElem => {
        injectSecartaRightSidebarElem(secartaElem);
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
 * @param {string | null} titleText
 * @returns {HTMLUListElement}
 */
function buildSecartaElem(scoreText, additionalClasses, titleText) {
  const secartaClasses = additionalClasses ? additionalClasses : [];
  const npmClasses = [
    "package__sidebarSection___2_OuR",
    "dib",
    "w-50",
    "bb",
    "b--black-10",
    "pr2"
  ];
  const secartaElem = buildElemWithClasses(
    "div",
    [].concat(npmClasses, secartaClasses)
  );
  secartaElem.id = SECARTA_BADGE_ID;

  secartaElem.appendChild(buildH3Elem());
  const scoreElem = buildScoreElem(scoreText);

  if (titleText) {
    scoreElem.setAttribute("title", titleText);
  }

  secartaElem.appendChild(scoreElem);
  return secartaElem;
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
  link.setAttribute("href", buildReportLinkForRepo(this.getProjectName()));
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");

  return link;
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

const mutationObserver = new MutationObserver(mutations => {
  const validMutations = mutations.filter(
    mutation => !mutation.target.classList.contains(RIGHT_SIDEBAR_CLASS)
  );

  // If we don't filter the badge mutation we get cyclic behavior and Chrome crashes
  if (validMutations.length > 0) {
    fetchAndInjectBadge();
  }
});

const packageTitle = document.querySelector("main");
if (packageTitle != null) {
  // Ensure badge loads on initial page load
  fetchAndInjectBadge();
  const options = {
    subtree: true,
    childList: true
  };
  mutationObserver.observe(packageTitle, options);
}
