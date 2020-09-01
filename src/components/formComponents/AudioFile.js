import React, { Component, Fragment } from 'react';
import Recorder from 'recorder-js';
import { withTranslation } from 'react-i18next';

import MediaLength from './MediaLength';
import styles from '../../styles/index.module.css';

class AudioFile extends Component {
    state = {
        recording: false,
        audio: null
    };

    recorder = new Recorder(new (window.AudioContext || window.webkitAudioContext)(), { type: 'audio/webm' });

    componentDidMount() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => this.recorder.init(stream));
    }

    cancel = () => this.setState({ audio: null });

    save = () => this.props.onChange(this.state.audio);

    start = () => this.recorder.start().then(() => this.setState({ recording: true }));

    stop = () => this.recorder.stop().then(({ blob }) => this.setState({ recording: false, audio: blob }));

    render() {
        const { available, t, disabled } = this.props;

        return <div>
            { available ?
                (this.state.audio ?
                    <div>
                        <audio controls>
                            <source src={URL.createObjectURL(this.state.audio)} />
                        </audio>
                        <div className={styles.modalButtonGroup}>
                            <button disabled={disabled} className={styles.formBtnCancel} type='button' onClick={this.cancel}>{t('cancel')}</button>
                            <button disabled={disabled} className={styles.formBtn} type='button' onClick={this.save}>{t('save')}</button>
                        </div>
                    </div> :
                    <Fragment>
                        <MediaLength recording={this.state.recording} data={this.state.data} />
                        <div className={styles.modalButtonGroup}>
                            <button disabled={disabled} className={styles.formBtn} onClick={this.state.recording ? this.stop : this.start}>
                                { this.state.recording ? t('stopRecording') : t('startRecording') }
                            </button>
                        </div>
                    </Fragment>
                ) :
                <div>{t('errors.audioPermission')}</div>
            }
        </div>;
    }
}

export default withTranslation()(AudioFile);
