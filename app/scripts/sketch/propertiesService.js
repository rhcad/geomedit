// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .factory('properties', ['board', 'eventHandler', 'commands', 'select',
    function(bd, eventHandler, commands, select) {
      var active = false,
          creators = {},
          data = {};

      data.options = {
        faces:     [
          { id: '', title: 'SelectOption' },
          { id: 'o', title: 'FaceCircle' },
          { id: 'x', title: 'FaceCross' },
          { id: '+', title: 'FacePlus' },
          { id: '<>', title: 'FaceDiamond' },
          { id: '[]', title: 'FaceSquare' },
          { id: '^', title: 'FaceUpTriangle' },
          { id: 'v', title: 'FaceDownTriangle' },
          { id: '<', title: 'FaceLeftTriangle' },
          { id: '>', title: 'FaceRightTriangle' },
        ],
        positions: [
          { id: '', title: 'SelectOption' },
          { id: 'lft', title: 'PosLeft' },
          { id: 'rt', title: 'PosRight' },
          { id: 'top', title: 'PosCenter' },
        ],
        dashes:    [
          { id: '', title: 'SelectOption' },
          { id: '0', title: 'SolidLine' },
          { id: '1', title: 'DottedLine' },
          { id: '2', title: 'SmallDashes' },
          { id: '3', title: 'MediumDashes' },
          { id: '4', title: 'BigDashes' },
          { id: '5', title: 'LargeGaps' },
          { id: '6', title: 'SmallGaps' },
        ],
        colors:    [
          'none', '#000000', '#eeeeee', '#808080', '#ff00ff', '#cc0000',
          '#ffa500', '#ffff00', '#3366ff', '#00ffff', '#006400', '#00ff00'
        ]
      };

      data.id = '';
      data.items = [];
      data.updateView = angular.noop;

      data.onEnter = function() {
        active = true;
        commands.cancel();
        data.fetch();
      };
      data.onExit = function() {
        active = false;
        bd.propObj = null;
        data.fetch();
      };

      eventHandler.customDownHandlers.push(function() {
        if (active) {
          bd.propObj = bd.board.downObjects[0];
          data.fetch();
        }
      });

      eventHandler.customMoveHandlers.push(function() {
        if (active && bd.propObj) {
          data.fetch();
        }
      });

      data.validID = function(id) {
        return id && id.indexOf('_') !== 0 && !id.match(/_ticks_\d+Label/) ? id : '';
      };

      data.fetch = function() {
        var item, items = [], keys = [];

        if (JXG.isString(bd.propObj)) {
          data.id = bd.propObj;
          keys = getKeys(bd.propObj);
        }
        else {
          data.id = bd.propObj ? bd.propObj.id : '';
          if (data.validID(data.id)) {
            keys = getKeys(bd.propObj.elementClass, bd.propObj.type, bd.propObj.elType, bd.propObj);
          }
        }

        keys.forEach(function(key) {
          item = creators[key];
          if (item && item.get && item.get() !== false) {
            item.oldValue = JXG.isObject(item.value) ? JXG.deepCopy({}, item.value) : item.value;
            item.id = key;
            items.push(item);
          }
        });

        data.items.length = 0;
        JXG.extend(data.items, items);
        data.updateView();
        select.select(bd.propObj, true);
      };

      data.needSave = function() {
        var n = 0;

        if (bd.propObj) {
          data.items.forEach(function(item) {
            if (JSON.stringify(item.value) !== JSON.stringify(item.oldValue)) {
              n++;
            }
          });
        }
        return n > 0;
      };

      data.save = function() {
        if (bd.propObj) {
          var r, changed = false;
          data.items.forEach(function(item) {
            if (JSON.stringify(item.value) !== JSON.stringify(item.oldValue)) {
              r = item.set();
              changed = changed || (r !== undefined && r !== false);
              item.oldValue = JXG.isObject(item.value) ? JXG.deepCopy({}, item.value) : item.value;
            }
          });
          if (changed) {
            bd.board.update();
          }
        }
      };

      function getKeys(elCls, objType, elType, el) {
        var items = ['label', 'fontSize', 'textColor', 'fixed', 'trace'];

        if (elCls === 'board') {
          items = ['ignoreLabels', 'grid', 'origin', 'units'];
        }
        else if (elType === 'slider') {
          items = ['range', 'snapWidth', 'face', 'size', 'label', 'fontSize', 'textColor',
            'strokeWidth', 'strokeColor', 'strokeOpacity', 'fillColor', 'fillOpacity'];
        }
        else if (elCls === JXG.OBJECT_CLASS_POINT) {
          items = ['coords', 'face', 'size', 'color', 'opacity'].concat(items);
        }
        else if (elCls === JXG.OBJECT_CLASS_LINE) {
          items = ['lineEndings', 'dash', 'strokeWidth', 'strokeColor', 'strokeOpacity'].concat(items);
        }
        else if (elCls === JXG.OBJECT_CLASS_CIRCLE) {
          items = ['radius', 'centerVisible', 'dash', 'strokeWidth', 'strokeColor', 'strokeOpacity',
            'fillColor', 'fillOpacity'].concat(items);
        }
        else if (objType === JXG.OBJECT_TYPE_POLYGON) {
          items = ['dash', 'strokeWidth', 'strokeColor', 'strokeOpacity', 'fillColor', 'fillOpacity'].concat(items);
        }
        else if (objType === JXG.OBJECT_TYPE_ANGLE) {
          items = ['radius', 'label', 'fontSize', 'textColor', 'dash', 'strokeWidth', 'strokeColor',
            'strokeOpacity', 'fillColor', 'fillOpacity'];
        }
        else if (objType === JXG.OBJECT_TYPE_SECTOR) {
          items = ['label', 'fontSize', 'textColor', 'dash', 'strokeWidth', 'strokeColor',
            'strokeOpacity', 'fillColor', 'fillOpacity'];
        }
        else if (objType === JXG.OBJECT_TYPE_GRID) {
          items = ['dash', 'strokeWidth', 'strokeColor', 'strokeOpacity'];
        }
        else if (elCls === JXG.OBJECT_CLASS_CURVE) {
          items = ['functionTerm', 'dash', 'strokeWidth', 'strokeColor', 'strokeOpacity', 'fillColor', 'fillOpacity'].concat(items);
        }
        else if (objType === JXG.OBJECT_TYPE_TEXT) {
          items = ['text', 'fontSize', 'textColor', 'fixed'];
          if (el && el.getAttribute('isLabel') && !JXG.isPoint(el.element)) {
            items.unshift('position', 'offset');
          }
        }
        else if (objType === JXG.OBJECT_TYPE_TICKS) {
          items = ['drawLabels', 'drawZero', 'insertTicks', 'majorHeight', 'scaleSymbol', 'ticksDistance', 'minorTicks'];
        }

        if (items.indexOf('label') > -1 && !el.label) {
          items.splice(items.indexOf('fontSize'), 1);
          items.splice(items.indexOf('textColor'), 1);
        }

        return items;
      }

      creators.snapWidth = {
        type: 'range', min: 1, max: 100,
        get:  function() {
          this.value = bd.propObj.getAttribute('snapWidth');
        },
        set:  function() {
          if (isFloat(this.value, this.min, this.max)) {
            return bd.propObj.setAttribute({ snapWidth: parseInt(this.value) });
          }
        }
      };

      creators.strokeWidth = {
        type: 'range', unit: 'px', min: 0.5, max: 50, step: 0.5,
        get:  function() {
          this.value = bd.propObj.getAttribute('strokeWidth');
        },
        set:  function() {
          if (isFloat(this.value, this.min, this.max)) {
            return setPolygonAttribute({ strokeWidth: parseFloat(this.value) });
          }
        }
      };

      function setPolygonAttribute(attr, vertices) {
        var r = bd.propObj.setAttribute(attr);
        if (bd.propObj.borders) {
          bd.propObj.borders.forEach(function(el) {
            el.setAttribute(attr);
          });
        }
        if (vertices && bd.propObj.vertices) {
          bd.propObj.vertices.forEach(function(el) {
            el.setAttribute(attr);
          });
        }
        return r;
      }

      creators.dash = {
        type: 'dash',
        get:  function() {
          this.value = bd.propObj.getAttribute('dash').toString();
        },
        set:  function() {
          if (this.value) {
            return setPolygonAttribute({ dash: parseInt(this.value) });
          }
        }
      };

      creators.strokeOpacity = {
        type: 'range', unit: '%', min: 1, max: 100,
        get:  function() {
          this.value = Math.round(bd.propObj.getAttribute('strokeOpacity') * 100);
        },
        set:  function() {
          return setPolygonAttribute({ strokeOpacity: this.value * 0.01 });
        }
      };

      creators.fillOpacity = {
        type: 'range', unit: '%', min: 1, max: 100,
        get:  function() {
          this.value = Math.round(bd.propObj.getAttribute('fillOpacity') * 100);
        },
        set:  function() {
          return bd.propObj.setAttribute({ fillOpacity: this.value * 0.01 });
        }
      };

      creators.opacity = {
        type: 'range', unit: '%', min: 1, max: 100,
        get:  function() {
          this.value = Math.round(bd.propObj.getAttribute('fillOpacity') * 100);
        },
        set:  function() {
          return bd.propObj.setAttribute({
            strokeOpacity: this.value * 0.01,
            fillOpacity:   this.value * 0.01
          });
        }
      };

      function isFloat(value, min, max) {
        var pattern = /^-?\d+\.?\d*$/, v = parseFloat(value);
        return JXG.exists(value) && pattern.test(value) && v > min - 1e-5 && v < max + 1e-5;
      }

      creators.size = {
        type: 'size', unit: 'px', min: 0.5, max: 50, step: 0.5,
        get:  function() {
          this.value = {
            size: bd.propObj.getAttribute('size'),
            zoom: bd.propObj.getAttribute('zoom')
          };
          this.value.size = bd.propObj.getAttribute('size');
          this.value.zoom = bd.propObj.getAttribute('zoom');
        },
        set:  function() {
          if (isFloat(this.value.size, this.min, this.max)) {
            var size = parseFloat(this.value.size);
            return bd.propObj.setAttribute({
              zoom:        this.value.zoom,
              size:        size,
              strokeWidth: size / 10
            });
          }
        }
      };

      creators.coords = {
        type: 'coords',
        get:  function() {
          this.value = {
            x:            bd.propObj.coords.usrCoords[1],
            y:            bd.propObj.coords.usrCoords[2],
            snapToGrid:   bd.propObj.getAttribute('snapToGrid'),
            snapToPoints: bd.propObj.getAttribute('snapToPoints')
          };
        },
        set:  function() {
          var pattern = /^-?\d+\.?\d*$/,
              x = parseFloat(this.value.x),
              y = parseFloat(this.value.y),
              inLimit = function(v) { return Math.abs(v) < 1e3; },
              attractorDistance = bd.propObj.getAttribute('attractorDistance'),
              attractorUnit = bd.propObj.getAttribute('attractorUnit');

          if (this.value.snapToPoints && attractorDistance < 1e-5) {
            attractorDistance = Math.max(bd.board.options.precision.hasPoint, 10);
            attractorUnit = 'screen';
          }
          if (pattern.test(this.value.x) && pattern.test(this.value.y) && inLimit(x) && inLimit(y)) {
            bd.propObj.setAttribute({
              snapToGrid:        this.value.snapToGrid,
              snapToPoints:      this.value.snapToPoints,
              attractorDistance: attractorDistance,
              attractorUnit:     attractorUnit
            });
            return bd.propObj.setPositionDirectly(JXG.COORDS_BY_USER, [x, y]);
          }
        }
      };

      creators.lineEndings = {
        type: 'lineEndings',
        get:  function() {
          var p = bd.propObj.visProp;
          this.value = {
            restrictFirst: !p.straightfirst,
            restrictLast:  !p.straightlast,
            arrowFirst:    p.firstarrow,
            arrowLast:     p.lastarrow
          };
        },
        set:  function() {
          var v = this.value;
          return bd.propObj.setAttribute({
            straightFirst: !v.restrictFirst,
            straightLast:  !v.restrictLast,
            firstArrow:    v.arrowFirst,
            lastArrow:     v.arrowLast
          });
        }
      };

      creators.face = {
        type: 'face',
        get:  function() {
          this.value = bd.propObj.getAttribute('face');
        },
        set:  function() {
          if (this.value) {
            return bd.propObj.setAttribute({ face: this.value });
          }
        }
      };

      creators.fixed = {
        type: 'checkbox', icon1: 'lock', icon0: 'unlock',
        get:  function() {
          this.value = bd.propObj.getAttribute('fixed');
        },
        set:  function() {
          return setPolygonAttribute({ fixed: this.value }, true);
        }
      };

      function generateNumberProperty(name, attr) {
        return JXG.deepCopy(JXG.deepCopy({type: 'number'}, attr || {}), {
          get: function() {
            this.value = bd.propObj.getAttribute(name);
          },
          set: function() {
            if (isFloat(this.value, this.min, this.max)) {
              var a = {};
              a[name] = parseFloat(this.value);
              return bd.propObj.setAttribute(a);
            }
          }
        });
      }

      function generateBoolProperty(name, prop) {
        return {
          type: 'checkbox',
          get:  function() {
            var obj = prop ? bd.propObj[prop] : bd.propObj;
            this.value = obj.getAttribute(name);
          },
          set:  function() {
            var attr = {},
                obj = prop ? bd.propObj[prop] : bd.propObj;
            attr[name] = !!this.value;
            return obj.setAttribute(attr);
          }
        };
      }

      creators.trace = generateBoolProperty('trace');

      function color2hex(c) {
        return (c && c !== 'none' && c.indexOf('#') < 0) ? JXG.rgb2hex(c) : c;
      }

      function validateColor(c) {
        return c === 'none' || JXG.rgbParser(c).length === 3;
      }

      creators.strokeColor = {
        type: 'color',
        get:  function() {
          this.value = color2hex(bd.propObj.getAttribute('strokeColor'));
        },
        set:  function() {
          if (validateColor(this.value)) {
            return setPolygonAttribute({ strokeColor: this.value });
          }
        }
      };

      creators.fillColor = {
        type: 'color',
        get:  function() {
          this.value = color2hex(bd.propObj.getAttribute('fillColor'));
        },
        set:  function() {
          if (validateColor(this.value)) {
            return bd.propObj.setAttribute({ fillColor: this.value });
          }
        }
      };

      creators.color = {
        type: 'color',
        get:  function() {
          this.value = color2hex(bd.propObj.getAttribute('fillColor'));
        },
        set:  function() {
          if (validateColor(this.value)) {
            return bd.propObj.setAttribute({
              strokeColor: this.value,
              fillColor:   this.value
            });
          }
        }
      };

      creators.radius = {
        type: 'number', step: 0.1,
        get:  function() {
          this.value = bd.propObj.Radius();
          this.readonly = bd.propObj.method && bd.propObj.method !== 'pointRadius';
        },
        set:  function() {
          if (bd.propObj.method === 'pointRadius') {
            return bd.propObj.setRadius(this.value);
          }
        }
      };

      creators.centerVisible = generateBoolProperty('visible', 'center');

      creators.label = {
        type: 'label',
        get:  function() {
          this.value = {
            withLabel: !!bd.propObj.getAttribute('withLabel'),
            name:      bd.propObj.getName()
          };
        },
        set:  function() {
          this.value.name = this.value.name.replace(/(^\s*)|(\s*$)/g, '');
          var withLabel = !!(this.value.withLabel && this.value.name),
              newLabel = !bd.propObj.label;

          if (this.value.name && this.value.name !== this.oldValue.name) {
            withLabel = true;
            this.value.withLabel = true;
          }
          bd.propObj.setAttribute({ withLabel: withLabel });
          if (this.value.name && this.value.name !== this.oldValue.name) {
            bd.propObj.setName(this.value.name);
            bd.propObj.label.setAttribute({ visible: true });
          }
          if (withLabel && newLabel) {
            data.fetch();
          }
          else if (withLabel && (!creators.fontSize.value || !creators.textColor.value)) {
            creators.fontSize.get();
            creators.textColor.get();
            data.updateView();
          }
          return true;
        }
      };

      creators.position = {
        type:    'position',
        get:     function() {
          var element = this.element();
          this.value = element ? element.getAttribute('position') : '';
        },
        set:     function() {
          var element = this.element();
          return element && element.setAttribute({ position: this.value });
        },
        element: function() {
          return !bd.propObj ? null : bd.propObj.label || bd.propObj;
        }
      };

      creators.offset = {
        type: 'xy', min: -200, max: 200, unit: 'px',
        get:  function() {
          var offset = bd.propObj.getAttribute('offset');
          this.value = { x: offset[0], y: offset[1] };
        },
        set:  function() {
          if (isFloat(this.value.x, this.min, this.max) && isFloat(this.value.y, this.min, this.max)) {
            return bd.propObj.setAttribute({ offset: [parseInt(this.value.x), parseInt(this.value.y)] });
          }
        }
      };

      creators.fontSize = {
        type:    'number', min: 8, max: 500, step: 0.5,
        get:     function() {
          var element = this.element();
          this.value = element ? element.getAttribute('fontSize') : '';
        },
        set:     function() {
          var element = this.element();
          if (element && isFloat(this.value, this.min, this.max)) {
            return element.setAttribute({ fontSize: parseFloat(this.value) }).updateSize();
          }
        },
        element: function() {
          return !bd.propObj ? null : bd.propObj.label || bd.propObj;
        }
      };

      creators.textColor = {
        type:    'color',
        get:     function() {
          var element = this.element();
          this.value = element ? element.getAttribute('strokeColor') : '';
        },
        set:     function() {
          var element = this.element();
          if (element && this.value) {
            return element.setAttribute({ strokeColor: this.value });
          }
        },
        element: function() {
          return !bd.propObj ? null : bd.propObj.label || bd.propObj;
        }
      };

      creators.ignoreLabels = {
        type: 'checkbox',
        get:  function() {
          this.value = bd.board.attr.ignorelabels;
        },
        set:  function() {
          bd.board.attr.ignorelabels = !!this.value;
          return true;
        }
      };

      creators.grid = {
        type: 'checkbox',
        get:  function() {
          this.value = bd.board.grids.length > 0 && bd.board.grids[0].getAttribute('visible');
        },
        set:  function() {
          var attr = { visible: !!this.value };
          bd.board.grids.forEach(function(el) {
            el.setAttribute(attr);
          });
          return true;
        }
      };

      creators.origin = {
        type: 'xy', min: 0, max: 2000, unit: 'px',
        get:  function() {
          this.value = {
            x: bd.board.origin.scrCoords[1],
            y: bd.board.origin.scrCoords[2]
          };
        },
        set:  function() {
          if ((!JXG.exists(this.value.x) || isFloat(this.value.x, this.min, this.max)) &&
            (!JXG.exists(this.value.y) || isFloat(this.value.y, this.min, this.max))) {
            var x = JXG.exists(this.value.x) ? parseInt(this.value.x) : bd.board.canvasWidth / 2,
                y = JXG.exists(this.value.y) ? parseInt(this.value.y) : bd.board.canvasHeight / 2;
            return bd.board.moveOrigin(x, y);
          }
        }
      };

      creators.units = {
        type: 'xy', min: 1, max: 1000, unit: 'px',
        get:  function() {
          this.value = {
            x: bd.board.unitX,
            y: bd.board.unitY
          };
        },
        set:  function() {
          if (isFloat(this.value.x, this.min, this.max) && isFloat(this.value.y, this.min, this.max)) {
            bd.board.unitX = parseFloat(this.value.x);
            bd.board.unitY = parseFloat(this.value.y);
            return bd.board.updateCoords().clearTraces().fullUpdate();
          }
        }
      };

      creators.majorHeight = {
        type: 'checkbox',
        get:  function() {
          this.value = bd.propObj.getAttribute('majorHeight') < 0;
        },
        set:  function() {
          var h = Math.abs(bd.propObj.getAttribute('majorHeight'));
          return bd.propObj.setAttribute({ majorHeight: this.value ? -h : h });
        }
      };

      creators.scaleSymbol = {
        type: 'text',
        get:  function() {
          this.value = bd.propObj.getAttribute('scaleSymbol');
        },
        set:  function() {
          return bd.propObj.setAttribute({ scaleSymbol: this.value });
        }
      };

      creators.drawLabels = generateBoolProperty('drawLabels');
      creators.drawZero = generateBoolProperty('drawZero');
      creators.insertTicks = generateBoolProperty('insertTicks');
      creators.ticksDistance = generateNumberProperty('ticksDistance', { min: 1, max: 50 });
      creators.minorTicks = generateNumberProperty('minorTicks', { min: 0, max: 9 });

      return data;
    }]);
