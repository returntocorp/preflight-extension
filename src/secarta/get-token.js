if (window.browser == null) {
  /* chrome are jerks */ window.browser = window.chrome;
}

browser.runtime.sendMessage({
  subject: "token",
  access_token: localStorage.access_token
});
