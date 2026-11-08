import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createSphereParticleData } from "../src/app/components/labs/landing/particle-sphere/particle-geometry.mjs";
import {
  getParticleBurstEnvelope,
  getParticleBurstParticleEnvelope,
  PARTICLE_BURST_EXPANSION,
  isParticleBurstActive,
} from "../src/app/components/labs/landing/particle-sphere/particle-interaction.mjs";
import {
  getParticleBurstSpreadScale,
  getParticleCameraDistance,
  getParticleCameraProjectionShift,
} from "../src/app/components/labs/landing/particle-sphere/particle-responsive.mjs";
import { getParticleSphereThemePalette } from "../src/app/components/labs/landing/particle-sphere/particle-theme.mjs";
import {
  areParticleQualityProfilesEqual,
  getParticleQualityProfile,
  hasParticleBudgetChanged,
} from "../src/app/components/labs/landing/particle-sphere/particle-quality.mjs";

const rendererSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/LabsParticleSphere.js", import.meta.url),
  "utf8",
);
const shaderSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/particle-shaders.js", import.meta.url),
  "utf8",
);
const orbitSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/particle-orbits.js", import.meta.url),
  "utf8",
);
const constantsSource = await readFile(
  new URL("../src/app/components/labs/landing/particle-sphere/p¶»§q«^uÉµ½Ù”ˆ¼¤ì(€…ÍÍ•ÉĞ¹µ…Ñ ¡É•¹‘•É•ÉM½ÕÉ”°€½ÍÑ…ÉÑ•‘=¹MÁ¡•É”¼¤ì(€…ÍÍ•ÉĞ¹µ…Ñ ¡É•¹‘•É•ÉM½ÕÉ”°€½Í•ÑA½¥¹Ñ•É…ÁÑÕÉ•pıp¹p¡•Ù•¹Ñp¹Á½¥¹Ñ•É%‘p¤¼¤ì(€…ÍÍ•ÉĞ¹µ…Ñ ¡É•¹‘•É•ÉM½ÕÉ”°€½‘¥ÍÑ…¹”€ğô€ÄÈ€˜˜Á½¥¹Ñ•É½İ¹p¹ÍÑ…ÉÑ•‘=¹MÁ¡•É”€˜˜¡¥ÑMÁ¡•É”¼¤ì(€…ÍÍ•ÉĞ¹µ…Ñ ¡É•¹‘•É•ÉM½ÕÉ”°€½‰ÕÉÍÑMÑ…ÉÑ•‘Ğ€ô•±…ÁÍ•¼¤ì(€…ÍÍ•ÉĞ¹µ…Ñ ¡É•¹‘•É•ÉM½ÕÉ”°€½9Õµ‰•Ép¹¥Í¥¹¥Ñ•p¡‰ÕÉÍÑMÑ…ÉÑ•‘Ñp¤pü•±…ÁÍ•€´‰ÕÉÍÑMÑ…ÉÑ•‘Ğ€è€´Ä¼¤ì(€…ÍÍ•ÉĞ¹µ…Ñ ¡É•¹‘•É•ÉM½ÕÉ”°€½Õ	ÕÉÍÑQ¥µ•p¹Ù…±Õ”€ô‰ÕÉÍÑQ¥µ”¼¤ì(€…ÍÍ•ÉĞ¹µ…Ñ ¡É•¹‘•É•ÉM½ÕÉ”°€½Ñ½Õ¡Ñ¥½¸€ô€‰Á…¸µäˆ¼¤ì(€…ÍÍ•ÉĞ¹µ…Ñ ¡É•¹‘•É•ÉM½ÕÉ”°€½É•µ½Ù•Ù•¹Ñ1¥ÍÑ•¹•Ép ‰Á½¥¹Ñ•É…¹•°ˆ¼¤ì(€…ÍÍ•ÉĞ¹µ…Ñ ¡É•¹‘•É•ÉM½ÕÉ”°€½É•±•…Í•A½¥¹Ñ•É…ÁÑÕÉ•pıp¹p¡•Ù•¹Ñp¹Á½¥¹Ñ•É%‘p¤¼¤ì)ô¤ì()Ñ•ÍĞ ‰½É‰¥ĞÁ…ÉÑ¥±•Ìµ½Ù”½¹Ñ¥¹Õ½ÕÍ±äİ¥Ñ¡½ÕĞ‰ÕÉÍĞµ±¥¹­•ÍÁ••¡…¹•Ìˆ°€ ¤€ôøì(€…ÍÍ•ÉĞ¹½¬¡½É‰¥ÑM½ÕÉ”¹¥¹±Õ‘•Ì ‰É½ÕÀ¹ÕÍ•É…Ñ„¹ÕÁ‘…Ñ”€ô€¡•±…ÁÍ•¤€ôøˆ¤¤ì(€…ÍÍ•ÉĞ¹µ…Ñ ¡½É‰¥ÑM½ÕÉ”°€½ÉÕ¹¹•Ép¹Á½Í¥Ñ¥½¹p¹½Áåp¡•Ñ=É‰¥ÑA½¥¹Ğ¼¤ì(€…ÍÍ•ÉĞ¹½¬ …½É‰¥ÑM½ÕÉ”¹¥¹±Õ‘•Ì ‰=I	%Q}	UIMQ}MA}5U1Q%A1%Hˆ¤¤ì(€…ÍÍ•ÉĞ¹½¬ …½É‰¥ÑM½ÕÉ”¹¥¹±Õ‘•Ì ‰‰ÕÉÍÑMÁ••ˆ¤¤ì(€…ÍÍ•ÉĞ¹½¬¡½É‰¥ÑM½ÕÉ”¹¥¹±Õ‘•Ì ‰‘•±Ñ„€¨ÍÁ•Œ¹ÍÁ••ˆ¤¤ì(€…ÍÍ•ÉĞ¹µ…Ñ ¡½É‰¥ÑM½ÕÉ”°€½•¹è5…Ñ¡p¹A$p¨€È¼¤ì(€…ÍÍ•ÉĞ¹µ…Ñ ¡½É‰¥ÑM½ÕÉ”°€½½É‰¥ĞµÁ…ÉÑ¥±”µ±½Ü¼¤ì(€…ÍÍ•ÉĞ¹½¬¡É•¹‘•É•ÉM½ÕÉ”¹¥¹±Õ‘•Ì ‰½É‰¥ÑÉ½ÕÀ¹ÕÍ•É…Ñ„¹ÕÁ‘…Ñ”ü¸¡•±…ÁÍ•¤ˆ¤¤ì)ô¤ì()Ñ•ÍĞ ‰1…‰Ì¡•É¼…ÁÁ±¥•Ì½¹”É•ÍÁ½¹Í¥Ù”‘…É¬É…‘¥…°‰…­É½Õ¹İ¥Ñ¡½ÕĞ„Í•Á…É…Ñ”½Ù•É±…äˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍĞ¡•É½M½ÕÉ”€ô…İ…¥ĞÉ•…‘¥±” (€€€¹•ÜUI0 ˆ¸¸½ÍÉŒ½…ÁÀ½½µÁ½¹•¹ÑÌ½±…‰Ì½1…‰Í%¹ÑÉ½‘ÕÑ¥½¸¹©Ìˆ°¥µÁ½ÉĞ¹µ•Ñ„¹ÕÉ°¤°(€€€€‰ÕÑ˜àŠÚîÆ­y