// tslint:disable

const uninstallUrl = `https://goo.gl/forms/B8ALNAcRHoLWHBVF2`;
const setUninstallUrl = new Promise((resolve, reject) => {
  const shim = window.browser || window.chrome;
  return shim.runtime.setUninstallURL(uninstallUrl, () => {
    const lastError = shim.runtime.lastError;
    if (lastError) {
      reject(lastError);
    } else {
      resolve();
    }
  });
});

setUninstallUrl.catch(err => console.error("Error setting uninstall URL", err));
