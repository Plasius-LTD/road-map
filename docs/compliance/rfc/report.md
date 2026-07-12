# Plasius RFC Compliance Audit

Generated from authoritative default branches pinned on 2026-07-12. Local changes are recorded separately and are not treated as authoritative evidence.

## Coverage

- Primary repositories: 93
- Published RFCs locked: 47
- Explicitly adopted drafts: 1
- Applicable classifications: 497
- States: nonconformant 8, not_applicable 59, partial 7, unverified 423

## Verified gaps

| Severity | Finding | RFC section | Repositories | State | Remediation |
| --- | --- | --- | --- | --- | --- |
| critical | RFC-9068-ACCESS-TOKEN-TYP: JWT access tokens are emitted with typ JWT and verifiers do not require at+jwt. | RFC9068 §2.1, 4 | oauth2-core, oauth2-issuer, plasius-ltd-site | nonconformant | Per-repository Tasks required: emit and verify at+jwt while retaining a controlled migration path. References: Plasius-LTD/oauth2-core#2, Plasius-LTD/oauth2-core#3, Plasius-LTD/oauth2-issuer#2, Plasius-LTD/oauth2-issuer#3, Plasius-LTD/plasius-ltd-site#1480, Plasius-LTD/plasius-ltd-site#1481 |
| high | RFC-9449-DPOP-VALIDATION: The optional DPoP path checks proof presence and cnf.jkt only; it does not validate the proof signature, claims, key binding, ath, or replay. | RFC9449 §4, 5, 7, 8, 9 | oauth2-issuer | nonconformant | Disable the incomplete advertised mode or implement the complete RFC 9449 verification pipeline. References: Plasius-LTD/oauth2-issuer#2, Plasius-LTD/oauth2-issuer#3 |
| high | RFC-6749-CONFIDENTIAL-CLIENT-AUTH: Metadata advertises client_secret_basic/client_secret_post and registration stores secrets, but token exchange does not authenticate them. | RFC6749 §2.3.1, 3.2.1 | oauth2-issuer | nonconformant | Add constant-time confidential-client authentication or restrict advertised methods to none. References: Plasius-LTD/oauth2-issuer#2, Plasius-LTD/oauth2-issuer#3 |
| high | RFC-6797-PRODUCTION-HSTS: Source middleware emits Strict-Transport-Security, but read-only production probes did not observe it on public HTTPS or OAuth metadata responses. | RFC6797 §7.1 | api, plasius-ltd-site | partial | Trace the CDN/edge header path and restore the accepted HSTS policy through the approved deployment workflow. References: Plasius-LTD/api#29, Plasius-LTD/plasius-ltd-site#1480, Plasius-LTD/plasius-ltd-site#1481 |
| high | RFC-9111-OFFLINE-NO-STORE: Offline cache implementations store successful responses without excluding no-store requests or responses. | RFC9111 §5.2.1.5, 5.2.2.5 | offline-cache, plasius-ltd-site | nonconformant | Refuse storage and reuse for no-store and add cache-directive contract tests. References: Plasius-LTD/offline-cache#4, Plasius-LTD/offline-cache#5, Plasius-LTD/plasius-ltd-site#1480, Plasius-LTD/plasius-ltd-site#1481 |
| medium | RFC-5646-LANGUAGE-TAG-SUBSET: The BCP 47 validator implements a narrow, case-sensitive subset while documentation implies general BCP 47 validity. | RFC5646 §2.1, 2.2.9 | schema, translations | partial | Implement or clearly expose a standards-accurate validator in schema before updating consumers. References: Plasius-LTD/schema#25, Plasius-LTD/schema#26, Plasius-LTD/translations#28 |
| medium | RFC-4648-RETURN-TO-ENCODING: Login return paths use btoa directly and raw Base64 query data, failing Unicode paths and URL-safe transport assumptions. | RFC4648 §4, 5 | auth | nonconformant | Encode UTF-8 bytes and use a documented base64url or percent-encoded representation. References: Plasius-LTD/auth#21, Plasius-LTD/auth#22 |
| medium | RFC-9110-RETRY-AFTER-PARSING: Retry-After parsing accepts non-integer delay values; one implementation also lacks a maximum wait bound. | RFC9110 §10.2.3 | analytics, auth | partial | Require the delay-seconds grammar, retain HTTP-date support, and enforce an operational cap. References: Plasius-LTD/auth#21, Plasius-LTD/auth#22, Plasius-LTD/analytics#31, Plasius-LTD/analytics#32 |
| low | RFC-9562-UUID-COMPATIBILITY-REFERENCE: The public validator and documentation cite obsolete RFC 4122 and implement only the legacy UUID version subset. | RFC9562 §all (obsoletes RFC 4122) | schema | partial | Preserve compatibility aliases while documenting the RFC 9562 successor and supported subset. References: Plasius-LTD/schema#25, Plasius-LTD/schema#26 |

