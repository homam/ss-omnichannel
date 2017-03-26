// @flow

import type { Action } from '../actions/types'

import * as Maybe from 'flow-static-land/lib/Maybe'
import * as R from 'ramda'

import type { QueryParams } from 'my-types'

const defaultParams : QueryParams = {
    cFromDate: '2016-01-01'
  , cToDate:   '2017-01-01'
  , pFromDate: '2016-01-01'
  , pToDate:   '2017-01-01'
  , country:   'US'
}

type AppState = QueryParams

const controls = (state : AppState = defaultParams , action: Action) => {
  console.log('action', action)
  switch (action.type) {
    case 'SET_Params':
      return R.merge(state, action.payload)
    default:
      return state
  }
}

export default controls
