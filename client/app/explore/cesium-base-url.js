// Must be imported BEFORE `cesium` so that Cesium's worker/asset loader
// picks up the copied static assets under /public/cesium.
if (typeof window !== 'undefined') {
  window.CESIUM_BASE_URL = '/cesium'
}
