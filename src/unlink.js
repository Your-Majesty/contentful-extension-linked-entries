import _ from 'lodash';

export const printE = entity => {
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

const getDisplayed = _.memoize(async (sdk, contentTypeId) => {
  const content = await sdk.space.getContentType(contentTypeId);
  return content.displayField;
}, (...args) => JSON.stringify(args));

const selectTitle = (fields, display, locale) => {
  return _.get(fields, `${display}[${locale}]`, _.find(fields[display]) || 'Untitled')
};

export const getTitle = async (sdk, entity) => {
  const display = await getDisplayed(sdk, entity.sys.contentType.sys.id);
  const x = selectTitle(entity.fields, display, sdk.locales.default);
  console.log(x);
  return x;
};

const printReferences = (sdk, entries) => {
  console.info('There is entries that links to this entry:');
  _.forEach(entries, async entity => {
    await getTitle(sdk, entity);
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

export const getLinkedEntries = async sdk => {
  const entries = await sdk.space.getEntries({
    'links_to_entry': sdk.entry.getSys().id
  });

  console.log(_.isArray(entries.items));
  //return _.isArray(entries.items) ? entries.items : [entries.items];
  return entries.items;
};

export const unlink = async sdk => {
  const entries = await sdk.space.getEntries({
    'links_to_entry': sdk.entry.getSys().id
  });

  if (!_.isEmpty(entries.items)) await start(sdk, entries.items);
  else console.error('No other entries link to this entry.');
};