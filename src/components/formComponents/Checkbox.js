import React, { Component } from 'react';
import Modal from 'react-responsive-modal';

import withFieldWrapper from '../hocs/withFieldWrapper';
import styles from '../../styles/index.css';

class CheckboxComponent extends Component {
    onChange = e => this.props.onChange(e.target.checked ? true : null);

    render() {
        const { input: { value }, label } = this.props;

        return <div>
            <label>
                <input
                    type='checkbox'
                    checked={!!value}
                    onChange={this.onChange} />
                <span>{ label }</span>
            </label>
        </div>;
    }
}

const Checkbox = withFieldWrapper(CheckboxComponent);

export class PersonalDataAgreement extends Component {
    state = {
        opened: false
    };

    open = () => this.setState({ opened: true });

    close = () => this.setState({ opened: false });

    getLabel = () => {
        return <span>
            Я даю согласие на <span className={styles.formLink} onClick={this.open}>обработку персональных данных</span>
            <Modal open={this.state.opened} onClose={this.close} center>
                <div dangerouslySetInnerHTML={{ __html: this.props.opd }} />
            </Modal>
        </span>;
    }

    render() {
        return <Checkbox
            {...this.props}
            label={this.getLabel()} />;
    }
}

export default Checkbox;
