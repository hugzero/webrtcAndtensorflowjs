// @tensorflow/tfjs-models Copyright 2019 Google
!function (t, e) {
    "object" == typeof exports && "undefined" != typeof module ? e(exports, require("@tensorflow/tfjs-core"),
        require("@tensorflow/tfjs-converter")) : "function" == typeof define && define.amd ?
        define(["exports", "@tensorflow/tfjs-core", "@tensorflow/tfjs-converter"], e) : e(t.posenet = {}, t.tf, t.tf)
}(this, function (t, e, r) {
    "use strict";
    var n = [8, 16, 32];

    function i(t) {
        e.util.assert("number" == typeof t, function () {
            return "outputStride is not a number"
        }), e.util.assert(n.indexOf(t) >= 0, function () {
            return "outputStride of " + t + " is invalid. It must be either 8, 16, or 32"
        })
    }

    function o(t, r) {
        e.util.assert("number" == typeof t, function () {
            return "resolution is not a number"
        }), e.util.assert((t - 1) % r == 0, function () {
            return "resolution of " + t + " is invalid for output stride " + r + "."
        })
    }

    var u = function () {
        function t(t, r) {
            this.model = t;
            var n = this.model.inputs[0].shape;
            // e.util.assert(-1 === n[1] && -1 === n[2], function () {
            e.util.assert(257 === n[1] && 257 === n[2], function () {
                return "Input shape [" + n[1] + ", " + n[2] + "] must both be -1"
            }), this.outputStride = r
        }

        return t.prototype.predict = function (t) {
            var r = this;
            return e.tidy(function () {
                var n = function (t) {
                    return e.tidy(function () {
                        return "int32" === t.dtype && (t = t.toFloat()), t = e.div(t, 127.5), e.sub(t, 1)
                    })
                }(t).expandDims(0), i = r.model.predict(n), o = i[0], u = i[1], s = i[2], a = i[3];
                return {
                    heatmapScores: u.squeeze().sigmoid(),
                    offsets: o.squeeze(),
                    displacementFwd: s.squeeze(),
                    displacementBwd: a.squeeze()
                }
            })
        },
            t.prototype.dispose = function () {
            this.model.dispose()
        },
            t
    }();

    function s(t) {
        return Math.floor(t / 2)
    }

    var a = function () {
        function t(t, e) {
            this.priorityQueue = new Array(t), this.numberOfElements = -1, this.getElementValue = e
        }

        return t.prototype.enqueue = function (t) {
            this.priorityQueue[++this.numberOfElements] = t, this.swim(this.numberOfElements)
        }, t.prototype.dequeue = function () {
            var t = this.priorityQueue[0];
            return this.exchange(0, this.numberOfElements--), this.sink(0), this.priorityQueue[this.numberOfElements + 1] = null, t
        },
            t.prototype.empty = function () {
            return -1 === this.numberOfElements
        },
            t.prototype.size = function () {
            return this.numberOfElements + 1
        },
            t.prototype.all = function () {
            return this.priorityQueue.slice(0, this.numberOfElements + 1)
        },
            t.prototype.max = function () {
            return this.priorityQueue[0]
        },
            t.prototype.swim = function (t) {
            for (; t > 0 && this.less(s(t), t);) this.exchange(t, s(t)), t = s(t)
        },
            t.prototype.sink = function (t) {
            for (; 2 * t <= this.numberOfElements;) {
                var e = 2 * t;
                if (e < this.numberOfElements && this.less(e, e + 1) && e++, !this.less(t, e)) break;
                this.exchange(t, e), t = e
            }
        },
            t.prototype.getValueAt = function (t) {
            return this.getElementValue(this.priorityQueue[t])
        },
            t.prototype.less = function (t, e) {
            return this.getValueAt(t) < this.getValueAt(e)
        },
            t.prototype.exchange = function (t, e) {
            var r = this.priorityQueue[t];
            this.priorityQueue[t] = this.priorityQueue[e], this.priorityQueue[e] = r
        },
            t
    }();

    function l(t, e, r, n, i, o) {
        for (var u = o.shape, s = u[0], a = u[1], l = !0, f = Math.max(r - i, 0), c = Math.min(r + i + 1, s), p = f; p < c; ++p) {
            for (var h = Math.max(n - i, 0), d = Math.min(n + i + 1, a), m = h; m < d; ++m) if (o.get(p, m, t) > e) {
                l = !1;
                break
            }
            if (!l) break
        }
        return l
    }

    var f = ["nose", "leftEye", "rightEye", "leftEar", "rightEar", "leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist", "rightWrist", "leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"],
        c = f.length, p = f.reduce(function (t, e, r) {
            return t[e] = r, t
        }, {}),
        h = [["nose", "leftEye"], ["leftEye", "leftEar"], ["nose", "rightEye"], ["rightEye", "rightEar"], ["nose", "leftShoulder"], ["leftShoulder", "leftElbow"], ["leftElbow", "leftWrist"], ["leftShoulder", "leftHip"], ["leftHip", "leftKnee"], ["leftKnee", "leftAnkle"], ["nose", "rightShoulder"], ["rightShoulder", "rightElbow"], ["rightElbow", "rightWrist"], ["rightShoulder", "rightHip"], ["rightHip", "rightKnee"], ["rightKnee", "rightAnkle"]],
        d = [["leftHip", "leftShoulder"], ["leftElbow", "leftShoulder"], ["leftElbow", "leftWrist"], ["leftHip", "leftKnee"], ["leftKnee", "leftAnkle"], ["rightHip", "rightShoulder"], ["rightElbow", "rightShoulder"], ["rightElbow", "rightWrist"], ["rightHip", "rightKnee"], ["rightKnee", "rightAnkle"], ["leftShoulder", "rightShoulder"], ["leftHip", "rightHip"]].map(function (t) {
            var e = t[0], r = t[1];
            return [p[e], p[r]]
        });

    function m(t, e, r, n) {
        return {y: n.get(t, e, r), x: n.get(t, e, r + c)}
    }

    function v(t, e, r) {
        var n = m(t.heatmapY, t.heatmapX, t.id, r), i = n.y, o = n.x;
        return {x: t.heatmapX * e + o, y: t.heatmapY * e + i}
    }

    function y(t, e, r) {
        return t < e ? e : t > r ? r : t
    }

    function g(t, e) {
        return {x: t.x + e.x, y: t.y + e.y}
    }

    var b = h.map(function (t) {
        var e = t[0], r = t[1];
        return [p[e], p[r]]
    }),
        w = b.map(function (t) {
        return t[1]
    }),
        x = b.map(function (t) {
        return t[0]
    });

    function _(t, e, r, n) {
        return {y: y(Math.round(t.y / e), 0, r - 1), x: y(Math.round(t.x / e), 0, n - 1)}
    }

    function E(t, e, r, n, i, o, u, s) {
        void 0 === s && (s = 2);
        for (var a = n.shape, l = a[0], c = a[1], p = function (t, e, r) {
            var n = r.shape[2] / 2;
            return {y: r.get(e.y, e.x, t), x: r.get(e.y, e.x, n + t)}
        }(t, _(e.position, o, l, c), u), h = g(e.position, p), d = 0; d < s; d++) {
            var v = _(h, o, l, c), y = m(v.y, v.x, r, i);
            h = g({x: v.x * o, y: v.y * o}, {x: y.x, y: y.y})
        }
        var b = _(h, o, l, c), w = n.get(b.y, b.x, r);
        return {position: h, part: f[r], score: w}
    }

    function S(t, e, r, n, i, o) {
        var u = e.shape[2], s = w.length, a = new Array(u), l = t.part, c = t.score, p = v(l, n, r);
        a[l.id] = {score: c, part: f[l.id], position: p};
        for (var h = s - 1; h >= 0; --h) {
            var d = w[h], m = x[h];
            a[d] && !a[m] && (a[m] = E(h, a[d], m, e, r, n, o))
        }
        for (h = 0; h < s; ++h) {
            d = x[h], m = w[h];
            a[d] && !a[m] && (a[m] = E(h, a[d], m, e, r, n, i))
        }
        return a
    }

    function M(t, e, r, n) {
        var i = r.x, o = r.y;
        return t.some(function (t) {
            var r, u, s, a, l, f, c = t.keypoints[n].position;
            return r = o, u = i, s = c.y, a = c.x, (l = s - r) * l + (f = a - u) * f <= e
        })
    }

    function k(t, e, r) {
        return r.reduce(function (r, n, i) {
            var o = n.position, u = n.score;
            return M(t, e, o, i) || (r += u), r
        }, 0) / r.length
    }

    var I = 1;

    function O(t, e, r, n, i, o, u, s) {
        void 0 === u && (u = .5), void 0 === s && (s = 20);
        for (var f = [], c = function (t, e, r) {
            for (var n = r.shape, i = n[0], o = n[1], u = n[2], s = new a(i * o * u, function (t) {
                return t.score
            }), f = 0; f < i; ++f) for (var c = 0; c < o; ++c) for (var p = 0; p < u; ++p) {
                var h = r.get(f, c, p);
                h < t || l(p, h, f, c, e, r) && s.enqueue({score: h, part: {heatmapY: f, heatmapX: c, id: p}})
            }
            return s
        }(u, I, t), p = s * s; f.length < o && !c.empty();) {
            var h = c.dequeue();
            if (!M(f, p, v(h.part, i, e), h.part.id)) {
                var d = S(h, t, e, i, r, n), m = k(f, p, d);
                f.push({keypoints: d, score: m})
            }
        }
        return f
    }

    var q = function () {
        return (q = Object.assign || function (t) {
            for (var e, r = 1, n = arguments.length; r < n; r++) for (var i in e = arguments[r]) Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t
        }).apply(this, arguments)
    };

    function N(t, e, r, n) {
        return new (r || (r = Promise))(function (i, o) {
            function u(t) {
                try {
                    a(n.next(t))
                } catch (t) {
                    o(t)
                }
            }

            function s(t) {
                try {
                    a(n.throw(t))
                } catch (t) {
                    o(t)
                }
            }

            function a(t) {
                t.done ? i(t.value) : new r(function (e) {
                    e(t.value)
                }).then(u, s)
            }

            a((n = n.apply(t, e || [])).next())
        })
    }

    function R(t, e) {
        var r, n, i, o, u = {
            label: 0, sent: function () {
                if (1 & i[0]) throw i[1];
                return i[1]
            }, trys: [], ops: []
        };
        return o = {
            next: s(0),
            throw: s(1),
            return: s(2)
        }, "function" == typeof Symbol && (o[Symbol.iterator] = function () {
            return this
        }), o;

        function s(o) {
            return function (s) {
                return function (o) {
                    if (r) throw new TypeError("Generator is already executing.");
                    for (; u;) try {
                        if (r = 1, n && (i = 2 & o[0] ? n.return : o[0] ? n.throw || ((i = n.return) && i.call(n), 0) : n.next) && !(i = i.call(n, o[1])).done) return i;
                        switch (n = 0, i && (o = [2 & o[0], i.value]), o[0]) {
                            case 0:
                            case 1:
                                i = o;
                                break;
                            case 4:
                                return u.label++, {value: o[1], done: !1};
                            case 5:
                                u.label++, n = o[1], o = [0];
                                continue;
                            case 7:
                                o = u.ops.pop(), u.trys.pop();
                                continue;
                            default:
                                if (!(i = (i = u.trys).length > 0 && i[i.length - 1]) && (6 === o[0] || 2 === o[0])) {
                                    u = 0;
                                    continue
                                }
                                if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) {
                                    u.label = o[1];
                                    break
                                }
                                if (6 === o[0] && u.label < i[1]) {
                                    u.label = i[1], i = o;
                                    break
                                }
                                if (i && u.label < i[2]) {
                                    u.label = i[2], u.ops.push(o);
                                    break
                                }
                                i[2] && u.ops.pop(), u.trys.pop();
                                continue
                        }
                        o = e.call(t, u)
                    } catch (t) {
                        o = [6, t], n = 0
                    } finally {
                        r = i = 0
                    }
                    if (5 & o[0]) throw o[1];
                    return {value: o[0] ? o[1] : void 0, done: !0}
                }([o, s])
            }
        }
    }

    var P = Number.NEGATIVE_INFINITY, j = Number.POSITIVE_INFINITY;

    function z(t) {
        return t.reduce(function (t, e) {
            var r = t.maxX, n = t.maxY, i = t.minX, o = t.minY, u = e.position, s = u.x, a = u.y;
            return {maxX: Math.max(r, s), maxY: Math.max(n, a), minX: Math.min(i, s), minY: Math.min(o, a)}
        }, {maxX: P, maxY: P, minX: j, minY: j})
    }

    function A(t, r) {
        return void 0 === r && (r = "float32"), N(this, void 0, void 0, function () {
            var n;
            return R(this, function (i) {
                switch (i.label) {
                    case 0:
                        return [4, t.data()];
                    case 1:
                        return n = i.sent(), [2, e.buffer(t.shape, r, n)]
                }
            })
        })
    }

    function B(t, e, r, n, i) {
        return void 0 === n && (n = 0), void 0 === i && (i = 0), {
            score: t.score,
            keypoints: t.keypoints.map(function (t) {
                var o = t.score, u = t.part, s = t.position;
                return {score: o, part: u, position: {x: s.x * r + i, y: s.y * e + n}}
            })
        }
    }

    function H(t) {
        return t instanceof e.Tensor ? [t.shape[0], t.shape[1]] : [t.height, t.width]
    }

    function T(t, r) {
        var n = r[0], i = r[1], o = H(t), u = o[0], s = o[1], a = i / n, l = [0, 0, 0, 0], f = l[0], c = l[1], p = l[2],
            h = l[3];
        return s / u < a ? (f = 0, c = 0, p = Math.round(.5 * (a * u - s)), h = Math.round(.5 * (a * u - s))) : (f = Math.round(.5 * (1 / a * s - u)), c = Math.round(.5 * (1 / a * s - u)), p = 0, h = 0), {
            resized: e.tidy(function () {
                var r = function (t) {
                    return t instanceof e.Tensor ? t : e.browser.fromPixels(t)
                }(t);
                return (r = e.pad3d(r, [[f, c], [p, h], [0, 0]])).resizeBilinear([n, i])
            }), padding: {top: f, left: p, right: h, bottom: c}
        }
    }

    function V(t, e, r, n, i) {
        var o = e[0], u = e[1], s = r[0], a = r[1], l = function (t, e, r, n, i) {
            return void 0 === n && (n = 0), void 0 === i && (i = 0), 1 === r && 1 === e && 0 === n && 0 === i ? t : t.map(function (t) {
                return B(t, e, r, n, i)
            })
        }(t, (o + n.top + n.bottom) / s, (u + n.left + n.right) / a, -n.top, -n.left);
        return i ? function (t, e) {
            return e <= 0 ? t : t.map(function (t) {
                return function (t, e) {
                    return {
                        score: t.score, keypoints: t.keypoints.map(function (t) {
                            var r = t.score, n = t.part, i = t.position;
                            return {score: r, part: n, position: {x: e - 1 - i.x, y: i.y}}
                        })
                    }
                }(t, e)
            })
        }(l, u) : l
    }

    function Y(t) {
        var r = t.shape, n = r[0], i = r[1], o = r[2];
        return e.tidy(function () {
            var r, u, s = t.reshape([n * i, o]).argMax(0), a = s.div(e.scalar(i, "int32")).expandDims(1),
                l = (r = s, u = i, e.tidy(function () {
                    var t = r.div(e.scalar(u, "int32"));
                    return r.sub(t.mul(e.scalar(u, "int32")))
                })).expandDims(1);
            return e.concat([a, l], 1)
        })
    }

    function F(t, e, r, n) {
        return {y: n.get(t, e, r), x: n.get(t, e, r + c)}
    }

    function K(t, r, n) {
        return e.tidy(function () {
            var i = function (t, r) {
                for (var n = [], i = 0; i < c; i++) {
                    var o = F(t.get(i, 0).valueOf(), t.get(i, 1).valueOf(), i, r), u = o.x, s = o.y;
                    n.push(s), n.push(u)
                }
                return e.tensor2d(n, [c, 2])
            }(t, n);
            return t.toTensor().mul(e.scalar(r, "int32")).toFloat().add(i)
        })
    }

    function Q(t, e, r) {
        return N(this, void 0, void 0, function () {
            var n, i, o, u, s, a, l, c, p, h;
            return R(this, function (d) {
                switch (d.label) {
                    case 0:
                        return n = 0, i = Y(t), [4, Promise.all([A(t), A(e), A(i, "int32")])];
                    case 1:
                        return o = d.sent(), u = o[0], s = o[1], a = o[2], [4, A(l = K(a, r, s))];
                    case 2:
                        return c = d.sent(), p = Array.from(function (t, e) {
                            for (var r = e.shape[0], n = new Float32Array(r), i = 0; i < r; i++) {
                                var o = e.get(i, 0), u = e.get(i, 1);
                                n[i] = t.get(o, u, i)
                            }
                            return n
                        }(u, a)), h = p.map(function (t, e) {
                            return n += t, {position: {y: c.get(e, 0), x: c.get(e, 1)}, part: f[e], score: t}
                        }), i.dispose(), l.dispose(), [2, {keypoints: h, score: n / h.length}]
                }
            })
        })
    }

    var X = "https://storage.googleapis.com/tfjs-models/savedmodel/posenet/mobilenet/",
        D = "https://storage.googleapis.com/tfjs-models/savedmodel/posenet/resnet50/";
    var W = function () {
            function t(t, r) {
                this.model = t;
                var n = this.model.inputs[0].shape;
                // e.util.assert(-1 === n[1] && -1 === n[2], function () {
                e.util.assert(257 === n[1] && 257 === n[2], function () {
                    return "Input shape [" + n[1] + ", " + n[2] + "] must both be equal to or -1"
                }), this.outputStride = r
            }

            return t.prototype.predict = function (t) {
                var r = this;
                return e.tidy(function () {
                    var n = function (t) {
                        return e.tidy(function () {
                            "int32" === t.dtype && (t = t.toFloat());
                            var r = e.tensor([-123.15, -115.9, -103.06]);
                            return t.add(r)
                        })
                    }(t).expandDims(0), i = r.model.predict(n), o = i[0], u = i[1], s = i[2];
                    return {
                        heatmapScores: i[3].squeeze().sigmoid(),
                        offsets: s.squeeze(),
                        displacementFwd: o.squeeze(),
                        displacementBwd: u.squeeze()
                    }
                })
            }, t.prototype.dispose = function () {
                this.model.dispose()
            }, t
        }(), C = {architecture: "MobileNetV1", outputStride: 16, multiplier: .75, inputResolution: 257},
        G = ["MobileNetV1", "ResNet50"], U = {MobileNetV1: [8, 16, 32], ResNet50: [32, 16]},
        L = [161, 193, 257, 289, 321, 353, 385, 417, 449, 481, 513, 801],
        J = {MobileNetV1: [.5, .75, 1], ResNet50: [1]}, Z = [1, 2, 4];
    var $ = {flipHorizontal: !1}, tt = {flipHorizontal: !1, maxDetections: 5, scoreThreshold: .5, nmsRadius: 20};
    var et = function () {
        function t(t, e) {
            this.baseModel = t, this.inputResolution = e
        }

        return t.prototype.estimateMultiplePoses = function (t, e) {
            return void 0 === e && (e = tt), N(this, void 0, void 0, function () {
                var r, n, u, s, a, l, f, c, p, h, d, m, v, y, g, b, w, x, _, E, S;
                return R(this, function (M) {
                    switch (M.label) {
                        case 0:
                            return r = q({}, tt, e), function (t) {
                                var e = t.maxDetections, r = t.scoreThreshold, n = t.nmsRadius;
                                if (e <= 0) throw new Error("Invalid maxDetections " + e + ". Should be > 0");
                                if (r < 0 || r > 1) throw new Error("Invalid scoreThreshold " + r + ". Should be in range [0.0, 1.0]");
                                if (n <= 0) throw new Error("Invalid nmsRadius " + n + ".")
                            }(e), n = this.baseModel.outputStride, u = this.inputResolution, i(n), o(this.inputResolution, n), s = H(t), a = s[0], l = s[1], f = T(t, [u, u]), c = f.resized, p = f.padding, h = this.baseModel.predict(c), d = h.heatmapScores, m = h.offsets, v = h.displacementFwd, y = h.displacementBwd, [4, function (t) {
                                return N(this, void 0, void 0, function () {
                                    return R(this, function (e) {
                                        return [2, Promise.all(t.map(function (t) {
                                            return A(t, "float32")
                                        }))]
                                    })
                                })
                            }([d, m, v, y])];
                        case 1:
                            return g = M.sent(), b = g[0], w = g[1], x = g[2], _ = g[3], [4, O(b, w, x, _, n, r.maxDetections, r.scoreThreshold, r.nmsRadius)];
                        case 2:
                            return E = M.sent(), S = V(E, [a, l], [u, u], p, r.flipHorizontal), d.dispose(), m.dispose(), v.dispose(), y.dispose(), c.dispose(), [2, S]
                    }
                })
            })
        },
            t.prototype.estimateSinglePose = function (t, e) {
            return void 0 === e && (e = $), N(this, void 0, void 0, function () {
                var r, n, u, s, a, l, f, c, p, h, d, m, v, y, g, b;
                return R(this, function (w) {
                    switch (w.label) {
                        case 0:
                            return r = q({}, $, e), n = this.baseModel.outputStride, u = this.inputResolution, i(n), o(u, n), s = H(t), a = s[0], l = s[1], f = T(t, [u, u]), c = f.resized, p = f.padding, h = this.baseModel.predict(c), d = h.heatmapScores, m = h.offsets, v = h.displacementFwd, y = h.displacementBwd, [4, Q(d, m, n)];
                        case 1:
                            return g = w.sent(), b = V([g], [a, l], [u, u], p, r.flipHorizontal), d.dispose(), m.dispose(), v.dispose(), y.dispose(), c.dispose(), [2, b[0]]
                    }
                })
            })
        },
            t.prototype.estimatePoses = function (t, e) {
            return N(this, void 0, void 0, function () {
                return R(this, function (r) {
                    switch (r.label) {
                        case 0:
                            return "single-person" != e.decodingMethod ? [3, 2] : [4, this.estimateSinglePose(t, e)];
                        case 1:
                            return [2, [r.sent()]];
                        case 2:
                            return [2, this.estimateMultiplePoses(t, e)]
                    }
                })
            })
        }, t.prototype.dispose = function () {
            this.baseModel.dispose()
        }, t
    }();

    function rt(t) {
        return N(this, void 0, void 0, function () {
            var n, i, o, s, a, l;
            return R(this, function (f) {
                switch (f.label) {
                    case 0:
                        if (n = t.outputStride, i = t.quantBytes, o = t.multiplier, null == e) throw new Error("Cannot find TensorFlow.js. If you are using a <script> tag, please also include @tensorflow/tfjs on the page before using this\n        model.");
                        return s = function (t, e, r) {
                            var n = {1: "100", .75: "075", .5: "050"}, i = "model-stride" + t + ".json";
                            return 4 == r ? X + "float/" + n[e] + "/" + i : X + "quant" + r + "/" + n[e] + "/" + i
                        }(n, o, i), [4, r.loadGraphModel(t.modelUrl || s)];
                    case 1:
                        return a = f.sent(), l = new u(a, n), [2, new et(l, t.inputResolution)]
                }
            })
        })
    }

    function nt(t) {
        return N(this, void 0, void 0, function () {
            var n, i, o, u, s;
            return R(this, function (a) {
                switch (a.label) {
                    case 0:
                        if (n = t.outputStride, i = t.quantBytes, null == e) throw new Error("Cannot find TensorFlow.js. If you are using a <script> tag, please also include @tensorflow/tfjs on the page before using this\n        model.");
                        return o = function (t, e) {
                            var r = "model-stride" + t + ".json";
                            return 4 == e ? D + "float/" + r : D + "quant" + e + "/" + r
                        }(n, i),
                            [4, r.loadGraphModel(t.modelUrl ||"posenet_resnet50/model-257x257-stride32.json")];
                            // [4, r.loadGraphModel(t.modelUrl || o)];
                    case 1:
                        return u = a.sent(), s = new W(u, n), [2, new et(s, t.inputResolution)]
                }
            })
        })
    }

    t.decodeMultiplePoses = O, t.decodeSinglePose = Q, t.MobileNet = u, t.partChannels = ["left_face", "right_face", "right_upper_leg_front", "right_lower_leg_back", "right_upper_leg_back", "left_lower_leg_front", "left_upper_leg_front", "left_upper_leg_back", "left_lower_leg_back", "right_feet", "right_lower_leg_front", "left_feet", "torso_front", "torso_back", "right_upper_arm_front", "right_upper_arm_back", "right_lower_arm_back", "left_lower_arm_front", "left_upper_arm_front", "left_upper_arm_back", "left_lower_arm_back", "right_hand", "right_lower_arm_front", "left_hand"], t.partIds = p, t.partNames = f, t.poseChain = h,
        t.load = function (t) {
        return void 0 === t && (t = C), N(this, void 0, void 0, function () {
            return R(this, function (e) {
                return "ResNet50" === (t = function (t) {
                    if (null == (t = t || C).architecture && (t.architecture = "MobileNetV1"), G.indexOf(t.architecture) < 0) throw new Error("Invalid architecture " + t.architecture + ". Should be one of " + G);
                    if (null == t.inputResolution && (t.inputResolution = 257), L.indexOf(t.inputResolution) < 0) throw new Error("Invalid inputResolution " + t.inputResolution + ". Should be one of " + L);
                    if (null == t.outputStride && (t.outputStride = 16), U[t.architecture].indexOf(t.outputStride) < 0) throw new Error("Invalid outputStride " + t.outputStride + ". Should be one of " + U[t.architecture] + " for architecutre " + t.architecture + ".");
                    if (null == t.multiplier && (t.multiplier = 1), J[t.architecture].indexOf(t.multiplier) < 0) throw new Error("Invalid multiplier " + t.multiplier + ". Should be one of " + J[t.architecture] + " for architecutre " + t.architecture + ".");
                    if (null == t.quantBytes && (t.quantBytes = 4), Z.indexOf(t.quantBytes) < 0) throw new Error("Invalid quantBytes " + t.quantBytes + ". Should be one of " + Z + " for architecutre " + t.architecture + ".");
                    return t
                }(t)).architecture ? [2, nt(t)] : "MobileNetV1" === t.architecture ? [2, rt(t)] : [2, null]
            })
        })
    },
        t.PoseNet = et, t.VALID_INPUT_RESOLUTION = L, t.getAdjacentKeyPoints = function (t, e) {
        return d.reduce(function (r, n) {
            var i = n[0], o = n[1];
            return function (t, e, r) {
                return t < r || e < r
            }(t[i].score, t[o].score, e) ? r : (r.push([t[i], t[o]]), r)
        }, [])
    },
        t.getBoundingBox = z, t.getBoundingBoxPoints = function (t) {
        var e = z(t), r = e.minX, n = e.minY, i = e.maxX, o = e.maxY;
        return [{x: r, y: n}, {x: i, y: n}, {x: i, y: o}, {x: r, y: o}]
    }, t.scalePose = B, Object.defineProperty(t, "__esModule", {value: !0})
});
