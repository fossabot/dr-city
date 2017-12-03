export { ROUTE_MAP, ROUTE_INFO_MAP } from './route'

// Simple store for state, with a handy function to wrapEntry
const createStateStore = (state) => {
  if (state === undefined) throw new Error('[ReduxEntry][createStateStore] initialState expected')
  return {
    getState: () => state,
    setState: (nextState) => (state = nextState),
    wrapEntry: (func) => (store, action) => func(state, store, action)
  }
}

const createStateStoreMergeReducer = (actionType, { getState, setState }) => (state, { type, payload }) => { // the reducer, NOTE the action should be like `{ type, payload }`
  type === actionType && setState({ ...getState(), ...payload })
  return getState()
}

export {
  createStateStore,
  createStateStoreMergeReducer
}
