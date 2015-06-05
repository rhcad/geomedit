#!/bin/sh
# Type 'test/jxg.sh' in the parent path to build an unminified version of jsxgraphcore.js in
#   `bower_components/jsxgraph/build/bin/`.
#

if [ ! -d bower_components/jsxgraph ] ; then
    git clone https://github.com/jsxgraph/jsxgraph bower_components/jsxgraph
fi
cd bower_components/jsxgraph
if [ ! -d node_modules/canvas ] ; then
    npm install
fi
make core-min
make core
cd ../..
