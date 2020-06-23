import { keys, contains } from 'ramda';

import { LINK_KEYS, CHILD_QUESTIONS_TYPES } from '../constants/questions';

export const isLinkedQuestion  = (field) => {
    let isLinked = false;
    const { settings = {} } = field;
    const settingsKeys = keys(settings) || [];

    settingsKeys.forEach(key => {
        if (contains(key, LINK_KEYS)) {
            isLinked = true;
        }
    });

    return isLinked;
};

export const findChildGeoQuestionsNames = (fields = [], chengedQuestionType, formValues = {}) => {
    const childQuestionsTypes = CHILD_QUESTIONS_TYPES[chengedQuestionType];
    const geoFields = [];

    fields.forEach(({ type, field }) => {
        if (contains(type, childQuestionsTypes) && !!formValues[type]) {
            geoFields.push(field);
        }
    });

    return geoFields;
};
