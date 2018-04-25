onload = function() {
  chrome.storage.sync.get(['score'], function(res) {
    console.log("got score from storage");
    console.log(res);
    document.querySelector('body').innerHTML = "Score: " + res.score.score + "</br>Breakdown:</br>" + 
    `<pre> ${JSON.stringify(res.score, null, 2)} </pre>` ;
  });
};

onload();