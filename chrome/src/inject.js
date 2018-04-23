var project_name_element = document.querySelector('#js-repo-pjax-container > div.pagehead.repohead.instapaper_ignore.readability-menu.experiment-repo-nav > div > h1 > strong > a')
var project_name = project_name_element.attributes.getNamedItem("href").value.substr(1)

var download_button = document.createElement('p');
download_button.innerHTML = '&nbsp;<a href=' + "https://app.returntocorp.com/reports/repos/" + project_name + '>Secarta Score</a>';
download_button.className = "button special-plugin-button";

injection_element = document.querySelector('#js-repo-pjax-container > div.pagehead.repohead.instapaper_ignore.readability-menu.experiment-repo-nav > div > h1 > span.Label.Label--outline.v-align-middle')
injection_element.parentElement.insertAdjacentElement('afterEnd', download_button);
