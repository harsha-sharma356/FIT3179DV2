#!/usr/bin/env python3
"""
build_dataset.py
Builds ONE tidy file (tech_countries.csv, one row per country-year) for the Vega map.

Pulled automatically from the World Bank API (needs internet when you run it):
    IT.CEL.SETS.P2   mobile subscriptions per 100 people
    IT.NET.USER.ZS   individuals using the internet (% of population)
    SP.POP.TOTL      population
    /country         region + capital-city lon/lat (used to place the bubbles)

Optional files you download yourself and drop in ./manual/  (all optional):
    fiveg_pct.csv              5G population coverage (%)           <- ITU DataHub
    ewaste_kt.csv              e-waste generated, kilotonnes        <- Global E-waste Monitor
    ewaste_kg_pc.csv           e-waste generated, kg per capita     <- Global E-waste Monitor
    smartphone_imports_usd.csv smartphone imports, US dollars       <- UN Comtrade (HS 851713)

Each manual file just needs: a country ISO3 column, a year column, a value column.
Header names are matched flexibly (see ALIASES below). If a file is missing, that column is
left empty and the map simply shows no bubbles for that metric.

Usage:
    python build_dataset.py
    python build_dataset.py --manual-dir manual --out data/tech_countries.csv --start 2015 --end 2025
    python build_dataset.py --ffill 3     # carry sparse manual metrics (e.g. e-waste) forward up to 3 years
"""
import argparse
import json
import sys
import time
import urllib.request
from itertools import product
from pathlib import Path

import pandas as pd

WB = "https://api.worldbank.org/v2"
WB_INDICATORS = {
    "IT.CEL.SETS.P2": "mobile_per100",
    "IT.NET.USER.ZS": "internet_pct",
    "SP.POP.TOTL": "population",
}
MANUAL_FILES = {
    "fiveg_pct": "fiveg_pct.csv",
    "ewaste_kt": "ewaste_kt.csv",
    "ewaste_kg_pc": "ewaste_kg_pc.csv",
    "smartphone_imports_usd": "smartphone_imports_usd.csv",
}
ALIASES = {
    "iso3": ["iso3", "code", "countrycode", "country_code", "iso", "iso_code", "iso3code",
             "economy", "ref_area", "entity_code", "reporteriso", "reporter_iso", "alpha3"],
    "year": ["year", "time", "time_period", "period", "date", "refyear", "ref_year"],
    "value": ["value", "obs_value", "val", "primaryvalue", "primary_value", "tradevalue"],
}
# Our fixed region buckets (World Bank renames regions now and then, so match by keyword)
REGION_RULES = [
    ("east asia", "East Asia & Pacific"),
    ("europe", "Europe & Central Asia"),
    ("latin america", "Latin America & Caribbean"),
    ("middle east", "Middle East & North Africa"),
    ("north america", "North America"),
    ("south asia", "South Asia"),
    ("sub-saharan", "Sub-Saharan Africa"),
]
OUT_COLUMNS = [
    "iso3", "country", "region", "lon", "lat", "year",
    "population_millions", "mobile_per100", "mobile_millions",
    "internet_pct", "internet_millions",
    "fiveg_pct", "ewaste_kt", "ewaste_kg_pc", "smartphone_imports_usd_m",
]


# --------------------------------------------------------------------------- World Bank
def wb_get(url, retries=3):
    last = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "tech-map-builder/1.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(1.5 * (i + 1))
    raise RuntimeError(f"Could not fetch {url}\n  -> {last}")


def wb_rows(url):
    rows, page = [], 1
    while True:
        sep = "&" if "?" in url else "?"
        data = wb_get(f"{url}{sep}page={page}")
        if not isinstance(data, list) or len(data) < 2 or data[1] is None:
            raise RuntimeError(f"Unexpected World Bank response for {url}: {str(data)[:300]}")
        meta, chunk = data[0], data[1]
        rows += chunk
        if page >= int(meta.get("pages", 1)):
            break
        page += 1
    return rows


def normalise_region(name):
    low = name.lower()
    for key, label in REGION_RULES:
        if key in low:
            return label
    print(f"  ! unrecognised World Bank region '{name}' kept as-is "
          f"(add it to REGIONS in the Vega spec or REGION_RULES here)")
    return name


def fetch_countries():
    out = []
    for r in wb_rows(f"{WB}/country?format=json&per_page=400"):
        region = ((r.get("region") or {}).get("value") or "").strip()
        if not region or region.lower() == "aggregates":
            continue  # skip "World", "High income", etc.
        try:
            lon, lat = float(r["longitude"]), float(r["latitude"])
        except (KeyError, TypeError, ValueError):
            continue  # territories without a capital coordinate
        out.append({"iso3": r["id"], "country": r["name"],
                    "region": normalise_region(region), "lon": lon, "lat": lat})
    return pd.DataFrame(out)


def fetch_indicator(code, name, start, end):
    rows = wb_rows(f"{WB}/country/all/indicator/{code}?format=json&per_page=20000&date={start}:{end}")
    recs = [{"iso3": r["countryiso3code"], "year": int(r["date"]), name: r["value"]}
            for r in rows if r.get("countryiso3code")]
    df = pd.DataFrame(recs, columns=["iso3", "year", name])
    return df.groupby(["iso3", "year"], as_index=False)[name].mean()


