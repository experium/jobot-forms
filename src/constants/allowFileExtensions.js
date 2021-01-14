export const defaultAllowFileExtensions = {
    document: {
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        html: 'text/html',
        odt: 'application/vnd.oasis.opendocument.text',
        pdf: 'application/pdf',
        rtf: 'application/rtf, text/rtf, .rtf',
        txt: 'text/plain',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    image: {
        jpg: 'image/jpeg',
        png: 'image/png',
        tif: 'image/tiff'
    }
};

export const TYPES = {
    audio: 'audio/*',
    video: 'video/*',
    image: 'image/jpeg, image/tiff, image/png',
    document: 'text/plain, application/msword, application/rtf, text/rtf, application/pdf, text/html, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.oasis.opendocument.text, .doc, .docx, .xls, .xlsx, .odt, .rtf, .txt',
};

export const VALIDATION_FILE_TYPES = {
    image: 'jpeg, tiff, png',
    document: 'doc, docx, html, odt, pdf, rtf, xls, xlsx',
};
