if (window.browser == null) {
  /* chrome are jerks */ window.browser = window.chrome;
}

const GITHUB_APPLICATION_MAIN_DIV = "div.application-main";

const R2C_VOTING_CONTAINER_ID = "r2c-voting-container";

const R2C_LOGO = `<svg width="89" height="114" viewBox="0 0 89 114" xmlns="http://www.w3.org/2000/svg">
<path d="M81.7731 111.834L22.7645 71.0697H54.0238C68.8246 71.0697 81.3898 58.8058 81.3898 43.5981C81.3898 28.5684 70.1037 16.1266 54.0238 16.1266H34.323L29.0264 21.4437L34.323 26.7607H54.0238C63.9901 26.7607 70.7965 34.1739 70.7965 43.5981C70.7965 52.8504 63.0565 60.4355 54.0238 60.4355H2.823V71.1242L62.7517 111.834H81.7731Z"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M34.323 16.1266H54.0238C70.1037 16.1266 81.3898 28.5684 81.3898 43.5981C81.3898 58.8058 68.8246 71.0697 54.0238 71.0697H22.7645L81.7731 111.834H62.7517L2.823 71.1242V60.4355H54.0238C63.0565 60.4355 70.7965 52.8504 70.7965 43.5981C70.7965 34.1739 63.9901 26.7607 54.0238 26.7607H34.323L29.0264 21.4437L34.323 16.1266ZM29.1784 73.0697L88.187 113.834H62.1366L0.822998 72.1834V58.4355H54.0238C61.9589 58.4355 68.7965 51.7388 68.7965 43.5981C68.7965 35.2251 62.833 28.7607 54.0238 28.7607H33.4923L26.2034 21.4437L33.4923 14.1266H54.0238C71.2683 14.1266 83.3898 27.5249 83.3898 43.5981C83.3898 59.9196 69.9199 73.0697 54.0238 73.0697H29.1784Z"/>
<path d="M2.823 21.6326L21.5494 2.83389L26.5431 7.84687L7.81671 26.6456L2.823 21.6326Z"/>
<path d="M7.81673 16.6196L26.5432 35.4183L21.5494 40.4313L2.823 21.6326L7.81673 16.6196Z"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M0 21.6326L21.5494 0L29.3661 7.84687L15.6334 21.6326L29.3662 35.4183L21.5494 43.2652L0 21.6326ZM2.823 21.6326L21.5494 40.4313L26.5432 35.4183L12.8104 21.6326L26.5431 7.84687L21.5494 2.83389L2.823 21.6326Z"/>
</svg>`;

const R2C_PRIVATE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-10-4c0-2.206 1.794-4 4-4s4 1.794 4 4v4h-8v-4zm11 16h-14v-10h14v10z"/></svg>`;

const R2C_VOTING_ICONS = {
  up: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>`,
  down: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"/></svg>`,
  question: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14.601 21.5c0 1.38-1.116 2.5-2.499 2.5-1.378 0-2.499-1.12-2.499-2.5s1.121-2.5 2.499-2.5c1.383 0 2.499 1.119 2.499 2.5zm-2.42-21.5c-4.029 0-7.06 2.693-7.06 8h3.955c0-2.304.906-4.189 3.024-4.189 1.247 0 2.57.828 2.684 2.411.123 1.666-.767 2.511-1.892 3.582-2.924 2.78-2.816 4.049-2.816 7.196h3.943c0-1.452-.157-2.508 1.838-4.659 1.331-1.436 2.986-3.222 3.021-5.943.047-3.963-2.751-6.398-6.697-6.398z"/></svg>`
};

/**
 * @returns {{ domain: string, org: string, repo: string, pathname: string, rest: string }}
 */
function extractSlugFromCurrentUrl() {
  const { hostname: domain, pathname } = document.location;
  const [_, org, repo, ...rest] = pathname.split("/");
  return { domain, org, repo, pathname, rest: rest.join("/") };
}

/**
 * @returns {string | undefined}
 */
function extractGitHubUserFromPage() {
  const userLoginMetaTags = document.getElementsByName("user-login");

  if (userLoginMetaTags.length == 0) {
    return undefined;
  }

  return userLoginMetaTags[0].getAttribute("content") || undefined;
}

/**
 * @param {{ source: string, medium: string, content: string }} utm
 */
function buildVotingUrl({ source, medium, content }) {
  const { domain, org, repo } = extractSlugFromCurrentUrl();
  const params = new URLSearchParams({ source, medium, content });
  return `https://api.secarta.io/v1/vote/${domain}/${org}/${repo}?${params}`;
}

/**
 *
 * @param {string} user
 */
function buildExtensionHeaders(user) {
  return user != null ? { "X-Secarta-GitHub-User": user } : undefined;
}

/**
 *
 * @param {"succeeded" | "failed"} animationType
 * @param {"up" | "down" | "question"} vote
 * @param {* | undefined} error
 */
