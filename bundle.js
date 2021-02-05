function whichTransitionEvent() {
    var el = document.createElement('fakeelement');
    var transitions = {
        'transition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'MozTransition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd'
    };

    for (var t in transitions) {
        if (el.style[t] !== undefined) {
            return transitions[t];
        }
    }
}

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var SKEWED_CLASSNAME = 'cz-body-container--skewed';
var OVERLAY_ACTIVE_CLASSNAME = 'cz-body-container__loader-overlay--active';
var BUTTON_ACTIVE_CLASSNAME = 'cz-menu-button--active';
var MENU_LINK_ACTIVE_CLASSNAME = 'cz-navigation__list-link--active';
var BODY_PERSPECTIVE_CLASSNAME = 'cz-body-perspective';

var Navigation = function () {
    /**
     * Create a navigation instance
     * @param nav {string} Reference to the navigation element
     * @param content{string} Reference to the content element
     * @param isOpen {Boolean} Defines the initial open state
     */
    function Navigation(nav, content, isOpen) {
        classCallCheck(this, Navigation);

        this.$nav = document.querySelector(nav);
        this.$content = document.querySelector(content);
        this.$contentOverlay = document.querySelector(content + '-overlay');
        this.$switch = this.$nav.querySelector('[cz-menu-button]');
        this.$links = this.$nav.getElementsByTagName('a');

        this._open = false;
        this._loading = false;

        this.open = isOpen;

        this.setListeners();
        this.setActiveLink();
    }

    /**
     * Sets global listeners
     */


    createClass(Navigation, [{
        key: 'setListeners',
        value: function setListeners() {
            var _this = this;

            this.$switch.addEventListener('click', function (e) {
                _this.$switch.blur();
                _this.open = !_this.open;
            });

            [].concat(toConsumableArray(this.$links)).forEach(function ($link) {
                $link.addEventListener('click', function (e) {
                    e.preventDefault();
                    _this.navigate($link.getAttribute('href'));
                });
            });
        }

        /**
         * Adds an active class to the link for the current page
         */

    }, {
        key: 'setActiveLink',
        value: function setActiveLink() {
            [].concat(toConsumableArray(this.$links)).forEach(function ($link) {
                if ($link.getAttribute('href') === window.location.pathname) {
                    $link.classList.add(MENU_LINK_ACTIVE_CLASSNAME);
                }
            });
        }

        /**
         * Sets the 'open' state
         * @param isOpen {Boolean}
         */

    }, {
        key: 'navigate',


        /**
         * Navigates to a specific url
         * @param href {string} Url href
         */
        value: function navigate(href) {
            var _this2 = this;

            var transitionEvent = whichTransitionEvent();
            var setWindowLocation = function setWindowLocation() {
                window.location = href;

                _this2.$content.addEventListener(transitionEvent, setWindowLocation);
            };

            this.open = false;

            transitionEvent && this.$content.addEventListener(transitionEvent, setWindowLocation);
        }
    }, {
        key: 'open',
        set: function set(isOpen) {
            var _this3 = this;

            var transitionEvent = whichTransitionEvent();
            var removePerspective = function removePerspective() {
                if (!_this3._open) {
                    document.body.classList.remove(BODY_PERSPECTIVE_CLASSNAME);
                }

                _this3.$content.removeEventListener(transitionEvent, removePerspective);
            };

            this._open = isOpen;

            if (isOpen) {
                document.body.classList.add(BODY_PERSPECTIVE_CLASSNAME);
                this.$content.classList.add(SKEWED_CLASSNAME);
                this.$switch.classList.add(BUTTON_ACTIVE_CLASSNAME);
            } else {
                this.$content.classList.remove(SKEWED_CLASSNAME);
                this.$contentOverlay.classList.remove(OVERLAY_ACTIVE_CLASSNAME);
                this.$switch.classList.remove(BUTTON_ACTIVE_CLASSNAME);
            }

            this.$content.addEventListener(transitionEvent, removePerspective);
        }

        /**
         * Sets the 'loading' state
         * @param isLoading {Boolean}
         */
        ,


        /**
         * Returns the open state
         * @returns {Boolean}
         */
        get: function get() {
            return this._open;
        }
    }, {
        key: 'loading',
        set: function set(isLoading) {
            this._loading = isLoading;

            if (isLoading) {
                this.$contentOverlay.classList.add(OVERLAY_ACTIVE_CLASSNAME);
            } else {
                this.$contentOverlay.classList.remove(OVERLAY_ACTIVE_CLASSNAME);
            }
        }

        /**
         * Returns the loading state
         * @returns {Boolean}
         */
        ,
        get: function get() {
            return this._loading;
        }
    }]);
    return Navigation;
}();

