import React, { Component } from 'react';
import { prop, append, remove, isEmpty, path, pathOr } from 'ramda';
import Modal from 'react-responsive-modal';
import { withTranslation } from 'react-i18next';
import getusermedia from 'getusermedia';

import withFieldWrapper from '../hocs/withFieldWrapper';
import ImageFile from './ImageFile';
import VideoFile from './VideoFile';
import AudioFile from './AudioFile';
import styles from '../../styles/index.module.css';
import formStyles from '../../styles/index.module.css';
import Spinner from './Spinner';
import { getFileErrorText } from '../../utils/file';

const TYPES = {
    audio: 'audio/*',
    video: 'video/*',
    image: 'image/jpeg, image/tiff, image/png',
    document: 'text/plain, application/msword, application/rtf, application/pdf, text/html, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.oasis.opendocument.text',
};

const MEDIA = {
    audio: { audio: true },
    video: { audio: true, video: true },
    photo: { video: true }
};

const MODAL_CONTENT = {
    audio: AudioFile,
    video: VideoFile,
    photo: ImageFile
};

const BTN_TEXT = {
    audio: 'recordAudio',
    video: 'recordVideo',
    photo: 'takePhoto'
};

class File extends Component {
    state = {
        loading: false,
        error: false,
        available: false,
        visibleModal: false,
        fileNames: {},
    };

    onSave = file => {
        if (file) {
            const { postFileUrl, settings, getFileUrl, input: { value, name }, onChange, t } = this.props;
            const multiple = prop('multiple', settings);
            const type = prop('type', settings);
            const fd = new FormData();

            fd.append('file', file);
            fd.append('name', file.name);

            this.setState({ loading: true, error: false });

            fetch(postFileUrl, {
                method: 'POST',
                body: fd
            })
                .then(response => response.json())
                .then(data => {
                    if (data.statusCode === 400) {
                        return this.setState({ error: data.message || true, loading: false });
                    }

                    if (!data.id) {
                        return this.setState({ error: true, loading: false });
                    }

                    const { input: { name } } = this.props;
                    const fileName = data.filename;
                    const url = getFileUrl ? getFileUrl(data.id) : data.id;
                    this.setState({ loading: false });

                    const fileItem = {
                        url,
                        text: fileName,
                        contentType: file.type,
                        type,
                    };

                    if (multiple) {
                        const fieldFiles = pathOr([], ['fileNames', name], this.state);
                        this.setState({ fileNames: {
                            [name]: [...fieldFiles, fileName],
                        }});
                        onChange(append(fileItem, value || []));
                    } else {
                        this.setState({ fileNames: {
                            [name]: [fileName],
                        }});
                        onChange(fileItem);
                    }
                })
                .catch(() => this.setState({ error: true }));
        }
    }

    onChange = e => {
        const file = e.target.files[0];

        this.onSave(file);
    }

    onDelete = (index) => {
        const { input: { value, name }, onChange } = this.props;
        const fieldFiles = path(['fileNames', name], this.state);

        this.setState({
            fileNames: {
                [name]: remove(index, 1, fieldFiles),
            },
        });

        if (Array.isArray(value)) {
            const newFieldValue = remove(index, 1, value);

            onChange(isEmpty(newFieldValue) ? undefined : newFieldValue);
        } else {
            onChange(undefined);
        }
    }

    openModal = () => {
        if (!this.state.available) {
            const { type } = this.props.settings || {};
            getusermedia(MEDIA[type], (error, stream) => {
                if (error) {
                    this.setState({ visibleModal: true });
                } else {
                    this.stream = stream;
                    this.setState({ visibleModal: true, available: true });
                }
            });
        } else {
            this.setState({ visibleModal: true });
        }
    }

    closeModal = () => {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.setState({ visibleModal: false });
    }

    onSaveModalContent = file => {
        this.onSave(file);
        this.closeModal();
    }

    renderPreview = (url, index) => {
        const { input: { name } } = this.props;
        const type = path(['settings', 'type'], this.props);
        const fileName = path(['fileNames', name, index], this.state);
        const isBlob = fileName === 'blob';

        switch (type) {
            case 'photo':
                return (
                    <div>
                        { isBlob ? (
                            <img className={styles.imagePreview} src={url} alt='file' />
                        ) : fileName}
                    </div>
                );
            case 'video':
                return (
                    <div>
                        { isBlob ? (
                            <video key={url} height={200} controls>
                                <source src={url} type='video/webm' />
                            </video>
                        ) : fileName}
                    </div>
                );
            case 'audio':
                return (
                    <div>
                        { isBlob ? (
                            <audio controls key={url}>
                                <source src={url} />
                            </audio>
                        ) : fileName}
                    </div>
                );
            default:
                return (
                    <div>
                        { fileName }
                    </div>
                );
        }
    }

    render() {
        const { settings, input: { value, name }, t } = this.props;
        const { type, multiple } = settings || {};
        const values = value ? (multiple ? value : [value]) : [];
        const ModalContent = MODAL_CONTENT[type];
        const { loading, error } = this.state;

        return <div>
            { !isEmpty(value) && (
                <div className={styles.fileList}>
                    { values.map(({ url }, index) =>
                        <div className={styles.fileItem} key={`file-${index}`}>
                            { this.renderPreview(url, index) }
                            <div className={styles.fileButtonGroup}>
                                <a
                                    className={styles.downloadButton}
                                    href={url}
                                    download
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    { t('download') }
                                </a>
                                <button
                                    className={styles.dangerBtn}
                                    type='button'
                                    onClick={() => this.onDelete(index)}
                                >
                                    { t('remove') }
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className={styles.fileControls}>
                { !multiple && value.length > 1 ? null :
                    <div>
                        <input
                            className={styles.fileInput}
                            id={name}
                            type='file'
                            value=''
                            onChange={this.onChange}
                            accept={TYPES[type]}
                            disabled={loading && !error}
                        />
                        <label htmlFor={name}>
                            { loading && !error && <Spinner /> }
                            <span className='button-text'>
                                {t('upload')}
                            </span>
                        </label>
                    </div>
                }
                { (!multiple && value.length > 1) || !BTN_TEXT[type] ? null : (
                    type && (
                        <button disabled={loading && !error} className={formStyles.formBtn} type='button' onClick={this.openModal}>
                            { t(BTN_TEXT[type]) }
                        </button>
                    )
                )}
            </div>
            { this.state.error && <div className={styles.error}>{ getFileErrorText(this.state.error) }</div> }
            { MODAL_CONTENT[type] && (
                <Modal
                    center
                    open={this.state.visibleModal}
                    onClose={this.closeModal}
                    classNames={{
                        modal: 'modal',
                        closeButton: 'modalCloseButton',
                    }}
                >
                    <ModalContent
                        available={this.state.available}
                        onChange={this.onSaveModalContent} />
                </Modal>
            )}
        </div>;
    }
}

export default withFieldWrapper(withTranslation()(File));
