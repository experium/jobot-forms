import React, { Component, Fragment } from 'react';
import Modal from 'react-responsive-modal';
import { withTranslation } from 'react-i18next';
import { FormSpy } from 'react-final-form';

import 'rc-checkbox/assets/index.css';
import 'react-responsive-modal/styles.css';

import { Checkbox } from './Checkbox';
import styles from '../../styles/index.module.css';
import HtmlOpdForm from './HtmlOpdForm';
import { FormContext } from '../../context/FormContext';
import { getAttrs } from '../../utils/attrs';

const opdLabelTexts = {
    'oferta': 'opdOffertaLabel',
};

const opdLinkTexts = {
    'oferta': 'opdOffertaLink',
};

class PersonalDataAgreementComponent extends Component {
    state = {
        opened: false,
        openedHtml: false
    };

    open = event => {
        if (this.props.opd) {
            event.preventDefault();
            this.setState({ opened: true });
        }
    }

    close = () => this.setState({ opened: false });

    closeHtml = () => this.setState({ openedHtml: false });

    getLabel = () => {
        const { t, renderOpdLabel, opd, opdLabelType } = this.props;
        const label = t('opdLabelCustom');
        const modalLinkProps = {
            className: opd ? styles.formLink : styles.withoutOpd,
            onClick: this.open
        };
        const opdLabel = opdLabelTexts[opdLabelType] || 'opdLabel';
        const opdLink = opdLinkTexts[opdLabelType] || 'opdLink';

        return <span>
            { renderOpdLabel ? renderOpdLabel(modalLinkProps) :
                label !== 'opdLabelCustom' ? (
                    label
                ) : (
                    <Fragment>
                        {t(opdLabel)} <span {...modalLinkProps}>{t(opdLink)}</span>
                    </Fragment>
                )
            }
            <Modal
                open={this.state.opened}
                onClose={this.close}
                classNames={{
                    modal: 'pda-modal',
                    closeButton: 'pda-modal-close-button',
                }}
                center
            >
                <div dangerouslySetInnerHTML={{ __html: this.props.opd }} />
            </Modal>
        </span>;
    }

    onChange = () => {
        const { meta: { submitting } } = this.props;

        !submitting && this.setState({ openedHtml: true });
    }

    onSubmitHtml = (html, data) => {
        this.props.input.onChange({
            value: !!html,
            htmlContent: html,
            data,
        });
        this.setState({ openedHtml: false });
    }

    render() {
        return <FormContext.Consumer>{ ({ htmlAttrs }) => (
            <Fragment>
                <Checkbox
                    id={'opdCheckbox'}
                    {...this.props}
                    onValueChange={this.props.htmlOpd ? this.onChange : null}
                    options={[{
                        value: true,
                        label: this.getLabel()
                    }]}
                    htmlAttrs={getAttrs('opdCheckbox', htmlAttrs)}
                />
                { this.props.htmlOpd &&
                    <Modal
                        open={this.state.openedHtml}
                        onClose={this.closeHtml}
                        classNames={{
                            modal: 'pda-modal',
                            closeButton: 'pda-modal-close-button',
                        }}
                        destroyOnClose
                        showCloseIcon={false}
                        center
                    >
                        <FormSpy>
                            { formProps => (
                                <HtmlOpdForm
                                    onSubmit={this.onSubmitHtml}
                                    onClose={this.closeHtml}
                                    value={this.props.input.value}
                                    formProps={formProps}
                                    getOpdValues={() => this.props.getOpdValues && this.props.getOpdValues(formProps)}
                                    htmlAttrs={htmlAttrs}
                                    html={this.props.htmlOpd} />
                            )}
                        </FormSpy>
                    </Modal>
                }
            </Fragment>
        )}</FormContext.Consumer>;
    }
}

const PersonalDataAgreement = withTranslation()(PersonalDataAgreementComponent);

export default PersonalDataAgreement;
