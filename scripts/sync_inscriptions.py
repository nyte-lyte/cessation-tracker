import binascii, struct, sys, json, urllib.request

ENGINE_ID = "b725884c8a6d63c2499c0f86b8e5863115808f8998697ba23abc0194b8c3323ei0"
OUT_PATH = "/Users/jesshillyer/cessation-tracker/src/data/inscriptions.ts"

DATES = [
    "2018-07-16","2018-10-04","2019-01-24","2019-04-24","2019-07-31",
    "2020-02-07","2020-02-28","2020-03-13","2020-05-22","2020-08-11",
    "2020-11-12","2021-02-24","2021-09-01","2021-12-01","2022-02-14",
    "2022-05-13","2022-08-25","2023-06-12","2023-09-05","2023-12-05",
    "2024-02-05","2024-06-10","2024-09-16","2024-12-30","2025-03-26",
    "2025-06-18","2025-09-12","2025-12-11","2026-03-20",
]

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as r:
        return r.read().decode('utf-8')

def decode_cbor(data):
    pos = [0]
    def read_uint(extra):
        if extra < 24: return extra
        elif extra == 24:
            v = data[pos[0]]; pos[0]+=1; return v
        elif extra == 25:
            v = int.from_bytes(data[pos[0]:pos[0]+2],'big'); pos[0]+=2; return v
        elif extra == 26:
            v = int.from_bytes(data[pos[0]:pos[0]+4],'big'); pos[0]+=4; return v
        elif extra == 27:
            v = int.from_bytes(data[pos[0]:pos[0]+8],'big'); pos[0]+=8; return v
    def decode():
        ib = data[pos[0]]; pos[0]+=1
        major = ib >> 5; extra = ib & 0x1f
        if major == 0: return read_uint(extra)
        elif major == 1: return -1 - read_uint(extra)
        elif major == 3:
            n = read_uint(extra)
            s = data[pos[0]:pos[0]+n].decode('utf-8'); pos[0]+=n
            return s
        elif major == 4:
            n = read_uint(extra)
            return [decode() for _ in range(n)]
        elif major == 5:
            n = read_uint(extra)
            return {decode(): decode() for _ in range(n)}
        elif major == 7:
            if extra == 27:
                v = data[pos[0]:pos[0]+8]; pos[0]+=8
                return struct.unpack('>d', v)[0]
            elif extra == 26:
                v = data[pos[0]:pos[0]+4]; pos[0]+=4
                return struct.unpack('>f', v)[0]
            elif extra == 25:
                v = data[pos[0]:pos[0]+2]; pos[0]+=2
                return struct.unpack('>e', v)[0]
        raise Exception(f"unhandled major {major} extra {extra}")
    return decode()

def main():
    children = json.loads(fetch(f"https://ordinals.com/r/children/{ENGINE_ID}"))
    ids = children["ids"]
    if children.get("more"):
        print("WARNING: more pages of children exist — script only handles page 0", file=sys.stderr)

    pieces = {}
    for insc_id in ids:
        info = json.loads(fetch(f"https://ordinals.com/r/inscription/{insc_id}"))
        hexmeta = fetch(f"https://ordinals.com/r/metadata/{insc_id}")
        meta = decode_cbor(bytearray(binascii.unhexlify(hexmeta.strip().strip('"'))))
        idx = meta["pieceIndex"]
        pieces[idx] = {
            "inscriptionId": insc_id,
            "hashTail": meta["hashTail"],
            "inscriptionUnix": meta["inscriptionUnix"],
            "blockHeight": info["height"],
        }

    lines = []
    lines.append("// inscriptions.ts — Per-piece on-chain data, filled in after minting.")
    lines.append("// All values null until the piece is inscribed.")
    lines.append("// Synced from chain via ordinals.com /r/children, /r/inscription, /r/metadata")
    lines.append("// (CBOR-decoded). Re-run sync to pick up newly minted pieces.")
    lines.append("")
    lines.append("export interface PieceInscription {")
    lines.append("  inscriptionId: string;")
    lines.append("  hashTail: number;        // 0–99")
    lines.append("  inscriptionUnix: number; // Unix seconds")
    lines.append("  blockHeight: number;")
    lines.append("}")
    lines.append("")
    lines.append("// Index matches piece index (0–28). null = not yet minted.")
    lines.append("export const PIECE_INSCRIPTIONS: (PieceInscription | null)[] = [")
    for i, date in enumerate(DATES):
        p = pieces.get(i)
        if p:
            lines.append("  {")
            lines.append(f'    inscriptionId: "{p["inscriptionId"]}",')
            lines.append(f'    hashTail: {p["hashTail"]},')
            lines.append(f'    inscriptionUnix: {p["inscriptionUnix"]},')
            lines.append(f'    blockHeight: {p["blockHeight"]},')
            lines.append(f"  }}, // piece {i:02d} — {date}")
        else:
            lines.append(f"  null, // piece {i:02d} — {date}")
    lines.append("];")
    lines.append("")
    lines.append(f'export const ENGINE_INSCRIPTION_ID: string | null =\n  "{ENGINE_ID}";')
    lines.append("")

    new_content = "\n".join(lines)
    try:
        with open(OUT_PATH) as f:
            old_content = f.read()
    except FileNotFoundError:
        old_content = ""

    if new_content == old_content:
        print(f"No changes. {len(pieces)}/{len(DATES)} pieces minted.")
    else:
        with open(OUT_PATH, "w") as f:
            f.write(new_content)
        print(f"Updated {OUT_PATH}. {len(pieces)}/{len(DATES)} pieces minted.")
        print("Minted piece indices:", sorted(pieces.keys()))

if __name__ == "__main__":
    main()
