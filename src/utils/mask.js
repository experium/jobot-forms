import { is, trim, isEmpty } from 'ramda';

import { maskItems } from '../constants/mask';

const isEmptyString = (str) => {
    return isEmpty(trim(str));
};

export const getMask = (maskString) => {
    if (is(String, maskString) && !isEmptyString(maskString)) {
        const result = [...maskString].reduce(
            (prevValue, item, index, array) => {
                const prevItem = index !== 0 && array[index - 1];

                if (item === '\\') {
                    return prevValue;
                }

                if (prevItem === '\\') {
                    return [...prevValue, `${item}`];
                } else {
                    const maskItem = maskItems[item] || item;
                    return [...prevValue, maskItem];
                }
            },
            [],
        );

        return result;
    } else {
        return false;
    }
};
