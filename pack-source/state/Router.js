import { Common, Browser } from 'dr-js/module/Dr.browser'
import { createStateStore } from 'pack-source/__utils__'

const { Module: { createRouteMap, parseRouteUrl } } = Common
const { Module: { createHistoryStateStore } } = Browser

const initialState = {
  historyStateStore: null,
  historyStateListener: null,

  url: null,
  routeData: null // { route, paramMap, data }
}

const { getState, setState, wrapEntry } = createStateStore(initialState)

const asyncTaskMap = {}

const entryMap = {
  'state:router:init': wrapEntry((state, { dispatch }, { payload: { routerConfigList } }) => {
    const historyStateStore = createHistoryStateStore()
    const routeMap = createRouteMap(routerConfigList)
    __DEV__ && console.log('[state:router:init]')
    const historyStateListener = (url) => {
      __DEV__ && console.log('historyStateListener', { url })
      dispatch({ type: 'reducer:router:update', payload: { url, routeData: parseRouteUrl(routeMap, getRouteUrl(url)) } })
    }
    historyStateStore.subscribe(historyStateListener)
    dispatch({ type: 'reducer:router:update', payload: { historyStateStore, historyStateListener } })
    historyStateListener(historyStateStore.getState())
  }),
  'state:router:clear': wrapEntry((state, { dispatch }, action) => {
    __DEV__ && console.log('[state:router:clear]')
    state.historyStateStore && state.historyStateStore.unsubscribe(state.historyStateListener)
    dispatch({ type: 'reducer:router:update', payload: initialState })
  }),
  'state:router:set': wrapEntry((state, store, { payload: { url } }) => {
    __DEV__ && console.log('state:router:route:to', { url })
    state.historyStateStore.setState(url)
  })
}

const getRouteUrl = (url) => (new window.URL(url)).pathname

export default {
  asyncTaskMap,
  entryMap,
  getState,
  setState
}
