import { Common } from 'dr-js/module/Dr.browser'
import { createStateStore } from 'pack-source/__utils__'

const { getRandomId } = Common.Math

const initialState = {
  errorList: [
    // { id: '', error: null, message: '', retryFunc: null }
  ]
}

const { getState, setState, wrapEntry } = createStateStore(initialState)

const asyncTaskMap = {}

const entryMap = {
  'state:error:clear': wrapEntry((state, store) => {
    store.dispatch({ type: 'reducer:error:update', payload: initialState })
  }),
  'state:error:add': wrapEntry((state, store, { payload: { id = getRandomId('ERROR-'), error, message = error.toString(), retryFunc = null } }) => {
    __DEV__ && console.log('[state:error:add]', { id, error, message, retryFunc })
    store.dispatch({ type: 'reducer:error:update', payload: { errorList: [ ...getState().errorList, { id, error, message, retryFunc } ] } })
  }),
  'state:error:delete': wrapEntry((state, store, { payload: idList }) => {
    __DEV__ && console.log('[state:error:delete]', idList)
    const { errorList } = getState()
    idList.length && errorList.length && store.dispatch({ type: 'reducer:error:update', payload: { errorList: errorList.filter(({ id }) => !idList.includes(id)) } })
  })
}

export default {
  asyncTaskMap,
  entryMap,
  getState,
  setState
}
