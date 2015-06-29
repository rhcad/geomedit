// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .service('snap', ['model', function(model) {
    'use strict';

    function makeParam(coords, masks, lastSnap) {
      var snapSize = model.board.options.precision.hasPoint;
      if (masks && masks.gliderFilter) {
        masks.glider = true;
      }
      return {
        coords: coords,
        hits: [],
        draftIDs: getDraftIDs(),
        masks: masks || lastSnap && lastSnap.masks,
        snapSize: snapSize,
        minDist: snapSize,
        dist: 0,
        snapped: null,
        glider: null
      };
    }

    function makeResult(v) {
      function check(el) {
        return el && el.coords ? el : null;
      }
      if (v.glider && (v.mid || v.cross || v.glider.slideObject !== v.snapped)) {
        if (v.created === v.glider) {
          v.created = null;
        }
        model.board.removeObject(v.glider);
        v.glider = null;
      }
      v.created = v.mid || v.cross || v.glider || v.created;
      if (v.oldSnapSize) {
        model.board.options.precision.hasPoint = v.oldSnapSize;
      }
      return {
        coords: (check(v.created) || check(v.snapped) || v).coords,
        created: v.created,
        snapped: v.snapped,
        mid: v.mid,
        cross: v.cross,
        glider: v.glider,
        masks: v.masks,
        clear: function() {
          if (this.created) {
            model.board.removeObject(this.created);
            this.created = null;
            this.mid = null;
            this.cross = null;
            this.glider = null;
          }
          this.snapped = null;
        },
        detach: function() {
          var ret = this.created;
          this.created = null;
          this.mid = null;
          this.cross = null;
          this.glider = null;
          this.snapped = null;
          return ret;
        }
      };
    }

    function doSnapCoords(v, snap) {
      if (v.masks && JXG.isFunction(v.masks.filter)) {
        gatherHits(v);
        v.masks.filter(v);
      }
      else {
        if (snap.point) {
          doSnapPoint(v);
        }
        if (v.minDist > v.snapSize / 4) {
          gatherHits(v);
          if (snap.mid) {
            doSnapMidPoint(v);
          }
          if (snap.cross) {
            doSnapCross(v);
          }
          if (snap.glider) {
            doSnapGlider(v);
          }
        }
      }
    }

    this.snapCoords = function(coords, lastSnap, masks) {
      var v = makeParam(coords, masks, lastSnap),
          snap = v.masks || model.snap;

      JXG.extend(v, {
        mid: null,
        cross: null,
        created: lastSnap ? lastSnap.glider : null,
        glider: lastSnap ? lastSnap.glider : null
      });

      if (lastSnap && lastSnap.created && !lastSnap.glider) {
        model.board.removeObject(lastSnap.created);
      }
      if (v.masks) {
        v.oldSnapSize = model.board.options.precision.hasPoint;
        v.snapSize = Math.max(v.snapSize, 60);
        v.minDist = v.snapSize;
        model.board.options.precision.hasPoint = v.snapSize;
      }

      doSnapCoords(v, snap);
      return makeResult(v);
    };

    this.hitTest = function(coords, masks) {
      var v = makeParam(coords, masks);

      if (!masks || masks.point) {
        doSnapPoint(v);
      }
      if (v.minDist > v.snapSize / 4 && (!masks || masks.glider)) {
        gatherHits(v);
        if (v.hits.length === 1) {
          v.snapped = v.hits[0];
        }
        else if (v.hits.length > 1) {
          doSnapGlider(v);
          model.board.removeObject(v.glider);
        }
      }

      return v.snapped;
    };

    function getDraftIDs() {
      var ids = model.drafts.map(function(el) {
        return el.id;
      });
      model.snaps.forEach(function(item) {
        if (item.created) {
          ids.push(item.created.id);
        }
      });
      return ids;
    }

    function scanObjects(v, filter) {
      function hasDraftID(el) {
        var ret = v.draftIDs && v.draftIDs.indexOf(el.id) >= 0;
        el.parents.forEach(function(id) {
          ret = ret || v.draftIDs && v.draftIDs.indexOf(id) >= 0;
        });
        return ret;
      }

      function isOrigin(el) {
        return el.type === JXG.OBJECT_TYPE_AXISPOINT && JXG.cmpArrays(el.coords.usrCoords, [1, 0, 0]);
      }

      if (!v.coords || !model.board) {
        return;
      }
      model.board.objectsList.forEach(function(el) {
        var checkObj = el !== v.created && model.drafts.indexOf(el) < 0;
        if (checkObj && !hasDraftID(el) && (el.visProp.visible || isOrigin(el))) {
          filter(el);
        }
      });
    }

    function gatherHits(v) {
      function canHasGlider(el) {
        var c = el.elementClass;
        return (c === JXG.OBJECT_CLASS_LINE || c === JXG.OBJECT_CLASS_CIRCLE ||
          c === JXG.OBJECT_CLASS_CURVE || el.borders) && !gliderFilter(v, el);
      }

      function canSnapPoints(el) {
        return v.masks && JXG.isFunction(v.masks.filter) && JXG.isPoint(el);
      }

      function hasPoint(el, x, y) {
        var r = el.hasPoint(x, y);
        if (!r && el.type === JXG.OBJECT_TYPE_POLYGON && el.visProp.hasinnerpoints) {
          el.visProp.hasinnerpoints = false;
          r = el.hasPoint(x, y);
          el.visProp.hasinnerpoints = true;
        }
        return r;
      }

      scanObjects(v, function(el) {
        if ((canSnapPoints(el) || canHasGlider(el)) &&
          hasPoint(el, v.coords.scrCoords[1], v.coords.scrCoords[2])) {
          v.hits.push(el);
        }
      });
    }

    function pointFilter(v, el) {
      return v.masks && JXG.isFunction(v.masks.pointFilter) && !v.masks.pointFilter(el);
    }

    function doSnapPoint(v) {
      scanObjects(v, function(el) {
        if (JXG.isPoint(el) && el.hasPoint(v.coords.scrCoords[1], v.coords.scrCoords[2]) &&
          !pointFilter(v, el)) {
          v.dist = el.coords.distance(JXG.COORDS_BY_SCREEN, v.coords);
          if (v.minDist > v.dist) {
            v.minDist = v.dist;
            v.snapped = el;
          }
        }
      });
    }

    function isSegment(el) {
      var line = el && el.elementClass === JXG.OBJECT_CLASS_LINE;
      return line && !el.straightFirst && !el.straightLast && !el.visProp.lastarrow;
    }

    this.isSegment = isSegment;

    function doSnapMidPoint(v) {
      var tmp;
      v.hits.forEach(function(el) {
        if (isSegment(el)) {
          tmp = model.create('midpoint', [el], model.board.options.midpoint);

          v.dist = tmp.coords.distance(JXG.COORDS_BY_SCREEN, v.coords);
          if (v.minDist > v.dist) {
            v.minDist = v.dist;
            v.snapped = el;
            if (v.mid) {
              model.board.removeObject(v.mid);
            }
            v.mid = tmp;
          }
          else {
            model.board.removeObject(tmp);
          }
        }
      });
    }

    function gliderFilter(v, el) {
      return v.masks && JXG.isFunction(v.masks.gliderFilter) && !v.masks.gliderFilter(el);
    }

    function doSnapGlider(v) {
      v.hits.forEach(function(el) {
        var tmp, distAdd = v.snapSize / 2 + 1;

        if (gliderFilter(v, el)) {
          return;
        }

        if (v.glider && v.glider.slideObject === el) {
          tmp = v.glider;
          tmp.setPositionDirectly(JXG.COORDS_BY_SCREEN, [v.coords.scrCoords[1], v.coords.scrCoords[2]]);
          distAdd = 1;
        }
        else {
          tmp = model.create('glider', v.coords.usrCoords.slice(1).concat(el));
        }

        v.dist = tmp.coords.distance(JXG.COORDS_BY_SCREEN, v.coords) + distAdd;
        if (v.minDist > v.dist) {
          v.minDist = v.dist;
          v.snapped = el;
          if (v.glider && v.glider !== tmp) {
            model.board.removeObject(v.glider);
          }
          v.glider = tmp;
        }
        else if (tmp !== v.glider) {
          model.board.removeObject(tmp);
        }
      });
    }

    function lineOrCircle(el) {
      return el.elementClass === JXG.OBJECT_CLASS_LINE || el.elementClass === JXG.OBJECT_CLASS_CIRCLE;
    }

    function checkSecondCross(v, el1, el2) {
      if (el1.elementClass === JXG.OBJECT_CLASS_CIRCLE || el2.elementClass === JXG.OBJECT_CLASS_CIRCLE) {
        var tmp2 = model.create('intersection', [el1, el2, 1]),
            d2 = tmp2.coords.distance(JXG.COORDS_BY_SCREEN, v.coords);
        if (v.dist > d2) {
          v.dist = d2;
          return tmp2;
        }
        else {
          model.board.removeObject(tmp2);
        }
      }
    }

    function doSnapCross(v) {
      var tmp, tmp2, invalidIntersection = [0, 0, 0];

      v.hits.forEach(function(el1, i) {
        v.hits.forEach(function(el2, j) {
          if (i > j && lineOrCircle(el1) && lineOrCircle(el2)) {
            tmp = model.create('intersection', [el1, el2, 0]);
            if (JXG.cmpArrays(tmp.coords.usrCoords, invalidIntersection)) {
              model.board.removeObject(tmp);
              return;
            }

            v.dist = tmp.coords.distance(JXG.COORDS_BY_SCREEN, v.coords);
            tmp2 = checkSecondCross(v, el1, el2);
            if (tmp2) {
              model.board.removeObject(tmp);
              tmp = tmp2;
            }

            if (v.minDist > v.dist) {
              v.minDist = v.dist;
              v.snapped = el1;
              if (v.cross) {
                model.board.removeObject(v.cross);
              }
              v.cross = tmp;
            }
            else {
              model.board.removeObject(tmp);
            }
          }
        });
      });
    }

  }]);
