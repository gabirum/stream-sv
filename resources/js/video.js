import Hls from 'hls.js'

if (Hls.isSupported()) {
  const videoEl = document.querySelector('video')
  const hls = new Hls()

  hls.loadSource(streamLink)
  hls.attachMedia(videoEl)
} else {
  alert('Your browser cannot play this video')
}
