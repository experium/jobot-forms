import i18n from './i18n';
import { test } from 'ramda';

export function dataURItoBlob(dataURI, fileName) {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(dataURI.split(',')[1]);
    } else {
        byteString = unescape(dataURI.split(',')[1]);
    }

    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ia], { type: mimeString });
    blob.lastModifiedDate = new Date();
    blob.name = fileName;

    return blob;
}

export const getFileErrorText = (error) => {
    const sizeErrorregExp = /^The uploaded file exceeds the (\d*) bytes$/;
    const sizeError = test(sizeErrorregExp, error);

    if (sizeError) {
        const bytes = sizeErrorregExp.exec(error)[1];
        const maximumSize = bytes / 1024 / 1024;

        return i18n.t('errors.maximumFileSize', { count: maximumSize });
    } else {
        return i18n.t('errors.uploadError');
    }
};
