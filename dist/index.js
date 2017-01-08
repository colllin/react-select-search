'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _fuse = require('fuse.js');

var _fuse2 = _interopRequireDefault(_fuse);

var _classnames2 = require('classnames');

var _classnames3 = _interopRequireDefault(_classnames2);

var _Bem = require('./Bem');

var _Bem2 = _interopRequireDefault(_Bem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var displayName = 'SelectSearch';
var propTypes = {
    options: _react2.default.PropTypes.array.isRequired,
    className: _react2.default.PropTypes.string.isRequired,
    search: _react2.default.PropTypes.bool.isRequired,
    placeholder: _react2.default.PropTypes.string,
    multiple: _react2.default.PropTypes.bool.isRequired,
    height: _react2.default.PropTypes.number,
    name: _react2.default.PropTypes.string,
    fuse: _react2.default.PropTypes.object.isRequired,
    onChange: _react2.default.PropTypes.func.isRequired,
    onHighlight: _react2.default.PropTypes.func.isRequired,
    onMount: _react2.default.PropTypes.func.isRequired,
    onBlur: _react2.default.PropTypes.func.isRequired,
    onFocus: _react2.default.PropTypes.func.isRequired,
    onOpen: _react2.default.PropTypes.func.isRequired,
    onClose: _react2.default.PropTypes.func.isRequired,
    renderOption: _react2.default.PropTypes.func.isRequired,
    value: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.array])
};

var defaultProps = {
    options: [],
    className: 'select-search-box',
    search: true,
    value: '',
    placeholder: null,
    multiple: false,
    height: 200,
    name: null,
    onHighlight: function onHighlight() {},
    onMount: function onMount() {},
    onBlur: function onBlur() {},
    onFocus: function onFocus() {},
    onOpen: function onOpen() {},
    onClose: function onClose() {},
    onChange: function onChange() {},
    renderOption: function renderOption(option) {
        return option.name;
    },
    fuse: {
        keys: ['name'],
        threshold: 0.3
    }
};

