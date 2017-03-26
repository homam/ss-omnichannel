// @flow

import type { QueryParams } from 'my-types'

export type Action =
    { type: 'SET_Countries', payload: Array<string> }
  | { type: 'QUERY_SUCCESS', payload: any }
  | { type: 'SET_Params', payload: QueryParams }
  | { type: 'CLEANUP_QUERY_RESULT' }

export type Dispatch = (Action) => void; // (action: Action | ThunkAction | PromiseAction | Array<Action>) => any;
export type GetState = () => Object;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
export type PromiseAction = Promise<Action>;
