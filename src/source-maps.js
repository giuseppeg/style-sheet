/* global Blob, Worker, URL, module */
import ErrorStackParser from 'error-stack-parser'

export function createSourceMapsEngine({
  baseUrl = 'https://unpkg.com/css-to-js-sourcemap-worker@2.0.5',
  renderInterval = 120,
} = {}) {
  const workerBlob = new Blob([`importScripts("${baseUrl}/worker.js")`], {
    type: 'application/javascript',
  })
  let worker = new Worker(URL.createObjectURL(workerBlob))
  worker.postMessage({
    id: 'init_wasm',
    url: `${baseUrl}/mappings.wasm`,
  })
  worker.postMessage({
    id: 'set_render_interval',
    interval: renderInterval,
  })
  if (module && module.hot) {
    module.hot.addStatusHandler(status => {
      if (status === 'dispose') {
        worker.postMessage({ id: 'invalidate' })
      }
    })
  }
  worker.onmessage = msg => {
    const { id, css } = msg.data
    if (id === 'render_css' && css) {
      const style = document.createElement('style')
      style.appendChild(document.createTextNode(css))
      document.head.appendChild(style)
    }
  }

  let counter = 0
  return {
    create(className = `__debug`) {
      const stackIndex = 3
      const error = new Error('stacktrace source')
      const prefix = getDebugClassName(error, stackIndex)
      const cls =
        typeof className === 'function'
          ? className(prefix, counter)
          : className + '-' + counter
      counter++
      worker.postMessage({
        id: 'add_mapped_class',
        className: cls,
        stackInfo: {
          stack: error.stack,
          message: error.message,
        },
        stackIndex,
      })
      return cls
    },
  }
}

export function getDebugClassName(error, stackIndex = 1) {
  const line = ErrorStackParser.parse(error)[stackIndex]
  if (!line || !line.fileName) {
    return '__dss-debug'
  }
  const parts = line.fileName.split('/')
  let name = parts.pop().replace(/\..*$/, '')
  if (name === 'index') {
    name = parts.pop()
  }
  name = name.replace(/\W/g, '-')
  return name.charAt(0).toUpperCase() + name.slice(1)
}
