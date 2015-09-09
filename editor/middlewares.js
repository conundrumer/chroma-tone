export function trackCache() {
  return store => next => action => {
    return next(action)
  }
}