## Repository applicability matrix

| Repository | Pinned commit | Roles | Applicable standards | Confirmed gaps | Local state |
| --- | --- | --- | --- | --- | --- |
| ai | `574419e06e8d` | none | Delegated platform boundary only | None verified | matches authoritative main |
| ai-config | `9b5bab333505` | none | Delegated platform boundary only | None verified | matches authoritative main |
| ai-evals | `d680be0eaef4` | none | Delegated platform boundary only | None verified | matches authoritative main |
| ai-game | `79a9b2ca5509` | none | Delegated platform boundary only | None verified | 6 checkout(s) differ from authoritative main |
| ai-governance | `0c564fb6164a` | none | Delegated platform boundary only | None verified | matches authoritative main |
| ai-mcp | `feffc071c8a4` | none | Delegated platform boundary only | None verified | matches authoritative main |
| ai-moderation | `622b19f112cd` | none | Delegated platform boundary only | None verified | matches authoritative main |
| ai-providers | `d9c063df9632` | none | Delegated platform boundary only | None verified | matches authoritative main |
| ai-rag | `9aa6ddf7ab4c` | none | Delegated platform boundary only | None verified | matches authoritative main |
| ai-router | `9d59a96eddbf` | none | Delegated platform boundary only | None verified | matches authoritative main |
| ai-speech | `e71c1b53b97d` | none | Delegated platform boundary only | None verified | matches authoritative main |
| analytics | `089de1082cc5` | http | RFC3986 (unverified), RFC6585 (unverified), RFC7239 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC9110 (partial), RFC9111 (unverified), RFC9112 (unverified), RFC9457 (unverified) | RFC-9110-RETRY-AFTER-PARSING | 1 checkout(s) differ from authoritative main |
| api | `fb1388619d04` | http, mime, oauth, structured-data, web-security | draft-ietf-oauth-v2-1-15 (unverified), RFC2045 (unverified), RFC2046 (unverified), RFC3339 (unverified), RFC3629 (unverified), RFC3986 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (unverified), RFC6265 (unverified), RFC6266 (unverified), RFC6585 (unverified), RFC6749 (unverified), RFC6750 (unverified), RFC6797 (partial), RFC7009 (unverified), RFC7239 (unverified), RFC7515 (unverified), RFC7517 (unverified), RFC7518 (unverified), RFC7519 (unverified), RFC7578 (unverified), RFC7591 (unverified), RFC7636 (unverified), RFC8187 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC8414 (unverified), RFC8707 (unverified), RFC8725 (unverified), RFC9068 (unverified), RFC9110 (unverified), RFC9111 (unverified), RFC9112 (unverified), RFC9205 (unverified), RFC9449 (unverified), RFC9457 (unverified), RFC9562 (unverified), RFC9700 (unverified), RFC9728 (unverified) | RFC-6797-PRODUCTION-HSTS | matches authoritative main |
| asset-contracts | `d33012599aad` | mime, structured-data | RFC2045 (unverified), RFC2046 (unverified), RFC3339 (unverified), RFC3629 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified), RFC8259 (unverified), RFC9562 (unverified) | None verified | matches authoritative main |
| asset-mcp | `f4f3f052e718` | mime | RFC2045 (unverified), RFC2046 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified) | None verified | matches authoritative main |
| asset-pipeline | `38a13ddcef53` | mime | RFC2045 (unverified), RFC2046 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified) | None verified | matches authoritative main |
| asset-processing | `d41b37292ac1` | mime | RFC2045 (unverified), RFC2046 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified) | None verified | matches authoritative main |
| asset-review | `2838333068d0` | mime | RFC2045 (unverified), RFC2046 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified) | None verified | matches authoritative main |
| auth | `6e678edfa5ce` | http, oauth, structured-data, web-security | draft-ietf-oauth-v2-1-15 (unverified), RFC3339 (unverified), RFC3629 (unverified), RFC3986 (unverified), RFC4647 (unverified), RFC4648 (nonconformant), RFC5646 (unverified), RFC6265 (unverified), RFC6585 (unverified), RFC6749 (unverified), RFC6750 (unverified), RFC6797 (unverified), RFC7009 (unverified), RFC7239 (unverified), RFC7515 (unverified), RFC7517 (unverified), RFC7518 (unverified), RFC7519 (unverified), RFC7591 (unverified), RFC7636 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC8414 (unverified), RFC8707 (unverified), RFC8725 (unverified), RFC9068 (unverified), RFC9110 (partial), RFC9111 (unverified), RFC9112 (unverified), RFC9205 (unverified), RFC9449 (unverified), RFC9457 (unverified), RFC9562 (unverified), RFC9700 (unverified), RFC9728 (unverified) | RFC-4648-RETURN-TO-ENCODING, RFC-9110-RETRY-AFTER-PARSING | matches authoritative main |
| chatbot | `77bb2a25adf7` | none | Delegated platform boundary only | None verified | matches authoritative main |
| dungeon-crafting | `30daa604cace` | none | Delegated platform boundary only | None verified | matches authoritative main |
| entity-manager | `e9fcd9f71222` | none | Delegated platform boundary only | None verified | matches authoritative main |
| environment | `66b7da6de7e6` | none | Delegated platform boundary only | None verified | matches authoritative main |
| error | `12582cac9274` | none | Delegated platform boundary only | None verified | matches authoritative main |
| game-audio | `50e7834051ed` | mime | RFC2045 (unverified), RFC2046 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified) | None verified | matches authoritative main |
| game-audio-react | `6149304f5a27` | mime | RFC2045 (unverified), RFC2046 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified) | None verified | matches authoritative main |
| game-audio-spatial | `d9b4aa118125` | mime | RFC2045 (unverified), RFC2046 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified) | None verified | matches authoritative main |
| game-audio-web | `da53f52331c8` | mime | RFC2045 (unverified), RFC2046 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified) | None verified | matches authoritative main |
| gpu-camera | `1a569c434902` | none | Delegated platform boundary only | None verified | 1 checkout(s) differ from authoritative main |
| gpu-camera-controls | `5c786fcb5963` | none | Delegated platform boundary only | None verified | 1 checkout(s) differ from authoritative main |
| gpu-cloth | `3ea15890c4c7` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-debug | `7648461372c9` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-demo-viewer | `42f5c8eaa341` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-fluid | `4bf1bb964a97` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-interaction | `385335482c7d` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-lighting | `1436ec1de66b` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-lock-free-queue | `a484b95a5cec` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-model-core | `3272f3f75811` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-model-fbx | `89e590c5a2cd` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-model-gltf | `d44bc3662e7d` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-model-ifc | `c5148c83758a` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-model-iges | `20c3f72ea051` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-model-obj | `c95f1a0041aa` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-model-renderer | `15b59c2eac81` | mime | RFC2045 (unverified), RFC2046 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified) | None verified | matches authoritative main |
| gpu-model-runtime | `8ed8efac7c60` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-model-step | `29854f65689c` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-particles | `80c25397b70e` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-performance | `1cfe92e86369` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-physics | `949419a1f78b` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-renderer | `b57418aa2f9a` | mime | RFC2045 (unverified), RFC2046 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified) | None verified | matches authoritative main |
| gpu-shared | `dac9f158cedf` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-worker | `833d9a069cfa` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-world-generator | `e5e2c2fc26c2` | none | Delegated platform boundary only | None verified | matches authoritative main |
| gpu-xr | `bb5b1e541777` | none | Delegated platform boundary only | None verified | 1 checkout(s) differ from authoritative main |
| graph-cache-redis | `369ec6814e6c` | http, structured-data | RFC3339 (unverified), RFC3629 (unverified), RFC3986 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (unverified), RFC6585 (unverified), RFC7239 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC9110 (unverified), RFC9111 (unverified), RFC9112 (unverified), RFC9457 (unverified), RFC9562 (unverified) | None verified | matches authoritative main |
| graph-client-core | `807f95ea7654` | http, structured-data | RFC3339 (unverified), RFC3629 (unverified), RFC3986 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (unverified), RFC6585 (unverified), RFC7239 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC9110 (unverified), RFC9111 (unverified), RFC9112 (unverified), RFC9457 (unverified), RFC9562 (unverified) | None verified | matches authoritative main |
| graph-client-react | `3eec73104f95` | http, structured-data | RFC3339 (unverified), RFC3629 (unverified), RFC3986 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (unverified), RFC6585 (unverified), RFC7239 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC9110 (unverified), RFC9111 (unverified), RFC9112 (unverified), RFC9457 (unverified), RFC9562 (unverified) | None verified | matches authoritative main |
| graph-contracts | `eb60d904ce05` | http, structured-data | RFC3339 (unverified), RFC3629 (unverified), RFC3986 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (unverified), RFC6585 (unverified), RFC7239 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC9110 (unverified), RFC9111 (unverified), RFC9112 (unverified), RFC9457 (unverified), RFC9562 (unverified) | None verified | matches authoritative main |
| graph-events | `ef497813e412` | http, structured-data | RFC3339 (unverified), RFC3629 (unverified), RFC3986 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (unverified), RFC6585 (unverified), RFC7239 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC9110 (unverified), RFC9111 (unverified), RFC9112 (unverified), RFC9457 (unverified), RFC9562 (unverified) | None verified | matches authoritative main |
| graph-gateway-core | `1487ac6f9a87` | http, structured-data | RFC3339 (unverified), RFC3629 (unverified), RFC3986 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (unverified), RFC6585 (unverified), RFC7239 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC9110 (unverified), RFC9111 (unverified), RFC9112 (unverified), RFC9457 (unverified), RFC9562 (unverified) | None verified | matches authoritative main |
| graph-runtime-azure-functions | `e1866d7959ee` | http, structured-data | RFC3339 (unverified), RFC3629 (unverified), RFC3986 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (unverified), RFC6585 (unverified), RFC7239 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC9110 (unverified), RFC9111 (unverified), RFC9112 (unverified), RFC9457 (unverified), RFC9562 (unverified) | None verified | matches authoritative main |
| graph-write-coordinator | `febb4eec330c` | http, structured-data | RFC3339 (unverified), RFC3629 (unverified), RFC3986 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (unverified), RFC6585 (unverified), RFC7239 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC9110 (unverified), RFC9111 (unverified), RFC9112 (unverified), RFC9457 (unverified), RFC9562 (unverified) | None verified | matches authoritative main |
| hexagons | `19b15802842b` | none | Delegated platform boundary only | None verified | matches authoritative main |
| images | `8cfbbacc0b9c` | mime | RFC2045 (unverified), RFC2046 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified) | None verified | matches authoritative main |
| item-crafting | `f0b042267a24` | none | Delegated platform boundary only | None verified | matches authoritative main |
| mcp-admin-contracts | `bddc22b3bdfb` | structured-data | RFC3339 (unverified), RFC3629 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (unverified), RFC8259 (unverified), RFC9562 (unverified) | None verified | matches authoritative main |
| nfr | `a1661dfb2561` | none | Delegated platform boundary only | None verified | matches authoritative main |
| oauth2-core | `1ce4a8f03864` | http, oauth, structured-data, web-security | draft-ietf-oauth-v2-1-15 (unverified), RFC3339 (unverified), RFC3629 (unverified), RFC3986 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (unverified), RFC6265 (unverified), RFC6585 (unverified), RFC6749 (unverified), RFC6750 (unverified), RFC6797 (unverified), RFC7009 (unverified), RFC7239 (unverified), RFC7515 (unverified), RFC7517 (unverified), RFC7518 (unverified), RFC7519 (unverified), RFC7591 (unverified), RFC7636 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC8414 (unverified), RFC8707 (unverified), RFC8725 (unverified), RFC9068 (nonconformant), RFC9110 (unverified), RFC9111 (unverified), RFC9112 (unverified), RFC9205 (unverified), RFC9449 (unverified), RFC9457 (unverified), RFC9562 (unverified), RFC9700 (unverified), RFC9728 (unverified) | RFC-9068-ACCESS-TOKEN-TYP | matches authoritative main |
| oauth2-issuer | `da09a194893d` | http, oauth, structured-data, web-security | draft-ietf-oauth-v2-1-15 (unverified), RFC3339 (unverified), RFC3629 (unverified), RFC3986 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (unverified), RFC6265 (unverified), RFC6585 (unverified), RFC6749 (nonconformant), RFC6750 (unverified), RFC6797 (unverified), RFC7009 (unverified), RFC7239 (unverified), RFC7515 (unverified), RFC7517 (unverified), RFC7518 (unverified), RFC7519 (unverified), RFC7591 (unverified), RFC7636 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC8414 (unverified), RFC8707 (unverified), RFC8725 (unverified), RFC9068 (nonconformant), RFC9110 (unverified), RFC9111 (unverified), RFC9112 (unverified), RFC9205 (unverified), RFC9449 (nonconformant), RFC9457 (unverified), RFC9562 (unverified), RFC9700 (unverified), RFC9728 (unverified) | RFC-6749-CONFIDENTIAL-CLIENT-AUTH, RFC-9068-ACCESS-TOKEN-TYP, RFC-9449-DPOP-VALIDATION | matches authoritative main |
| offline-cache | `826c26dbbc9a` | http | RFC3986 (unverified), RFC6585 (unverified), RFC7239 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC9110 (unverified), RFC9111 (nonconformant), RFC9112 (unverified), RFC9457 (unverified) | RFC-9111-OFFLINE-NO-STORE | not checked out |
| plasius-ltd-site | `bdbc9efc5868` | http, oauth, site-publication, web-security | draft-ietf-oauth-v2-1-15 (unverified), RFC3986 (unverified), RFC6265 (unverified), RFC6585 (unverified), RFC6749 (unverified), RFC6750 (unverified), RFC6797 (partial), RFC7009 (unverified), RFC7239 (unverified), RFC7515 (unverified), RFC7517 (unverified), RFC7518 (unverified), RFC7519 (unverified), RFC7591 (unverified), RFC7636 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC8414 (unverified), RFC8615 (unverified), RFC8707 (unverified), RFC8725 (unverified), RFC9068 (nonconformant), RFC9110 (unverified), RFC9111 (nonconformant), RFC9112 (unverified), RFC9116 (unverified), RFC9205 (unverified), RFC9309 (unverified), RFC9449 (unverified), RFC9457 (unverified), RFC9700 (unverified), RFC9728 (unverified) | RFC-6797-PRODUCTION-HSTS, RFC-9068-ACCESS-TOKEN-TYP, RFC-9111-OFFLINE-NO-STORE | 7 checkout(s) differ from authoritative main |
| player-system | `1d31b93a91e3` | none | Delegated platform boundary only | None verified | matches authoritative main |
| player-system-demo-viewer | `be64ce2dda19` | none | Delegated platform boundary only | None verified | matches authoritative main |
| player-system-interface | `f0f6c988b647` | none | Delegated platform boundary only | None verified | matches authoritative main |
| profile | `0617be22cbe9` | none | Delegated platform boundary only | None verified | matches authoritative main |
| react-query | `d0b848a11a7a` | none | Delegated platform boundary only | None verified | matches authoritative main |
| react-state | `43d061cfffe4` | none | Delegated platform boundary only | None verified | matches authoritative main |
| renderer | `8367bd21fb09` | mime | RFC2045 (unverified), RFC2046 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified) | None verified | not checked out |
| road-map | `0685bdd2738e` | none | Delegated platform boundary only | None verified | 1 checkout(s) differ from authoritative main |
| scene-animation | `fea9f5f68baf` | none | Delegated platform boundary only | None verified | matches authoritative main |
| scene-layout | `9b8242db393c` | none | Delegated platform boundary only | None verified | matches authoritative main |
| scene-object | `7c83492d0fb4` | none | Delegated platform boundary only | None verified | matches authoritative main |
| scene-runtime | `4d080d93c5ff` | none | Delegated platform boundary only | None verified | matches authoritative main |
| schema | `66d7c10de7dc` | structured-data | RFC3339 (unverified), RFC3629 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (partial), RFC8259 (unverified), RFC9562 (partial) | RFC-5646-LANGUAGE-TAG-SUBSET, RFC-9562-UUID-COMPATIBILITY-REFERENCE | matches authoritative main |
| sharedassets | `ebaf7f0ff9c1` | mime | RFC2045 (unverified), RFC2046 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified) | None verified | matches authoritative main |
| sharedcomponents | `293edd202670` | none | Delegated platform boundary only | None verified | matches authoritative main |
| spellcraft | `b6967e57c56f` | none | Delegated platform boundary only | None verified | matches authoritative main |
| storage | `516613067a54` | http, mime, structured-data | RFC2045 (unverified), RFC2046 (unverified), RFC3339 (unverified), RFC3629 (unverified), RFC3986 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (unverified), RFC6266 (unverified), RFC6585 (unverified), RFC7239 (unverified), RFC7578 (unverified), RFC8187 (unverified), RFC8259 (unverified), RFC8288 (unverified), RFC9110 (unverified), RFC9111 (unverified), RFC9112 (unverified), RFC9457 (unverified), RFC9562 (unverified) | None verified | matches authoritative main |
| training | `9a3fd20611e2` | none | Delegated platform boundary only | None verified | matches authoritative main |
| translations | `937afe859a05` | structured-data | RFC3339 (unverified), RFC3629 (unverified), RFC4647 (unverified), RFC4648 (unverified), RFC5646 (partial), RFC8259 (unverified), RFC9562 (unverified) | RFC-5646-LANGUAGE-TAG-SUBSET | matches authoritative main |
| ui-foundry | `143449ea0b47` | none | Delegated platform boundary only | None verified | matches authoritative main |
| video | `d904452b5514` | mime | RFC2045 (unverified), RFC2046 (unverified), RFC6266 (unverified), RFC7578 (unverified), RFC8187 (unverified) | None verified | matches authoritative main |
| voice | `af380d0367a1` | none | Delegated platform boundary only | None verified | matches authoritative main |

## Scope notes

- `unverified` is an explicit queue for clause-level evidence, not a compliance claim.
- `delegated` means the integration boundary was checked while protocol internals remain owned by Node.js, browsers, Azure, TLS, CDN, or another named dependency.
- OAuth 2.1 draft-15 is reported separately from published RFCs.
- SSE, MCP, glTF, WebGPU, WebXR, IFC, STEP, and other non-IETF specifications are companion standards outside this clause-level RFC audit.
