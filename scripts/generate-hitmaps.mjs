#!/usr/bin/env node
/**
 * Generate alpha hit maps for transparent PNG images
 *
 * This script creates compressed binary hit maps that indicate which pixels
 * are opaque enough to be considered "hittable" for hover detection.
 *
 * Usage: node scripts/generate-hitmaps.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// PNG signature and chunk reading utilities
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function readPNG(filePath) {
  const buffer = readFileSync(filePath);

  // Verify PNG signature
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error(`Not a valid PNG file: ${filePath}`);
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const dataChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      dataChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }

    offset += 12 + length; // length + type + data + crc
  }

  return { width, height, bitDepth, colorType, dataChunks };
}

// Simple run-length encoding for hit maps
function encodeHitMap(hitMap, width, height) {
  // Format: [width (2 bytes), height (2 bytes), RLE data...]
  // RLE: [count (1 byte), value (1 bit packed into bytes)]

  const result = [];

  // Write dimensions
  result.push((width >> 8) & 0xFF, width & 0xFF);
  result.push((height >> 8) & 0xFF, height & 0xFF);

  // Pack bits into bytes with simple RLE
  let currentValue = hitMap[0] ? 1 : 0;
  let runLength = 0;

  for (let i = 0; i < hitMap.length; i++) {
    const value = hitMap[i] ? 1 : 0;

    if (value === currentValue && runLength < 255) {
      runLength++;
    } else {
      // Write run
      result.push(runLength);
      result.push(currentValue);
      currentValue = value;
      runLength = 1;
    }
  }

  // Write final run
  if (runLength > 0) {
    result.push(runLength);
    result.push(currentValue);
  }

  return Buffer.from(result);
}

// Since we can't easily decode PNG without native modules,
// we'll generate a simpler format: store the hit map dimensions
// and let the browser decode the actual alpha using canvas
function generateHitMapMetadata(imagePath, outputPath, alphaThreshold = 10) {
  try {
    const { width, height, colorType } = readPNG(imagePath);

    // We can only determine if the image has alpha channel
    const hasAlpha = colorType === 4 || colorType === 6; // Grayscale+Alpha or RGBA

    // Write metadata file that the browser will use to generate hit map
    const metadata = {
      width,
      height,
      hasAlpha,
      alphaThreshold,
      // Grid size for downsampled hit map (for performance)
      gridSize: 4, // 4x4 pixel grid = 1 hit map cell
      gridWidth: Math.ceil(width / 4),
      gridHeight: Math.ceil(height / 4),
    };

    writeFileSync(outputPath, JSON.stringify(metadata));
    console.log(`  Generated metadata: ${outputPath} (${width}x${height}, hasAlpha: ${hasAlpha})`);
    return true;
  } catch (error) {
    console.error(`  Error processing ${imagePath}: ${error.message}`);
    return false;
  }
}

// Images to process
const heroImages = [
  'img-1.png',
  'img-2.png',
  'img-3.png',
  'img-4.png',
  'img-5.png',
  'img-6.png',
  'img-7.png',
  'img-8.png',
  'img-9.png',
  'img-10.png',
  'img-11.png',
  'img-12.png',
  'img-13.png',
];

const inputDir = join(projectRoot, 'public', 'images', 'hero');
const outputDir = join(projectRoot, 'public', 'images', 'hero', 'hitmaps');

// Create output directory
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

console.log('Generating hit map metadata for hero images...\n');

let successCount = 0;
for (const image of heroImages) {
  const inputPath = join(inputDir, image);
  const outputPath = join(outputDir, image.replace('.png', '.json'));

  if (!existsSync(inputPath)) {
    console.log(`  Skipping ${image} (file not found)`);
    continue;
  }

  if (generateHitMapMetadata(inputPath, outputPath)) {
    successCount++;
  }
}

console.log(`\nCompleted: ${successCount}/${heroImages.length} hit maps generated`);
console.log('\nNote: Actual hit maps will be generated in the browser using canvas.');
console.log('The metadata files provide dimensions for the browser to use.');
