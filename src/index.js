import React from 'react';
import Fuse from 'fuse.js';
import classnames from 'classnames';
import Bem from './Bem';

const displayName  = 'SelectSearch';
const propTypes    = {
    options        : React.PropTypes.array.isRequired,
    className      : React.PropTypes.string.isRequired,
    search         : React.PropTypes.bool.isRequired,
    placeholder    : React.PropTypes.string,
    multiple       : React.PropTypes.bool.isRequired,
    height         : React.PropTypes.number,
    name           : React.PropTypes.string,
    fuse           : React.PropTypes.object.isRequired,
    onChange       : React.PropTypes.func.isRequired,
    onHighlight    : React.PropTypes.func.isRequired,
    onMount        : React.PropTypes.func.isRequired,
    onBlur         : React.PropTypes.func.isRequired,
    onFocus        : React.PropTypes.func.isRequired,
    onOpen         : React.PropTypes.func.isRequired,
    onClose        : React.PropTypes.func.isRequired,
    renderOption   : React.PropTypes.func.isRequired,
    value          : React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.array
    ])
};

const defaultProps = {
    options        : [],
    className      : 'select-search-box',
    search         : true,
    value          : '',
    placeholder    : null,
    multiple       : false,
    height         : 200,
    name           : null,
    onHighlight    : function () {},
    onMount        : function () {},
    onBlur         : function () {},
    onFocus        : function () {},
    onOpen         : function () {},
    onClose        : function () {},
    onChange       : function () {},
    renderOption   : function (option) {
        return option.name;
    },
    fuse: {
        keys      : ['name'],
        threshold : 0.3
    }
};

class Component extends React.Component {

    /**
     * Component setup
     * -------------------------------------------------------------------------*/
    constructor(props) {
        super(props);

        let options = props.options;
        let value   = (!props.value && props.multiple) ? [] : props.value;
        let search  = '';

        if (value) {
            let option = this.findByValue(options, value);

            if (option) {
                search = option.name;
            }
        }

        this.placeSelectedFirst(options, value);

        this.state = {
            search            : search,
            value             : value,
            defaultOptions    : props.options,
            options           : options,
            highlighted       : null,
            fieldHasFocus     : false,
            componentHasFocus : false,
            menuOpen              : false
        };

        this.updateClassnames(props);
    }

    updateClassnames(newProps) {
        this.classes = {
            container         : newProps.className,
            search            : Bem.e(newProps.className, 'search'),
            select            : Bem.e(newProps.className, 'select'),
            options           : Bem.e(newProps.className, 'options'),
            option            : Bem.e(newProps.className, 'option'),
            out               : Bem.e(newProps.className, 'out'),
            label             : Bem.e(newProps.className, 'label')
        };
    }

    /**
     * Component lifecycle
     * -------------------------------------------------------------------------*/
    componentWillMount() {

    }

    componentDidMount() {
        this.props.onMount.call(null, this.publishOption(), this.state, this.props);
        this.scrollToSelected();
    }

    componentWillUnmount() {
        // document.removeEventListener('keydown', this.onKeyDown);
        // document.removeEventListener('keypress', this.onKeyPress);
        // document.removeEventListener('keyup', this.onKeyUp);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.className != this.props.className) {
            this.updateClassnames(nextProps);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.componentHasFocus != prevState.componentHasFocus) {
            this.componentFocusDidUpdate(prevState.componentHasFocus);
        }

        if (this.state.fieldHasFocus != prevState.fieldHasFocus) {
            this.fieldFocusDidUpdate(prevState.fieldHasFocus);
        }

        if (this.state.menuPressed != prevState.menuPressed) {
            this.menuPressedDidUpdate(prevState.menuPressed);
        }

        if (this.state.menuOpen != prevState.menuOpen) {
            this.menuOpenDidUpdate(prevState.menuOpen);
        }

        /* Fire callbacks */
        if (this.state.highlighted !== prevState.highlighted) {
            // Override the context with `null` instead of leaking `this.props` as the context.
            this.props.onHighlight.call(null, this.state.options[this.state.highlighted], this.state, this.props);
        }

        if (this.state.value !== prevState.value) {
            // Override the context with `null` instead of leaking `this.props` as the context.
            this.props.onChange.call(null, this.publishOption(this.state.value), this.state, this.props);
        }

