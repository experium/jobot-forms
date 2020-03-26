import React, { Component, Fragment } from 'react';
import Webcam from 'react-webcam';

import styles from '../../styles/index.module.css';
import MediaLength from './MediaLength';

const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user'
};

export default class VideoFile extends Component {
    state = {
        data: null,
        recording: false
    };

    cancel = () => this.setState({ data: null });

    save = () => {
        this.props.onChange(this.state.data);
    }

    onUserMedia = () => {
        this.recorder = new MediaRecorder(this.webcam.stream);
        this.recorder.ondataavailable = ({ data }) => this.setState({ data });
    }

    start = () => {
        this.recorder.start();
        this.setState({ recording: true });
    }

    stop = () => {
        this.recorder.stop();
        this.setState({ recording: false });
    }

    render() {
        const { available } = this.props;

        return <div>
            { available ?
                (this.state.data ?
                    <div>
                        <video
                            width={640}
                            height={480}
                            controls>
                            <source src={URL.createObjectURL(this.state.data)} type='video/webm' />
                        </video>
                        <div>
                            <button className={styles.formBtn} type='button' onClick={this.save}>Сохранить</button>
                            <button className={styles.formBtn} type='button' onClick={this.cancel}>Отмена</button>
                        </div>
                    </div> :
                    <Fragment>
                        <Webcam
                            ref={node => this.webcam = node}
                            videoConstraints={videoConstraints}
                            onUserMedia={this.onUserMedia} />
                        <MediaLength recording={this.state.recording} data={this.state.data} />
                        <div>
                            <button className={styles.formBtn} onClick={this.state.recording ? this.stop : this.start}>
                                { this.state.recording ? 'Остановить запись' : 'Начать запись' }
                            </button>
                        </div>
                    </Fragment>
                ) :
                <div>
                    Доступ к камере заблокирован. Разрешите доступ к камере в настройках браузера
                </div>
            }
        </div>;
    }
}
