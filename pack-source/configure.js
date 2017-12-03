import { Common } from 'dr-js/module/Dr.browser'
import { entryMap as stateEntryMap, reducerMap as stateReducerMap, setInitialState } from './state'

const { Immutable: { createStateStoreEnhanced } } = Common

const configure = ({ initialState = {} }) => {
  const store = createStateStoreEnhanced({
    initialState: {},
    enhancer: configureEnhancer({ ...stateEntryMap }),
    reducer: combineReducers({ ...stateReducerMap })
  })
  setInitialState(store, initialState)
  __DEV__ && console.log('[configure] initialState', store.getState())
  return { store }
}

// simple ReduxEntry middleware
const configureEnhancer = (entryMap) => (enhancerStore, action) => {
  const entryFunction = entryMap[ action.type ]
  return entryFunction && entryFunction(enhancerStore, action)
}

// simple Redux combineReducers
const combineReducers = (reducerMap) => {
  const keyList = Object.keys(reducerMap)
  const keyListLength = keyList.length
  return (state, action) => {
    const nextState = {}
    let isChanged = false
    for (let index = 0; index < keyListLength; index++) {
      const key = keyList[ index ]
      const keyState = state[ key ]
      const nextKeyState = reducerMap[ key ](keyState, action)
      nextState[ key ] = nextKeyState
      isChanged = isChanged || (nextKeyState !== keyState)
    }
    return isChanged ? nextState : state
  }
}

export { configure }
