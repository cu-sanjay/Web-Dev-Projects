# JWT Token Decoder & Inspector

A premium developer workspace utility to decode, verify, inspect, and encode JSON Web Tokens (JWT) 100% inside your browser. Analyze header/payload segments, track claim timelines, and perform local HS256 signature verifications with zero external dependencies.

## 🚀 Key Features

- **Bi-directional JWT Editor**:
  - *Decode Mode*: Paste any standard Base64Url-encoded JWT to instantly parse headers and claims.
  - *Encode Mode*: Edit header and payload JSON properties directly in text fields and dynamically sign/encode a new token string.
- **Segment Color Indicators**: Segments color-matched with the official JWT.io visual scheme (Header in pink, Payload in blue, Signature in green).
- **HMAC-SHA256 (HS256) Signature Verifier**: Built-in pure JavaScript cryptography node checking signature validity against a user-defined secret key.
- **Claims Inspector & Timeline**:
  - Automatically translates UNIX epoch timestamps (`iat`, `exp`, `nbf`) into local human-readable date strings.
  - Features real-time countdown clocks showing expiration limits (e.g. "Expires in 4 hours").
- **Saved Keys Vault & Presets**: Keep a list of commonly used signing secrets and sample tokens in a local sidebar list.

## 📂 Folder Layout

```
JWT Token Decoder & Inspector/
├── README.md         # Detailed user manual
├── project.json      # Metadata descriptor
├── index.html        # App HTML structures
├── style.css         # Theme stylesheet and segment configurations
├── script.js         # Decoders, claims parsers, & custom HS256 crypto engines
└── thumbnail.svg     # Project showcase graphic
```

## 🛠️ How to Use

1. Open `index.html` in any modern browser.
2. Select a preset token from the dropdown list. The token will parse automatically.
3. To test signature verification, type the verification key (e.g. `super-secret-key-123`) in the signature text box and verify that the status badge changes to **Signature Verified** (green).
4. Click the **Token Builder** tab, edit payload claims in the textarea, and copy the newly generated JWT token.
