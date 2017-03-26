// @flow

import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'

import { Submit, DateField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, Select } from './Styled'

import type { QueryParams } from 'my-types'
import { set_params, get_countries } from '../actions'
import { toQueryString } from '../helpers'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

const DateInput = ({name, value, onChange} : {name: string, value: string, onChange: string => void}) =>
  <FormRow>
    <FormLabel>{name}</FormLabel>
    <DateField value={value} type="date" onChange={ x => onChange(x.target.value) } />
  </FormRow>

type ControlsProps = {
    params: QueryParams
  , countries: Array<string>
  , set_params: QueryParams => any
}
class Controls extends React.Component {
  props: ControlsProps
  state: QueryParams
  constructor(props: ControlsProps) {
    super(props)
    this.state = props.params
  }

  render() {
    return <FormContainer>

      <FormSection>
        <FormTitle>Create report for Customers who made their first purchase during:</FormTitle>
        <DateInput name="From" value={ this.state.cFromDate } onChange={ val => this.setState({ 'cFromDate': val, 'pFromDate': val }) } />
        <DateInput name="To" value={ this.state.cToDate } onChange={ val => this.setState({ 'cToDate': val, 'pToDate': val }) } />
      </FormSection>
      <FormSection>
        <FormTitle>And for Sales during:</FormTitle>
        <DateInput name="From" value={ this.state.pFromDate } onChange={ val => this.setState({ 'pFromDate': val }) } />
        <DateInput name="To" value={ this.state.pToDate } onChange={ val => this.setState({ 'pToDate': val }) } />
      </FormSection>
      <FormSection>
        <FormTitle>And Stores in:</FormTitle>
        <FormRow>
          <FormLabel>Country:</FormLabel>
          <Select value={ this.state.country } onChange={ (e) => this.setState({ 'country': e.target.value }) }>
            { this.props.countries.map(c => <option key={ c }>{ c }</option>) }
          </Select>
        </FormRow>
      </FormSection>
      <Submit onClick={ _ => this.props.set_params(this.state) }>
        Draw the Dashboard
      </Submit>
    </FormContainer>
  }
}

type HomeProps = {
    params: QueryParams
  , maybe_countries: Maybe<Array<string>>
  , set_params: QueryParams => void
  , get_countries: () => void
}
class Home extends React.Component {
  props: HomeProps
  state: { is_set: bool }

  constructor(props: HomeProps) {
    super(props)
    this.state = { is_set: false }
  }

  render() {

    return maybe.maybe(
        _ => { this.props.get_countries(); return <div>loading..</div> }
      , countries => _ => this.state.is_set
        ? <Redirect push to={ `/dashboard?${toQueryString(this.props.params)}` } />
        : <Controls
            params={ this.props.params }
            countries={ countries }
            set_params={ v => {
              this.props.set_params(v);
              const self = this
              setTimeout(() => self.setState({ is_set: true }), 30)
            } }
          />
      , this.props.maybe_countries
    )()
  }
}


export default connect(state => ({ params: state.controls, maybe_countries: state.countries  }), { set_params, get_countries })(Home)
