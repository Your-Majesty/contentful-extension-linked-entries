import _ from 'lodash';

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
    const x = await sdk.space.updateEntry(entry);
    console.log(`entity ${x.sys.id} updated`);
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

  const first = entries[0];
  printReferences(sdk, entries);

  // TODO uncomment
  // await updateEntry(sdk, omit(first, e => isEqLink(e, id)));
};

export const unlink = async (sdk) => {
  const entries = await sdk.space.getEntries({
    'links_to_entry': sdk.entry.getSys().id
  });

  if (!_.isEmpty(entries.items)) await start(sdk, entries.items);
  else console.error('No other entries link to this entry.');
};