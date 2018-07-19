#!/usr/bin/env python3
import pandas as pd


def percent_converter(val):
    return float(val.replace("%", "")) / 100.0


print("<!DOCTYPE html>")
print("<html>")
print("<body>")
header_names = ["HOLC Grade", "Draft Built Form District", "Area Fraction"]
df = pd.read_csv(
    "results/results_{}ft.csv".format(1),
    header=0,
    names=header_names,
    converters={2: percent_converter}
)
df = df.groupby(["Draft Built Form District", "HOLC Grade"]).sum().unstack()
df = df.fillna(0)
districts = [
    "Interior 1",
    "Interior 2",
    "Interior 3",
    "Corridor 4",
    "Corridor 6",
    "Transit 10",
    "Transit 15",
    "Transit 20",
    "Transit 30",
    "Core 50",
    "Production",
    "Parks",
    "Transportation"
]
df["sort_order"] = pd.Series([districts.index(d) for d in df.index], index=df.index)
df = df.sort_values("sort_order")
df = df.drop("sort_order", axis=1)
table_html = (df.style.background_gradient(cmap="viridis", low=0.5, high=0.5)
    .format("{:,.3%}".format)
    .apply(lambda v: ["color: lightgray" for _ in v])
    .render())
table_html = "\n".join(line for line in table_html.split("\n")
                       if line.strip())
print(table_html)
print("<br/>")

sums_holc = df.sum(axis=0)
sums_bf = df.sum(axis=1)
expected = pd.DataFrame(
    [[sums_holc[grade] * sums_bf[district] for grade in sums_holc.index]
     for district in sums_bf.index],
    index=df.index,
    columns=sums_holc.index
)
excess = df - expected
excess = excess.rename(columns={"Area Fraction": "Excess Area Fraction"})
excess_html = (excess.style.background_gradient(cmap="bwr")
    .format("{:,.3%}".format)
    .render())
excess_html = "\n".join(line for line in excess_html.split("\n")
                        if line.strip())
print(excess_html)

print("</body>")
print("</html>")
