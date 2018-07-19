#!/usr/bin/env python3
from collections import defaultdict
import matplotlib.pyplot as plt
import csv

resolutions = [100, 50, 40, 30, 20, 15, 10, 7, 5, 3, 2, 1]
keys = set()
data = {}
for resolution in resolutions:
    data[resolution] = defaultdict(lambda: 0)
    with open("results/results_{}ft.csv".format(resolution)) as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            key = "{},{}".format(row[0], row[1])
            value = float(row[2].replace("%", "")) / 100
            data[resolution][key] = value
            keys.add(key)
for key in sorted(keys):
    y = [data[resolution][key] for resolution in resolutions]
    plt.plot(resolutions, y, "o-")
plt.show()
