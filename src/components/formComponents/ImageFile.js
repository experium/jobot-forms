import React, { Component, Fragment } from 'react';
import Webcam from 'react-webcam';

import styles from '../../styles/index.css';
import { dataURItoBlob } from '../../utils/file';

export default class ImageFile extends Component {
    state = {
        image: null
    };

    capture = () => this.setState({ image: this.webcam.getScreenshot() });

    cancel = () => this.setState({ image: null });

    save = () => {
        this.props.onChange(dataURItoBlob(this.state.image, 'webcam.jpeg'));
    }

    render() {
        const { available } = this.props;

        return <div>
            { available ?
                (this.state.image ?
                    <div>
                        <img alt='webcam' src={this.state.image} />
                        <div>
                            <button className={styles.formBtn} type='button' onClick={this.save}>Сохранить</button>
                            <button className={styles.formBtn} type='button' onClick={this.cancel}>Отмена</button>
                        </div>
                    </div> :
                    <Fragment>
                        <Webcam
                            audio={false}
                            ref={node => this.webcam = node}
                            screenshotFormat='image/jpeg'
                            screenshotQuality={1}
                            screenshotWidth={640} />
                        <div>
                            <button className={styles.formBtn} onClick={this.capture}>Сделать фото</button>
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
