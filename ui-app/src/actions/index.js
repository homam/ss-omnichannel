// @flow

import { post, get, toQueryString } from '../helpers'

import type { QueryParams } from 'my-types'
import type { Dispatch } from './types'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

export const get_countries = () => (dispatch: Dispatch) =>  {
  get({url: 'http://0.0.0.0:3081/api/countries'})
  .then(d => dispatch({ type: 'SET_Countries', payload: d }))
}

export const query = (params: QueryParams) => (dispatch: Dispatch) => {
  get({url: 'http://0.0.0.0:3081/api/query/?' + toQueryString(params)})
  .then(d => dispatch({ type: 'QUERY_SUCCESS', payload: d }))
}

export const cleanup_query_result = () => (dispatch: Dispatch) =>
  dispatch({ type: 'CLEANUP_QUERY_RESULT' })

export const set_params = (value: QueryParams) => (dispatch: Dispatch) =>
  dispatch({ type: `SET_Params`, payload: value })
