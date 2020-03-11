import React, { Component, Fragment } from 'react';
import { path, append } from 'ramda';
import Modal from 'react-responsive-modal';
import getusermedia from 'getusermedia';

import withFieldWrapper from '../hocs/withFieldWrapper';
import ImageFile from './ImageFile';
import VideoFile from './VideoFile';
import AudioFile from './AudioFile';
import styles from '../../styles/index.module.css';
import formStyles from '../../styles/index.module.css';

const TYPES = {
    audio: 'audio/*',
    video: 'video/*',
    image: 'image/*'
};

const MEDIA = {
    audio: { audio: true },
    video: { audio: true, video: true },
    image: { video: true }
};

const MODAL_CONTENT = {
    audio: AudioFile,
    video: VideoFile,
    image: ImageFile
};

const BTN_TEXT = {
    audio: 'Записать аудио',
    video: 'Записать видео',
    image: 'Сделать фото'
};

class File extends Component {
    state = {
        loading: false,
        error: false,
        available: false,
        visibleModal: false
    };

    onSave = file => {
        if (file) {
            const { postFileUrl, settings, getFileUrl, input: { value }, onChange } = this.props;
            const multiple = path(['type'], settings);
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
                    const val = getFileUrl ? getFileUrl(data.id) : data.id;

                    this.setState({ loading: false });
                    onChange(multiple ? append(val, value || []) : val);
                })
                .catch(() => this.setState({ error: true }));
        }
    }

    onChange = e => {
        const file = e.target.files[0];

        this.onSave(file);
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
        this.stream.getTracks().forEach(track => track.stop());
        this.setState({ visibleModal: false });
    }

    onSaveModalContent = file => {
        this.onSave(file);
        this.closeModal();
    }

    render() {
        const { settings, input: { value }} = this.props;
        const { type, multiple } = settings || {};
        const values = value ? (multiple ? value : [value]) : [];
        const ModalContent = MODAL_CONTENT[type];

        return <div>
            { values.map((v, index) =>
                <div key={`file-${index}`}>
                    { type === 'image' ?
                        <img src={v} alt='file' /> :
                        <a href={v} download target='_blank' rel='noopener noreferrer'>Скачать</a>
                    }
                    <button>Удалить</button>
                </div>
            )}
            <div className={styles.fileControls}>
                { !multiple && value.length > 1 ? null :
                    <div>
                        <input
                            className={styles.fileInput}
                            id='file'
                            type='file'
                            value=''
                            onChange={this.onChange}
                            accept={TYPES[type]} />
                        <label htmlFor='file'>Загрузить</label>
                    </div>
                }
                { type &&
                    <button className={formStyles.formBtn} type='button' onClick={this.openModal}>
                        { BTN_TEXT[type] }
                    </button>
                }
            </div>
            { this.state.error && <div>Не удалось загрузить файл</div> }
            { type && (
                <Modal
                    open={this.state.visibleModal}
                    onClose={this.closeModal}
                >
                    <ModalContent
                        available={this.state.available}
                        onChange={this.onSaveModalContent} />
                </Modal>
            )}
        </div>;
    }
}

export default withFieldWrapper(File);
