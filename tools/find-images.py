"""
Tìm ảnh thật, miễn phí bản quyền (CC0) theo chủ đề qua Openverse API — không cần API key.

    python3 tools/find-images.py "mountain climbing" "camping tent" --n 12

In ra danh sách URL ảnh từ StockSnap (CC0) để dán vào bộ dữ liệu JSON.
Thêm --json để lấy cả tác giả, giấy phép, trang gốc (ghi vào CREDITS).
"""
import argparse, json, urllib.parse, urllib.request

API = 'https://api.openverse.org/v1/images/'


def search(query, n=12, source='stocksnap'):
    qs = urllib.parse.urlencode({'q': query, 'source': source, 'page_size': n})
    req = urllib.request.Request(f'{API}?{qs}', headers={'User-Agent': 'wd2026-image-finder'})
    with urllib.request.urlopen(req, timeout=20) as res:
        data = json.load(res)
    return [{
        'url': r['url'],
        'title': r.get('title'),
        'creator': r.get('creator'),
        'license': r.get('license'),
        'landing': r.get('foreign_landing_url'),
        'width': r.get('width'), 'height': r.get('height'),
    } for r in data.get('results', [])]


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('queries', nargs='+')
    ap.add_argument('--n', type=int, default=12)
    ap.add_argument('--source', default='stocksnap')
    ap.add_argument('--json', action='store_true')
    args = ap.parse_args()
    out = {q: search(q, args.n, args.source) for q in args.queries}
    if args.json:
        print(json.dumps(out, ensure_ascii=False, indent=2))
    else:
        for q, items in out.items():
            print(f'# {q}')
            for it in items:
                print(f"{it['url']}  ({it['license']}, {it['width']}x{it['height']}) {it['title']}")
