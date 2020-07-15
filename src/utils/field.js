import { prop } from 'ramda';

export const isLinkedField = (field) => {
    const { settings } = field;
    const linkType = prop('linkType', settings);
    const linkField = prop('linkField', settings);
    const linkValue = prop('linkValue', settings);
    return linkType && linkField && linkValue;
};
