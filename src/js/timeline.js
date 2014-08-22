/**
 * Timeline
 *
 * @author Cole AD http://cole-ad.co.uk
 */
(function ($) {  
  function Timeline (opts) {
    var self = this,
        windowWidth = $('body').innerWidth();

    if (!(this instanceof Timeline)) {
      return new Timeline();
    }

    if (typeof $ !== 'function') {
      self.log('jQuery 1.11.0+ is required for the timeline');
    }

    self.settings = {
      'debug': false,
      'breakpoint': 480
    };

    $.extend(self.settings, opts);

    if (!self.settings.hasOwnProperty('element')) {
      self.log('Please provide an element to timeline-ize');
    }

    self.timeline = self.settings.element;
    self.points = [];

    self.clearStyles();
    self.populatePoints();

    if (windowWidth >= self.settings.breakpoint) {
      self.condenseTimeline();
    }

    $(window).smartresize(function () {
      windowWidth = $('body').innerWidth();

      self.clearStyles();

      if (windowWidth >= self.settings.breakpoint) {
        self.populatePoints();
        self.condenseTimeline();
      }

    });
  }

  Timeline.prototype.clearStyles = function () {
    $(self.timeline).removeClass('js');
    $('*', self.timeline).attr('style', '');
  };

  Timeline.prototype.populatePoints = function () {
    var self = this;

    self.points = [];

    $('.event, .timestamp', self.timeline).each(function (index, element) {
      self.points.push(new TimelineEvent(element));
    });
  };

  Timeline.prototype.log = function (val) {
    var self = this;

    if (self.settings.debug) {
      console.log(val);
    }
  };

  Timeline.prototype.setTimelineHeight = function () {
    var self = this,
        timelineHeight,
        lastElement = $(self.timeline).children().last();

    timelineHeight = lastElement.position().top + lastElement.outerHeight(true);
    $(self.timeline).css('height', timelineHeight);
  };

  Timeline.prototype.condenseTimeline = function () {
    var self = this;

    $(self.timeline).addClass('js');

    self.topValue = 0;

    $(self.points).each(function (index, theTimelineEvent) {
      self.applyPositioning(index, theTimelineEvent);
    });

    self.setTimelineHeight();
  };

  Timeline.prototype.applyPositioning = function (index, theTimelineEvent) {
    var self = this;
    var element = theTimelineEvent.element;

    $(element)
      .css(self.generateStyle(index, theTimelineEvent))
      .css(theTimelineEvent.baseStyle());
  };

  Timeline.prototype.generateStyle = function (index, theTimelineEvent) {
    var self = this,
        element = theTimelineEvent.element,
        newStyle = {},
        badgeSize,
        offset;

    if (theTimelineEvent.type === 'event') {
      badgeSize = $(theTimelineEvent.element).children('.tl-badge').css('width');
      offset = '50% - ' + (parseInt(badgeSize) / 2) + 'px';

      if (theTimelineEvent.side === 'left') {
        newStyle.right = 'calc(' + offset + ')';
      } else {
        newStyle.left = 'calc(' + offset + ')';
      }
    } else if (theTimelineEvent.type == 'timestamp') {

    }

    newStyle.top = self.getTopValue(index, theTimelineEvent);

    return newStyle;
  };

  Timeline.prototype.getTopValue = function (index, theTimelineEvent) {
    var self = this,
        topValue,
        lastPoint,
        lastTimestamp,
        previousPointsOnSide,
        lastPointOnSide,
        values = [];

    self.log('-------------------------');

    function getPreviousPoints(index) {
      var previousPoints;

      previousPoints = self.points.slice(0, index);

      return previousPoints;
    }

    function getLastPoint(index, previousPoints) {
      return previousPoints[previousPoints.length - 1];
    }

    function getLastTimestamp(index, previousPoints) {
      var previousTimestamps;

      previousTimestamps = previousPoints.filter(function (point) {
        return point.type === 'timestamp';
      }, self);

      return previousTimestamps[previousTimestamps.length - 1];
    }

    function getPreviousPointsOnSide(index, side, previousPoints) {
      var previousPointsOnSide;

      previousPointsOnSide = previousPoints.filter(function (event) {
        return event.side === side;
      }, self);

      return previousPointsOnSide;
    }

    previousPoints = getPreviousPoints(index);


    if (index === 0) {
      self.topValue = 0;
      self.log(theTimelineEvent);
      self.log([0]);
    } else {
      lastPoint = getLastPoint(index, previousPoints);
      lastTimestamp = getLastTimestamp(index, previousPoints);
      previousPointsOnSide = getPreviousPointsOnSide(index, theTimelineEvent.side, previousPoints);

      values.push(0);


      /**
       * EVENT
       */
      if (theTimelineEvent.type === 'event') {


        /*
         * If there is a previous point on this side,
         * either position it under that, the last timestamp
         * or the last badge from the other side, whichever
         * is greater
         */

        if (previousPointsOnSide.length) {
          lastPointOnSide = previousPointsOnSide[previousPointsOnSide.length - 1];
          values.push(
            $(lastPointOnSide.element).position().top +
            $(lastPointOnSide.element).outerHeight(true)
          );
        }

        if (typeof lastTimestamp === 'object') {
          values.push(
            $(lastTimestamp.element).position().top +
            $(lastTimestamp.element).outerHeight(true)
          );
        }

        if (previousPoints.length && $(theTimelineEvent.element).prevAll('.event').length) {
          values.push(
            $(theTimelineEvent.element).prevAll('.event').position().top +
            $(theTimelineEvent.element).prevAll('.event').children('.tl-badge').outerHeight(true)
          );
        }

      /**
       * TIMESTAMP
       */
      } else if (theTimelineEvent.type === 'timestamp') {

        /**
         * Position either under the last timestamp or
         * the last event badge, whichever is greater
         */

        if (typeof lastTimestamp === 'object') {
          values.push(
            $(lastTimestamp.element).position().top +
            $(lastTimestamp.element).outerHeight(true)
          );
        }

        if (previousPoints.length && $(theTimelineEvent.element).prevAll('.event').length) {
          values.push(
            $(theTimelineEvent.element).prevAll('.event').position().top +
            $(theTimelineEvent.element).prevAll('.event').children('.tl-badge').outerHeight(true)
          );
        }
      }
      
      self.topValue = Math.max.apply(Math, values);

      self.log(theTimelineEvent);
      self.log(values);
    }

    return self.topValue;
  };

  function TimelineEvent (element) {
    var self = this;

    if (!(this instanceof TimelineEvent)) {
      return new TimelineEvent();
    } 

    self.element = element;

    if ($(self.element).hasClass('event')) {
      self.type = 'event';
      self.side = $(self.element).css('float');
    } else if ($(self.element).hasClass('timestamp')) {
      self.type = 'timestamp';
    }
  }

  TimelineEvent.prototype.baseStyle = function () {
    var self = this,
        style;
      
    style = {
      'position': 'absolute'
    };

    return style;
  };

  $.prototype.timeline = function (opts) {
    this.each(function (index, element) {
      if (element.id) {
        opts.element = element;
        new Timeline(opts);
      }
    });
  };

})(jQuery);
