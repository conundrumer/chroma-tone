export default function simStateStep() {
  return ({getState}) => next => action => {

    switch (action.type) {
    }
    let result = next(action)
    return result
  }
}