function findCzElements(dataAttr) {
    return findByAttr(dataAttr);
}

function findByAttr(dataAttr, dataAttrVal) {
    var scope = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document;

    var queryAddition = '';

    if (dataAttrVal) {
        queryAddition = '~="' + dataAttrVal + '"';
    }

    var query = '[cz-' + dataAttr + queryAddition + ']';

    return [].slice.call(scope.querySelectorAll(query));
}

function getOffsetFromElement(el) {
    var x = 0;
    var y = 0;

    while (el) {
        if (el.tagName === 'BODY') {
            x += el.offsetLeft + el.clientLeft;
            y += el.offsetTop + el.clientTop;
        } else {
            x += el.offsetLeft - el.scrollLeft + el.clientLeft;
            y += el.offsetTop - el.scrollTop + el.clientTop;
        }

        el = el.offsetParent;
    }

    return { y: y, x: x };
}

function getElementDimensions(element) {
    var offset = getOffsetFromElement(element);

    return {
        height: element.offsetHeight,
        width: element.offsetWidth,
        top: offset.y,
        left: offset.x
    };
}

var pfx = ['webkit', 'moz', 'MS', 'o', ''];
function onPrefixedEvent(element, type, callback) {
    for (var p = 0; p < pfx.length; p++) {
        if (!pfx[p]) type = type.toLowerCase();
        element.addEventListener(pfx[p] + type, callback, false);
    }
}

function offPrefixedEvent(element, type, callback) {
    for (var p = 0; p < pfx.length; p++) {
        if (!pfx[p]) type = type.toLowerCase();
        element.removeEventListener(pfx[p] + type, callback);
    }
}

var panelAnimateClass = 'cz-split-panels__panel-bg--animate';
var panelPreAnimateClass = 'cz-split-panels__panel-bg--pre-animate';
var panelsAnimateClass = 'cz-split-panels--active';
var diamondSpacerClass = 'cz-diamond--spacer';
var $diamonds = findCzElements('diamond').filter(function ($diamond) {
    return !$diamond.classList.contains(diamondSpacerClass);
});
var $splitPanels = findCzElements('diamond-split-panel');

var panelDisplayStyle = {
    hide: 'none',
    show: 'block'
};

var KEYCODES = {
    ESCAPE: 27
};

function DiamondSplitPanel(bodyLocker, nav) {

    var keyDownFunction = void 0;

    initialize();

    function initialize() {
        $splitPanels.forEach(function ($panel) {
            document.body.appendChild($panel);
        });
        $diamonds.forEach(function ($diamond) {
            return $diamond.onclick = showPanel.bind(null, $diamond);
        });
    }

    function showPanel($diamond) {
        if (!nav.open) {
            animatePanel();
        } else {
            nav.open = false;
            onPrefixedEvent(nav.$content, 'transitionend', animatePanel);
        }

        function animatePanel() {
            //Get the actual diamond shape
            var $diamondShape = findByAttr('diamond-shape', '', $diamond)[0];
            //Get the member name from a diamond
            var memberName = $diamond.getAttribute('cz-team-member');
            //Get the panels by memberName
            var $splitPanelsFiltered = $splitPanels.filter(function (panel) {
                return panel.getAttribute('cz-team-member') === memberName;
            });
            if ($splitPanelsFiltered && $splitPanelsFiltered.length) {
                //Get the first panel (there should always be one)
                var $splitPanelOverlay = $splitPanelsFiltered[0];
                //Get the panel shape from the current
                var $panelShape = findByAttr('panel-from-diamond', '', $splitPanelOverlay)[0];
                //Lock the body for the overlay
                bodyLocker.lockMobile();
                //Show the panel overlay
                $splitPanelOverlay.style.display = panelDisplayStyle.show;
                //Set scrolling to top
                $splitPanelOverlay.scrollTop = 0;
                //Animate panel shape from diamond shape
                openPanelBgFromDiamond($panelShape, $splitPanelOverlay, $diamondShape);
                //Init click handler for closing the overlay
                $splitPanelOverlay.onclick = closePanelToDiamond.bind(null, $splitPanelOverlay);
            }
            offPrefixedEvent(nav.$content, 'transitionend', animatePanel);
        }
    }

    function openPanelBgFromDiamond($panel, $splitPanel, $diamond) {
        var diamondDims = getElementDimensions($diamond),
            panelDims = getElementDimensions($panel);

        var transformations = calculatePanelTransformations(diamondDims, panelDims);

        Object.assign($panel.style, transformations);

        //Set up key down function and attach eventlistener
        keyDownFunction = function keyDownFunction(e) {
            return handleKeydown(e, $splitPanel);
        };
        document.addEventListener('keydown', keyDownFunction);

        requestAnimationFrame(function () {
            $splitPanel.classList.add(panelsAnimateClass);
            $panel.classList.add(panelAnimateClass);
            $panel.style.transform = null;
            $panel.classList.remove(panelPreAnimateClass);
            onPrefixedEvent($panel, 'transitionend', removeAnimateClass);
        });

        function removeAnimateClass() {
            $panel.classList.remove(panelAnimateClass);
            offPrefixedEvent($panel, 'transitionend', removeAnimateClass);
        }
    }

    function handleKeydown(e, $splitPanel) {
        if (e.keyCode === KEYCODES.ESCAPE) {
            closePanelToDiamond($splitPanel);
        }
    }

    function closePanelToDiamond($splitPanel) {
        requestAnimationFrame(function () {
            $splitPanel.classList.remove(panelsAnimateClass);
            onPrefixedEvent($splitPanel, 'transitionend', hideSplitPanels);
        });

        document.removeEventListener('keydown', keyDownFunction);

        function hideSplitPanels() {
            $splitPanel.style.display = panelDisplayStyle.hide;
            offPrefixedEvent($splitPanel, 'transitionend', hideSplitPanels);
            bodyLocker.unlockMobile();
        }
    }

    function calculatePanelTransformations(diamondDimensions, panelDimensions) {
        var translateX = diamondDimensions.left - panelDimensions.left;
        var translateY = diamondDimensions.top - panelDimensions.top;
        var scaleX = diamondDimensions.width / panelDimensions.width;
        var scaleY = diamondDimensions.height / panelDimensions.height;

        return {
            transform: 'translate3d(' + translateX + 'px, ' + translateY + 'px, 0) rotate(-45deg) scale(' + scaleX + ', ' + scaleY + ')'
        };
    }
}

