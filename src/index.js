import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Button } from '@contentful/forma-36-react-components';
import { init, locations } from 'contentful-ui-extensions-sdk';
import tokens from '@contentful/forma-36-tokens';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';
import _ from 'lodash';

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
          }}>
          Close modal
        </Button>
      </div>
    );
  }
}

export class SidebarExtension extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  };

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();
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
      <Button
        buttonType="positive"
        isFullWidth={true}
        testId="open-dialog"
        onClick={this.onButtonClick}>
        Click on me to open dialog extension
      </Button>
    );
  }
}

const printE = entity => {
  console.log(JSON.stringify(entity, null, ' '))
};

const isEqLink = (field, id) =>
  field &&
  field.hasOwnProperty('sys') &&
  field.sys.type === 'Link' &&
  field.sys.linkType === 'Entry' &&
  field.sys.id === id;

const updateEntry = async (sdk, entry) => {
  try {
    const newHello = await sdk.space.updateEntry(entry);
    console.log(`entity ${newHello.sys.id} updated`);
  } catch (err) {
    console.error(err);
  }
};

const omit = (obj, predicate) => {
  return _.transform(obj, (result, value, key) => {
    if (_.isObject(value))
      value = omit(value, predicate);

    if (!predicate(value, key))
      _.isArray(obj) ? result.push(value) : result[key] = value;
  });
};

const getTitle = (fields, locale) => {
  return _.get(fields, `title[${locale}]`, _.find(fields.title) || 'Untitled')
};

const printReferences = (sdk, entries) => {
  console.info('There is entries that links to this entry:');
  _.forEach(entries, e => {
    console.info(getTitle(e.fields, sdk.locales.default));
  });
};

const start = async (sdk, entries) => {
  const sys = sdk.entry.getSys();
  const id = sys.id;

  const hello = entries[0];
  printReferences(sdk, entries);

  await updateEntry(sdk, omit(hello, e => isEqLink(e, id)));
};

export const initialize = async sdk => {
  if (sdk.location.is(locations.LOCATION_DIALOG)) {
    ReactDOM.render(<DialogExtension sdk={sdk} />, document.getElementById('root'));
  } else if (sdk.location.is(locations.LOCATION_ENTRY_SIDEBAR)) {
    ReactDOM.render(<SidebarExtension sdk={sdk} />, document.getElementById('root'));
  }

  const entries = await sdk.space.getEntries({
    'links_to_entry': sdk.entry.getSys().id
  });

  if (!_.isEmpty(entries.items)) await start(sdk, entries.items);
  else console.error('No other entries link to this entry.');
};

init(initialize);

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
