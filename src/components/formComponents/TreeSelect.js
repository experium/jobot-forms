import React, { Component } from 'react';
import { assocPath, path, head, contains, compose, concat, join, propEq, prop, propOr, pathOr, findIndex, indexOf, values, keys, last, map, split, toLower } from 'ramda';
import { Field } from 'react-final-form';
import qs from 'qs';
import { withTranslation } from 'react-i18next';
import TreeSelect from 'rc-tree-select';

import DownOutlined from '@ant-design/icons/DownOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import CloseCircleFilled from '@ant-design/icons/CloseCircleFilled';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';

import '../../styles/tree.css';
import '../../styles/tree-select.css';

import { CompanyDictionaryContext } from '../../context/CompanyDictionary';
import withFieldWrapper from '../hocs/withFieldWrapper';

class TreeSelectComponent extends Component {
    constructor(props) {
        super(props);

        const parentDicts = values(props.settings.parents);
        const dicts = [
            ...(parentDicts || []),
            props.settings.dictionary,
        ];

        this.state = {
            dicts,
            options: {},
            loaded: {},
            treeData: [],
            loading: false,
            error: false,
        };
    }

    getDictionary = async (dictionary, parentId, search) => {
        this.setState({ error: false });
        const { apiUrl, settings } = this.props;
        const urlParams = qs.stringify({
            filter: {
                dictionary,
                parent: Array.isArray(parentId) ? undefined : parentId,
                parents: Array.isArray(parentId) ? parentId : undefined
            },
            pagination: JSON.stringify({ limit: 0 }),
            sorting: JSON.stringify(pathOr({ field: 'value', order: 'asc' }, ['sorting'], settings)),
            relations: ['parent'],
        }, { addQueryPrefix: true });

        try {
            const response = await fetch(`${apiUrl || ''}/api/company-dictionary-item${urlParams}`);

            if (!response.ok) {
                throw new Error();
            }

            const items = propOr([], 'items', await response.json());

            return items;
        } catch {
            this.setState({ error: true, loading: false });
            return [];
        }
    }

    setDictionaryItems = (items, dict, parent, parentDict, childrenPath) => {
        const insertIndex = parent ? findIndex(propEq('value', `${parentDict}_${parent}`), this.state.treeData) : 0;
        const options = items.map((item, index) => ({
            value: `${item.dictionary}_${item.id}`,
            pId: item.parent ? `${parentDict}_${item.parent}` : 0,
            label: item.value,
            data: {
                ...item,
                childrenPath: parent ? [...childrenPath, index, 'children'] : [index, 'children'],
            },
            selectable: item.dictionary === this.props.settings.dictionary,
            isLeaf: item.dictionary === this.props.settings.dictionary,
        }));

        this.setState({
            options: {
                ...this.state.options,
                [dict]: concat(this.state.options[dict] || [], items),
            },
            treeData: childrenPath ? assocPath(childrenPath, options, this.state.treeData) : options,
            loading: false,
        });
    }

    async fetchAndSetDictionary() {
        const { settings } = this.props;

        const parentKeys = keys(settings.parents);
        const parentDicts = values(settings.parents);

        const dicts = [
            ...(parentDicts || []),
            settings.dictionary,
        ];
        const dict = head(dicts);

        this.setState({ loading: true, dicts });

        if (settings.multiple) {
            const items = await this.getDictionary(dict);
            this.setDictionaryItems(items, dict);
        } else {
            const dictItems = await Promise.all(dicts.map(name => this.getDictionary(name)));

            const parentHash = {};
            const parentIndex = {};
            const parentValues = {};
            let treeData = [];
            let parentDict = null;

            dictItems.forEach((dictionary, index) => {
                dictionary.forEach((item, itemIndex) => {
                    const childrenIndex = parentIndex[`${parentDict}_${item.parent}`] || 0;
                    if (!item.parent) {
                        treeData.push({
                            value: `${item.dictionary}_${item.id}`,
                            pId: 0,
                            label: item.value,
                            data: item,
                            children: [],
                            selectable: item.dictionary === this.props.settings.dictionary,
                            isLeaf: item.dictionary === this.props.settings.dictionary,
                        });
                    } else {
                        treeData = assocPath(concat(parentHash[`${parentDict}_${item.parent}`], [childrenIndex]), {
                            value: `${item.dictionary}_${item.id}`,
                            pId: item.parent ? `${parentDict}_${item.parent}` : 0,
                            label: item.value,
                            fullLabel: join(
                                ' - ',
                                concat(map(prop('label'), parentValues[`${parentDict}_${item.parent}`]), [item.value])
                            ),
                            data: {
                                ...item,
                                values: parentValues[`${parentDict}_${item.parent}`],
                            },
                            selectable: item.dictionary === this.props.settings.dictionary,
                            isLeaf: item.dictionary === this.props.settings.dictionary,
                        }, treeData);
                    }
                    if (item.dictionary !== this.props.settings.dictionary) {
                        parentHash[`${item.dictionary}_${item.id}`] = concat(parentHash[`${parentDict}_${item.parent}`] || [], [childrenIndex, 'children']);
                    }
                    parentValues[`${item.dictionary}_${item.id}`] = concat(parentValues[`${parentDict}_${item.parent}`] || [], [{
                        name: parentKeys[index],
                        value: item.id,
                        label: item.value,
                    }]);
                    parentIndex[`${parentDict}_${item.parent}`] = childrenIndex + 1;
                });
                parentDict = dicts[index];
            });

            this.setState({ loading: false, treeData });
        }
    }

