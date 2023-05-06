const url = require('url')
export const serveImage = (protocol, host, path) => {
  return url.format({
    protocol,
    host,
    pathname: `${path.replace('public', '')}`,
  })
}
