import { is, trim, isEmpty, replace, split, join } from 'ramda';
import { AsYouType } from 'libphonenumber-js';

import { maskItems } from '../constants/mask';
import { PHONE_MASK, PHONE_MASK_RU, PHONE_MASK_RU_EIGHT } from '../constants/masks';

const isEmptyString = (str) => {
    return isEmpty(trim(str));
};

export const getMask = (mask) => {
    if (is(String, mask) && !isEmptyString(mask)) {
        const result = [...mask].reduce(
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
        return mask;
    }
};

const templateToMask = (template) => {
    const mask = [];
    const splittedTemplate = split(' ', template);
    const maskParts = splittedTemplate.map((item, index) => {
        switch (index) {
            case 0:
                return replace(/^./, '+', item);
            case 1:
                return ` (${item}) `;
            case 2:
                return `${item}`;
            default:
                return `-${item}`;
        }
    });

    const maskTemplateString = join('', maskParts);

    [...maskTemplateString].forEach(element => {
        if (element === 'x') {
            mask.push(/\d/);
        } else {
            mask.push(element);
        }
    });

    return mask;
};

export const getPhoneMask = (rawValue, { previousConformedValue }) => {
    const asYouTypeNumber = new AsYouType();
    asYouTypeNumber.input(rawValue ? `+${rawValue}`.replace('++', '+') : rawValue);
    const template = asYouTypeNumber.template;

    if (!template && previousConformedValue) {
        asYouTypeNumber.input(previousConformedValue);
        const prevTemplate = asYouTypeNumber.template;

        if (prevTemplate) {
            return templateToMask(prevTemplate);
        }
    }

    if (template) {
        return templateToMask(template);
    } else {
        return PHONE_MASK;
    }
};

export const getPhoneMaskRU = value => value && value[0] === '8' ? PHONE_MASK_RU_EIGHT : PHONE_MASK_RU;
