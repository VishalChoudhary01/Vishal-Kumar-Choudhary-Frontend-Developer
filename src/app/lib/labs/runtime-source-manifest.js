import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
const root=process.cwd();
const runtimes={
 "magnetic-interaction":["src/app/components/labs/runtime/experiments/magnetic-interaction/index.js",()=>readFile(path.join(root,"src/app/components/labs/runtime/experiments/magnetic-interaction/index.js"),"utf8")],
 "scroll-driven-text-reveal":["src/app/components/labs/runtime/experiments/scroll-driven-text-reveal/index.js",()=>readFile(path.join(root,"src/app/components/labs/runtime/experiments/scroll-driven-text-reveal/index.js"),"utf8")],
 "gradient-bloom":["src/app/components/labs/runtime/experiments/gradient-bloom/index.js",()=>readFile(path.join(root,"src/app/components/labs/runtime/experiments/gradient-bloom/index.js"),"utf8")],
 "generative-particle-field":["src/app/components/labs/runtime/experiments/generative-particle-field/index.js",()=>readFile(path.join(root,"src/app/components/labs/runtime/experiments/generative-particle-field/index.js"),"utf8")]
};
export const LAB_RUNTIME_SOURCE_SLUGS=Object.keys(runtimes);
export async function getLabRuntimeSourceFiles(slug){
 const r=runtimes[slug];if(!r){const e=new Error("Unknown Labs runtime.");e.code="NOT_FOUND";throw e}
 const [entry,hook,provider]=await Promise.all([r[1](),readFile(path.join(root,"src/app/hooks/useReducedMotion.js"),"utf8"),readFile(path.join(root,"src/app/providers/MotionProvider.js"),"utf8")]);
 return [{path:r[0],language:"javascript",content:entry},{path:"src/app/hooks/useReducedMotion.js",language:"javascript",content:hook},{path:"src/app/providers/MotionProvider.js",language:"javascript",content:provider}];
}