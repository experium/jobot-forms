import React, { Component } from 'react';
import moment from 'moment';

import styles from '../../styles/index.module.css';

export default class MediaLength extends Component {
    state = {
        seconds: 0
    };

    componentWillUnmount() {
        this.stop();
    }

    start = () => {
        this.interval = setInterval(
            () => this.setState(prev => ({ seconds: prev.seconds + 1 })),
            1000
        );
    }

    stop = () => {
        clearInterval(this.interval);
    }

    reset = () => this.setState({ seconds: 0 });

    componentDidUpdate(prev) {
        !prev.recording && this.props.recording && this.start();
        prev.recording && !this.props.recording && this.stop();
        prev.data && !this.props.data && this.reset();
    }

    render() {
        const time = moment().hour(0).minute(0).seconds(this.state.seconds)
            .format('HH:mm:ss');

        return <div className={styles.timeIndicator}>
            { time }
        </div>;
    }
}
