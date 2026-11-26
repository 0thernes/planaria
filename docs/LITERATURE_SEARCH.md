# Literature Search & Prior-Art Attribution Log (`PLANARIA v2.4.0`)

Per independent research hygiene standards (Playbook #15), this log records the prior-art databases, search queries, date of review, closest published work, and explicit attribution/differentiation boundaries for PLANARIA.

- **Search Date:** 2026-11-25 (verified live against Crossref REST API on 2026-11-25; results archived in `results/citation-audit.json`)
- **Author:** Alexander Stephen Donahue (Independent Researcher, 0thernes project, ORCID `0009-0006-8168-9648`)
- **Databases Queried:** Crossref REST API (`api.crossref.org`), IEEE Xplore DOIs, ACM Digital Library DOIs, arXiv (`cs.CR`, `cs.OS`, `cs.PL`, `cs.LO`, `cs.IT`), NIST FIPS / RFC archives, and Lean 4 community verification literature.

---

## 1. Search Queries Executed

| Date | Venue / Index | Query Terms | Purpose |
| :--- | :--- | :--- | :--- |
| 2026-11-25 | Crossref REST API | Direct DOI resolution + retraction check for all 19 DOI-bearing references in `paper/main.tex` | Verify exact bibliographic metadata, author/year/pages, and zero retractions (caught & fixed `forney1965` DOI `10.1109/TIT.1965.1053833` [Massey 1965] → `10.1109/TIT.1965.1053825` [Forney 1965]). |
| 2026-11-25 | arXiv / Google Scholar / IEEE | `"Priority Encoding Transmission" executable OR binary`, `"unequal error protection" bytecode OR VM`, `"Cauchy" "Reed-Solomon" self-healing executable` | Confirm differentiation vs. Albanese et al. (1996) PET, Bloemer et al. (1995) Cauchy MDS, and Plank (1997) RAID storage tutorials. |
| 2026-11-25 | ACM DL / IEEE / USENIX | `"graceful degradation" virtual machine bytecode`, `"Byzantine" erasure coding Merkle poisoning`, `self-synchronizing framing binary format` | Check prior art in erasure-coded storage (Rabin 1989 IDA, Cachin & Tessaro 2005 AVID, Hendricks et al. 2007) and fault-tolerant VMs. |
| 2026-11-25 | Lean 4 / Formal Methods | `Lean 4 "GF(2^8)" OR "Reed-Solomon" OR "Cauchy"`, `Lean 4 comparator multi-kernel "lean4lean" "nanoda"` | Verify alignment with Lean 4.35.0 module system and multi-kernel verification methodology (Carneiro 2024 `lean4lean`, Palomar comparator workflow). |

---

## 2. Prior-Art Differentiation Matrix

| Prior Work | Citation | What Prior Work Established | How PLANARIA Builds On & Differs From It |
| :--- | :--- | :--- | :--- |
| **Reed–Solomon & Algebraic Decoding** | Reed & Solomon (1960); Chien (1964); Forney (1965, DOI `10.1109/TIT.1965.1053825`); Berlekamp (1968); Massey (1969) | Optimal MDS block codes and polynomial-time $O(t^2)$ bounded-distance algebraic decoding. | PLANARIA uses textbook 2-way interleaved `RS(254,238)` as its *inner* 508 B cellular armor; no novelty is claimed in RS algebra. |
| **Cauchy MDS & Information Dispersal** | Rabin (1989); Bloemer et al. (1995); Plank (1997) | Cauchy matrices over $\mathrm{GF}(2^w)$ guarantee MDS submatrix invertibility for erasure storage & dispersal. | PLANARIA applies stratified Cauchy MDS *directly to compiled VM instruction bundles* coupled to an exact-integer balanced half-cut schedule (`PLACEMENT_SCHEDULE`) for zero-overlap 50/50 executable mitosis. |
| **Priority Encoding Transmission (PET)** | Albanese et al. (1996, IEEE Trans. Inf. Theory) | Unequal Error Protection (UEP) assigning lower thresholds $k$ to higher-priority packet segments (e.g., MPEG I-frames). | PLANARIA adapts PET's UEP principle from passive multimedia streams to *live Turing-complete bytecode execution* paired with runtime `PVM-32` control-flow anastomosis (`ORGAN_CALL` descending fallback). |
| **Verifiable Dispersal & Merkle Trees** | Merkle (1987); Cachin & Tessaro (2005); Hendricks et al. (2007); FIPS 180-4 (2015) | Cryptographic authentication preventing Byzantine shards from corrupting linear erasure reconstruction. | PLANARIA embeds a 128 B Depth-8 domain-separated (`0x00`/`0x01`/`0x02`) SHA-256-128 proof *inside every self-synchronizing 512 B executable frame*, isolating forged cells before Cauchy decoding and enabling ABI-checked cross-species xenografts. |
| **Self-Synchronizing Framing** | Barker (1953); ITU-T / CCSDS telemetry framing | Low-autocorrelation sync markers for frame recovery in unaligned noisy bitstreams. | PLANARIA combines a 4 B `PLN\xB7` fuzzy sync correlator ($\le 3$ bit flips), a sliding-window fuzzy dense-flood DoS guard, and a ±512 B cadence flywheel inside a standalone executable file format. |
| **Quantum Nonlocality & Simulation** | Bell (1964); Clauser et al. (1969); Mermin (1990); Horodecki et al. (1995) | CHSH $2\sqrt{2}$ Tsirelson bound, $3\times 3$ Horodecki criterion, and 4-qubit GHZ Mermin witness $|M_4| = 4.0$. | Implemented strictly as a textbook exact classical 4-qubit simulator powering the interactive Studio & Lean unitarity proofs; zero new physics claimed. |

---

## 3. Live Crossref Retraction Audit

Every DOI-bearing reference in `paper/main.tex` and `paper/WHITE_PAPER.md` is verified live via `npm run check:citations -- --live`, emitting `results/citation-audit.json` with HTTP 200 status and `retracted: false` for all entries.