        this.scrollToSelected();
    }

    /**
     * DOM event handlers
     * -------------------------------------------------------------------------*/
    fieldDidFocus = () => this.setState({fieldHasFocus: true});
    fieldDidBlur = () => this.setState({fieldHasFocus: false});

    searchDidChange = (e) => {
        let value = e.target.value;

        if (!value) {
            value = '';
        }

        let options = this.state.defaultOptions;
        options = this.getNewOptionsList(options, value)

        this.placeSelectedFirst(options);

        this.setState({search: value, options: options});
    }

    onKeyPress = (e) => {
        if (!this.state.options || this.state.options.length < 1) {
            return;
        }

        /** Enter */
        if (e.keyCode === 13) {
            return this.enterWasPressed();
        }
    }

    onKeyDown = (e) => {
        // if (!this.state.fieldHasFocus) {
        //     return;
        // }

        if (!this.state.menuOpen) {
            this.setState({menuOpen: true});
        }

        /** Tab */
        // if (e.keyCode === 9) {
        //     return this.fieldDidBlur();
        // }

        /** Arrow Down */
        if (e.keyCode === 40) {
            this.handleArrowDown();
        }

        /** Arrow Up */
        if (e.keyCode === 38) {
            this.handleArrowUp();
        }
    }

    onKeyUp = (e) => {
        /** Esc */
        if (e.keyCode === 27) {
            this.escWasPressed();
        }
    }

    /**
     * Keyboard actions
     * -------------------------------------------------------------------------*/
    handleArrowDown() {
        if (this.state.options.length < 1) {
            return;
        }

        let highlighted = null;

        if (this.state.highlighted != null) {
            highlighted = this.state.highlighted + 1;
        } else {
            highlighted = 0;
        }

        if (highlighted > this.state.options.length - 1) {
            highlighted = 0;
        }

        this.setState({highlighted: highlighted});
    }

    handleArrowUp() {
        if (this.state.options.length < 1) {
            return;
        }

        let highlighted = this.state.options.length - 1;

        if (this.state.highlighted != null) {
            highlighted = this.state.highlighted - 1;
        }

        if (highlighted < 0) {
            highlighted = this.state.options.length - 1;
        }

        this.setState({highlighted: highlighted});
    }

    enterWasPressed() {
        this.chooseOption();
    }

    escWasPressed() {
        this.setState({menuOpen: false});
    }

    /**
     * Custom methods
     * -------------------------------------------------------------------------*/
    publishOption(value) {
        if (typeof(value) === 'undefined') {
            value = this.state.value;
        }

        if (this.props.multiple) {
            return this.publishOptionMultiple(value);
        }

        return this.publishOptionSingle(value);
    }

    publishOptionSingle(value) {
        return this.findByValue(null, value);
    }

    publishOptionMultiple(value) {
        return value.map((value) => {
            return this.findByValue(null, value);
        });
    }

    updateComponentHasFocus() {
        const componentHasFocus = this.state.fieldHasFocus || this.state.menuPressed;
        if (componentHasFocus != this.state.componentHasFocus) {
            this.setState({componentHasFocus: componentHasFocus});
        }
    }

    componentFocusDidUpdate(prevFocus) {
        if (this.state.componentHasFocus) {
            this.setState({options: this.state.defaultOptions, search: ''});

            // Override the context with `null` instead of leaking `this.props` as the context.
            this.props.onFocus.call(null, this.publishOption(), this.state, this.props);
        } else {
            let search = '';

            if (this.state.value && this.props.search && !this.props.multiple) {
                let option = this.findByValue(null, this.state.value);
                search = option.name;
            }

            // The menu can't be open if the component isn't focused.
            this.setState({menuOpen: false, highlighted: null, search: search});

            // Override the context with `null` instead of leaking `this.props` as the context.
            this.props.onBlur.call(null, this.publishOption(), this.state, this.props);
        }
    }

    fieldFocusDidUpdate(prevFocus) {
        this.updateComponentHasFocus();

        if (this.state.fieldHasFocus) {
            // document.addEventListener('keydown', this.onKeyDown);
            // document.addEventListener('keypress', this.onKeyPress);
            // document.addEventListener('keyup', this.onKeyUp);
        } else {
            // document.removeEventListener('keydown', this.onKeyDown);
            // document.removeEventListener('keypress', this.onKeyPress);
            // document.removeEventListener('keyup', this.onKeyUp);
        }
    }

    menuOpenDidUpdate(prevOpen) {
        if (this.state.menuOpen) {
            this.optimizeMenuHeight();

            // Override the context with `null` instead of leaking `this.props` as the context.
            this.props.onOpen.call(null, this.publishOption(), this.state, this.props);
        } else {
            // Override the context with `null` instead of leaking `this.props` as the context.
            this.props.onClose.call(null, this.publishOption(), this.state, this.props);
        }
    }

    menuPressedDidUpdate(prevPressed) {
        this.updateComponentHasFocus();

        if (this.state.menuPressed) {

        } else {

        }
    }

    optimizeMenuHeight() {
        if (this.state.options.length > 0 && !this.props.multiple) {
            let element = this.refs.select;
            let viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            let elementPos     = element.getBoundingClientRect();
            let selectHeight   = viewportHeight - elementPos.top - 20;

            element.style.maxHeight = selectHeight + 'px';
        }
    }

    findIndexByOption(searchOption, options) {
        if (!options) {
            options = this.state.options;
        }

        if (options.length < 1) {
            return -1;
        }

        let index = -1;

        options.some(function (option, i) {
            if (option.value === searchOption.value) {
                index = i;
                return true;
            }

            return false;
        });

        return index;
    }

    findByValue(source, value) {
        if (!source || source.length < 1) {
            source = this.state.defaultOptions;
        }

        if (!source) {
            return null;
        }

        return source.filter(function (object) {
            return object.value === value;
        })[0];
    }

    toggle = (event) => {
        event && event.preventDefault();
        this.setState({menuOpen: !this.state.menuOpen});
    }

    placeSelectedFirst(options, value) {
        if (!value && this.state) {
            value = this.state.value;
        }

        if (this.props.multiple || !value) {
            return options;
        }

        let option = this.findByValue(options, value);

        if (!option) {
            return options;
        }

        let index = this.findIndexByOption(option, options);

        if (index < 0 || index > options.length - 1) {
            return options;
        }

        options.splice(index, 1);
        options.splice(0, 0, option);

        return options;
    }

    menuDidPress = () => this.setState({menuPressed: true});
    menuDidUnpress = () => {
        this.refs.search && this.refs.search.focus();
        this.setState({menuPressed: false});
    }

    chooseOption(value) {
        let currentValue = this.state.value;
        let option;
        let search;

        if (!value) {
            let index = this.state.highlighted;

            if (!index || (this.state.options.length - 1) < index) {
                index = 0;
            }

            option = this.state.options[index];
        } else {
            option = this.findByValue(this.state.defaultOptions, value);
        }

        if (this.props.multiple) {
            if (!currentValue) {
                currentValue = [];
            }

            currentValue.push(option.value);

            search = '';
        } else {
            currentValue = option.value;
            search = option.name;
        }

        let options = this.state.defaultOptions;
        let highlighted = (this.props.multiple) ? this.state.highlighted : null;

        this.placeSelectedFirst(options, option.value);

        this.setState({value: currentValue, search: search, options: options, highlighted: highlighted, /*fieldHasFocus: this.props.multiple,*/ menuOpen: false});

        if (this.props.search && !this.props.multiple) {
            this.refs.search.blur();
        }
    }

    removeOption(value) {
        if (!value) {
            return false;
        }

        let option = this.findByValue(this.state.defaultOptions, value);
        value = this.state.value;

        if (!option || value.indexOf(option.value) < 0) {
            return false;
        }

        value.splice(value.indexOf(option.value), 1);

        this.setState({value: value, search: ''});
    }

    getNewOptionsList(options, value) {
        if (options && options.length > 0 && value && value.length > 0) {
            let fuse         = new Fuse(options, this.props.fuse);
            let foundOptions = fuse.search(value);

            return foundOptions;
        }

        return options;
    }

    scrollToSelected() {
        if (this.props.multiple || this.state.highlighted == null || !this.refs.select || !this.state.fieldHasFocus || !this.state.menuOpen || this.state.options.length < 1) {
            return;
        }

        let selectedItem = this.refs.selectOptions.querySelector('.' + Bem.m(this.classes.option, 'hover'));

        this.refs.select.scrollTop = selectedItem.offsetTop;
    }

    /**
     * Component render
     * -------------------------------------------------------------------------*/
    renderOptions() {
        let select       = null;
        let options      = [];
        let selectStyle  = {};
        let foundOptions = this.state.options;

        if (foundOptions && foundOptions.length > 0) {
            foundOptions.forEach((element, i) => {
                let className = this.classes.option;

                if (this.state.highlighted === i) {
                    className += ' ' + Bem.m(this.classes.option, 'hover');
                }

                if ((this.props.multiple && this.state.value.indexOf(element.value) >= 0) || element.value === this.state.value) {
                    className += ' ' + Bem.m(this.classes.option, 'selected');
                }

                if (this.props.multiple) {
                    if (this.state.value.indexOf(element.value) < 0) {
                        options.push(<li className={className} onClick={() => {
                            console.log('!', element.value);
                            this.chooseOption(element.value);
                        }} key={element.value + '-option'} data-value={element.value}>{this.props.renderOption(element, this.state, this.props)}</li>);
                    } else {
                        options.push(<li className={className} onClick={() => {
                            console.log('!', element.value);
                            this.removeOption(element.value);
                        }} key={element.value + '-option'} data-value={element.value}>{this.props.renderOption(element, this.state, this.props)}</li>);
                    }
                } else {
                    if (element.value === this.state.value) {
                        options.push(<li className={className} key={element.value + '-option'} data-value={element.value}>{this.props.renderOption(element)}</li>);
                    } else {
                        options.push(<li className={className} onClick={() => {
                            console.log('!', element.value);
                            this.chooseOption(element.value);
                        }} key={element.value + '-option'} data-value={element.value}>{this.props.renderOption(element, this.state, this.props)}</li>);
                    }
                }
            });

            if (options.length > 0) {
                select = (
                    <ul ref="selectOptions" className={this.classes.options} onMouseDown={this.menuDidPress} onTouchStart={this.menuDidPress} onMouseUp={this.menuDidUnpress} onTouchEnd={this.menuDidUnpress}>
                        {options}
                    </ul>
                );
            }
        }

        if (this.props.multiple) {
            selectStyle.height = this.props.height;
        }

        let className = this.classes.select;

        if (this.state.menuOpen) {
            className += ' ' + Bem.m(this.classes.select, 'display');
        }

        return (
            <div ref="select" className={className} style={selectStyle}>
                {select}
            </div>
        );
    }

    renderOutElement() {
        let option = null;
        let outElement;

        if (this.props.multiple) {
            if (this.state.value) {
                let finalValueOptions = [];

                this.state.value.forEach((value, i) => {
                    option = this.findByValue(this.state.defaultOptions, value);
                    finalValueOptions.push(<option key={i} value={option.value}>{option.name}</option>);
                });

                outElement = (
                    <select value={this.state.value} className={this.classes.out} name={this.props.name} readOnly multiple>
                        {finalValueOptions}
                    </select>
                );
            } else {
                outElement = (
                    <select className={this.classes.out} name={this.props.name} readOnly multiple>
                        <option>Nothing selected</option>
                    </select>
                );
            }
        } else {
            if (this.props.search) {
                outElement = <input type="hidden" defaultValue={this.state.value} ref="outInput" name={this.props.name} />;
            } else {
                let outStyle = {
                    opacity: 0,
                    position: 'absolute',
                    top: '-9999px',
                    left: '-9999px'
                };

                outElement = <input type="text" /*onFocus={this.fieldDidFocus} onBlur={this.fieldDidBlur}*/ style={outStyle} value={this.state.value} readOnly={true} ref="outInput" name={this.props.name} />;
            }
        }

        return outElement;
    }

    renderSearchField() {
        let searchField = null;

        const keyboardEvents = {
            onKeyDown  : this.onKeyDown,
            onKeyPress : this.onKeyPress,
            onKeyUp    : this.onKeyUp
        };
        const focusEvents = {
            onFocus : this.fieldDidFocus,
            onBlur  : this.fieldDidBlur
        };

        if (this.props.search) {
            let name = null;

            searchField = <input {...focusEvents} {...keyboardEvents} name={name} ref="search" className={this.classes.search} type="search" value={this.state.search} onChange={this.searchDidChange} placeholder={this.props.placeholder} />;
        } else {
            let option;
            let labelValue;
            let labelClassName;

            if (!this.state.value) {
                labelValue     = this.props.placeholder;
                labelClassName = this.classes.search + ' ' + Bem.m(this.classes.search, 'placeholder');
            } else {
                option         = this.findByValue(this.state.defaultOptions, this.state.value);
                labelValue     = option.name;
                labelClassName = this.classes.search;
            }

            searchField = <a href="javascript://" {...focusEvents} {...keyboardEvents} onClick={this.toggle} className={labelClassName}>{labelValue}</a>;
        }

        return searchField;
    }

    render() {
        return (
            <div ref="container" className={classnames(this.classes.container, Bem.m(this.classes.container, 'select'), {
                [Bem.m(this.classes.container, 'multiple')]: this.props.multiple,
                [Bem.m(this.classes.container, 'focus')]: this.state.fieldHasFocus,
                [Bem.m(this.classes.container, 'open')]: this.state.menuOpen,
            })}>
                {this.renderOutElement()}
                {this.renderSearchField()}
                {this.renderOptions()}
            </div>
        );
    }

}

Component.displayName  = displayName;
Component.propTypes    = propTypes;
Component.defaultProps = defaultProps;

export default Component;
