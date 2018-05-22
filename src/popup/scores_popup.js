if (window.browser == null) {
  /* chrome are jerks */ window.browser = window.chrome;
}

function promisifyTabsQuery() {
  return new Promise((resolve, reject) => {
    browser.tabs.query({ active: true, currentWindow: true }, tabs =>
      resolve(tabs)
    );
  });
}

onload = function() {
  promisifyTabsQuery()
    .then(tabs => {
      return Promise.all([
        Promise.resolve(tabs),
        new Promise((resolve, reject) =>
          browser.storage.local.get(
            ["access_token", "expires_at", "projects"],
            results => resolve(results)
          )
        )
      ]);
    })
    .then(([tabs, store]) => [
      tabs,
      store.projects,
      store.access_token,
      store.expires_at
    ])
    .then(([tabs, projects, token, expiresAt]) => {
      console.log("current tabs", tabs);
      console.log("projects:", projects);
      console.log("access_token:", token);
      console.log("expires:", expiresAt);

      if (projects == null) {
        document.querySelector(
          "body"
        ).innerHTML = `<p>No repos analyzed yet</p><p>Access token: <code>${token}</code></p>
      <p>Expires at: <code>${expiresAt}</code></p>`;
      } else if (tabs != null && tabs.length > 0 && tabs[0].url != null) {
        const activeTab = tabs[0];
        const url = activeTab.url;
        console.log("active tab url:", url);
        const repo = getRepoFromGitHubUrl(url);
        console.log("active repo:", repo);

        if (repo != null) {
          const projectForRepo = projects[repo];

          if (projectForRepo != null) {
            console.log("response for repo", projectForRepo);
            document.querySelector("body").innerHTML =
              `<h4>${repo}</h4></br>Score: ` +
              projectForRepo.score.result.score +
              "</br>Breakdown:</br>" +
              `<pre>${JSON.stringify(
                projectForRepo.score.result.factors,
                null,
                2
              )}</pre>`;
          } else {
            document.querySelector(
              "body"
            ).innerHTML = `<p>Haven't analyzed current tab</p><p>Access token: <code>${token}</code></p>
          <p>Expires at: <code>${expiresAt}</code></p>`;
          }
        } else {
          document.querySelector(
            "body"
          ).innerHTML = `<p>Current tab isn't GitHub, or couldn't divine repo from url ${url}</p><p>Access token: <code>${token}</code></p>
        <p>Expires at: <code>${res.expiresAt}</code></p>`;
        }
      } else {
        console.log("No score in storage");
      }
    });
};

function getRepoFromGitHubUrl(url) {
  const regexed = /^https:\/\/github.com\/([A-Za-z0-9\-\.\_\/]+)$/.exec(url);
  if (regexed != null && regexed.length > 1) {
    return regexed[1];
  } else {
    return null;
  }
}

onload();
