import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';
import _ from 'lodash'
import { getIncomingLinks, getTitleLink, removeIncomingLink } from './unlink'
import { Note, List, ListItem, TextLink, IconButton } from '@contentful/forma-36-react-components';
import { init, locations } from 'contentful-ui-extensions-sdk';

class IncomingLinksItem extends React.Component{
  static propTypes = {
    entry: PropTypes.object.isRequired,
    i: PropTypes.number.isRequired,
    removeEntry: PropTypes.func.isRequired
  };

  baseUrl = 'https://app.contentful.com';

  getHref() {
    return `${this.baseUrl}/spaces/${this.props.entry.space}/entries/${this.props.entry.id}`
  }

  removeEntry(entry, i) {
    this.props.removeEntry(entry, i);
  }

  async onButtonClick() {
    const options = {
      title: 'Confirmation',
      message: 'Are you sure?',
      intent: 'negative',
      confirmLabel: 'Yes',
      cancelLabel: 'No'
    };

    if (await this.props.sdk.dialogs.openConfirm(options)) {
      this.removeEntry(this.props.entry, this.props.i);
    }
  };

  render() {
    return (
      <ListItem className='incoming-links__item'>
        <TextLink
          linkType='primary'
          href={this.getHref()}
          className='incoming-links__link'
          target='_blank'
        >
          {this.props.entry.title}
        </TextLink>
        <IconButton
          buttonType='negative'
          onClick={this.onButtonClick}
          testId='open-dialog'
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
    entries: PropTypes.array.isRequired,
    removeEntry: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.removeEntry = this.removeEntry.bind(this);
  }

  removeEntry(entry, i) {
    this.props.removeEntry(entry, i);
  };

  render() {
    return (
      <List className='incoming-links__list'>
        { this.props.entries.map((item, i)  =>  (
          <IncomingLinksItem
            key={item.id}
            entry={item}
            i={i}
            removeEntry={this.removeEntry}
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
    this.removeEntry = this.removeEntry.bind(this);
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

  async removeEntry(entry, i) {
    await removeIncomingLink(this.props.sdk, entry.id);
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
            removeEntry={this.removeEntry}
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
