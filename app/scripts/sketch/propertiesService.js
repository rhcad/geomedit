// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .factory('properties', ['board', 'eventHandler', 'commands', 'motion', 'snap', 'select',
    function(bd, eventHandler, commands, motion, snap, select) {
      var active = false,
          creators = {},
          data = {};

      data.faces = [
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
      ];
      data.colors = [
        'none', '#000000', '#eeeeee', '#808080', '#ff00ff', '#cc0000',
        '#ffa500', '#ffff00', '#3366ff', '#00ffff', '#006400', '#00ff00'
      ];
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
      };

      eventHandler.customDownHandlers.push(function() {
        if (active) {
          bd.propObj = snap.hitTest(motion.pt);
          data.fetch();
        }
      });

      eventHandler.customMoveHandlers.push(function() {
        if (active && bd.propObj) {
          data.fetch();
        }
      });

      data.fetch = function() {
        var item, items = [];

        data.id = bd.propObj ? bd.propObj.id : '';
        if (data.id) {
          getKeys(bd.propObj.elementClass, bd.propObj.type, bd.propObj.elType).forEach(function(key) {
            item = creators[key];
            if (item && item.get && item.get() !== false) {
              item.title = item.title || key.substring(0, 1).toUpperCase() + key.substring(1);
              item.oldValue = JXG.isObject(item.value) ? JXG.deepCopy({}, item.value) : item.value;
              item.id = key;
              items.push(item);
            }
          });
        }
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
          var n = 0, r;
          data.items.forEach(function(item) {
            if (JSON.stringify(item.value) !== JSON.stringify(item.oldValue)) {
              r = item.set();
              if (r !== undefined && r !== false) {
                item.oldValue = JXG.isObject(item.value) ? JXG.deepCopy({}, item.value) : item.value;
                n++;
              }
            }
          });
          if (n > 0) {
            bd.board.update();
          }
        }
      };

      function getKeys(elCls, objType, elType) {
        var i, items = ['label', 'fontSize', 'textColor', 'fixed', 'trace'];

        if (elType === 'slider') {
          items = ['label', 'range', 'fontSize', 'textColor', 'snapWidth', 'face', 'size',
            'strokeWidth', 'strokeColor', 'strokeOpacity', 'fillColor', 'fillOpacity'];
        }
        else if (elCls === JXG.OBJECT_CLASS_POINT) {
          items = ['coords', 'face', 'size', 'color', 'opacity'].concat(items);
        }
        else if (elCls === JXG.OBJECT_CLASS_LINE) {
          items = ['lineEndings', 'strokeWidth', 'strokeColor', 'strokeOpacity'].concat(items);
        }
        else if (elCls === JXG.OBJECT_CLASS_CIRCLE) {
          items = ['radius', 'centerVisible', 'strokeWidth', 'strokeColor', 'strokeOpacity', 'fillColor', 'fillOpacity'].concat(items);
        }
        else if (objType === JXG.OBJECT_TYPE_POLYGON) {
          items = ['label', 'draggable', 'fontSize', 'textColor', 'strokeWidth', 'strokeColor', 'strokeOpacity', 'fillColor', 'fillOpacity'];
        }
        else if (objType === JXG.OBJECT_TYPE_ANGLE) {
          items = ['label', 'radius', 'fontSize', 'textColor', 'strokeWidth', 'strokeColor', 'strokeOpacity', 'fillColor', 'fillOpacity'];
        }
        else if (objType === JXG.OBJECT_TYPE_SECTOR) {
          items = ['label', 'fontSize', 'textColor', 'strokeWidth', 'strokeColor', 'strokeOpacity', 'fillColor', 'fillOpacity'];
        }
        else if (elCls === JXG.OBJECT_CLASS_CURVE) {
          items = ['functionTerm', 'strokeWidth', 'strokeColor', 'strokeOpacity', 'fillColor', 'fillOpacity'].concat(items);
        }
        else if (objType === JXG.OBJECT_TYPE_TEXT) {
          items = ['text', 'fontSize', 'textColor', 'fixed'];
        }

        i = items.indexOf('label');
        if (i > 0) {
          items.unshift(items.splice(i, 1)[0]);
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
          this.value = bd.propObj.getAttribute('strokewidth');
        },
        set:  function() {
          if (isFloat(this.value, this.min, this.max)) {
            return setPolygonAttribute({ strokewidth: parseFloat(this.value) });
          }
        }
      };

      function setPolygonAttribute(attr) {
        var r = bd.propObj.setAttribute(attr);
        if (bd.propObj.borders) {
          bd.propObj.borders.forEach(function(el) {
            el.setAttribute(attr);
          });
        }
        return r;
      }

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
          return bd.propObj.setAttribute({ fixed: this.value });
        }
      };

      creators.trace = {
        type: 'checkbox',
        get:  function() {
          this.value = bd.propObj.getAttribute('trace');
        },
        set:  function() {
          return bd.propObj.setAttribute({ trace: this.value });
        }
      };

      creators.draggable = {
        type: 'checkbox',
        get:  function() {
          this.value = bd.propObj.getAttribute('draggable');
        },
        set:  function() {
          return bd.propObj.setAttribute({ draggable: this.value });
        }
      };

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

      creators.centerVisible = {
        type: 'checkbox',
        get:  function() {
          this.value = bd.propObj.center.getAttribute('visible');
        },
        set:  function() {
          return bd.propObj.center.setAttribute({ visible: this.value });
        }
      };

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
          var withLabel = !!(this.value.withLabel && this.value.name);

          if (this.value.name && this.value.name !== this.oldValue.name) {
            bd.propObj.setName(this.value.name);
            withLabel = true;
            this.value.withLabel = true;
          }
          bd.propObj.setAttribute({ withLabel: withLabel });
          if (withLabel && (!creators.fontSize.value || !creators.textColor.value)) {
            creators.fontSize.get();
            creators.textColor.get();
            data.updateView();
          }
          return true;
        }
      };

      creators.fontSize = {
        type:    'number', min: 1, max: 500, step: 0.5,
        get:     function() {
          this.value = this.element() ? this.element().getAttribute('fontSize') : '';
        },
        set:     function() {
          if (this.element() && isFloat(this.value, this.min, this.max)) {
            return this.element().setAttribute({ fontSize: parseFloat(this.value) });
          }
        },
        element: function() {
          return !bd.propObj ? null : bd.propObj.type === JXG.OBJECT_TYPE_TEXT ? bd.propObj : bd.propObj.label;
        }
      };

      creators.textColor = {
        type:    'color',
        get:     function() {
          this.value = this.element() ? this.element().getAttribute('strokeColor') : '';
        },
        set:     function() {
          if (this.element() && this.value) {
            return this.element().setAttribute({ strokeColor: this.value });
          }
        },
        element: function() {
          return !bd.propObj ? null : bd.propObj.type === JXG.OBJECT_TYPE_TEXT ? bd.propObj : bd.propObj.label;
        }
      };

      return data;
    }]);
