import React, { Component, Fragment } from 'react';
import Webcam from 'react-webcam';
import { withTranslation } from 'react-i18next';

import styles from '../../styles/index.module.css';
import { dataURItoBlob } from '../../utils/file';

class ImageFile extends Component {
    state = {
        image: null
    };

    capture = () => this.setState({ image: this.webcam.getScreenshot() });

    cancel = () => this.setState({ image: null });

    save = () => {
        this.props.onChange(dataURItoBlob(this.state.image, 'webcam.jpeg'));
    }

    render() {
        const { available, t, disabled } = this.props;

        return <div>
            { available ?
                (this.state.image ?
                    <div>
                        <img alt='webcam' src={this.state.image} />
                        <div className={styles.modalButtonGroup}>
                            <button disabled={disabled} className={styles.formBtnCancel} type='button' onClick={this.cancel}>{ t('cancel') }</button>
                            <button disabled={disabled} className={styles.formBtn} type='button' onClick={this.save}>{ t('save') }</button>
                        </div>
                    </div> :
                    <Fragment>
                        <Webcam
                            audio={false}
                            ref={node => this.webcam = node}
                            screenshotFormat='image/jpeg'
                            screenshotQuality={1}
                            minScreenshotWidth={640} />
                        <div className={styles.modalButtonGroup}>
                            <button disabled={disabled} className={styles.formBtn} onClick={this.capture}>{ t('takePhoto') }</button>
                        </div>
                    </Fragment>
                ) :
                <div>
                    { t('errors.cameraPermission') }
                </div>
            }
        </div>;
    }
}

export default withTranslation()(ImageFile);
