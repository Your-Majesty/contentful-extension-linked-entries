import _ from 'lodash';

const isEqLink = (field, id) =>
  field &&
  field.hasOwnProperty('sys') &&
  field.sys.type === 'Link' &&
  field.sys.linkType === 'Entry' &&
  field.sys.id === id;

const updateEntry = async (sdk, entry) => {
  try { await sdk.space.updateEntry(entry) }
  catch (err) { console.error(err); }
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
}, () => 'contentTypeId'); /* contentTypeId is unique in the space */

const selectTitle = (fields, display, locale) => {
  return _.get(fields, `${display}[${locale}]`, _.find(fields[display]) || 'Untitled')
};

export const getTitleLink = async (sdk, entity) => {
  const display = await getDisplayed(sdk, entity.sys.contentType.sys.id);
  return selectTitle(entity.fields, display, sdk.locales.default);
};

export const removeIncomingLink = async (sdk, targetId) => {
  const id = sdk.entry.getSys().id;
  const entry = await sdk.space.getEntry(targetId);
  await updateEntry(sdk, omit(entry, e => isEqLink(e, id)));
};

export const getIncomingLinks = async sdk => {
  const entries = await sdk.space.getEntries({
    'links_to_entry': sdk.entry.getSys().id
  });

  return entries.items;
};