// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('snap', ['board', 'options', function(bd, options) {

    function makeParam(coords, masks) {
      var snapSize = bd.board.options.precision.hasPoint;
      return {
        coords:   coords,
        hits:     [],
        masks:    masks,
        snapSize: snapSize,
        minDist:  snapSize,
        dist:     0,
        snapped:  null,
        glider:   null
      };
    }

    this.snapCoords = function(coords, lastSnap, masks) {
      var v = makeParam(coords, masks),
          oldSnapSize,
          snap = options.snap;

      JXG.extend(v, {
        draftIDs: getDraftIDs(),
        mid:      null,
        cross:    null,
        created:  lastSnap ? lastSnap.glider : null,
        glider:   lastSnap ? lastSnap.glider : null
      });

      if (lastSnap) {
        if (lastSnap.created && !lastSnap.glider) {
          bd.board.removeObject(lastSnap.created);
        }
        v.masks = masks || lastSnap.masks;
      }
      if (v.masks) {
        oldSnapSize = bd.board.options.precision.hasPoint;
        v.snapSize = Math.max(v.snapSize, 60);
        v.minDist = v.snapSize;
        bd.board.options.precision.hasPoint = v.snapSize;

        snap.vertex = snap.vertex || v.masks.vertex;
        snap.mid = snap.mid || v.masks.mid;
        snap.cross = snap.cross || v.masks.cross;
        snap.glider = snap.glider || v.masks.glider;
      }

      if (v.masks && JXG.isFunction(v.masks.filter)) {
        gatherHits(v);
        v.masks.filter(v);
      }
      else {
        if (options.snap.vertex && (!v.masks || v.masks.vertex)) {
          _snapPoint(v);
        }
        if (v.minDist > v.snapSize / 4) {
          gatherHits(v);
          if (options.snap.mid && (!v.masks || v.masks.mid)) {
            _snapMidPoint(v);
          }
          if (options.snap.cross && !v.mid && (!v.masks || v.masks.cross)) {
            _snapCross(v);
          }
          if (options.snap.glider && !v.snapped && (!v.masks || v.masks.glider)) {
            _snapGlider(v);
          }
        }
      }

      if (v.glider && (v.mid || v.cross || v.glider.slideObject !== v.snapped)) {
        bd.board.removeObject(v.glider);
        v.glider = null;
      }
      v.created = v.mid || v.cross || v.glider || v.created;
      if (oldSnapSize) {
        bd.board.options.precision.hasPoint = oldSnapSize;
      }

      return {
        coords:  (v.created || v.snapped || v).coords,
        created: v.created,
        snapped: v.snapped,
        mid:     v.mid,
        cross:   v.cross,
        glider:  v.glider,
        masks:   v.masks,
        clear:   function() {
          if (v.created) {
            bd.board.removeObject(v.created);
            v.created = null;
            v.mid = null;
            v.cross = null;
            v.glider = null;
          }
          v.snapped = null;
        },
        detach:  function() {
          var ret = v.created;
          v.created = null;
          v.mid = null;
          v.cross = null;
          v.glider = null;
          v.snapped = null;
          return ret;
        }
      };
    };

    this.hitTest = function(coords) {
      var v = makeParam(coords);

      _snapPoint(v);
      if (v.minDist > v.snapSize / 4) {
        gatherHits(v);
        if (v.hits.length === 1) {
          v.snapped = v.hits[0];
        }
        else if (v.hits.length > 1) {
          _snapGlider(v);
          bd.board.removeObject(v.glider);
        }
      }

      return v.snapped;
    };

    function getDraftIDs() {
      var ids = bd.drafts.map(function(el) { return el.id; });
      bd.snaps.forEach(function(item) {
        if (item.created) {
          ids.push(item.created.id);
        }
      });
      return ids;
    }

    function scanObjects(v, filter) {
      function hasDraftID(ids) {
        var ret = false;
        ids.forEach(function(id) {
          ret = ret || v.draftIDs && v.draftIDs.indexOf(id) >= 0;
        });
        return ret;
      }
      function isOrigin(el) {
        return el.type === JXG.OBJECT_TYPE_AXISPOINT && JXG.cmpArrays(el.coords.usrCoords, [1, 0, 0]);
      }

      if (!v.coords || !bd.board) {
        return;
      }
      bd.board.objectsList.forEach(function(el) {
        if (el !== v.created && bd.drafts.indexOf(el) < 0 && !hasDraftID(el.parents) &&
          (el.visProp.visible || isOrigin(el))) {
          filter(el);
        }
      });
    }

    function gatherHits(v) {
      function canHasGlider(cls) {
        return cls === JXG.OBJECT_CLASS_LINE ||
          cls === JXG.OBJECT_CLASS_CIRCLE || cls === JXG.OBJECT_CLASS_CURVE;
      }
      function canSnapPoints(el) {
        return v.masks && v.masks.filter && JXG.isPoint(el);
      }

      scanObjects(v, function(el) {
        if ( (canSnapPoints(el) || canHasGlider(el.elementClass)) &&
          el.hasPoint(v.coords.scrCoords[1], v.coords.scrCoords[2])) {
          v.hits.push(el);
        }
      });
    }

    function _snapPoint(v) {
      scanObjects(v, function(el) {
        if (JXG.isPoint(el) && el.hasPoint(v.coords.scrCoords[1], v.coords.scrCoords[2])) {
          v.dist = el.coords.distance(JXG.COORDS_BY_SCREEN, v.coords);
          if (v.minDist > v.dist) {
            v.minDist = v.dist;
            v.snapped = el;
          }
        }
      });
    }

    function _snapMidPoint(v) {
      var tmp;
      v.hits.forEach(function(el) {
        if (el.elementClass === JXG.OBJECT_CLASS_LINE && !el.straightFirst && !el.straightLast && !el.visProp.lastarrow) {
          tmp = bd.create('midpoint', [el], bd.board.options.midpoint);

          v.dist = tmp.coords.distance(JXG.COORDS_BY_SCREEN, v.coords);
          if (v.minDist > v.dist) {
            v.minDist = v.dist;
            v.snapped = el;
            if (v.mid) {
              bd.board.removeObject(v.mid);
            }
            v.mid = tmp;
          }
          else {
            bd.board.removeObject(tmp);
          }
        }
      });
    }

    function _snapGlider(v) {
      v.hits.forEach(function(el) {
        var tmp, distAdd = v.snapSize / 2 + 1;

        if (v.masks && v.masks.gliderFilter && !v.masks.gliderFilter(el)) {
          return;
        }

        if (v.glider && v.glider.slideObject === el) {
          tmp = v.glider;
          tmp.setPositionDirectly(JXG.COORDS_BY_SCREEN, [v.coords.scrCoords[1], v.coords.scrCoords[2]]);
          distAdd = 1;
        }
        else {
          tmp = bd.create('glider', v.coords.usrCoords.slice(1).concat(el));
        }

        v.dist = tmp.coords.distance(JXG.COORDS_BY_SCREEN, v.coords) + distAdd;
        if (v.minDist > v.dist) {
          v.minDist = v.dist;
          v.snapped = el;
          if (v.glider && v.glider !== tmp) {
            bd.board.removeObject(v.glider);
          }
          v.glider = tmp;
        }
        else if (tmp !== v.glider) {
          bd.board.removeObject(tmp);
        }
      });
    }

    function _snapCross(v) {
      var lineOrCircle = function(el) {
        return el.elementClass === JXG.OBJECT_CLASS_LINE || el.elementClass === JXG.OBJECT_CLASS_CIRCLE;
      }, tmp, tmp2, d2;

      v.hits.forEach(function(el1, i) {
        v.hits.forEach(function(el2, j) {
          if (i > j && lineOrCircle(el1) && lineOrCircle(el2)) {
            tmp = bd.create('intersection', [el1, el2, 0]);
            if (JXG.cmpArrays(tmp.coords.usrCoords, [0, 0, 0])) {
              bd.board.removeObject(tmp);
              return;
            }

            v.dist = tmp.coords.distance(JXG.COORDS_BY_SCREEN, v.coords);
            if (el1.elementClass === JXG.OBJECT_CLASS_CIRCLE || el2.elementClass === JXG.OBJECT_CLASS_CIRCLE) {
              tmp2 = bd.create('intersection', [el1, el2, 1]);
              d2 = tmp2.coords.distance(JXG.COORDS_BY_SCREEN, v.coords);
              if (v.dist > d2) {
                v.dist = d2;
                bd.board.removeObject(tmp);
                tmp = tmp2;
              }
              else {
                bd.board.removeObject(tmp2);
              }
            }

            if (v.minDist > v.dist) {
              v.minDist = v.dist;
              v.snapped = el1;
              if (v.cross) {
                bd.board.removeObject(v.cross);
              }
              v.cross = tmp;
            }
            else {
              bd.board.removeObject(tmp);
            }
          }
        });
      });
    }

  }]);
