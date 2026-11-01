#!/usr/bin/env python3
"""
build_au_tech_postcodes.py
Joins the Clean Energy Regulator (CER) small-scale installation postcode files with postcode
centroids (and, optionally, Census 2021 dwelling counts) into ONE tidy file for the Vega hex map:

    postcode, state, lon, lat, bat_kwh, bat_installs, solar_installs, solar_kw,
    swh_installs, hp_installs, dwellings          (a column is only written if its source exists)

INPUT  (the CSVs from the CER page, anywhere under <project>/data ; file names are matched by keyword)
    required : *battery*capacity*.csv            (the file you already use)
    optional : *battery*installations*.csv       battery install COUNTS
               *sgu*solar*installations*2011*    rooftop solar systems (cumulative, 2011-present)
               *sgu*solar*installations*2001*    rooftop solar 2001-2010 (added to the above)
               *sgu*solar*capacity*2011*         solar kW
               *swh*solar*installations*         solar hot water   (2011-present, plus 2001-2010 if present)
               *swh*air*installations*           air-source heat pumps (same)
    optional : --dwellings dwellings.csv         two columns: postcode (or POA code), dwellings

USAGE
    python scripts/build_au_tech_postcodes.py                  # works from any folder; reads <project>/data
    python scripts/build_au_tech_postcodes.py --dwellings data/dwellings.csv
    python build_au_tech_postcodes.py --postcodes path/to/australian_postcodes.csv   # skip the download
"""
import argparse
import re
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent      # project folder (parent of scripts/)

POSTCODES_URL = ("https://raw.githubusercontent.com/matthewproctor/australianpostcodes/"
                 "master/australian_postcodes.csv")

# CER headline totals, as published at 30 Sep 2026 -- used ONLY as a sanity check printout
CER_HEADLINE = {"solar_installs": 4_562_198, "bat_installs": 546_789, "hot_water": 2_007_945}

MONTH_RE = re.compile(r"^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}", re.I)

# name, must-contain keywords, kind ("capacity" or "installs"), add-to (for the 2001-2010 files)
SOURCES = [
    ("bat_kwh",        ["battery", "capacity"],                       "capacity", None),
    ("bat_installs",   ["battery", "installations"],                  "installs", None),
    ("solar_installs", ["sgu", "solar", "installations", "2011"],     "installs", None),
    ("solar_old",      ["sgu", "solar", "installations", "2001"],     "installs", "solar_installs"),
    ("solar_kw",       ["sgu", "solar", "capacity", "2011"],          "capacity", None),
    ("swh_installs",   ["swh", "solar", "installations", "2011"],     "installs", None),
    ("swh_old",        ["swh", "solar", "installations", "2001"],     "installs", "swh_installs"),
    ("hp_installs",    ["swh", "air", "installations", "2011"],       "installs", None),
    ("hp_old",         ["swh", "air", "installations", "2001"],       "installs", "hp_installs"),
]


def resolve(p, what):
    """Accept a path relative to the current folder OR to the project root."""
    path = Path(p)
    for cand in (path, ROOT / path):
        if cand.exists():
            return cand
    sys.exit(f"\n{what} not found: '{p}'\n  (looked in {Path.cwd()} and {ROOT})")


def looks_like_cer(path):
    """CER postcode files start with a 'Small Unit Installation Postcode' column."""
    try:
        with open(path, encoding="utf-8-sig", errors="replace") as fh:
            first = fh.readline().split(",")[0].strip().strip('"').lower()
        return "postcode" in first
    except OSError:
        return False


def find_file(raw_dir, keywords):
    hits = [p for p in Path(raw_dir).rglob("*.csv")
            if all(k in p.name.lower() for k in keywords) and looks_like_cer(p)]
    if not hits:
        return None
    hits.sort(key=lambda p: (0 if "sgu" in p.name.lower() or "swh" in p.name.lower() else 1, len(p.name)))
    if len(hits) > 1:
        print(f"  note: {len(hits)} files match {keywords}; using {hits[0].name}")
    return hits[0]


