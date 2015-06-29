// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .factory('properties', ['model', 'eventHandler', 'commands', 'select',
    function(model, eventHandler, commands, select) {
      'use strict';
      var active = false,
          creators = {},
          data = {};

      data.options = {
        faces: [
          { id: '', title: 'SelectOption' },
          { id: 'o', title: 'FaceCircle' },
          { id: 'x', title: 'FaceCross' },
          { id: '+', title: 'FacePlus' },
          { id: '<>', title: 'FaceDiamond' },
          { id: '[]', title: 'FaceSquare' },
          { id: '^', title: 'FaceUpTriangle' },
          { id: 'v', title: 'FaceDownTriangle' },
          { id: '<', title: 'FaceLeftTriangle' },
          { id: '>', title: 'FaceRightTriangle' }
        ],
        positions: [
          { id: '', title: 'SelectOption' },
          { id: 'lft', title: 'PosLeft' },
          { id: 'rt', title: 'PosRight' },
          { id: 'top', title: 'PosCenter' }
        ],
        dashes: [
          { id: '', title: 'SelectOption' },
          { id: '0', title: 'SolidLine' },
          { id: '1', title: 'DottedLine' },
          { id: '2', title: 'SmallDashes' },
          { id: '3', title: 'MediumDashes' },
          { id: '4', title: 'BigDashes' },
          { id: '5', title: 'LargeGaps' },
          { id: '6', title: 'SmallGaps' }
        ],
        colors: [
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
        model.propObj = null;
        data.fetch();
      };

      eventHandler.customDownHandlers.push(function() {
        if (active) {
          model.propObj = model.board.downObjects[0];
          data.fetch();
        }
      });

      eventHandler.customMoveHandlers.push(function() {
        if (active && model.propObj) {
          data.fetch();
        }
      });

      data.validID = function(id) {
        return id && id.indexOf('_') !== 0 && !id.match(/_ticks_\d+Label/) ? id : '';
      };

      data.fetch = function() {
        var item, items = [], keys = [];

        if (JXG.isString(model.propObj)) {
          data.id = model.propObj;
          keys = getKeys(model.propObj);
        }
        else {
          data.id = model.propObj ? model.propObj.id : '';
          if (data.validID(data.id)) {
            keys = getKeys(model.propObj.elementClass, model.propObj.type, model.propObj.elType, model.propObj);
          }
        }

        keys.forEach(function(key) {
          item = creators[key];
          if (!JXG.isFalse(item && item.get && item.get())) {
            item.oldValue = JXG.isObject(item.value) ? JXG.deepCopy({}, item.value) : item.value;
            item.id = key;
            items.push(item);
          }
        });

        data.items.length = 0;
        JXG.extend(data.items, items);
        data.updateView();
        select.select(model.propObj, true);
      };

      data.needSave = function() {
        var n = 0;

        if (model.propObj) {
          data.items.forEach(function(item) {
            if (JSON.stringify(item.value) !== JSON.stringify(item.oldValue)) {
              n++;
            }
          });
        }
        return n > 0;
      };

      data.save = function() {
        if (model.propObj) {
          var r, changed = false;
          data.items.forEach(function(item) {
            if (JSON.stringify(item.value) !== JSON.stringify(item.oldValue)) {
              r = item.set();
              changed = changed || r;
              item.oldValue = JXG.isObject(item.value) ? JXG.deepCopy({}, item.value) : item.value;
            }
          });
          if (changed) {
            model.board.update();
          }
        }
      };

      function getKeys(elCls, objType, elType, el) {
        var items = ['label', 'fontSize', 'textColor', 'fixed', 'trace'];

        if (elCls === 'board') {
          items = ['draggable', 'ignoreLabels', 'grid', 'gridCell', 'ticksDistances', 'axis', 'origin', 'units'];
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
          items = ['innerPoints', 'dash', 'strokeWidth', 'strokeColor', 'strokeOpacity', 'fillColor', 'fillOpacity'].concat(items);
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
          items = ['gridCell', 'gridLT', 'gridRB', 'dash', 'strokeWidth', 'strokeColor', 'strokeOpacity'];
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
        get: function() {
          this.value = model.propObj.getAttribute('snapWidth');
        },
        set: function() {
          if (isFloat(this.value, this.min, this.max)) {
            return model.propObj.setAttribute({ snapWidth: parseInt(this.value) });
          }
        }
      };

      creators.strokeWidth = {
        type: 'range', unit: 'px', min: 0.5, max: 50, step: 0.5,
        get: function() {
          this.value = model.propObj.getAttribute('strokeWidth');
        },
        set: function() {
          if (isFloat(this.value, this.min, this.max)) {
            return setPolygonAttribute({ strokeWidth: parseFloat(this.value) });
          }
        }
      };

      function setPolygonAttribute(attr, vertices) {
        var r = model.propObj.setAttribute(attr);
        if (model.propObj.borders) {
          model.propObj.borders.forEach(function(el) {
            el.setAttribute(attr);
          });
        }
        if (vertices && model.propObj.vertices) {
          model.propObj.vertices.forEach(function(el) {
            el.setAttribute(attr);
          });
        }
        return r;
      }

      creators.dash = {
        type: 'dash',
        get: function() {
          this.value = model.propObj.getAttribute('dash').toString();
        },
        set: function() {
          if (this.value) {
            return setPolygonAttribute({ dash: parseInt(this.value) });
          }
        }
      };

      creators.strokeOpacity = {
        type: 'range', unit: '%', min: 1, max: 100,
        get: function() {
          this.value = Math.round(model.propObj.getAttribute('strokeOpacity') * 100);
        },
        set: function() {
          return setPolygonAttribute({ strokeOpacity: this.value * 0.01 });
        }
      };

      creators.fillOpacity = {
        type: 'range', unit: '%', min: 1, max: 100,
        get: function() {
          this.value = Math.round(model.propObj.getAttribute('fillOpacity') * 100);
        },
        set: function() {
          return model.propObj.setAttribute({ fillOpacity: this.value * 0.01 });
        }
      };

      creators.opacity = {
        type: 'range', unit: '%', min: 1, max: 100,
        get: function() {
          this.value = Math.round(model.propObj.getAttribute('fillOpacity') * 100);
        },
        set: function() {
          return model.propObj.setAttribute({
            strokeOpacity: this.value * 0.01,
            fillOpacity: this.value * 0.01
          });
        }
      };

      function isFloat(value, min, max) {
        var pattern = /^-?\d+\.?\d*$/, v = parseFloat(value);
        return JXG.exists(value) && pattern.test(value) && v > min - 1e-5 && v < max + 1e-5;
      }

      creators.size = {
        type: 'size', unit: 'px', min: 0.5, max: 50, step: 0.5,
        get: function() {
          this.value = {
            size: model.propObj.getAttribute('size'),
            zoom: model.propObj.getAttribute('zoom')
          };
          this.value.size = model.propObj.getAttribute('size');
          this.value.zoom = model.propObj.getAttribute('zoom');
        },
        set: function() {
          if (isFloat(this.value.size, this.min, this.max)) {
            var size = parseFloat(this.value.size);
            return model.propObj.setAttribute({
              zoom: this.value.zoom,
              size: size,
              strokeWidth: size / 10
            });
          }
        }
      };

      function toFixedNumber(number) {
        return parseFloat(number.toFixed(4));
      }

      creators.coords = {
        type: 'coords',
        get: function() {
          this.value = {
            x: toFixedNumber(model.propObj.coords.usrCoords[1]),
            y: toFixedNumber(model.propObj.coords.usrCoords[2]),
            snapToGrid: model.propObj.getAttribute('snapToGrid'),
            snapToPoints: model.propObj.getAttribute('snapToPoints'),
            readonly: model.propObj.type === JXG.OBJECT_TYPE_CAS
          };
        },
        set: function() {
          var pattern = /^-?\d+\.?\d*$/,
              valid = !this.value.readonly && pattern.test(this.value.x) && pattern.test(this.value.y),
              x = parseFloat(this.value.x),
              y = parseFloat(this.value.y),
              inLimit = function(v) {
                return Math.abs(v) < 1e3;
              },
              attractorDistance = model.propObj.getAttribute('attractorDistance'),
              attractorUnit = model.propObj.getAttribute('attractorUnit');

          if (this.value.snapToPoints && attractorDistance < 1e-5) {
            attractorDistance = Math.max(model.board.options.precision.hasPoint, 10);
            attractorUnit = 'screen';
          }
          if (valid && inLimit(x) && inLimit(y)) {
            model.propObj.setAttribute({
              snapToGrid: this.value.snapToGrid,
              snapToPoints: this.value.snapToPoints,
              attractorDistance: attractorDistance,
              attractorUnit: attractorUnit
            });
            return model.propObj.setPositionDirectly(JXG.COORDS_BY_USER, [x, y]);
          }
        }
      };

      creators.lineEndings = {
        type: 'lineEndings',
        get: function() {
          var p = model.propObj.visProp;
          this.value = {
            restrictFirst: !p.straightfirst,
            restrictLast: !p.straightlast,
            arrowFirst: p.firstarrow,
            arrowLast: p.lastarrow
          };
        },
        set: function() {
          var v = this.value;
          return model.propObj.setAttribute({
            straightFirst: !v.restrictFirst,
            straightLast: !v.restrictLast,
            firstArrow: v.arrowFirst,
            lastArrow: v.arrowLast
          });
        }
      };

      creators.face = {
        type: 'face',
        get: function() {
          this.value = model.propObj.getAttribute('face');
        },
        set: function() {
          if (this.value) {
            return model.propObj.setAttribute({ face: this.value });
          }
        }
      };

      creators.fixed = {
        type: 'checkbox', icon1: 'lock', icon0: 'unlock',
        get: function() {
          this.value = model.propObj.getAttribute('fixed');
        },
        set: function() {
          return setPolygonAttribute({ fixed: this.value }, true);
        }
      };

      function generateNumberProperty(name, attr) {
        return JXG.deepCopy(JXG.deepCopy({type: 'number'}, attr || {}), {
          get: function() {
            this.value = model.propObj.getAttribute(name);
          },
          set: function() {
            if (isFloat(this.value, this.min, this.max)) {
              var a = {};
              a[name] = parseFloat(this.value);
              return model.propObj.setAttribute(a);
            }
          }
        });
      }

      function generateBoolProperty(name, prop) {
        return {
          type: 'checkbox',
          get: function() {
            var obj = prop ? model.propObj[prop] : model.propObj;
            this.value = obj.getAttribute(name);
          },
          set: function() {
            var attr = {},
                obj = prop ? model.propObj[prop] : model.propObj;
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
        get: function() {
          this.value = color2hex(model.propObj.getAttribute('strokeColor'));
        },
        set: function() {
          if (validateColor(this.value)) {
            return setPolygonAttribute({ strokeColor: this.value });
          }
        }
      };

      creators.fillColor = {
        type: 'color',
        get: function() {
          this.value = color2hex(model.propObj.getAttribute('fillColor'));
        },
        set: function() {
          if (validateColor(this.value)) {
            return model.propObj.setAttribute({ fillColor: this.value });
          }
        }
      };

      creators.color = {
        type: 'color',
        get: function() {
          this.value = color2hex(model.propObj.getAttribute('fillColor'));
        },
        set: function() {
          if (validateColor(this.value)) {
            return model.propObj.setAttribute({
              strokeColor: this.value,
              fillColor: this.value
            });
          }
        }
      };

      creators.radius = {
        type: 'number', step: 0.1,
        get: function() {
          this.value = toFixedNumber(model.propObj.Radius());
          this.readonly = model.propObj.method && model.propObj.method !== 'pointRadius';
        },
        set: function() {
          if (model.propObj.method === 'pointRadius') {
            return model.propObj.setRadius(this.value);
          }
        }
      };

      creators.centerVisible = generateBoolProperty('visible', 'center');

      creators.label = {
        type: 'label',
        get: function() {
          this.value = {
            withLabel: !!model.propObj.getAttribute('withLabel'),
            name: model.propObj.getName()
          };
        },
        set: function() {
          this.value.name = this.value.name.replace(/(^\s*)|(\s*$)/g, '');
          var nameChanged = this.value.name && this.value.name !== this.oldValue.name,
              withLabel = nameChanged || (this.value.withLabel && this.value.name),
              newLabel = !model.propObj.label;

          model.propObj.setAttribute({ withLabel: !!withLabel });
          if (nameChanged) {
            model.propObj.setName(this.value.name);
            model.propObj.label.setAttribute({ visible: true });
            this.value.withLabel = true;
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
        type: 'position',
        get: function() {
          var element = this.element();
          this.value = element ? element.getAttribute('position') : '';
        },
        set: function() {
          var element = this.element();
          return element && element.setAttribute({ position: this.value });
        },
        element: function() {
          return !model.propObj ? null : model.propObj.label || model.propObj;
        }
      };

      creators.offset = {
        type: 'xy', min: -200, max: 200, unit: 'px',
        get: function() {
          var offset = model.propObj.getAttribute('offset');
          this.value = { x: offset[0], y: offset[1] };
        },
        set: function() {
          if (isFloat(this.value.x, this.min, this.max) && isFloat(this.value.y, this.min, this.max)) {
            return model.propObj.setAttribute({ offset: [parseInt(this.value.x), parseInt(this.value.y)] });
          }
        }
      };

      creators.fontSize = {
        type: 'number', min: 8, max: 500, step: 0.5,
        get: function() {
          var element = this.element();
          this.value = element ? element.getAttribute('fontSize') : '';
        },
        set: function() {
          var element = this.element();
          if (element && isFloat(this.value, this.min, this.max)) {
            return element.setAttribute({ fontSize: parseFloat(this.value) }).updateSize();
          }
        },
        element: function() {
          return !model.propObj ? null : model.propObj.label || model.propObj;
        }
      };

      creators.textColor = {
        type: 'color',
        get: function() {
          var element = this.element();
          this.value = element ? element.getAttribute('strokeColor') : '';
        },
        set: function() {
          var element = this.element();
          if (element && this.value) {
            return element.setAttribute({ strokeColor: this.value });
          }
        },
        element: function() {
          return !model.propObj ? null : model.propObj.label || model.propObj;
        }
      };

      creators.draggable = {
        type: 'checkbox',
        get: function() {
          this.value = model.draggable;
        },
        set: function() {
          model.draggable = !!this.value;
          return true;
        }
      };

      creators.ignoreLabels = {
        type: 'checkbox',
        get: function() {
          this.value = model.board.attr.ignorelabels;
        },
        set: function() {
          model.board.attr.ignorelabels = !!this.value;
          return true;
        }
      };

      creators.grid = {
        type: 'checkbox',
        get: function() {
          this.value = model.board.grids.length > 0 && model.board.grids[0].getAttribute('visible');
        },
        set: function() {
          var attr = { visible: !!this.value };
          model.board.grids.forEach(function(el) {
            el.setAttribute(attr);
          });
          return true;
        }
      };

      creators.axis = {
        type: 'checkbox',
        get: function() {
          var axis = JXG.filterElements(model.board.objectsList, {type: JXG.OBJECT_TYPE_AXIS});
          this.value = axis[0] && axis[0].getAttribute('visible');
        },
        set: function() {
          var axis = JXG.filterElements(model.board.objectsList, {type: JXG.OBJECT_TYPE_AXIS}),
              attr = { visible: !!this.value };
          axis.forEach(function(el) {
            el.setAttribute(attr);
          });
          return true;
        }
      };

      creators.gridCell = {
        type: 'xy', min: 0.5, max: 50, step: 0.5,
        get: function() {
          var grid = this.element();
          if (grid) {
            this.value = {
              x: grid.getAttribute('gridX'),
              y: grid.getAttribute('gridY')
            };
          }
        },
        set: function() {
          var grid = this.element();
          if (grid && isFloat(this.value.x, this.min, this.max) && isFloat(this.value.y, this.min, this.max)) {
            return grid.setAttribute({ gridX: parseFloat(this.value.x), gridY: parseFloat(this.value.y) });
          }
        },
        element: function() {
          return model.propObj && model.propObj.type === JXG.OBJECT_TYPE_GRID ? model.propObj :
            JXG.filterElements(model.board.objectsList, {type: JXG.OBJECT_TYPE_GRID})[0];
        }
      };

      creators.gridLT = {
        type: 'xy', min: -500, max: 500,
        get: function() {
          var lt = model.propObj.getAttribute('topLeft');
          this.value = lt ? { x: lt[0], y: lt[1] } : {};
        },
        set: function() {
          var valid = isFloat(this.value.x, this.min, this.max) && isFloat(this.value.y, this.min, this.max);
          model.propObj.visProp.topleft = valid ? [parseFloat(this.value.x), parseFloat(this.value.y)] : undefined;
          model.board.applyZoom();
          return true;
        }
      };

      creators.gridRB = {
        type: 'xy', min: -500, max: 500,
        get: function() {
          var lt = model.propObj.getAttribute('bottomRight');
          this.value = lt ? { x: lt[0], y: lt[1] } : {};
        },
        set: function() {
          var valid = isFloat(this.value.x, this.min, this.max) && isFloat(this.value.y, this.min, this.max);
          model.propObj.visProp.bottomright = valid ? [parseFloat(this.value.x), parseFloat(this.value.y)] : undefined;
          model.board.applyZoom();
          return true;
        }
      };

      creators.ticksDistances = {
        type: 'xy', min: 1, max: 50, title: 'ticksDistance',
        get: function() {
          var ticks = JXG.filterElements(model.board.objectsList, {type: JXG.OBJECT_TYPE_TICKS});
          if (ticks.length > 1) {
            this.value = {
              x: ticks[0].getAttribute('ticksDistance'),
              y: ticks[1].getAttribute('ticksDistance')
            };
          }
        },
        set: function() {
          var ticks = JXG.filterElements(model.board.objectsList, {type: JXG.OBJECT_TYPE_TICKS});
          if (ticks.length > 1 && isFloat(this.value.x, this.min, this.max) &&
            isFloat(this.value.y, this.min, this.max)) {
            ticks[0].setAttribute({ ticksDistance: parseFloat(this.value.x) });
            ticks[1].setAttribute({ ticksDistance: parseFloat(this.value.y) });
            return true;
          }
        }
      };

      creators.origin = {
        type: 'xy', min: 0, max: 2000, unit: 'px',
        get: function() {
          this.value = {
            x: model.board.origin.scrCoords[1],
            y: model.board.origin.scrCoords[2]
          };
        },
        set: function() {
          if ((!JXG.exists(this.value.x) || isFloat(this.value.x, this.min, this.max)) &&
            (!JXG.exists(this.value.y) || isFloat(this.value.y, this.min, this.max))) {
            var x = JXG.exists(this.value.x) ? parseInt(this.value.x) : model.board.canvasWidth / 2,
                y = JXG.exists(this.value.y) ? parseInt(this.value.y) : model.board.canvasHeight / 2;
            return model.board.moveOrigin(x, y);
          }
        }
      };

      creators.units = {
        type: 'xy', min: 1, max: 1000, unit: 'px',
        get: function() {
          this.value = {
            x: model.board.unitX,
            y: model.board.unitY
          };
        },
        set: function() {
          if (isFloat(this.value.x, this.min, this.max) && isFloat(this.value.y, this.min, this.max)) {
            model.board.unitX = parseFloat(this.value.x);
            model.board.unitY = parseFloat(this.value.y);
            return model.board.updateCoords().clearTraces().fullUpdate();
          }
        }
      };

      creators.majorHeight = {
        type: 'checkbox',
        get: function() {
          this.value = model.propObj.getAttribute('majorHeight') < 0;
        },
        set: function() {
          var h = Math.abs(model.propObj.getAttribute('majorHeight'));
          return model.propObj.setAttribute({ majorHeight: this.value ? -h : h });
        }
      };

      creators.scaleSymbol = {
        type: 'text',
        get: function() {
          this.value = model.propObj.getAttribute('scaleSymbol');
        },
        set: function() {
          return model.propObj.setAttribute({ scaleSymbol: this.value });
        }
      };

      creators.innerPoints = generateBoolProperty('hasInnerPoints');
      creators.drawLabels = generateBoolProperty('drawLabels');
      creators.drawZero = generateBoolProperty('drawZero');
      creators.insertTicks = generateBoolProperty('insertTicks');
      creators.ticksDistance = generateNumberProperty('ticksDistance', { min: 1, max: 50 });
      creators.minorTicks = generateNumberProperty('minorTicks', { min: 0, max: 9 });

      return data;
    }]);