function handleVoteAnimation(animationType, vote, error) {
  clearAllVoteState();

  const voteButtons = document.getElementsByClassName(`vote-${vote}`);

  if (voteButtons.length == 0) {
    console.error(`Couldn't find vote button corresponding to ${vote}`);
  } else {
    const voteButton = voteButtons[0];
    const voteAnimationClass = `vote-${animationType}`;
    voteButton.classList.add(voteAnimationClass);

    const votedText = buildElemWithClasses("div", ["voted-text"]);

    if (error != null) {
      votedText.innerText = "Couldn't vote";
    } else {
      votedText.innerText = "Voted";
    }

    voteButton.querySelector(".vote-icon").appendChild(votedText);

    voteButton.addEventListener(
      "animationend",
      e => {
        e.preventDefault();
        setTimeout(() => {
          if (votedText != null) {
            voteButton.querySelector(".vote-icon").removeChild(votedText);
          }
        }, 1500);
      },
      { once: true }
    );

    if (error) {
      console.error("Couldn't vote:", error);
    }
  }
}

function clearAllVoteState() {
  document
    .querySelectorAll(".secarta-vote-button")
    .forEach(node => node.classList.remove("vote-success"));
}

function updateVoteCounts(voteCounts) {
  for (let key in voteCounts) {
    const voteCount = voteCounts[key];
    const voteButtonCounter = document.querySelector(
      `.vote-${key} .vote-count`
    );

    if (voteButtonCounter != null) {
      voteButtonCounter.innerText = voteCount;
    }
  }
}

/**
 * @param {"up" | "down" | "question"} vote
 * @param {string} user
 */
function submitVote(vote, user) {
  return e => {
    e.preventDefault();
    const body = {
      vote,
      user
    };

    const headers = buildExtensionHeaders(user);
    fetch(buildVotingUrl(getAnalyticsParams()), {
      method: "POST",
      body: JSON.stringify(body),
      headers
    })
      .then(response => {
        if (!response.ok) {
          handleVoteAnimation("failed", vote, response.status);
        } else {
          response.json().then(response => {
            handleVoteAnimation("success", vote);
            updateVoteCounts(response.votes);
          });
        }
      })
      .catch(e => handleVoteAnimation("failed", vote, e));
  };
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

  if (textContent != null) {
    elem.innerText = textContent;
  }

  return elem;
}

/**
 *
 * @param {"up" | "down" | "question"} vote
 * @param {number} count
 * @returns {HTMLAnchorElement}
 */
function buildVoteButton(vote, count) {
  const user = extractGitHubUserFromPage();
  const { org, repo } = extractSlugFromCurrentUrl();
  const button = buildElemWithClasses("a", [
    "secarta-vote-button",
    `vote-${vote}`
  ]);
  button.setAttribute("title", `${vote}vote ${org}/${repo}`);

  const iconContainer = buildElemWithClasses("div", ["vote-icon"]);
  iconContainer.innerHTML = `${R2C_VOTING_ICONS[vote]}`;
  button.appendChild(iconContainer);

  const voteCount = buildElemWithClasses("div", ["vote-count"]);
  voteCount.innerText = count.toFixed(0);
  button.appendChild(voteCount);

  button.onclick = submitVote(vote, user);
  button.setAttribute("href", "javascript:;");
  return button;
}

/**
 *
 * @param {"up" | "down" | "question"} vote
 * @returns {HTMLAnchorElement}
 */
function buildR2CButton(vote) {
  const button = buildElemWithClasses("a", ["r2c-button"]);
  button.setAttribute("title", `R2C homepage`);
  button.innerHTML = R2C_LOGO;
  button.setAttribute("href", "https://returntocorp.com");
  return button;
}

function isRepositoryPrivate() {
  const private = document.querySelector("h1.private");
  return private != null;
}

/**
 * @returns {{ source: string, medium: string, content: string }}
 */
function getAnalyticsParams() {
  return {
    source: document.location.toString(),
    medium: "extension",
    content: "voting-checkcross-newcolors"
  };
}

/**
 * @param {{ domain: string, org: string, repo: string }}
 * @returns {Promise<{ votes: {[voteType: string]: number} }>}
 */
function getVotesForProject({ domain, org, repo }) {
  const votesUrl = buildVotingUrl(getAnalyticsParams());
  return fetch(votesUrl, {
    headers: buildExtensionHeaders(extractGitHubUserFromPage())
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw response;
    }
  });
}

/**
 * @returns {HTMLDivElement}
 */
function buildVoteContainerElem() {
  const container = document.createElement("div");
  container.id = R2C_VOTING_CONTAINER_ID;
  container.appendChild(buildR2CButton());

  if (isRepositoryPrivate()) {
    const lockIcon = buildElemWithClasses("a", [
      "r2c-button",
      "button-private-repository"
    ]);
    lockIcon.innerHTML = `${R2C_PRIVATE_ICON} Private repository`;
    lockIcon.setAttribute("href", "javascript:;");
    container.appendChild(lockIcon);
  } else {
    getVotesForProject(extractSlugFromCurrentUrl()).then(response => {
      container.appendChild(buildVoteButton("up", response.votes.up));
      container.appendChild(buildVoteButton("down", response.votes.down));
      container.appendChild(
        buildVoteButton("question", response.votes.question)
      );
    });
  }

  return container;
}

const mainDiv = document.querySelector("body");
const votingButtons = document.querySelector(`#${R2C_VOTING_CONTAINER_ID}`);

if (mainDiv != null) {
  const container = buildVoteContainerElem();
  if (votingButtons == null) {
    mainDiv.appendChild(container);
  } else {
    mainDiv.replaceChild(container);
  }
}
