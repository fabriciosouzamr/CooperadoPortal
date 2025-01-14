﻿app.directive("menuTop", function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: "directives/menus/menu-top.html"
  };
});
app.directive("menuSide", function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: "directives/menus/menu-side.html"
  };
});

app.directive("topBar", function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: "directives/top/top-bar.html"
  };
});

app.directive("topBreadcrumb", function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: "directives/top/top-breadcrumb.html"
  };
});

app.directive("pageFooter", function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: "directives/footer/page-footer.html"
  };
});

app.directive("nextFocus", [
  function() {
    return {
      restrict: "A",
      link: function(scope, elem, attrs) {
        elem.bind("keydown", function(e) {
          var code = e.keyCode || e.which;
          if (code === 13) {
            e.preventDefault();
            try {
              if (attrs.tabindex !== undefined) {
                var currentTabeIndex = attrs.tabindex;
                var nextTabIndex = parseInt(currentTabeIndex) + 1;
                var elems = document.querySelectorAll("[tabindex]");
                for (var i = 0, len = elems.length; i < len; i++) {
                  var el = angular.element(elems[i]);
                  var idx = parseInt(el.attr("tabindex"));
                  if (idx === nextTabIndex) {
                    elems[i].focus();
                    break;
                  }
                }
              }
            } catch (e) {
              console.log("Focus error: " + e);
            }
          }
        });
      }
    };
  }
]);

app.directive("formateDate", function() {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      element.on("keydown", function(e) {
        var k = e.keyCode;

        if (
          k != 8 &&
          k != 9 &&
          k != 13 &&
          (k < 48 || k > 105 || (k > 57 && k < 96))
        ) {
          e.preventDefault();
        }
      });
      element.on("keyup", function(e) {
        var v = element.val();
        var k = e.keyCode;

        if (k == 8 && (v.length == 3 || v.length == 6)) {
          scope.$apply(function() {
            element.val(v.slice(0, -1));
          });
        } else if (v.length == 2 || v.length == 5) {
          scope.$apply(function() {
            element.val(v + "/");
          });
        }
      });
    }
  };
});

app.filter("docFormat", function() {
  return function(doc) {
    if (doc != undefined) {
      if (doc.length == 14) {
        return (
          doc.substr(0, 2) +
          "." +
          doc.substr(2, 3) +
          "." +
          doc.substr(5, 3) +
          "/" +
          doc.substr(8, 4) +
          "-" +
          doc.substr(12, 2)
        );
      } else {
        return (
          doc.substr(0, 3) +
          "." +
          doc.substr(3, 3) +
          "." +
          doc.substr(6, 3) +
          "-" +
          doc.substr(9, 2)
        );
      }
    }

    return doc;
  };
});

app.filter("telFormat", function() {
  return function(tel) {
    if (tel != undefined) {
      if (tel.length == 11) {
        return (
          "(" +
          tel.substr(0, 2) +
          ")" +
          tel.substr(2, 5) +
          "-" +
          tel.substr(7, 4)
        );
      }
      if (tel.length == 10) {
        return (
          "(" +
          tel.substr(0, 2) +
          ")" +
          tel.substr(2, 4) +
          "-" +
          tel.substr(6, 4)
        );
      }
    }

    return tel;
  };
});

app.filter("formatData", function() {
  return function(data) {
    if (data != undefined) {
      console.log(data);
      var formatData =
        data.substring(8, 10) +
        "/" +
        data.substring(5, 7) +
        "/" +
        data.substring(0, 4);
    }
    return formatData;
  };
});

app.directive("numberChar", function() {
  return {
    require: "ngModel",
    restrict: "A",
    link: function(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function(inputValue) {
        if (inputValue == null) return "";
        cleanInputValue = inputValue.replace(/[^\d]/g, "");
        if (cleanInputValue != inputValue) {
          modelCtrl.$setViewValue(cleanInputValue);
          modelCtrl.$render();
        }
        return cleanInputValue;
      });
    }
  };
});

app.directive("restrictTo", function() {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      var re = RegExp(attrs.restrictTo);
      var exclude = /Backspace|Enter|Tab|Delete|Del|ArrowUp|Up|ArrowDown|Down|ArrowLeft|Left|ArrowRight|Right/;

      element[0].addEventListener("keydown", function(event) {
        if (!exclude.test(event.key) && !re.test(event.key)) {
          event.preventDefault();
        }
      });
    }
  };
});