var animationEvent;
var transitionEvent;
var transitions = {
    "transition": "transitionend",
    "OTransition": "oTransitionEnd",
    "MozTransition": "transitionend",
    "WebkitTransition": "webkitTransitionEnd"
};

var animations = {
    "animation": "animationend",
    "OAnimation": "oAnimationEnd",
    "MozAnimation": "animationend",
    "WebkitAnimation": "webkitAnimationEnd"
};

/**
* @ignore
* @public
* @name listenForTransitionEnd
* @param {object} element the target element of the transition
* @param {function} callback the function to be called after transition end
*
* @description
* Listen for the end of the transition, then call a function
*/
function listenForTransitionEnd(element, callback) {
    listenForEnd('transition', element, callback);
}

/**
* @ignore
* @private
* @name listenForEnd
* @param {string} type the listener type (transition / animation)
* @param {object} element the target element of the transition/animation
* @param {function} callback the function to be called after transition/animation end
*
* @description
* Determines and sets eventlistener, triggers callback after end. used by listenForTransitionEnd / listenForAnimationEnd
*/
function listenForEnd(type, element, callback) {
    var arTypes = ['transition', 'animation'];
    if (arTypes.indexOf(type) < 0 || element === 'undefined' || typeof callback !== 'function') {
        return;
    }

    var eventType = type === 'transition' ? whichTransitionEvent$1() : whichAnimationEvent(),
        eventCallback = function eventCallback() {
        element.removeEventListener(eventType, eventCallback, false);
        callback();
    };

    element.addEventListener(eventType, eventCallback, false);
}

/**
* @ignore
* @public
* @name whichAnimationEvent
* @returns {string} animationEvent of the current browser
*
* @description
* Determines and caches animationEvent of the current browser
*/
function whichAnimationEvent() {
    if (animationEvent) {
        return animationEvent;
    }

    return animationEvent = determineEventType(animations);
}

/**
* @ignore
* @public
* @name whichTransitionEvent
* @returns {string} transitionEvent of the current browser
*
* @description
* Determines and caches transitionEvent of the current browser
*/
function whichTransitionEvent$1() {
    if (transitionEvent) {
        return transitionEvent;
    }

    return transitionEvent = determineEventType(transitions);
}

/**
* @ignore
* @private
* @name determineEventType
* @param {Object} eventTypes Object of eventTypes
* @returns {string} eventType of the current browser
*
* returns eventType of the current browser. used by whichTransitionEvent and whichAnimationEvent
*/
function determineEventType(eventTypes) {
    var t,
        el = document.createElement("fakeelement");

    for (t in eventTypes) {
        if (el.style[t] !== undefined) {
            return eventTypes[t];
        }
    }
}

