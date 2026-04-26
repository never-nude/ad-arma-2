window.AD_ARMA_BUILD_ID = '20260426-phase2-data-cleanup';
window.AD_ARMA_BUILD = {
  id: window.AD_ARMA_BUILD_ID,
  channel: 'root',
  assetBase: 'assets/',
};

window.AD_ARMA_BUILD_LABEL = `Ad Arma build ${window.AD_ARMA_BUILD_ID} (${window.AD_ARMA_BUILD.channel})`;

function applyAdArmaBuildMarker() {
  const markerText = window.AD_ARMA_BUILD_LABEL;
  for (const el of document.querySelectorAll('[data-build-marker]')) {
    el.textContent = markerText;
  }
}

console.info(`[Ad Arma] ${window.AD_ARMA_BUILD_LABEL}`);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyAdArmaBuildMarker, { once: true });
} else {
  applyAdArmaBuildMarker();
}