app.directive("myOnFocus", function() {
  return {
    scope: true,
    restrict: "A",
    link: function(scope, elem, attr, ctrl) {
      elem.bind("focus", function() {
        if (scope[attr.myOnFocus]) {
          elem.triggerHandler("click");
        }
      });
      elem.bind("blur", function() {
        scope[attr.myOnFocus] = true;
      });
    }
  };
});

//novo componente de calendario em substituicao ao do Angular Material para aceitar mascara ao preencher
(function() {
  "use strict";

  angular
    .module("material.components.datepicker")
    .directive("mdDatepickerCustom", datePickerDirective);

  /**
   * @ngdoc directive
   * @name mdDatepickerCustom
   * @module material.components.datepicker
   *
   * @param {Date} ng-model The component's model. Expects a JavaScript Date object.
   * @param {expression=} ng-change Expression evaluated when the model value changes.
   * @param {Date=} md-min-date Expression representing a min date (inclusive).
   * @param {Date=} md-max-date Expression representing a max date (inclusive).
   * @param {(function(Date): boolean)=} md-date-filter Function expecting a date and returning a boolean whether it can be selected or not.
   * @param {String=} md-placeholder The date input placeholder value.
   * @param {boolean=} ng-disabled Whether the datepicker is disabled.
   * @param {boolean=} ng-required Whether a value is required for the datepicker.
   *
   * @description
   * `<md-datepicker>` is a component used to select a single date.
   * For information on how to configure internationalization for the date picker,
   * see `$mdDateLocaleProvider`.
   *
   * This component supports [ngMessages](https://docs.angularjs.org/api/ngMessages/directive/ngMessages).
   * Supported attributes are:
   * * `required`: whether a required date is not set.
   * * `mindate`: whether the selected date is before the minimum allowed date.
   * * `maxdate`: whether the selected date is after the maximum allowed date.
   *
   * @usage
   * <hljs lang="html">
   *   <md-datepicker ng-model="birthday"></md-datepicker>
   * </hljs>
   *
   */
  function datePickerDirective() {
    return {
      template:
        // Buttons are not in the tab order because users can open the calendar via keyboard
        // interaction on the text input, and multiple tab stops for one component (picker)
        // may be confusing.
        '<md-button class="md-datepicker-button md-icon-button" type="button" ' +
        'tabindex="-1" aria-hidden="true" ' +
        'ng-click="ctrl.openCalendarPane($event)">' +
        '<md-icon class="md-datepicker-calendar-icon ng-scope" aria-label="md-calendar" md-svg-src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTkgM2gtMVYxaC0ydjJIOFYxSDZ2Mkg1Yy0xLjExIDAtMS45OS45LTEuOTkgMkwzIDE5YzAgMS4xLjg5IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0yVjVjMC0xLjEtLjktMi0yLTJ6bTAgMTZINVY4aDE0djExek03IDEwaDV2NUg3eiIvPjwvc3ZnPg==" role="img"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"></path></svg></md-icon>' +
        "</md-button>" +
        '<div class="md-datepicker-input-container" ' +
        "ng-class=\"{'md-datepicker-focused': ctrl.isFocused}\">" +
        '<input class="md-datepicker-input" aria-haspopup="true" ' +
        'ng-focus="ctrl.setFocused(true)" ng-blur="ctrl.setFocused(false)" ng-model="ctrl.defaultDate" mask="{{::ctrl.mask}}" mask-clean="{{::ctrl.cleanMask}}" mask-restrict="{{::ctrl.restrict}}">' +
        '<md-button type="button" md-no-ink ' +
        'class="md-datepicker-triangle-button md-icon-button" ' +
        'ng-click="ctrl.openCalendarPane($event)" ' +
        'aria-label="{{::ctrl.dateLocale.msgOpenCalendar}}">' +
        '<div class="md-datepicker-expand-triangle"></div>' +
        "</md-button>" +
        "</div>" +
        // This pane will be detached from here and re-attached to the document body.
        '<div class="md-datepicker-calendar-pane md-whiteframe-z1">' +
        '<div class="md-datepicker-input-mask">' +
        '<div class="md-datepicker-input-mask-opaque"></div>' +
        "</div>" +
        '<div class="md-datepicker-calendar">' +
        '<md-calendar role="dialog" aria-label="{{::ctrl.dateLocale.msgCalendar}}" ' +
        'md-min-date="ctrl.minDate" md-max-date="ctrl.maxDate"' +
        'md-date-filter="ctrl.dateFilter"' +
        'ng-model="ctrl.date" ng-if="ctrl.isCalendarOpen">' +
        "</md-calendar>" +
        "</div>" +
        "</div>",
      require: ["ngModel", "mdDatepickerCustom", "?^mdInputContainer"],
      scope: {
        minDate: "=mdMinDate",
        maxDate: "=mdMaxDate",
        placeholder: "@mdPlaceholder",
        dateFilter: "=mdDateFilter",
        //  Custom attributes added
        defaultDate: "@mdCustomDefaultDate",
        mask: "@mdCustomMask",
        cleanMask: "@mdCustomCleanMask",
        restrict: "@mdCustomRestrict",
        required: "@mdCustomRequired"
      },
      controller: DatePickerCtrl,
      controllerAs: "ctrl",
      bindToController: true,
      link: function(scope, element, attr, controllers) {
        var ngModelCtrl = controllers[0];
        var mdDatePickerCtrl = controllers[1];

        var mdInputContainer = controllers[2];
        if (mdInputContainer) {
          throw Error(
            "md-datepicker should not be placed inside md-input-container."
          );
        }

        mdDatePickerCtrl.configureNgModel(ngModelCtrl);
      }
    };
  }

  /** Additional offset for the input's `size` attribute, which is updated based on its content. */
  var EXTRA_INPUT_SIZE = 3;

  /** Class applied to the container if the date is invalid. */
  var INVALID_CLASS = "md-datepicker-invalid";

  /** Default time in ms to debounce input event by. */
  var DEFAULT_DEBOUNCE_INTERVAL = 500;

  /**
   * Height of the calendar pane used to check if the pane is going outside the boundary of
   * the viewport. See calendar.scss for how $md-calendar-height is computed; an extra 20px is
   * also added to space the pane away from the exact edge of the screen.
   *
   *  This is computed statically now, but can be changed to be measured if the circumstances
   *  of calendar sizing are changed.
   */
  var CALENDAR_PANE_HEIGHT = 600; //368

  /**
   * Width of the calendar pane used to check if the pane is going outside the boundary of
   * the viewport. See calendar.scss for how $md-calendar-width is computed; an extra 20px is
   * also added to space the pane away from the exact edge of the screen.
   *
   *  This is computed statically now, but can be changed to be measured if the circumstances
   *  of calendar sizing are changed.
   */
  var CALENDAR_PANE_WIDTH = 360;

  /**
   * Controller for md-datepicker.
   *
   * @ngInject @constructor
   */
  function DatePickerCtrl(
    $scope,
    $element,
    $attrs,
    $compile,
    $timeout,
    $window,
    $mdConstant,
    $mdTheming,
    $mdUtil,
    $mdDateLocale,
    $$mdDateUtil,
    $$rAF
  ) {
    /** @final */
    this.$compile = $compile;

    /** @final */
    this.$timeout = $timeout;

    /** @final */
    this.$window = $window;

    /** @final */
    this.dateLocale = $mdDateLocale;

    /** @final */
    this.dateUtil = $$mdDateUtil;

    /** @final */
    this.$mdConstant = $mdConstant;

    /* @final */
    this.$mdUtil = $mdUtil;

    /** @final */
    this.$$rAF = $$rAF;

    /**
     * The root document element. This is used for attaching a top-level click handler to
     * close the calendar panel when a click outside said panel occurs. We use `documentElement`
     * instead of body because, when scrolling is disabled, some browsers consider the body element
     * to be completely off the screen and propagate events directly to the html element.
     * @type {!angular.JQLite}
     */
    this.documentElement = angular.element(document.documentElement);

    /** @type {!angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {HTMLInputElement} */
    this.inputElement = $element[0].querySelector("input");

    /** @final {!angular.JQLite} */
    this.ngInputElement = angular.element(this.inputElement);

    /** @type {HTMLElement} */
    this.inputContainer = $element[0].querySelector(
      ".md-datepicker-input-container"
    );

    /** @type {HTMLElement} Floating calendar pane. */
    this.calendarPane = $element[0].querySelector(
      ".md-datepicker-calendar-pane"
    );

    /** @type {HTMLElement} Calendar icon button. */
    this.calendarButton = $element[0].querySelector(".md-datepicker-button");

    /**
     * Element covering everything but the input in the top of the floating calendar pane.
     * @type {HTMLElement}
     */
    this.inputMask = $element[0].querySelector(
      ".md-datepicker-input-mask-opaque"
    );

    /** @final {!angular.JQLite} */
    this.$element = $element;

    /** @final {!angular.Attributes} */
    this.$attrs = $attrs;

    /** @final {!angular.Scope} */
    this.$scope = $scope;

    /** @type {Date} */
    this.date = null;

    /** @type {boolean} */
    this.isFocused = false;

    /** @type {boolean} */
    this.isDisabled;
    this.setDisabled(
      $element[0].disabled || angular.isString($attrs["disabled"])
    );

    /** @type {boolean} Whether the date-picker's calendar pane is open. */
    this.isCalendarOpen = false;

    /**
     * Element from which the calendar pane was opened. Keep track of this so that we can return
     * focus to it when the pane is closed.
     * @type {HTMLElement}
     */
    this.calendarPaneOpenedFrom = null;

    this.calendarPane.id = "md-date-pane" + $mdUtil.nextUid();

    $mdTheming($element);

    /** Pre-bound click handler is saved so that the event listener can be removed. */
    this.bodyClickHandler = angular.bind(this, this.handleBodyClick);

    /** Pre-bound resize handler so that the event listener can be removed. */
    this.windowResizeHandler = $mdUtil.debounce(
      angular.bind(this, this.closeCalendarPane),
      100
    );

    // Unless the user specifies so, the datepicker should not be a tab stop.
    // This is necessary because ngAria might add a tabindex to anything with an ng-model
    // (based on whether or not the user has turned that particular feature on/off).
    if (!$attrs["tabindex"]) {
      $element.attr("tabindex", "-1");
    }

    this.installPropertyInterceptors();
    this.attachChangeListeners();
    this.attachInteractionListeners();

    var self = this;
    $scope.$on("$destroy", function() {
      self.detachCalendarPane();
    });
  }

  /**
   * Sets up the controller's reference to ngModelController.
   * @param {!angular.NgModelController} ngModelCtrl
   */
  DatePickerCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    this.ngModelCtrl = ngModelCtrl;

    var self = this;
    ngModelCtrl.$render = function() {
      var value = self.ngModelCtrl.$viewValue;

      if (value && !(value instanceof Date)) {
        throw Error(
          "The ng-model for md-datepicker must be a Date instance. " +
            "Currently the model is a: " +
            typeof value
        );
      }

      self.date = value;
      self.inputElement.value = self.dateLocale.formatDate(value);
      self.resizeInputElement();
      self.updateErrorState();
    };
  };

  /**
   * Attach event listeners for both the text input and the md-calendar.
   * Events are used instead of ng-model so that updates don't infinitely update the other
   * on a change. This should also be more performant than using a $watch.
   */
  DatePickerCtrl.prototype.attachChangeListeners = function() {
    var self = this;

    self.$scope.$on("md-calendar-change", function(event, date) {
      self.ngModelCtrl.$setViewValue(date);
      self.date = date;
      self.inputElement.value = self.dateLocale.formatDate(date);
      self.closeCalendarPane();
      self.resizeInputElement();
      self.updateErrorState();
    });

    self.ngInputElement.on(
      "input",
      angular.bind(self, self.resizeInputElement)
    );
    // TODO(chenmike): Add ability for users to specify this interval.
    self.ngInputElement.on(
      "input",
      self.$mdUtil.debounce(
        self.handleInputEvent,
        DEFAULT_DEBOUNCE_INTERVAL,
        self
      )
    );
  };

  /** Attach event listeners for user interaction. */
  DatePickerCtrl.prototype.attachInteractionListeners = function() {
    var self = this;
    var $scope = this.$scope;
    var keyCodes = this.$mdConstant.KEY_CODE;

    // Add event listener through angular so that we can triggerHandler in unit tests.
    self.ngInputElement.on("keydown", function(event) {
      if (event.altKey && event.keyCode == keyCodes.DOWN_ARROW) {
        self.openCalendarPane(event);
        $scope.$digest();
      }
    });

    $scope.$on("md-calendar-close", function() {
      self.closeCalendarPane();
    });
  };

  /**
   * Capture properties set to the date-picker and imperitively handle internal changes.
   * This is done to avoid setting up additional $watches.
   */
  DatePickerCtrl.prototype.installPropertyInterceptors = function() {
    var self = this;

    if (this.$attrs["ngDisabled"]) {
      // The expression is to be evaluated against the directive element's scope and not
      // the directive's isolate scope.
      var scope = this.$scope.$parent;

      if (scope) {
        scope.$watch(this.$attrs["ngDisabled"], function(isDisabled) {
          self.setDisabled(isDisabled);
        });
      }
    }

    Object.defineProperty(this, "placeholder", {
      get: function() {
        return self.inputElement.placeholder;
      },
      set: function(value) {
        self.inputElement.placeholder = value || "";
      }
    });
  };

  /**
   * Sets whether the date-picker is disabled.
   * @param {boolean} isDisabled
   */
  DatePickerCtrl.prototype.setDisabled = function(isDisabled) {
    this.isDisabled = isDisabled;
    this.inputElement.disabled = isDisabled;
    this.calendarButton.disabled = isDisabled;
  };

  /**
   * Sets the custom ngModel.$error flags to be consumed by ngMessages. Flags are:
   *   - mindate: whether the selected date is before the minimum date.
   *   - maxdate: whether the selected flag is after the maximum date.
   *   - filtered: whether the selected date is allowed by the custom filtering function.
   *   - valid: whether the entered text input is a valid date
   *
   * The 'required' flag is handled automatically by ngModel.
   *
   * @param {Date=} opt_date Date to check. If not given, defaults to the datepicker's model value.
   */
  DatePickerCtrl.prototype.updateErrorState = function(opt_date) {
    var date = opt_date || this.date;

    // Clear any existing errors to get rid of anything that's no longer relevant.
    this.clearErrorState();

    if (this.dateUtil.isValidDate(date)) {
      // Force all dates to midnight in order to ignore the time portion.
      date = this.dateUtil.createDateAtMidnight(date);

      if (this.dateUtil.isValidDate(this.minDate)) {
        var minDate = this.dateUtil.createDateAtMidnight(this.minDate);
        this.ngModelCtrl.$setValidity("mindate", date >= minDate);
      }

      if (this.dateUtil.isValidDate(this.maxDate)) {
        var maxDate = this.dateUtil.createDateAtMidnight(this.maxDate);
        this.ngModelCtrl.$setValidity("maxdate", date <= maxDate);
      }

      if (angular.isFunction(this.dateFilter)) {
        this.ngModelCtrl.$setValidity("filtered", this.dateFilter(date));
      }
    } else {
      // The date is seen as "not a valid date" if there is *something* set
      // (i.e.., not null or undefined), but that something isn't a valid date.
      //  this.ngModelCtrl.$setValidity('valid', date == null);
      this.ngModelCtrl.$setValidity("valid", !isNaN(date));
      this.ngModelCtrl.$setValidity(
        "required",
        this.required !== "true" || date !== null
      );
    }

    // TODO(jelbourn): Change this to classList.toggle when we stop using PhantomJS in unit tests
    // because it doesn't conform to the DOMTokenList spec.
    // See https://github.com/ariya/phantomjs/issues/12782.
    if (!this.ngModelCtrl.$valid) {
      this.inputContainer.classList.add(INVALID_CLASS);
    }
  };

  /** Clears any error flags set by `updateErrorState`. */
  DatePickerCtrl.prototype.clearErrorState = function() {
    this.inputContainer.classList.remove(INVALID_CLASS);
    ["mindate", "maxdate", "filtered", "valid", "required"].forEach(function(
      field
    ) {
      this.ngModelCtrl.$setValidity(field, true);
    },
    this);
  };

  /** Resizes the input element based on the size of its content. */
  DatePickerCtrl.prototype.resizeInputElement = function() {
    this.inputElement.size = this.inputElement.value.length + EXTRA_INPUT_SIZE;
  };

  /**
   * Sets the model value if the user input is a valid date.
   * Adds an invalid class to the input element if not.
   */
  DatePickerCtrl.prototype.handleInputEvent = function() {
    var inputString = this.inputElement.value;
    var parsedDate = inputString
      ? this.dateLocale.parseDate(inputString)
      : null;
    this.dateUtil.setDateTimeToMidnight(parsedDate);

    // An input string is valid if it is either empty (representing no date)
    // or if it parses to a valid date that the user is allowed to select.
    var isValidInput =
      inputString == "" ||
      (this.dateUtil.isValidDate(parsedDate) &&
        this.dateLocale.isDateComplete(inputString) &&
        this.isDateEnabled(parsedDate));

    // The datepicker's model is only updated when there is a valid input.
    if (isValidInput) {
      this.ngModelCtrl.$setViewValue(parsedDate);
      this.date = parsedDate;
    }

    this.updateErrorState(parsedDate);
  };

  /**
   * Check whether date is in range and enabled
   * @param {Date=} opt_date
   * @return {boolean} Whether the date is enabled.
   */
  DatePickerCtrl.prototype.isDateEnabled = function(opt_date) {
    return (
      this.dateUtil.isDateWithinRange(opt_date, this.minDate, this.maxDate) &&
      (!angular.isFunction(this.dateFilter) || this.dateFilter(opt_date))
    );
  };

  /** Position and attach the floating calendar to the document. */
  DatePickerCtrl.prototype.attachCalendarPane = function() {
    var calendarPane = this.calendarPane;
    calendarPane.style.transform = "";
    this.$element.addClass("md-datepicker-open");

    var elementRect = this.inputContainer.getBoundingClientRect();
    var bodyRect = document.body.getBoundingClientRect();

    // Check to see if the calendar pane would go off the screen. If so, adjust position
    // accordingly to keep it within the viewport.
    var paneTop = elementRect.top - bodyRect.top;
    var paneLeft = elementRect.left - bodyRect.left;

    // If ng-material has disabled body scrolling (for example, if a dialog is open),
    // then it's possible that the already-scrolled body has a negative top/left. In this case,
    // we want to treat the "real" top as (0 - bodyRect.top). In a normal scrolling situation,
    // though, the top of the viewport should just be the body's scroll position.
    var viewportTop =
      bodyRect.top < 0 && document.body.scrollTop == 0
        ? -bodyRect.top
        : document.body.scrollTop;

    var viewportLeft =
      bodyRect.left < 0 && document.body.scrollLeft == 0
        ? -bodyRect.left
        : document.body.scrollLeft;

    var viewportBottom = viewportTop + this.$window.innerHeight;
    var viewportRight = viewportLeft + this.$window.innerWidth;

    // If the right edge of the pane would be off the screen and shifting it left by the
    // difference would not go past the left edge of the screen. If the calendar pane is too
    // big to fit on the screen at all, move it to the left of the screen and scale the entire
    // element down to fit.
    if (paneLeft + CALENDAR_PANE_WIDTH > viewportRight) {
      if (viewportRight - CALENDAR_PANE_WIDTH > 0) {
        paneLeft = viewportRight - CALENDAR_PANE_WIDTH;
      } else {
        paneLeft = viewportLeft;
        var scale = this.$window.innerWidth / CALENDAR_PANE_WIDTH;
        calendarPane.style.transform = "scale(" + scale + ")";
      }

      calendarPane.classList.add("md-datepicker-pos-adjusted");
    }

    // If the bottom edge of the pane would be off the screen and shifting it up by the
    // difference would not go past the top edge of the screen.
    if (
      paneTop + CALENDAR_PANE_HEIGHT > viewportBottom &&
      viewportBottom - CALENDAR_PANE_HEIGHT > viewportTop
    ) {
      paneTop = viewportBottom - CALENDAR_PANE_HEIGHT;
      calendarPane.classList.add("md-datepicker-pos-adjusted");
    }

    calendarPane.style.left = paneLeft + "px";
    calendarPane.style.top = paneTop + "px";
    document.body.appendChild(calendarPane);

    // The top of the calendar pane is a transparent box that shows the text input underneath.
    // Since the pane is floating, though, the page underneath the pane *adjacent* to the input is
    // also shown unless we cover it up. The inputMask does this by filling up the remaining space
    // based on the width of the input.
    this.inputMask.style.left = elementRect.width + "px";

    // Add CSS class after one frame to trigger open animation.
    this.$$rAF(function() {
      calendarPane.classList.add("md-pane-open");
    });
  };

  /** Detach the floating calendar pane from the document. */
  DatePickerCtrl.prototype.detachCalendarPane = function() {
    this.$element.removeClass("md-datepicker-open");
    this.calendarPane.classList.remove("md-pane-open");
    this.calendarPane.classList.remove("md-datepicker-pos-adjusted");

    if (this.isCalendarOpen) {
      this.$mdUtil.enableScrolling();
    }

    if (this.calendarPane.parentNode) {
      // Use native DOM removal because we do not want any of the angular state of this element
      // to be disposed.
      this.calendarPane.parentNode.removeChild(this.calendarPane);
    }
  };

  /**
   * Open the floating calendar pane.
   * @param {Event} event
   */
  DatePickerCtrl.prototype.openCalendarPane = function(event) {
    if (!this.isCalendarOpen && !this.isDisabled) {
      this.isCalendarOpen = true;
      this.calendarPaneOpenedFrom = event.target;

      // Because the calendar pane is attached directly to the body, it is possible that the
      // rest of the component (input, etc) is in a different scrolling container, such as
      // an md-content. This means that, if the container is scrolled, the pane would remain
      // stationary. To remedy this, we disable scrolling while the calendar pane is open, which
      // also matches the native behavior for things like `<select>` on Mac and Windows.
      this.$mdUtil.disableScrollAround(this.calendarPane);

      this.attachCalendarPane();
      this.focusCalendar();

      // Attach click listener inside of a timeout because, if this open call was triggered by a
      // click, we don't want it to be immediately propogated up to the body and handled.
      var self = this;
      this.$mdUtil.nextTick(function() {
        // Use 'touchstart` in addition to click in order to work on iOS Safari, where click
        // events aren't propogated under most circumstances.
        // See https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
        self.documentElement.on("click touchstart", self.bodyClickHandler);
      }, false);

      window.addEventListener("resize", this.windowResizeHandler);
    }
  };

  /** Close the floating calendar pane. */
  DatePickerCtrl.prototype.closeCalendarPane = function() {
    if (this.isCalendarOpen) {
      this.detachCalendarPane();
      this.isCalendarOpen = false;
      this.calendarPaneOpenedFrom.focus();
      this.calendarPaneOpenedFrom = null;

      this.ngModelCtrl.$setTouched();

      this.documentElement.off("click touchstart", this.bodyClickHandler);
      window.removeEventListener("resize", this.windowResizeHandler);
    }
  };

  /** Gets the controller instance for the calendar in the floating pane. */
  DatePickerCtrl.prototype.getCalendarCtrl = function() {
    return angular
      .element(this.calendarPane.querySelector("md-calendar"))
      .controller("mdCalendar");
  };

  /** Focus the calendar in the floating pane. */
  DatePickerCtrl.prototype.focusCalendar = function() {
    // Use a timeout in order to allow the calendar to be rendered, as it is gated behind an ng-if.
    var self = this;
    this.$mdUtil.nextTick(function() {
      self.getCalendarCtrl().focus();
    }, false);
  };

  /**
   * Sets whether the input is currently focused.
   * @param {boolean} isFocused
   */
  DatePickerCtrl.prototype.setFocused = function(isFocused) {
    if (!isFocused) {
      this.ngModelCtrl.$setTouched();
    }
    this.isFocused = isFocused;
  };

  /**
   * Handles a click on the document body when the floating calendar pane is open.
   * Closes the floating calendar pane if the click is not inside of it.
   * @param {MouseEvent} event
   */
  DatePickerCtrl.prototype.handleBodyClick = function(event) {
    if (this.isCalendarOpen) {
      // TODO(jelbourn): way want to also include the md-datepicker itself in this check.
      var isInCalendar = this.$mdUtil.getClosest(event.target, "md-calendar");
      if (!isInCalendar) {
        this.closeCalendarPane();
      }

      this.$scope.$digest();
    }
  };
})();

