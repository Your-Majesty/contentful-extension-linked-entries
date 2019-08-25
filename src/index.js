import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';
import _ from 'lodash'
import { getIncomingLinks, getTitleLink, unlinkEntry } from './unlink'
import { Note, List, ListItem, IconButton } from '@contentful/forma-36-react-components';
import { init, locations } from 'contentful-ui-extensions-sdk';

class IncomingLinksItem extends React.Component{
  static propTypes = {
    sdk: PropTypes.object.isRequired,
    entry: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    removeIncomingLink: PropTypes.func.isRequired
  };

  baseUrl = 'https://app.contentful.com';

  getHref() {
    return `${this.baseUrl}/spaces/${this.props.entry.space}/entries/${this.props.entry.id}`
  };

  removeIncomingLink(entry, index) {
    this.props.removeIncomingLink(entry, index);
  };

  onButtonClick = async () => {
    const options = {
      title: 'Confirmation',
      message: 'Are you sure?',
      intent: 'negative',
      confirmLabel: 'Yes',
      cancelLabel: 'No'
    };

    if (await this.props.sdk.dialogs.openConfirm(options)) {
      this.removeIncomingLink(this.props.entry, this.props.index);
    }
  };

  render() {
    return (
      <ListItem className='incoming-links__item'>
        <a
          href={this.getHref()}
          className='incoming-links__link'
          target='_blank'
          title={this.props.entry.title}
        >
          {this.props.entry.title}
        </a>
        <IconButton
          buttonType='negative'
          onClick={this.onButtonClick}
          className='btn-close'
          iconProps={{ icon: 'Close' }}
          label='unlink'
        />
      </ListItem>
    )
  }
}

class IncomingLinksList extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired,
    entries: PropTypes.array.isRequired,
    removeIncomingLink: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.removeIncomingLink = this.removeIncomingLink.bind(this);
  };

  removeIncomingLink = (entry, i) => {
    this.props.removeIncomingLink(entry, i);
  };

  render() {
    return (
      <List className='incoming-links__list'>
        { this.props.entries.map((entry, index)  =>  (
          <IncomingLinksItem
            sdk={this.props.sdk}
            key={entry.id}
            entry={entry}
            index={index}
            removeIncomingLink={this.removeIncomingLink}
          />
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
    this.state = { entries: [] };
    this.removeIncomingLink = this.removeIncomingLink.bind(this);
  }

  async componentDidMount() {
    this.props.sdk.window.startAutoResizer();
    const entries = await Promise.all(
      _.map(await getIncomingLinks(this.props.sdk), async e => ({
        id: e.sys.id,
        title: await getTitleLink(this.props.sdk, e),
        space: e.sys.space.sys.id
      }))
    );
    this.setState({ entries });
  }

  async removeIncomingLink(entry, i) {
    await unlinkEntry(this.props.sdk, entry.id);
    let entries = this.state.entries.slice();
    entries.splice(i, 1);
    this.setState({ entries });
  }

  render() {
    const n = _.size(this.state.entries);
    return (
      <div className='entity-sidebar__incoming-links'>
        <p className='incoming-links__message'>
          { n === 1 && 'There is one other entry that links to this entry:' }
          { n > 1 && `There are ${ n } other entries that link to this entry:` }
          { n === 0 && 'No other entries link to this entry.' }
        </p>
        { n !== 0 &&
          <IncomingLinksList
            sdk={this.props.sdk}
            removeIncomingLink={this.removeIncomingLink}
            entries={this.state.entries}
          />
        }
      </div>
    );
  }
}

export const initialize = async sdk => {
  const root = document.getElementById('root');
  if (sdk.location.is(locations.LOCATION_ENTRY_SIDEBAR)) {
    ReactDOM.render(<SidebarExtension sdk={sdk} />, root);
  } else {
    ReactDOM.render(<Note noteType="negative">Wrong Location</Note>, root)
  }
};

init(initialize);

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