def to_num(s):
    return pd.to_numeric(s.astype(str).str.replace(",", "", regex=False).str.strip(), errors="coerce")


def read_cer(path, kind):
    """Return a Series (index = integer postcode) with the all-months total for one CER file."""
    df = pd.read_csv(path, dtype=str)
    pc = pd.to_numeric(df.iloc[:, 0].str.strip(), errors="coerce")
    df = df.loc[pc.notna()].copy()
    df.index = pc[pc.notna()].astype(int)

    month_cols = [c for c in df.columns[1:] if MONTH_RE.match(c.strip())]
    if kind == "installs":
        pref = [c for c in month_cols if "install" in c.lower() or "quantity" in c.lower()]
    else:
        pref = [c for c in month_cols if re.search(r"kwh|kw|capacity|usable|rated|output", c, re.I)]
    month_cols = pref or month_cols

    total_cols = [c for c in df.columns[1:] if c.strip().lower().startswith("total")]
    if kind == "installs":
        total_cols = [c for c in total_cols if "kw" not in c.lower()] or total_cols
    else:
        total_cols = [c for c in total_cols if re.search(r"kwh|kw|capacity|usable|rated|output", c, re.I)] or total_cols

    # if there are several 'Total ...' columns (e.g. per-year subtotals), the grand total is the biggest
    best_total = max(total_cols, key=lambda c: to_num(df[c]).fillna(0).sum()) if total_cols else None

    if month_cols:
        value = sum(to_num(df[c]).fillna(0) for c in month_cols)
        how = f"sum of {len(month_cols)} monthly columns"
        if best_total:
            tot = to_num(df[best_total]).fillna(0)
            diff = abs(value.sum() - tot.sum())
            if diff > 0.01 * max(tot.sum(), 1):
                print(f"  ! {path.name}: monthly sum {value.sum():,.0f} differs from '{best_total}' {tot.sum():,.0f}")
    elif best_total:
        value = to_num(df[best_total]).fillna(0)
        how = f"column '{best_total}'"
    else:
        sys.exit(f"\n{path}: could not find monthly or 'Total...' columns.\n  Columns: {list(df.columns)[:12]} ...")
    print(f"  {path.name}: {how}; {len(value):,} postcodes; sum = {value.sum():,.0f}")
    return value.groupby(level=0).sum()


def read_centroids(src):
    df = pd.read_csv(src, low_memory=False)
    cols = {c.lower(): c for c in df.columns}
    for need in ("postcode", "long", "lat"):
        if need not in cols:
            sys.exit(f"postcode file has no '{need}' column. Columns: {list(df.columns)}")
    out = pd.DataFrame({
        "postcode": pd.to_numeric(df[cols["postcode"]], errors="coerce"),
        "lon": pd.to_numeric(df[cols["long"]], errors="coerce"),
        "lat": pd.to_numeric(df[cols["lat"]], errors="coerce"),
    })
    if "state" in cols:
        out["state"] = df[cols["state"]].astype(str).str.strip().str.upper()
    out = out.dropna(subset=["postcode", "lon", "lat"])
    out = out[out.lon.between(112, 155) & out.lat.between(-45, -9)]
    out["postcode"] = out["postcode"].astype(int)
    agg = {"lon": "mean", "lat": "mean"}
    if "state" in out:
        agg["state"] = lambda s: s.mode().iat[0] if len(s.mode()) else None
    return out.groupby("postcode").agg(agg)


def read_dwellings(path):
    df = pd.read_csv(path, dtype=str)
    low = {c.lower().strip(): c for c in df.columns}
    key = next((low[a] for a in ("postcode", "poa", "poa_code", "poa_code_2021", "poa_code21", "poa_code_2016", "code") if a in low), df.columns[0])
    val = next((low[a] for a in ("dwellings", "total_dwellings", "private_dwellings", "tot_private_dwellings", "households") if a in low), None)
    if val is None:
        num = [c for c in df.columns if c != key and to_num(df[c]).notna().mean() > 0.8]
        if not num:
            sys.exit(f"{path}: couldn't find a dwellings column. Columns: {list(df.columns)}")
        val = num[-1]
    pc = pd.to_numeric(df[key].astype(str).str.extract(r"(\d{3,4})")[0], errors="coerce")
    out = pd.DataFrame({"postcode": pc, "dwellings": to_num(df[val])}).dropna()
    out["postcode"] = out["postcode"].astype(int)
    print(f"  dwellings: key='{key}', value='{val}', {len(out):,} postcodes, total {out.dwellings.sum():,.0f}")
    return out.groupby("postcode")["dwellings"].sum()