var Component = function (_React$Component) {
    _inherits(Component, _React$Component);

    /**
     * Component setup
     * -------------------------------------------------------------------------*/
    function Component(props) {
        _classCallCheck(this, Component);

        var _this = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this, props));

        _initialiseProps.call(_this);

        var options = props.options;
        var value = !props.value && props.multiple ? [] : props.value;
        var search = '';

        if (value) {
            var option = _this.findByValue(options, value);

            if (option) {
                search = option.name;
            }
        }

        _this.placeSelectedFirst(options, value);

        _this.state = {
            search: search,
            value: value,
            defaultOptions: props.options,
            options: options,
            highlighted: null,
            fieldHasFocus: false,
            componentHasFocus: false,
            menuOpen: false
        };

        _this.updateClassnames(props);
        return _this;
    }

    _createClass(Component, [{
        key: 'updateClassnames',
        value: function updateClassnames(newProps) {
            this.classes = {
                container: newProps.className,
                search: _Bem2.default.e(newProps.className, 'search'),
                select: _Bem2.default.e(newProps.className, 'select'),
                options: _Bem2.default.e(newProps.className, 'options'),
                option: _Bem2.default.e(newProps.className, 'option'),
                out: _Bem2.default.e(newProps.className, 'out'),
                label: _Bem2.default.e(newProps.className, 'label')
            };
        }

        /**
         * Component lifecycle
         * -------------------------------------------------------------------------*/

    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {}
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.props.onMount.call(null, this.publishOption(), this.state, this.props);
            this.scrollToSelected();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            // document.removeEventListener('keydown', this.onKeyDown);
            // document.removeEventListener('keypress', this.onKeyPress);
            // document.removeEventListener('keyup', this.onKeyUp);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.className != this.props.className) {
                this.updateClassnames(nextProps);
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
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

    }, {
        key: 'handleArrowDown',


        /**
         * Keyboard actions
         * -------------------------------------------------------------------------*/
        value: function handleArrowDown() {
            if (this.state.options.length < 1) {
                return;
            }

            var highlighted = null;

            if (this.state.highlighted != null) {
                highlighted = this.state.highlighted + 1;
            } else {
                highlighted = 0;
            }

            if (highlighted > this.state.options.length - 1) {
                highlighted = 0;
            }

            this.setState({ highlighted: highlighted });
        }
    }, {
        key: 'handleArrowUp',
        value: function handleArrowUp() {
            if (this.state.options.length < 1) {
                return;
            }

            var highlighted = this.state.options.length - 1;

            if (this.state.highlighted != null) {
                highlighted = this.state.highlighted - 1;
            }

            if (highlighted < 0) {
                highlighted = this.state.options.length - 1;
            }

            this.setState({ highlighted: highlighted });
        }
    }, {
        key: 'enterWasPressed',
        value: function enterWasPressed() {
            this.chooseOption();
        }
    }, {
        key: 'escWasPressed',
        value: function escWasPressed() {
            this.setState({ menuOpen: false });
        }

        /**
         * Custom methods
         * -------------------------------------------------------------------------*/

    }, {
        key: 'publishOption',
        value: function publishOption(value) {
            if (typeof value === 'undefined') {
                value = this.state.value;
            }

            if (this.props.multiple) {
                return this.publishOptionMultiple(value);
            }

            return this.publishOptionSingle(value);
        }
    }, {
        key: 'publishOptionSingle',
        value: function publishOptionSingle(value) {
            return this.findByValue(null, value);
        }
    }, {
        key: 'publishOptionMultiple',
        value: function publishOptionMultiple(value) {
            var _this2 = this;

            return value.map(function (value) {
                return _this2.findByValue(null, value);
            });
        }
    }, {
        key: 'updateComponentHasFocus',
        value: function updateComponentHasFocus() {
            var componentHasFocus = this.state.fieldHasFocus || this.state.menuPressed;
            if (componentHasFocus != this.state.componentHasFocus) {
                this.setState({ componentHasFocus: componentHasFocus });
            }
        }
    }, {
        key: 'componentFocusDidUpdate',
        value: function componentFocusDidUpdate(prevFocus) {
            if (this.state.componentHasFocus) {
                // The menu always opens on initial component focus.
                this.setState({ menuOpen: true, options: this.state.defaultOptions, search: '' });

                // Override the context with `null` instead of leaking `this.props` as the context.
                this.props.onFocus.call(null, this.publishOption(), this.state, this.props);
            } else {
                var search = '';

                if (this.state.value && this.props.search && !this.props.multiple) {
                    var option = this.findByValue(null, this.state.value);
                    search = option.name;
                }

                // The menu can't be open if the component isn't focused.
                this.setState({ menuOpen: false, highlighted: null, search: search });

                // Override the context with `null` instead of leaking `this.props` as the context.
                this.props.onBlur.call(null, this.publishOption(), this.state, this.props);
            }
        }
    }, {
        key: 'fieldFocusDidUpdate',
        value: function fieldFocusDidUpdate(prevFocus) {
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
    }, {
        key: 'menuOpenDidUpdate',
        value: function menuOpenDidUpdate(prevOpen) {
            if (this.state.menuOpen) {
                this.optimizeMenuHeight();

                // Override the context with `null` instead of leaking `this.props` as the context.
                this.props.onOpen.call(null, this.publishOption(), this.state, this.props);
            } else {
                // Override the context with `null` instead of leaking `this.props` as the context.
                this.props.onClose.call(null, this.publishOption(), this.state, this.props);
            }
        }
    }, {
        key: 'menuPressedDidUpdate',
        value: function menuPressedDidUpdate(prevPressed) {
            this.updateComponentHasFocus();

            if (this.state.menuPressed) {} else {}
        }
    }, {
        key: 'optimizeMenuHeight',
        value: function optimizeMenuHeight() {
            if (this.state.options.length > 0 && !this.props.multiple) {
                var element = this.refs.select;
                var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                var elementPos = element.getBoundingClientRect();
                var selectHeight = viewportHeight - elementPos.top - 20;

                element.style.maxHeight = selectHeight + 'px';
            }
        }
    }, {
        key: 'findIndexByOption',
        value: function findIndexByOption(searchOption, options) {
            if (!options) {
                options = this.state.options;
            }

            if (options.length < 1) {
                return -1;
            }

            var index = -1;

            options.some(function (option, i) {
                if (option.value === searchOption.value) {
                    index = i;
                    return true;
                }

                return false;
            });

            return index;
        }
    }, {
        key: 'findByValue',
        value: function findByValue(source, value) {
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
    }, {
        key: 'placeSelectedFirst',
        value: function placeSelectedFirst(options, value) {
            if (!value && this.state) {
                value = this.state.value;
            }

            if (this.props.multiple || !value) {
                return options;
            }

            var option = this.findByValue(options, value);

            if (!option) {
                return options;
            }

            var index = this.findIndexByOption(option, options);

            if (index < 0 || index > options.length - 1) {
                return options;
            }

            options.splice(index, 1);
            options.splice(0, 0, option);

            return options;
        }
    }, {
        key: 'chooseOption',
        value: function chooseOption(value) {
            var currentValue = this.state.value;
            var option = void 0;
            var search = void 0;

            if (!value) {
                var index = this.state.highlighted;

                if (!index || this.state.options.length - 1 < index) {
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

            var options = this.state.defaultOptions;
            var highlighted = this.props.multiple ? this.state.highlighted : null;

            this.placeSelectedFirst(options, option.value);

            this.setState({ value: currentValue, search: search, options: options, highlighted: highlighted, /*fieldHasFocus: this.props.multiple,*/menuOpen: false });

            if (this.props.search && !this.props.multiple) {
                this.refs.search.blur();
            }
        }
    }, {
        key: 'removeOption',
        value: function removeOption(value) {
            if (!value) {
                return false;
            }

            var option = this.findByValue(this.state.defaultOptions, value);
            value = this.state.value;

            if (!option || value.indexOf(option.value) < 0) {
                return false;
            }

            value.splice(value.indexOf(option.value), 1);

            this.setState({ value: value, search: '' });
        }
    }, {
        key: 'getNewOptionsList',
        value: function getNewOptionsList(options, value) {
            if (options && options.length > 0 && value && value.length > 0) {
                var fuse = new _fuse2.default(options, this.props.fuse);
                var foundOptions = fuse.search(value);

                return foundOptions;
            }

            return options;
        }
    }, {
        key: 'scrollToSelected',
        value: function scrollToSelected() {
            if (this.props.multiple || this.state.highlighted == null || !this.refs.select || !this.state.fieldHasFocus || !this.state.menuOpen || this.state.options.length < 1) {
                return;
            }

            var selectedItem = this.refs.selectOptions.querySelector('.' + _Bem2.default.m(this.classes.option, 'hover'));

            this.refs.select.scrollTop = selectedItem.offsetTop;
        }

        /**
         * Component render
         * -------------------------------------------------------------------------*/

    }, {
        key: 'renderOptions',
        value: function renderOptions() {
            var _this3 = this;

            var select = null;
            var options = [];
            var selectStyle = {};
            var foundOptions = this.state.options;

            if (foundOptions && foundOptions.length > 0) {
                foundOptions.forEach(function (element, i) {
                    var className = _this3.classes.option;

                    if (_this3.state.highlighted === i) {
                        className += ' ' + _Bem2.default.m(_this3.classes.option, 'hover');
                    }

                    if (_this3.props.multiple && _this3.state.value.indexOf(element.value) >= 0 || element.value === _this3.state.value) {
                        className += ' ' + _Bem2.default.m(_this3.classes.option, 'selected');
                    }

                    if (_this3.props.multiple) {
                        if (_this3.state.value.indexOf(element.value) < 0) {
                            options.push(_react2.default.createElement(
                                'li',
                                { className: className, onClick: function onClick() {
                                        console.log('!', element.value);
                                        _this3.chooseOption(element.value);
                                    }, key: element.value + '-option', 'data-value': element.value },
                                _this3.props.renderOption(element, _this3.state, _this3.props)
                            ));
                        } else {
                            options.push(_react2.default.createElement(
                                'li',
                                { className: className, onClick: function onClick() {
                                        console.log('!', element.value);
                                        _this3.removeOption(element.value);
                                    }, key: element.value + '-option', 'data-value': element.value },
                                _this3.props.renderOption(element, _this3.state, _this3.props)
                            ));
                        }
                    } else {
                        if (element.value === _this3.state.value) {
                            options.push(_react2.default.createElement(
                                'li',
                                { className: className, key: element.value + '-option', 'data-value': element.value },
                                _this3.props.renderOption(element)
                            ));
                        } else {
                            options.push(_react2.default.createElement(
                                'li',
                                { className: className, onClick: function onClick() {
                                        console.log('!', element.value);
                                        _this3.chooseOption(element.value);
                                    }, key: element.value + '-option', 'data-value': element.value },
                                _this3.props.renderOption(element, _this3.state, _this3.props)
                            ));
                        }
                    }
                });

                if (options.length > 0) {
                    select = _react2.default.createElement(
                        'ul',
                        { ref: 'selectOptions', className: this.classes.options, onMouseDown: this.menuDidPress, onTouchStart: this.menuDidPress, onMouseUp: this.menuDidUnpress, onTouchEnd: this.menuDidUnpress },
                        options
                    );
                }
            }

            if (this.props.multiple) {
                selectStyle.height = this.props.height;
            }

            var className = this.classes.select;

            if (this.state.menuOpen) {
                className += ' ' + _Bem2.default.m(this.classes.select, 'display');
            }

            return _react2.default.createElement(
                'div',
                { ref: 'select', className: className, style: selectStyle },
                select
            );
        }
    }, {
        key: 'renderOutElement',
        value: function renderOutElement() {
            var _this4 = this;

            var option = null;
            var outElement = void 0;

            if (this.props.multiple) {
                if (this.state.value) {
                    (function () {
                        var finalValueOptions = [];

                        _this4.state.value.forEach(function (value, i) {
                            option = _this4.findByValue(_this4.state.defaultOptions, value);
                            finalValueOptions.push(_react2.default.createElement(
                                'option',
                                { key: i, value: option.value },
                                option.name
                            ));
                        });

                        outElement = _react2.default.createElement(
                            'select',
                            { value: _this4.state.value, className: _this4.classes.out, name: _this4.props.name, readOnly: true, multiple: true },
                            finalValueOptions
                        );
                    })();
                } else {
                    outElement = _react2.default.createElement(
                        'select',
                        { className: this.classes.out, name: this.props.name, readOnly: true, multiple: true },
                        _react2.default.createElement(
                            'option',
                            null,
                            'Nothing selected'
                        )
                    );
                }
            } else {
                if (this.props.search) {
                    outElement = _react2.default.createElement('input', { type: 'hidden', defaultValue: this.state.value, ref: 'outInput', name: this.props.name });
                } else {
                    var outStyle = {
                        opacity: 0,
                        position: 'absolute',
                        top: '-9999px',
                        left: '-9999px'
                    };

                    outElement = _react2.default.createElement('input', { type: 'text' /*onFocus={this.fieldDidFocus} onBlur={this.fieldDidBlur}*/, style: outStyle, value: this.state.value, readOnly: true, ref: 'outInput', name: this.props.name });
                }
            }

            return outElement;
        }
    }, {
        key: 'renderSearchField',
        value: function renderSearchField() {
            var searchField = null;

            var keyboardEvents = {
                onKeyDown: this.onKeyDown,
                onKeyPress: this.onKeyPress,
                onKeyUp: this.onKeyUp
            };
            var focusEvents = {
                onFocus: this.fieldDidFocus,
                onBlur: this.fieldDidBlur
            };

            if (this.props.search) {
                var name = null;

                searchField = _react2.default.createElement('input', _extends({}, focusEvents, keyboardEvents, { name: name, ref: 'search', className: this.classes.search, type: 'search', value: this.state.search, onChange: this.searchDidChange, placeholder: this.props.placeholder }));
            } else {
                var option = void 0;
                var labelValue = void 0;
                var labelClassName = void 0;

                if (!this.state.value) {
                    labelValue = this.props.placeholder;
                    labelClassName = this.classes.search + ' ' + _Bem2.default.m(this.classes.search, 'placeholder');
                } else {
                    option = this.findByValue(this.state.defaultOptions, this.state.value);
                    labelValue = option.name;
                    labelClassName = this.classes.search;
                }

                searchField = _react2.default.createElement(
                    'a',
                    _extends({ href: 'javascript://' }, focusEvents, keyboardEvents, { onClick: this.toggle, className: labelClassName }),
                    labelValue
                );
            }

            return searchField;
        }
    }, {
        key: 'render',
        value: function render() {
            var _classnames;

            return _react2.default.createElement(
                'div',
                { ref: 'container', className: (0, _classnames3.default)(this.classes.container, _Bem2.default.m(this.classes.container, 'select'), (_classnames = {}, _defineProperty(_classnames, _Bem2.default.m(this.classes.container, 'multiple'), this.props.multiple), _defineProperty(_classnames, _Bem2.default.m(this.classes.container, 'focus'), this.state.fieldHasFocus), _defineProperty(_classnames, _Bem2.default.m(this.classes.container, 'open'), this.state.menuOpen), _classnames)) },
                this.renderOutElement(),
                this.renderSearchField(),
                this.renderOptions()
            );
        }
    }]);

    return Component;
}(_react2.default.Component);

var _initialiseProps = function _initialiseProps() {
    var _this5 = this;

    this.fieldDidFocus = function () {
        return _this5.setState({ fieldHasFocus: true });
    };

    this.fieldDidBlur = function () {
        return _this5.setState({ fieldHasFocus: false });
    };

    this.searchDidChange = function (e) {
        var value = e.target.value;

        if (!value) {
            value = '';
        }

        var options = _this5.state.defaultOptions;
        options = _this5.getNewOptionsList(options, value);

        _this5.placeSelectedFirst(options);

        _this5.setState({ search: value, options: options });
    };

    this.onKeyPress = function (e) {
        if (!_this5.state.options || _this5.state.options.length < 1) {
            return;
        }

        /** Enter */
        if (e.keyCode === 13) {
            return _this5.enterWasPressed();
        }
    };

    this.onKeyDown = function (e) {
        // if (!this.state.fieldHasFocus) {
        //     return;
        // }

        if (!_this5.state.menuOpen) {
            _this5.setState({ menuOpen: true });
        }

        /** Tab */
        // if (e.keyCode === 9) {
        //     return this.fieldDidBlur();
        // }

        /** Arrow Down */
        if (e.keyCode === 40) {
            _this5.handleArrowDown();
        }

        /** Arrow Up */
        if (e.keyCode === 38) {
            _this5.handleArrowUp();
        }
    };

    this.onKeyUp = function (e) {
        /** Esc */
        if (e.keyCode === 27) {
            _this5.escWasPressed();
        }
    };

    this.toggle = function (event) {
        event && event.preventDefault();
        _this5.setState({ menuOpen: !_this5.state.menuOpen });
    };

    this.menuDidPress = function () {
        return _this5.setState({ menuPressed: true });
    };

    this.menuDidUnpress = function () {
        _this5.refs.search && _this5.refs.search.focus();
        _this5.setState({ menuPressed: false });
    };
};

Component.displayName = displayName;
Component.propTypes = propTypes;
Component.defaultProps = defaultProps;

exports.default = Component;