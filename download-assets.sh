#!/usr/bin/env bash

mkdir -p assets

aws s3 sync \
	s3://d.willhaley.com/ ./assets/

