console.log("here");

browser.runtime.sendMessage({
  subject: "token",
  access_token: localStorage.access_token,
  expires_at: localStorage.expires_at
});
