import React, { Component, Fragment } from 'react';
import Modal from 'react-responsive-modal';
import { withTranslation } from 'react-i18next';
import { FormSpy } from 'react-final-form';
import { path, pathOr } from 'ramda';

import 'rc-checkbox/assets/index.css';
import 'react-responsive-modal/styles.css';

import { Checkbox } from './Checkbox';
import styles from '../../styles/index.module.css';
import HtmlOpdForm from './HtmlOpdForm';
import { FormContext } from '../../context/FormContext';
import { getAttrs } from '../../utils/attrs';

class PersonalDataAgreementComponent extends Component {
    state = {
        opened: false,
        openedHtml: false
    };

    static defaultProps = {
        opdSettings: {}
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
        const { t, renderOpdLabel, opd, opdSettings, language } = this.props;
        const label = t('opdLabelCustom');
        const modalLinkProps = {
            className: opd ? styles.formLink : styles.withoutOpd,
            onClick: this.open
        };
        const linkText = pathOr(pathOr(t('opdLink'), ['pdaLabelLink'], opdSettings), ['translations', 'pdaLabelLink', language], opdSettings);
        const link = pathOr(path(['pdaLink'], opdSettings), ['translations', 'pdaLink', language], opdSettings);
        const opdText = pathOr(opd, ['translations', 'pda', language], opdSettings);
        const opdType = pathOr('modal', ['pdaLinkType'], opdSettings);

        return <span>
            { renderOpdLabel ? renderOpdLabel(modalLinkProps) :
                label !== 'opdLabelCustom' ? (
                    label
                ) : (
                    <Fragment>
                        { pathOr(pathOr(t('opdLabel'), ['pdaLabelStart'], opdSettings), ['translations', 'pdaLabelStart', language], opdSettings) }
                        { ' ' }
                        { opdType === 'modal' ?
                            <span {...modalLinkProps}>{ linkText }</span> :
                            <a href={`//${link}`} target='_blank'>{ linkText }</a>
                        }
                        { ' ' }
                        { pathOr(pathOr('.', ['pdaLabelEnd'], opdSettings), ['translations', 'pdaLabelEnd', language], opdSettings) }
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
                <div dangerouslySetInnerHTML={{ __html: opdText }} />
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
