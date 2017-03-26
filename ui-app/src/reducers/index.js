// @flow

import { combineReducers } from 'redux'

import dashboard from './dashboard'
import controls from './controls'
import countries from './countries'

const rootReducer = combineReducers({
  dashboard, controls, countries
})

export default rootReducer
