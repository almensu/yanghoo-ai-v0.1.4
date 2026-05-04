#!/bin/bash
set -e
echo "Running Stage 2 verification via TypeScript assertion script..."
npx tsx scripts/ops/verify-stage2-caption-batch.ts
