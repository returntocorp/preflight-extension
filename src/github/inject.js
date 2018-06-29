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

const ACCESS_TOKEN_KEY = "access_token";

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
    return getBrowserStorage([ACCESS_TOKEN_KEY])
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
        return { statusCode: 500 };
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
          // unauthorized OR project doesn't exist OR unknown error
          default:
            scoreElem.innerText = "?";
            scoreElem.setAttribute(
              "title",
              "Please click to visit Secarta. If this is a private project you likely need to log in or we haven't yet analyzed the project."
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
 * @param {string | null} token
 */
function fetchScore(repoName, token) {
  const requestBody = token
    ? { headers: new Headers({ Authorization: token }) }
    : {};

  return fetch(buildApiScoreLinkForRepo(repoName), requestBody).then(response =>
    response.json()
  );
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