/**
 * Checklist-model
 * AngularJS directive for list of checkboxes
 * https://github.com/vitalets/checklist-model
 * License: MIT http://opensource.org/licenses/MIT
 */

angular.module("checklist-model", []).directive("checklistModel", [
  "$parse",
  "$compile",
  function($parse, $compile) {
    // contains
    function contains(arr, item, comparator) {
      if (angular.isArray(arr)) {
        for (var i = arr.length; i--; ) {
          if (comparator(arr[i], item)) {
            return true;
          }
        }
      }
      return false;
    }

    // add
    function add(arr, item, comparator) {
      arr = angular.isArray(arr) ? arr : [];
      if (!contains(arr, item, comparator)) {
        arr.push(item);
      }
      return arr;
    }

    // remove
    function remove(arr, item, comparator) {
      if (angular.isArray(arr)) {
        for (var i = arr.length; i--; ) {
          if (comparator(arr[i], item)) {
            arr.splice(i, 1);
            break;
          }
        }
      }
      return arr;
    }

    // http://stackoverflow.com/a/19228302/1458162
    function postLinkFn(scope, elem, attrs) {
      // exclude recursion, but still keep the model
      var checklistModel = attrs.checklistModel;
      attrs.$set("checklistModel", null);
      // compile with `ng-model` pointing to `checked`
      $compile(elem)(scope);
      attrs.$set("checklistModel", checklistModel);

      // getter / setter for original model
      var getter = $parse(checklistModel);
      var setter = getter.assign;
      var checklistChange = $parse(attrs.checklistChange);
      var checklistBeforeChange = $parse(attrs.checklistBeforeChange);

      // value added to list
      var value = attrs.checklistValue
        ? $parse(attrs.checklistValue)(scope.$parent)
        : attrs.value;

      var comparator = angular.equals;

      if (attrs.hasOwnProperty("checklistComparator")) {
        if (attrs.checklistComparator[0] == ".") {
          var comparatorExpression = attrs.checklistComparator.substring(1);
          comparator = function(a, b) {
            return a[comparatorExpression] === b[comparatorExpression];
          };
        } else {
          comparator = $parse(attrs.checklistComparator)(scope.$parent);
        }
      }

      // watch UI checked change
      scope.$watch(attrs.ngModel, function(newValue, oldValue) {
        if (newValue === oldValue) {
          return;
        }

        if (checklistBeforeChange && checklistBeforeChange(scope) === false) {
          scope[attrs.ngModel] = contains(
            getter(scope.$parent),
            value,
            comparator
          );
          return;
        }

        setValueInChecklistModel(value, newValue);

        if (checklistChange) {
          checklistChange(scope);
        }
      });

      function setValueInChecklistModel(value, checked) {
        var current = getter(scope.$parent);
        if (angular.isFunction(setter)) {
          if (checked === true) {
            setter(scope.$parent, add(current, value, comparator));
          } else {
            setter(scope.$parent, remove(current, value, comparator));
          }
        }
      }

      // declare one function to be used for both $watch functions
      function setChecked(newArr, oldArr) {
        if (checklistBeforeChange && checklistBeforeChange(scope) === false) {
          setValueInChecklistModel(value, scope[attrs.ngModel]);
          return;
        }
        scope[attrs.ngModel] = contains(newArr, value, comparator);
      }

      // watch original model change
      // use the faster $watchCollection method if it's available
      if (angular.isFunction(scope.$parent.$watchCollection)) {
        scope.$parent.$watchCollection(checklistModel, setChecked);
      } else {
        scope.$parent.$watch(checklistModel, setChecked, true);
      }
    }

    return {
      restrict: "A",
      priority: 1000,
      terminal: true,
      scope: true,
      compile: function(tElement, tAttrs) {
        if (
          (tElement[0].tagName !== "INPUT" || tAttrs.type !== "checkbox") &&
          tElement[0].tagName !== "MD-CHECKBOX" &&
          !tAttrs.btnCheckbox
        ) {
          throw 'checklist-model should be applied to `input[type="checkbox"]` or `md-checkbox`.';
        }

        if (!tAttrs.checklistValue && !tAttrs.value) {
          throw "You should provide `value` or `checklist-value`.";
        }

        // by default ngModel is 'checked', so we set it if not specified
        if (!tAttrs.ngModel) {
          // local scope var storing individual checkbox model
          tAttrs.$set("ngModel", "checked");
        }

        return postLinkFn;
      }
    };
  }
]);
