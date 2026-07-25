# Implementation Plan: Web Bot Authority Verification

The goal is to integrate the provided cryptographic signature fields into the project's global headers. This identifies `displaycellpros.com` as a verified "web-bot" authority, specifically for integration with Shopify's security and crawler ecosystem.

## User Review Required

> [!IMPORTANT]
> **Signature Expiry:** The provided signature expires on **Aug 24, 2026**. You will need to regenerate and update these headers before that date to maintain verified status.
>
> **Global Application:** These headers will be applied to **all** responses served by Vercel. This is the standard way to broadcast site identity to modern bot-verification systems.

## Proposed Changes

### [Vercel Configuration]

#### [MODIFY] [vercel.json](file:///C:/Users/cheyo/OneDrive/Documents/GitHub/displaycellpros.com/vercel.json)
- Add the following headers to the global source `/(.*)`:
  - `Signature`: `sig1=:5/HQDD5jvSTDvbJEMpDy4VmjcVvxiDDQrLa+g9rPPW/IzLQT6QSJfczYKxkJvALIYdrS1FdpUZX8s9V8aArxCQ==:`
  - `Signature-Input`: `sig1=("@authority" "signature-agent");keyid="SjjyXvQ2cGhsRXs9DXEaV6ClyCun0Pj5yxjV67dLGOk";nonce="yZhDJXFCVwpJMj8FxFBrx4QplAgRZv2+NbtSLlx/yPxo9247/q1chWIiA3oLHtxssAHYHgE/gzchAN2/c/l3Cw==";tag="web-bot-auth";created=1785016539;expires=1787608539`
  - `Signature-Agent`: `"https://shopify.com"`

## Verification Plan

### Manual Verification
- Deploy to Vercel.
- Use `curl -I https://displaycellpros.com` to verify that the headers are correctly returned in the response.
- Confirm the `Signature-Agent` matches `"https://shopify.com"`.
