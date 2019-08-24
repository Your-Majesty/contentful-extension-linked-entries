import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Tooltip, Button, List, ListItem, TextLink, Paragraph, Typography, IconButton } from '@contentful/forma-36-react-components';
import { init, locations } from 'contentful-ui-extensions-sdk';
import tokens from '@contentful/forma-36-tokens';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';
import { unlink, getLinkedEntries, getTitle, printE } from './unlink.js'
import _ from 'lodash'

export class DialogExtension extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  };

  render() {
    return (
      <div style={{ margin: tokens.spacingM }}>
        <Button
          testId="close-dialog"
          buttonType="muted"
          onClick={() => {
            this.props.sdk.close('data from modal dialog');
          }}
        >
          Close modal
        </Button>
      </div>
    );
  }
}

export class ReferenceListItem extends React.Component{
  static propTypes = {
    sdk: PropTypes.object.isRequired,
    entry: PropTypes.string.isRequired,
    space: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
  };

  /* TODO better way to extract base url */
  baseUrl = 'https://app.contentful.com';

  getHref() {
    return `${this.baseUrl}/spaces/${this.props.space}/entries/${this.props.entry}`
  }

  onButtonClick = async () => {
    const result = await this.props.sdk.dialogs.openExtension({
      width: 800,
      title: 'The same extension rendered in modal window'
    });
    console.log(result);
  };

  render() {
    return (
      <ListItem className="incoming-links__item">
        <TextLink
            linkType="primary"
            href={this.getHref()}
            className="no-underline incoming-links__link"
            target="_blank"
        >
          {this.props.title}
        </TextLink>
        <Tooltip content="unlink" place="right">
          <IconButton
            buttonType="negative"
            onClick={this.onButtonClick}
            isFullWidth={false}
            testId="open-dialog"
            className="btn-close"
            iconProps={{ icon: 'Close', /* size: 'large' */ }}
            label="unlink"

          />
        </Tooltip>
      </ListItem>
    )
  }
}

export class ReferenceLinkList extends React.Component {
  static propTypes = {
    entries: PropTypes.array.isRequired,
    sdk: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { entries: [] };
  }

  async componentDidMount() {
    const entries = await Promise.all(_.map(this.props.entries, async e => ({
        id: e.sys.id,
        title: await getTitle(this.props.sdk, e),
        space: e.sys.space.sys.id
    })));
    this.setState({entries: entries});
  }

  render() {
    return (
      <List className="incoming-links__list">
        {this.state.entries.map((item, key)  =>  (
           <ReferenceListItem key={item.id} sdk={this.props.sdk} entry={item.id} space={item.space} title={item.title}/>
          ))}
      </List>
    );
  }
}

export class SidebarExtension extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { entities: [] };
  }

  async componentDidMount() {
    this.props.sdk.window.startAutoResizer();
    const entities = await getLinkedEntries(this.props.sdk);
    this.setState({entities: entities});
  }

  onButtonClick = async () => {
    const result = await this.props.sdk.dialogs.openExtension({
      width: 800,
      title: 'The same extension rendered in modal window'
    });
    console.log(result);
  };

  render() {
    if (_.isEmpty(this.state.entities)) {
      return (
        <Paragraph className="incoming-links__message">No other entries link to this entry.</Paragraph>
      );
    } else {
      return (
        <Typography className="entity-sidebar__incoming-links">
          <Paragraph className="incoming-links__message">There are other entries that links to this entry:</Paragraph>
          <ReferenceLinkList sdk={this.props.sdk} entries={this.state.entities}/>
        </Typography>
      );
    }
  }
}

export const initialize = async sdk => {
  if (sdk.location.is(locations.LOCATION_DIALOG)) {
    ReactDOM.render(<DialogExtension sdk={sdk} />, document.getElementById('root'));
  } else if (sdk.location.is(locations.LOCATION_ENTRY_SIDEBAR)) {
    ReactDOM.render(<SidebarExtension sdk={sdk} />, document.getElementById('root'));
  }
  await unlink(sdk);
};

init(initialize);

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
