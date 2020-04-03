import React, { Component, Fragment } from 'react';
import Recorder from 'recorder-js';

import MediaLength from './MediaLength';
import styles from '../../styles/index.module.css';

export default class AudioFile extends Component {
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
        const { available } = this.props;

        return <div>
            { available ?
                (this.state.audio ?
                    <div>
                        <audio controls>
                            <source src={URL.createObjectURL(this.state.audio)} />
                        </audio>
                        <div className={styles.modalButtonGroup}>
                            <button className={styles.formBtnCancel} type='button' onClick={this.cancel}>Отмена</button>
                            <button className={styles.formBtn} type='button' onClick={this.save}>Сохранить</button>
                        </div>
                    </div> :
                    <Fragment>
                        <MediaLength recording={this.state.recording} data={this.state.data} />
                        <div className={styles.modalButtonGroup}>
                            <button className={styles.formBtn} onClick={this.state.recording ? this.stop : this.start}>
                                { this.state.recording ? 'Остановить запись' : 'Начать запись' }
                            </button>
                        </div>
                    </Fragment>
                ) :
                <div>Доступ к микрофону заблокирован. Разрешите доступ к микрофону в настройках браузера</div>
            }
        </div>;
    }
}
