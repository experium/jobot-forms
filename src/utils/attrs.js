import { pathOr } from 'ramda';

export const getAttrs = (name, attrs) => pathOr({}, [name], attrs);
