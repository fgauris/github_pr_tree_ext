import React from 'react'
import { StorageSync } from '../../lib'

const chromeStoreUrl = 'https://chrome.google.com/webstore/detail/github-pull-request-tree/nfhdjopbhlggibjlimhdbogflgmbiahc'
const firefoxStoreUrl = 'https://addons.mozilla.org/en-US/firefox/addon/better-pull-request-for-github/'

class Options extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.updateOptions = this.updateOptions.bind(this)
  }

  async componentDidMount () {
    this.setState(await StorageSync.get())
  }

  async updateOptions () {
    await StorageSync.save()
    this.setState(await StorageSync.get())
  }

  isChrome () {
    return typeof browser === 'undefined'
  }

  render () {
    return (
      <div className='container'>
        <div className='text-center'>
          <h1>Better Pull Request</h1>

          <div>
            <h3>Additional features</h3>
            <ol style={{textAlign:'left'}}>
              <li>Reverse search: Type '!' and then text, for example '!foo' and all files that do NOT contain word 'foo' will be found.</li>
              <li>Filtering out files that contain word 'Test' (case sensitive!).</li>
              <li>Filtering out .csproj and .config files (case sensitive!).</li>
            </ol>
          </div>
        </div>
        <div>
          <h4>Customize</h4>
          <label className='label-enabled'>
            <input
              id='diffStats'
              type='checkbox'
              checked={Boolean(this.state.diffStats)}
              onChange={this.updateOptions}
            />
            <span className='label-body'>Show <strong>Diff Stats</strong> next to files</span>
          </label>
        </div>
      </div>
    )
  }
}

export default Options