    componentDidMount() {
        this.fetchAndSetDictionary();
    }

    onLoadData = async (item) => {
        if (item.children) {
            return true;
        }

        const dictKey = this.state.dicts[indexOf(item.data.dictionary, this.state.dicts) + 1];
        const parentKeys = concat(this.state.loaded[dictKey] || [], [item.data.id]);

        const dict = await this.getDictionary(dictKey, item.data.id);

        this.setState({
            loaded: {
                ...this.state.loaded,
                [dictKey]: parentKeys,
            },
        });

        this.setDictionaryItems(dict, dictKey, item.data.id, item.data.dictionary, item.data.childrenPath);
    }

    onChange = (value) => {
        this.props.onChange(compose(last, split('_'))(value));
    }

    onSelect = (value, option) => {
        this.props.form.batch(() => {
            if (option.data.values) {
                option.data.values.map(item => this.props.form.change(item.name, item.value));
            }
        });
    }

    getOptions = () => {
        const { settings } = this.props;
        const dictionaryKey = settings.parent || settings.dictionary;

        return pathOr([], ['options', dictionaryKey], this.state);
    }

    getParentOptions = () => {
        const { contextOptions, parentField } = this.props;

        return prop(parentField, contextOptions);
    }

    getInputIcon = () => {
        const { error, loading } = this.state;
        if (loading) {
            return <LoadingOutlined />;
        } else if (error) {
            return (
                <div
                    className='error-indicator'
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        this.fetchAndSetDictionary();
                    }}
                >
                    <div className='error-icon'>!</div>
                </div>
            );
        } else {
            return <DownOutlined />;
        }
    }

    filterTreeNode = (value, node) => {
        const search = toLower(`${value || ''}`);
        return node.isLeaf && search ? contains(search, toLower(`${node.title || ''}`)) : false;
    }

    render() {
        const { loading, error } = this.state;
        const { input: { value, name }, settings, t, disabled } = this.props;
        const showFullPath = path(['showFullPath'], settings) || true;
        const multiple = path(['multiple'], settings);
        const dictionary = path(['dictionary'], settings);

        return (
            <TreeSelect
                id={name}
                className={`${error ? 'error' : ''}`}
                disabled={disabled}
                dropdownPopupAlign={{ overflow: { adjustY: 0, adjustX: 0 }, offset: [0, 8] }}
                value={value ? `${dictionary}_${value}` : value}
                treeData={this.state.treeData}
                filterTreeNode={this.filterTreeNode}
                treeNodeFilterProp="label"
                treeNodeLabelProp={showFullPath ? 'fullLabel' : undefined}
                notFoundContent={loading ? t('loading') : t('noOptionsMessage')}
                onChange={this.onChange}
                onSelect={this.onSelect}
                loadData={this.onLoadData}
                treeCheckable={multiple}
                showSearch={!multiple}

                inputIcon={this.getInputIcon}
                switcherIcon={({ loading, isLeaf }) => loading ? <LoadingOutlined /> : isLeaf ? null : <DownOutlined />}
                removeIcon={<CloseOutlined />}
                clearIcon={<CloseCircleFilled />}
            />
        );
    }
}

const withParentField = WrappedComponent =>
    class WithParentField extends Component {
        render() {
            const { settings } = this.props;
            const parentField = prop('parentField', settings);

            return (
                <CompanyDictionaryContext.Consumer>
                    { ({ options, changeOptions }) => {
                        const renderComponent = value => (
                            <WrappedComponent
                                parentField={parentField}
                                parentFieldValue={value}
                                contextOptions={options}
                                changeContextOptions={changeOptions}
                                {...this.props}
                            />
                        );

                        return parentField ? (
                            <Field name={parentField} subscription={{ value: true }}>
                                {({ input: { value } }) => renderComponent(value)}
                            </Field>
                        ) : renderComponent();
                    }}
                </CompanyDictionaryContext.Consumer>
            );
        }
    };

export default withFieldWrapper(withParentField(withTranslation()(TreeSelectComponent)));