var _class = function () {
    function _class(instance) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        classCallCheck(this, _class);

        this.el = document.querySelector(instance);
        this.cycle = undefined;
        this.options = Object.assign({
            interval: 5000, // set to 0 to disable
            equaliseHeight: false,
            class: {
                current: 'cz-carousel--current',
                item: 'cz-carousel--item',
                transition: 'cz-carousel--transition',
                navigation: {
                    next: 'cz-carousel-next',
                    previous: 'cz-carousel-previous'
                }
            }
        }, options);
        this.slides = this.el.querySelectorAll('.' + this.options.class.item);

        // TODO: Fix height issues with CSS instead of js
        if (this.options.equaliseHeight) {
            this.el.style.height = Array.from(this.slides).reduce(function (maxHeight, slide) {
                return slide.offsetHeight > maxHeight ? slide.offsetHeight : maxHeight;
            }, 0) + 'px';
        }

        if (!this.el.nodeName) {
            console.error('Carousel ' + this.el + ' is not a valid HTML element');
            return;
        }
        this.carousel = instance;

        //Show First slide
        this.slides[0].classList.add(this.options.class.current);
        this.init();
        this.addListeners();
    }

    createClass(_class, [{
        key: 'init',
        value: function init() {
            var _self = this;
            if (_self.options.interval > 0) {
                this.cycle = setInterval(function () {
                    _self.slide('right');
                }, _self.options.interval);
            }
        }
    }, {
        key: 'addListeners',
        value: function addListeners() {
            var _self = this;

            var next = this.el.querySelector('.' + this.options.class.navigation.next);
            if (next) {
                next.addEventListener('click', function () {
                    _self.triggerSlide('right');
                });
            }

            var previous = this.el.querySelector('.' + this.options.class.navigation.previous);
            if (previous) {
                previous.addEventListener('click', function () {
                    _self.triggerSlide('left');
                });
            }
        }
    }, {
        key: 'triggerSlide',
        value: function triggerSlide(direction) {
            if (!direction) {
                return;
            }

            this.slide(direction);
            window.clearInterval(this.cycle);
            this.init();
        }
    }, {
        key: 'slide',
        value: function slide(direction) {
            var current = void 0,
                next = void 0;

            if (direction) {
                this.el.setAttribute('cz-carousel-direction', direction);
            }

            for (var i = 0; i < this.slides.length; i++) {
                if (this.slides[i].classList.contains(this.options.class.current)) {
                    current = this.slides[i];

                    if (direction === 'right') {
                        next = i + 1 < this.slides.length ? this.slides[i + 1] : this.slides[0];
                    } else {
                        next = i - 1 >= 0 ? this.slides[i - 1] : this.slides[this.slides.length - 1];
                    }
                }
            }

            current.classList.add(this.options.class.transition);

            var _self = this;
            listenForTransitionEnd(current, function () {
                current.classList.remove(_self.options.class.transition);
                current.classList.remove(_self.options.class.current);
                next.classList.add(_self.options.class.current);
            });
        }
    }]);
    return _class;
}();

var bodyLockClassname = 'body--locked-mobile';
var bodyEl = document.body;

var BodyLocker = function () {
    function BodyLocker() {
        classCallCheck(this, BodyLocker);
    }

    createClass(BodyLocker, [{
        key: 'lockMobile',
        value: function lockMobile() {
            bodyEl.classList.add(bodyLockClassname);
        }
    }, {
        key: 'unlockMobile',
        value: function unlockMobile() {
            bodyEl.classList.remove(bodyLockClassname);
        }
    }]);
    return BodyLocker;
}();

var Main = function Main() {
    classCallCheck(this, Main);

    var nav = new Navigation('[cz-menu]', '#body-container');
    var bodyLocker = new BodyLocker();
    new DiamondSplitPanel(bodyLocker, nav);

    // only create a carousel when the attribute cz-carousel is present
    if (document.querySelector('[cz-carousel]') !== null) {
        var carousel = new _class('[cz-carousel]');
    }
    if (document.querySelector('[cz-bedrijven-carousel]') !== null) {
        var carousel2 = new _class('[cz-bedrijven-carousel]', {
            interval: 6000,
            equaliseHeight: true,
            class: {
                current: 'cz-bedrijven-carousel--current',
                item: 'cz-bedrijven-carousel--item',
                transition: 'cz-bedrijven-carousel--transition',
                navigation: {
                    next: 'cz-bedrijven-carousel--next',
                    previous: 'cz-bedrijven-carousel--previous'
                }
            }
        });
    }
};

// Start after page has been loaded


window.onload = function () {
    new Main();
};