onload = function() {
  chrome.storage.sync.get(['score', 'project_name'], function(res) {
    console.log("got score from storage");
    console.log(res);
    if (res.project_name) {
      document.querySelector('body').innerHTML = `<h4>${res.project_name}</h4></br>Score: ` + res.score.score + "</br>Breakdown:</br>" + 
      `<pre> ${JSON.stringify(res.score, null, 2)} </pre>` ;
    } else {
      document.querySelector('body').innerHTML = "Hi, you're logged in! Load a Github page and click here to see a score breakdown!" ;
    }
  });
};

onload();