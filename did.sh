#!/usr/bin/env bash

function generate_did() {
    local canister=$1
    canister_root="src/backend/$canister"

    cargo build --manifest-path="$canister_root/Cargo.toml" \
    --target wasm32-unknown-unknown \
    --release --package "$canister"

    candid-extractor "target/wasm32-unknown-unknown/release/$canister.wasm" > "$canister_root/$canister.did"
}

function generate_did_for_recovery() {
    local canister=$1
    canister_root="src/backend/recovery/$canister"

    cargo build --manifest-path="$canister_root/Cargo.toml" \
    --target wasm32-unknown-unknown \
    --release --package "$canister"

    candid-extractor "target/wasm32-unknown-unknown/release/$canister.wasm" > "$canister_root/$canister.did"
}

# The list of canisters of your project
CANISTERS="hush,storage,reclaim_verifier_unofficial"

for canister in $(echo $CANISTERS | sed "s/,/ /g"); do
  generate_did "$canister"
done

RECOVERY_CANISTERS="dkim_email_verifier,aadhaar_digital_zk_verifier"

for canister in $(echo $RECOVERY_CANISTERS | sed "s/,/ /g"); do 
    generate_did_for_recovery "$canister"
done
