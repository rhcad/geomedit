// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('snap', ['board', 'options', function(bd, options) {

    this.snapCoords = function(coords, lastSnap) {
      var snapSize = bd.board.options.precision.hasPoint,
          v = {
            coords:   coords,
            draftIDs: getDraftIDs(),
            hits:     [],
            snapSize: snapSize,
            minDist:  snapSize,
            dist:     0,
            snapped:  null,
            mid:      null,
            cross:    null,
            created:  lastSnap ? lastSnap.glider : null,
            glider:   lastSnap ? lastSnap.glider : null
          };

      if (lastSnap) {
        bd.board.removeObject(lastSnap.mid);
        bd.board.removeObject(lastSnap.cross);
      }
      if (options.snap.vertex) {
        _snapPoint(v);
      }
      if (v.minDist > snapSize / 4) {
        gatherHits(v);
        if (options.snap.mid) {
          _snapMidPoint(v);
        }
        if (options.snap.cross && !v.mid) {
          _snapCross(v);
        }
        if (options.snap.glider && !v.snapped) {
          _snapGlider(v);
        }
      }

      if (v.glider && (v.mid || v.cross || v.glider.slideObject !== v.snapped)) {
        bd.board.removeObject(v.glider);
        v.glider = null;
      }
      v.created = v.mid || v.cross || v.glider;

      return {
        coords:  (v.created || v.snapped || v).coords,
        created: v.created,
        snapped: v.snapped,
        mid:     v.mid,
        cross:   v.cross,
        glider:  v.glider,
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
      var snapSize = bd.board.options.precision.hasPoint,
          v = {
            coords:   coords,
            hits:     [],
            snapSize: snapSize,
            minDist:  snapSize,
            dist:     0,
            snapped:  null,
            glider:   null
          };

      _snapPoint(v);
      if (v.minDist > snapSize / 4) {
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
          ids.push(item.created);
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

      if (!v.coords || !bd.board) {
        return;
      }
      bd.board.objectsList.forEach(function(el) {
        if (el !== v.created && bd.drafts.indexOf(el) < 0 && el.visProp.visible && !hasDraftID(el.parents)) {
          filter(el);
        }
      });
    }

    function gatherHits(v) {
      function canHasGlider(cls) {
        return cls === JXG.OBJECT_CLASS_LINE ||
          cls === JXG.OBJECT_CLASS_CIRCLE || cls === JXG.OBJECT_CLASS_CURVE;
      }

      scanObjects(v, function(el) {
        if (canHasGlider(el.elementClass) && el.hasPoint(v.coords.scrCoords[1], v.coords.scrCoords[2])) {
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
