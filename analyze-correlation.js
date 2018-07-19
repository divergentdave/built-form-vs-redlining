#!/usr/bin/env node
var rbush = require("rbush");
var turf = require("@turf/turf");
var booleanWithin = require("./turf-boolean-within-patched.js");
var pointGridGen = require("./turf-point-grid-generator.js");
var fs = require("fs");
var process = require("process");

function loadGeoJson(path) {
    var contents = fs.readFileSync(path, {"encoding": "utf-8"});
    var json = JSON.parse(contents);
    var features = json.features;
    for (var i = 0; i < features.length; i++) {
        features[i].bbox = turf.bbox(features[i]);
    }
    return json;
}

function makeTree(features) {
    var accessors = [".bbox[0]", ".bbox[1]", ".bbox[2]", ".bbox[3]"];
    var tree = rbush(9, accessors);
    tree.load(features);
    return tree;
}

function lookup(tree, point, propertyCallback) {
    var x = point.geometry.coordinates[0];
    var y = point.geometry.coordinates[1];
    var result = tree.search({minX: x, minY: y, maxX: x, maxY: y});
    var values = [];
    for (var feature of result) {
        if (booleanWithin(point, feature)) {
            values.push(propertyCallback(feature));
        }
    }
    return values;
}

function main() {
    var resolution = parseFloat(process.argv[2]);
    var holc = loadGeoJson("HOLC_Minneapolis.geojson");
    var compPlanDraftBuiltForm = loadGeoJson(
        "mpls-comprehensive-plan-draft-built-form_cleaned.geojson"
    );
    var extents = turf.bbox(holc);
    var points = pointGridGen(extents, resolution, {"units": "feet"});
    var holcTree = makeTree(holc.features);
    var bfTree = makeTree(compPlanDraftBuiltForm.features);
    var counts = {};
    var total = 0;
    for (var point of points) {
        var results1 = lookup(holcTree, point, function (feature) {
            return feature.properties.holc_grade;
        });
        if (results1.length == 0) {
            continue;
        }
        var results2 = lookup(bfTree, point, function (feature) {
            return feature.properties.Prop_BF;  // TODO: compare Prop_BF_1
        });
        if (results1.length > 0 && results2.length > 0) {
            var fraction = 1.0 / results1.length / results2.length;
            for (var val1 of results1) {
                for (var val2 of results2) {
                    var key = val1 + "," + val2;
                    if (key in counts) {
                        counts[key] += fraction;
                    } else {
                        counts[key] = fraction;
                    }
                }
            }
            total++;
        }
    }
    var keys = Object.keys(counts);
    keys.sort();
    for (var key of keys) {
        console.log(key + "," + (100 * counts[key] / total) + "%");
    }
}

main();
