#!/usr/bin/bash

set -ex

cd gen
rustup run nightly cargo run -- "../config.yml"

cd ../ready
yarn install
yarn run parcel build index.html --no-minify --public-url ./
