/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')
// eslint-disable-next-line node/no-missing-require
const CompLibrary = require('../../core/CompLibrary.js')

const MarkdownBlock = CompLibrary.MarkdownBlock /* Used to read markdown */
const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

const siteConfig = require(`${process.cwd()}/siteConfig.js`)

function imgUrl(img) {
  return `${siteConfig.baseUrl}img/${img}`
}

function docUrl(doc, language) {
  return `${siteConfig.baseUrl}docs/${language ? `${language}/` : ''}${doc}`
}

function pageUrl(page, language) {
  return siteConfig.baseUrl + (language ? `${language}/` : '') + page
}

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    )
  }
}

Button.defaultProps = {
  target: '_self',
}

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
)

const Logo = props => (
  <div className="serialportLogo">
    <img src={props.img_src} alt="Node SerialPort Logo" />
  </div>
)

const ProjectTitle = () => (
  <h2 className="projectTitle">
    {siteConfig.title}
    <small>{siteConfig.tagline}</small>
  </h2>
)

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
)

class HomeSplash extends React.Component {
  render() {
    const language = this.props.language || ''
    return (
      <SplashContainer>
        <Logo img_src={imgUrl('serialport-logo.svg')} />
        <div className="inner">
          <ProjectTitle />
          <PromoSection>
            <Button href={docUrl('guide-about', language)}>Documentation</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    )
  }
}

const Block = props => (
  <Container padding={['bottom', 'top']} id={props.id} background={props.background}>
    <GridBlock align="center" contents={props.children} layout={props.layout} />
  </Container>
)

// eslint-disable-next-line no-unused-vars
const Features = () => (
  <Block layout="twoColumn">
    {[
      {
        content:
          'The Internet of things is filled with hardware that talks over serial ports. From sensor networks to home hubs SerialPort can help you make it happen.',
        image: imgUrl('tumisu-iot-300px.png'),
        imageAlign: 'top',
        title: 'Internet of Things',
        imageLink: 'https://iot.mozilla.org/about/',
      },
      {
        content: 'Nodebots uses SerialPort as the bridge between your javascript and the firmware on thousands of devices from Arduinos to drones.',
        image: imgUrl('nodebots-logo.svg'),
        imageAlign: 'top',
        title: 'Powers NodeBots',
        imageLink: 'http://nodebots.io',
      },
      {
        content:
          'SerialPort is used in consumer devices from pancake printing robots to homebrew games. When used with Electron you have fast and easy path from prototype to production.',
        image: imgUrl('pancake-bot-300px.jpg'),
        imageAlign: 'top',
        title: 'Consumer Devices',
        imageLink: 'http://www.pancakebot.com/',
      },
      {
        content:
          'From underwater sensors, to drones, to ATMs, to fork lift diagnostics, to medical device communications. SerialPort has found its way into many industries. With an Open Source MIT license and the ability to submit fixes back to the project, SerialPort is an obvious choice for your next project.',
        image: imgUrl('open-rov-300px.jpg'),
        imageAlign: 'top',
        title: 'Commercial Applications',
      },
    ]}
  </Block>
)

// eslint-disable-next-line no-unused-vars
const FeatureCallout = () => (
  <div className="productShowcaseSection paddingBottom" style={{ textAlign: 'center' }}>
    <h2>Feature Callout</h2>
    <MarkdownBlock>These are features of this project</MarkdownBlock>
  </div>
)

// eslint-disable-next-line no-unused-vars
const LearnHow = () => (
  <Block background="light">
    {[
      {
        title: 'Control your Creations',
        content: `
\`\`\`js
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const port = new SerialPort(path, { baudRate: 256000 })

const parser = new Readline()
port.pipe(parser)

parser.on('data', line => console.log(\`> \${line}\`))
port.write('ROBOT POWER ON\\n')
//> ROBOT ONLINE
\`\`\`
        `,
      },
    ]}
  </Block>
)

// eslint-disable-next-line no-unused-vars
const TryOut = () => (
  <Block id="try">
    {[
      {
        content: 'Talk about trying this out',
        image: imgUrl('docusaurus.svg'),
        imageAlign: 'left',
        title: 'Try it Out',
      },
    ]}
  </Block>
)

// eslint-disable-next-line no-unused-vars
const Description = () => (
  <Block background="dark">
    {[
      {
        content: 'This is another description of how this project is useful',
        image: imgUrl('docusaurus.svg'),
        imageAlign: 'right',
        title: 'Description',
      },
    ]}
  </Block>
)

// eslint-disable-next-line no-unused-vars
const Showcase = props => {
  if ((siteConfig.users || []).length === 0) {
    return null
  }

  const showcase = siteConfig.users
    .filter(user => user.pinned)
    .map(user => (
      <a href={user.infoLink} key={user.infoLink}>
        <img src={user.image} alt={user.caption} title={user.caption} />
      </a>
    ))

  return (
    <div className="productShowcaseSection paddingBottom">
      <h2>Who is Using This?</h2>
      <p>This project is used by all these people</p>
      <div className="logos">{showcase}</div>
      <div className="more-users">
        <a className="button" href={pageUrl('users.html', props.language)}>
          More {siteConfig.title} Users
        </a>
      </div>
    </div>
  )
}

class Index extends React.Component {
  render() {
    const language = this.props.language || ''

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <LearnHow />
          <Features />
          {/* <FeatureCallout /> */}
          {/* <TryOut /> */}
          {/* <Description /> */}
          {/* <Showcase language={language} /> */}
        </div>
      </div>
    )
  }
}

module.exports = Index
