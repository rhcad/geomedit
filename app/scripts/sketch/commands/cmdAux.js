// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .service('cmdAux', ['model', 'motion', function(model, motion) {
    'use strict';

    function checkParams(p) {
      if (JXG.isFunction(p.snapFilter)) {
        p.snapMasks = p.snapMasks || {};
        p.snapMasks.filter = p.snapFilter;
      }
      p.afterCreated = p.afterCreated || function(el) {
        return el;
      };
    }

    function showTip(p, step) {
      if (p.tip) {
        if (JXG.isString(p.tip)) {
          model.context.tip = p.tip;
        }
        else if (JXG.isFunction(p.tip)) {
          model.context.tip = p.tip(step);
          model.context.applyContext();
        }
      }
    }

    this.generateTip = function(tips) {
      return function(step) {
        return tips[Math.min(step, tips.length - 1)];
      }
    };

    this.addPointCommand = function(p) {
      checkParams(p);

      function downHandler() {
        motion.setDraftCoords(0, p.snapMasks);
        motion.createDraftPoint(0);
      }

      function upHandler() {
        motion.submit(function() {
          var created = motion.getDraftCoords().created;
          if (!p.snapMasks || JXG.isPoint(created)) {
            return motion.createPoint(0);
          }
          return JXG.isFunction(p.defaultCreator) && p.defaultCreator();
        });
      }

      model.addCommand(p.group || 'point', p.id, makeHandlers(p, downHandler, upHandler));
    };

    this.snapMasksForLine = { gliderFilter: function(el) {
      return el.elementClass === JXG.OBJECT_CLASS_LINE;
    }};
    this.snapMasksForTriangle = { gliderFilter: function(el) {
      return el.type === JXG.OBJECT_TYPE_POLYGON && el.borders.length === 3;
    }};
    this.snapMasksForCircle = { gliderFilter: function(el) {
      return el.type === JXG.OBJECT_TYPE_CIRCLE;
    }};

    this.perpendicularFilter = function(v) {
      var tmp;
      v.hits.forEach(function(el) {
        if (JXG.isPoint(model.drafts[0]) && el.elementClass === JXG.OBJECT_CLASS_LINE) {
          tmp = model.create('perpendicularPoint', [model.drafts[0], el], model.initOptions.perpendicularPoint);

          v.dist = tmp.coords.distance(JXG.COORDS_BY_SCREEN, v.coords);
          if (v.minDist > v.dist) {
            v.minDist = v.dist;
            v.snapped = el;
            if (v.created) {
              model.board.removeObject(v.created);
            }
            v.created = tmp;
          }
          else {
            model.board.removeObject(tmp);
          }
        }
      });
    };

    this.addCommandSnapSecond = function(p) {
      checkParams(p);

      function downHandler() {
        if (!motion.hasDraftCoords()) {
          motion.addDraftCoords();
          motion.addDraftCoords(p.snapMasks);
          var recorder = motion.recordObjects();
          p.afterCreated(model.create('segment', motion.createDraftPoints(0, 1), { strokeWidth: 1, dash: 2 }));
          recorder.addTo(model.drafts);
        }
        else {
          motion.updateDraftCoords();
        }
        p.cmd.step = 2;
      }

      function upHandler() {
        if (motion.lastDraftCoordsIsNew()) {
          p.cmd.step = 0;
          motion.submit(function() {
            var endSnap = motion.getDraftCoords();
            if (endSnap.snapped) {
              if (JXG.isFunction(p.creator)) {
                return p.creator(motion.createPoint(0, true), endSnap);
              }
              var parents = [motion.createPoint(0, true), endSnap.snapped];
              if (endSnap.created.elType === 'mirrorpoint') {
                parents.reverse();
              }
              return p.afterCreated(model.create(endSnap.created.elType, parents, p.attr));
            }
          });
        }
        else {
          p.cmd.step = 1;
        }
      }

      model.addCommand(p.group || 'point', p.id, makeHandlers(p, downHandler, upHandler));
    };

    this.addLineCommand = function(p) {
      checkParams(p);

      function verifyParents(points) {
        return JXG.isFunction(p.verifyParents) ? p.verifyParents(points) : points;
      }

      function downHandler() {
        if (!motion.hasDraftCoords()) {
          motion.addDraftCoords();
          motion.addDraftCoords();
          var points = motion.createDraftPoints(0, 1),
              recorder = motion.recordObjects();
          p.afterCreated(model.create(p.type, verifyParents(points), p.attr));
          recorder.addTo(model.drafts)
        }
        else {
          motion.updateDraftCoords();
        }
        p.cmd.step = 2;
      }

      function upHandler() {
        if (motion.lastDraftCoordsIsNew()) {
          p.cmd.step = 0;
          motion.submit(function() {
            var p1 = motion.createPoint(0, true, p.attrP1),
                p2 = motion.createPoint(1, true, p.attrP2);
            return p.afterCreated(model.create(p.type, verifyParents([p1, p2]), p.attr));
          });
        }
        else {
          p.cmd.step = 1;
        }
      }

      model.addCommand(p.group || 'line', p.id, makeHandlers(p, downHandler, upHandler));
    };

    this.addCommandSnapFirst = function(p) {
      checkParams(p);

      function downHandler() {
        if (!motion.hasDraftCoords()) {
          if (motion.addDraftCoords(p.snapMasks).snapped) {
            motion.addDraftCoords();
            model.drafts.push(p.creator(motion.getDraftCoords(0), motion.createDraftPoint(1)));
          }
          else {
            motion.clearDraftCoords();
          }
        }
        else {
          motion.updateDraftCoords();
        }
        p.cmd.step = 2;
      }

      function upHandler() {
        if (motion.lastDraftCoordsIsNew()) {
          p.cmd.step = 0;
          motion.submit(function() {
            return p.creator(motion.getDraftCoords(0), motion.createPoint(1, true, p.attr));
          });
        }
        else {
          p.cmd.step = 1;
        }
      }

      model.addCommand(p.group || 'line', p.id, makeHandlers(p, downHandler, upHandler));
    };

    this.addCommand3p = function(p) {
      var points;

      checkParams(p);

      function downHandler() {
        var count = motion.draftCoordsCount();
        if (count < 1) {
          motion.addDraftCoords();
          motion.addDraftCoords();
          points = motion.createDraftPoints(0, 1, 2);
          p.cmd.step = 1;
        }
        else if (count < 3 && motion.lastDraftCoordsIsNew()) {
          motion.addDraftCoords();
          var recorder = motion.recordObjects();
          p.afterCreated(model.create(p.type, points), points);
          recorder.addTo(model.drafts);
        }
        else {
          motion.updateDraftCoords();
        }
        p.cmd.step++;
      }

      function upHandler() {
        if (motion.lastDraftCoordsIsNew()) {
          p.cmd.step++;
          if (motion.draftCoordsCount() === 3) {
            p.cmd.step = 0;
            motion.submit(function() {
              points = motion.createPoints();
              return p.afterCreated(model.create(p.type, points), points);
            });
          }
        }
        else {
          p.cmd.step--;
        }
      }

      model.addCommand(p.group || 'circle', p.id, makeHandlers(p, downHandler, upHandler));
    };

    this.addPolygonCommand = function(p) {
      checkParams(p);

      function downHandler() {
        var count = motion.draftCoordsCount();
        if (count < 1) {
          motion.addDraftCoords();
          motion.addDraftCoords();
          p.cmd.step = 1;

          var i, indexes = [];
          for (i = 0; i < p.maxCount; i++) {
            indexes[i] = i;
          }
          model.drafts.push(model.create('polygon', motion.createDraftPoints(indexes)));
        }
        else if (motion.lastDraftCoordsIsNew() && count < p.maxCount) {
          motion.addDraftCoords();
        }
        else {
          motion.updateDraftCoords();
        }
        p.cmd.step++;
      }

      function upHandler() {
        if (motion.lastDraftCoordsIsNew()) {
          p.cmd.step++;
          if (motion.draftCoordsCount() === p.maxCount) {
            p.cmd.step = 0;
            motion.submit(function() {
              return model.create('polygon', motion.createPoints());
            });
          }
        }
        else {
          p.cmd.step--;
        }
      }

      model.addCommand(p.group || 'polygon', p.id, makeHandlers(p, downHandler, upHandler));
    };

    function makeHandlers(p, downHandler, upHandler) {
      var cmd = { step: 0 };

      p.tip = p.tip || 'Tip_' + p.id;
      p.cmd = cmd;

      cmd.downHandler = !JXG.isFunction(p.tip) ? downHandler : function() {
        downHandler();
        showTip(p, cmd.step);
      };
      cmd.upHandler = !JXG.isFunction(p.tip) ? upHandler : function() {
        upHandler();
        showTip(p, cmd.step);
      };

      cmd.inited = function() {
        cmd.step = 0;
        if (JXG.isFunction(p.inited) && JXG.isFalse(p.inited())) {
          return false;
        }
        showTip(p, cmd.step);
      };

      if (JXG.isFunction(p.cancelled)) {
        cmd.cancelled = p.cancelled;
      }
      if (JXG.isFunction(p.clickHandler)) {
        cmd.clickHandler = p.clickHandler;
      }

      return cmd;
    }

  }]);