# --------------------------------------------------------------------------- manual files
def _find(cols_lower, wanted):
    for a in ALIASES[wanted]:
        if a in cols_lower:
            return cols_lower[a]
    return None


def load_manual(path):
    df = pd.read_csv(path)
    cols = {c.lower().strip(): c for c in df.columns}
    iso, yr, val = _find(cols, "iso3"), _find(cols, "year"), _find(cols, "value")
    if val is None and iso and yr:  # e.g. Our World in Data style: Entity, Code, Year, <indicator>
        rest = [c for c in df.columns if c not in (iso, yr)]
        numeric = [c for c in rest if pd.api.types.is_numeric_dtype(df[c])]
        val = numeric[-1] if numeric else None
    if not (iso and yr and val):
        raise SystemExit(
            f"\n{path}: could not find ISO3 / year / value columns.\n"
            f"  Columns in file: {list(df.columns)}\n"
            f"  Rename them to iso3, year, value (or one of {ALIASES}) and re-run.")
    out = pd.DataFrame({
        "iso3": df[iso].astype(str).str.strip().str.upper(),
        "year": pd.to_numeric(df[yr], errors="coerce"),
        "value": pd.to_numeric(df[val], errors="coerce"),
    }).dropna(subset=["year", "value"])
    out["year"] = out["year"].astype(int)
    return out.groupby(["iso3", "year"], as_index=False)["value"].mean()


# --------------------------------------------------------------------------- main build
def build(manual_dir, start, end, ffill=0):
    print("Fetching country list …")
    countries = fetch_countries()
    print(f"  {len(countries)} countries with a region and a capital coordinate")

    years = list(range(start, end + 1))
    grid = pd.DataFrame(list(product(countries["iso3"], years)), columns=["iso3", "year"])
    df = grid.merge(countries, on="iso3", how="left")

    for code, name in WB_INDICATORS.items():
        print(f"Fetching World Bank {code} → {name} …")
        df = df.merge(fetch_indicator(code, name, start, end), on=["iso3", "year"], how="left")

    manual_dir = Path(manual_dir)
    for col, fname in MANUAL_FILES.items():
        path = manual_dir / fname
        if path.exists():
            m = load_manual(path).rename(columns={"value": col})
            matched = m[m["iso3"].isin(countries["iso3"])]
            print(f"Loaded {path} → {col}: {len(matched)} usable country-year rows "
                  f"({matched['year'].min() if len(matched) else '-'}–{matched['year'].max() if len(matched) else '-'})")
            df = df.merge(matched, on=["iso3", "year"], how="left")
        else:
            print(f"(no {path}; '{col}' will be empty)")
            df[col] = float("nan")

    df = df.sort_values(["iso3", "year"])
    if ffill > 0:
        for col in ["fiveg_pct", "ewaste_kt", "ewaste_kg_pc", "smartphone_imports_usd"]:
            df[col] = df.groupby("iso3")[col].ffill(limit=ffill)

    pop = df["population"]
    df["population_millions"] = pop / 1e6
    df["mobile_millions"] = df["mobile_per100"] / 100 * pop / 1e6
    df["internet_millions"] = df["internet_pct"] / 100 * pop / 1e6
    # fill whichever e-waste unit is missing from the other one
    kt_missing = df["ewaste_kt"].isna() & df["ewaste_kg_pc"].notna()
    df.loc[kt_missing, "ewaste_kt"] = df["ewaste_kg_pc"] * pop / 1e6
    kg_missing = df["ewaste_kg_pc"].isna() & df["ewaste_kt"].notna()
    df.loc[kg_missing, "ewaste_kg_pc"] = df["ewaste_kt"] * 1e6 / pop
    df["smartphone_imports_usd_m"] = df["smartphone_imports_usd"] / 1e6

    out = df[OUT_COLUMNS].copy()
    for c in OUT_COLUMNS[6:]:
        out[c] = out[c].round(3)
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--manual-dir", default="manual")
    ap.add_argument("--out", default="data/tech_countries.csv")
    ap.add_argument("--start", type=int, default=2015)
    ap.add_argument("--end", type=int, default=2025)
    ap.add_argument("--ffill", type=int, default=0,
                    help="carry sparse manual metrics forward up to N years (0 = never)")
    a = ap.parse_args()

    out = build(a.manual_dir, a.start, a.end, a.ffill)
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    out.to_csv(a.out, index=False)

    print(f"\nWrote {a.out}: {len(out)} rows, {out['iso3'].nunique()} countries")
    print("Non-empty values per metric:")
    for c in OUT_COLUMNS[6:]:
        n = out[c].notna().sum()
        yrs = out.loc[out[c].notna(), "year"]
        span = f"{yrs.min()}–{yrs.max()}" if n else "—"
        print(f"  {c:26s} {n:5d}  {span}")
    print("Rows per region:")
    print(out.drop_duplicates("iso3")["region"].value_counts().to_string())


if __name__ == "__main__":
    sys.exit(main())
