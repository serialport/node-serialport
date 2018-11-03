/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')
// eslint-disable-next-line node/no-missing-require
const CompLibrary = require('../../core/CompLibrary.js')

const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

const siteConfig = require(`${process.cwd()}/siteConfig.js`)
// eslint-disable-next-line node/no-missing-require
const translate = require('../../server/translate.js').translate

function docUrl(doc, language) {
  return `${siteConfig.baseUrl}docs/${language ? `${language}/` : ''}${doc}`
}

class Help extends React.Component {
  render() {
    const language = this.props.language || ''
    const supportLinks = [
      {
        content: (
          <translate>
            Learn more using the [api on this site.](
            {docUrl('api-overview', language)})
          </translate>
        ),
        title: <translate>Browse Docs</translate>,
      },
      {
        content: <translate>Ask questions about the documentation and project</translate>,
        title: <translate>Join the community</translate>,
      },
      {
        content: <translate>Find out what&apos;s new with this project</translate>,
        title: <translate>Stay up to date</translate>,
      },
    ]

    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post">
            <header className="postHeader">
              <h1>
                <translate>Need help?</translate>
              </h1>
            </header>
            <p>
              <translate desc="statement made to reader">This project is maintained by a dedicated group of people.</translate>
            </p>
            <GridBlock contents={supportLinks} layout="threeColumn" />
          </div>
        </Container>
      </div>
    )
  }
}

module.exports = Help
