import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Note, List, ListItem, TextLink, Paragraph, Typography, IconButton } from '@contentful/forma-36-react-components';
import { init, locations } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';
import { getLinkedEntries, getTitle, removeReference } from './unlink'
import _ from 'lodash'

export class ReferenceListItem extends React.Component{
  static propTypes = {
    sdk: PropTypes.object.isRequired,
    entry: PropTypes.object.isRequired,
    i: PropTypes.number.isRequired,
    removeItem: PropTypes.func.isRequired
  };

  baseUrl = 'https://app.contentful.com';

  getHref() {
    return `${this.baseUrl}/spaces/${this.props.entry.space}/entries/${this.props.entry.id}`
  }

  removeItem(item, i) {
    this.props.removeItem(item, i);
  }

  onButtonClick = async () => {
    const options = {
      title: 'Confirmation',
      message: 'Are you sure?',
      intent: 'negative',
      confirmLabel: 'Yes',
      cancelLabel: 'No'
    };

    if (await this.props.sdk.dialogs.openConfirm(options)) {
      await removeReference(this.props.sdk, this.props.entry.id);
      this.removeItem(this.props.entry, this.props.i);
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

export class ReferenceLinkList extends React.Component {
  static propTypes = {
    entries: PropTypes.array.isRequired,
    sdk: PropTypes.object.isRequired,
    removeItem: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { entries: [] };
    this.removeItem = this.removeItem.bind(this);
  }

  async componentDidMount() {
    const entries = await Promise.all(_.map(this.props.entries, async e => ({
      id: e.sys.id,
      title: await getTitle(this.props.sdk, e),
      space: e.sys.space.sys.id
    })));
    this.setState({entries: entries});
  }

  removeItem = (item, i) => {
    let entries = this.state.entries.slice();
    entries.splice(i, 1);
    this.setState({ entries });
    this.props.removeItem(item, i);
  };

  render() {
    return (
      <List className='incoming-links__list'>
        {this.state.entries.map((item, i)  =>  (
           <ReferenceListItem
               key={item.id}
               sdk={this.props.sdk}
               entry={item}
               i={i}
               removeItem={this.removeItem}
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
    this.removeItem = this.removeItem.bind(this);
  }

  async componentDidMount() {
    this.props.sdk.window.startAutoResizer();
    const entries = await getLinkedEntries(this.props.sdk);
    this.setState({entries: entries});
  }

  removeItem(item, i) {
    let entries = this.state.entries.slice();
    entries.splice(i, 1);
    this.setState({ entries });
  }

  render() {
    const n = _.size(this.state.entries);
    return (
      <Typography className='entity-sidebar__incoming-links'>
        <p className='incoming-links__message'>
          { n === 1 && 'There is one other entry that links to this entry:' }
          { n > 1 && `There are ${ n } other entries that link to this entry:` }
          { n === 0 && 'No other entries link to this entry.' }
        </p>
        { n !== 0 &&
          <ReferenceLinkList
            removeItem={this.removeItem}
            sdk={this.props.sdk}
            entries={this.state.entries}
          />
        }
      </Typography>
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
