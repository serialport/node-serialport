/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

class Footer extends React.Component {
  docUrl(doc) {
    const language = false // until we have more than english
    const baseUrl = this.props.config.baseUrl
    return `${baseUrl}docs/${language ? `${language}/` : ''}${doc}`
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl
    return baseUrl + (language ? `${language}/` : '') + doc
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img src={this.props.config.baseUrl + this.props.config.footerIcon} alt={this.props.config.title} width="66" height="58" />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('guide-usage', this.props.language)}>Getting Started</a>
            <a href={this.docUrl('guide-about', this.props.language)}>Guides</a>
            <a href={this.docUrl('api-overview', this.props.language)}>API Reference</a>
          </div>
          <div>
            <h5>Community</h5>
            <a href="http://nodebots.io/" target="_blank" rel="noopener noreferrer">
              NodeBots
            </a>
            <a href="http://johnny-five.io/" target="_blank" rel="noopener noreferrer">
              Johnny-Five
            </a>

            <a href="http://stackoverflow.com/questions/tagged/node-serialport" target="_blank" rel="noreferrer noopener">
              Stack Overflow
            </a>
            <a href="https://twitter.com/nodebots" target="_blank" rel="noreferrer noopener">
              Twitter
            </a>
          </div>
          <div>
            <h5>More</h5>
            {/* <a href={`${this.props.config.baseUrl}blog`}>Blog</a> */}
            <a href={this.props.config.repoUrl}>GitHub</a>
            {/* <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href="/node-serialport/node-serialport/stargazers"
              data-show-count="true"
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub"
            >
              Star
            </a> */}
          </div>
        </section>
        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    )
  }
}

module.exports = Footer