def build(raw_dir, postcodes_src, dwellings_path):
    raw_dir = resolve(raw_dir, "Raw data folder")
    print(f"Raw data folder: {raw_dir.resolve()}")
    series = {}
    print("Reading CER files:")
    for name, kw, kind, add_to in SOURCES:
        f = find_file(raw_dir, kw)
        if f is None:
            if name == "bat_kwh":
                seen = sorted(p.name for p in Path(raw_dir).rglob("*.csv") if "sgu" in p.name.lower())
                sys.exit(f"\nRequired battery capacity CSV not found under {Path(raw_dir).resolve()}\n"
                         f"  (looking for a .csv whose name contains {kw})\n"
                         f"  CER-style files I did find there: {seen if seen else 'none'}")
            continue
        series[name] = read_cer(f, kind)

    for name, _, _, add_to in SOURCES:
        if add_to and name in series:
            base = series.get(add_to, pd.Series(dtype=float))
            series[add_to] = base.add(series.pop(name), fill_value=0)

    df = pd.concat(series, axis=1).fillna(0)
    df.index.name = "postcode"

    print("Reading postcode centroids …")
    cent = read_centroids(postcodes_src)
    out = df.join(cent, how="left")

    missing = out["lon"].isna()
    for col in ("bat_installs", "bat_kwh", "solar_installs"):
        if col in out:
            lost = out.loc[missing, col].sum() / max(out[col].sum(), 1)
            print(f"  postcodes without coordinates hold {lost:.2%} of {col}")
    out = out.loc[~missing]

    if dwellings_path:
        print("Reading dwellings …")
        out = out.join(read_dwellings(resolve(dwellings_path, "Dwellings file")), how="left")

    out = out.reset_index()
    cols = ["postcode", "state", "lon", "lat", "bat_kwh", "bat_installs", "solar_installs",
            "solar_kw", "swh_installs", "hp_installs", "dwellings"]
    out = out[[c for c in cols if c in out.columns]]
    for c in out.columns:
        if c not in ("postcode", "state"):
            out[c] = out[c].round(4)
    return out, df


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--raw", default=str(ROOT / "data"), help="folder with the CER CSVs (searched recursively)")
    ap.add_argument("--out", default=str(ROOT / "data" / "au_household_tech_by_postcode.csv"))
    ap.add_argument("--postcodes", default=POSTCODES_URL)
    ap.add_argument("--dwellings", default=None)
    a = ap.parse_args()

    out, raw = build(a.raw, a.postcodes, a.dwellings)
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    out.to_csv(a.out, index=False)

    print(f"\nWrote {a.out}: {len(out):,} postcodes, columns = {list(out.columns)}")
    print("\nSanity check against CER's published headline totals (30 Sep 2026; yours will drift as CER updates):")
    chk = {"solar_installs": raw.get("solar_installs"), "bat_installs": raw.get("bat_installs")}
    hw = sum(raw[c].sum() for c in ("swh_installs", "hp_installs") if c in raw)
    if hw:
        chk["hot_water"] = pd.Series([hw])
    for k, s in chk.items():
        if s is not None:
            tot = s.sum()
            print(f"  {k:15s} yours {tot:>12,.0f}   CER {CER_HEADLINE[k]:>12,}   ratio {tot / CER_HEADLINE[k]:.3f}")
    print("  (a ratio far from 1.0 usually means a file is missing, e.g. the 2001-2010 solar file)")


if __name__ == "__main__":
    main()