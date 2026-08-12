import { copyFileSync } from 'node:fs';

copyFileSync('public/_redirects', 'dist/_redirects');
