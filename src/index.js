import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Button } from '@contentful/forma-36-react-components';
import { init, locations } from 'contentful-ui-extensions-sdk';
import tokens from '@contentful/forma-36-tokens';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

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

export const initialize = async sdk => {
  if (sdk.location.is(locations.LOCATION_DIALOG)) {
    ReactDOM.render(<DialogExtension sdk={sdk} />, document.getElementById('root'));
  } else if (sdk.location.is(locations.LOCATION_ENTRY_SIDEBAR)) {
    ReactDOM.render(<SidebarExtension sdk={sdk} />, document.getElementById('root'));
  }
  const sys = sdk.entry.getSys();
  const id = sys.id;
  const entries = await sdk.space.getEntries({
    'links_to_entry': id
  });
  const targetId = entries.items[0].sys.id;
  console.log("target id " + targetId);
  let hello = await sdk.space.getEntry(targetId);
  hello.fields.title['en-US'] = 'Hello Contentful';

  try {
    const _ = await sdk.space.updateEntry(hello);
    console.log(`entity ${_.sys.id} updated`);
  } catch (err) {
    console.error(err);
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
