"use client";
import {useState} from "react";
import Link from "next/link";
import {Download,LoaderCircle} from "lucide-react";
const demos=[["magnetic-interaction","Magnetic Interaction"],["scroll-driven-text-reveal","Scroll-driven Text Reveal"],["gradient-bloom","Gradient Bloom"],["generative-particle-field","Generative Particle Field"]];
export default function LabRuntimeImportPanel(){
 const [busy,setBusy]=useState(false),[result,setResult]=useState(null),[error,setError]=useState("");
 async function importAll(){
  if(!window.confirm("Import the reviewed runtime source for all four demos? Existing drafts are skipped; published source is unchanged."))return;
  setBusy(true);setError("");setResult(null);
  try{const r=await fetch("/api/v1/admin/labs/sources/import-runtime",{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"Content-Type":"application/json",Accept:"application/json"},body:"{}"});const p=await r.json();if(!r.ok)throw new Error(p?.error?.message||"Import failed");setResult(p.data)}catch(e){setError(e.message||"Import failed")}finally{setBusy(false)}
 }
 return <section className="mt-8 border border-border bg-surface-1 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Initialize experiment sources</h2><p className="mt-1 text-xs text-text-tertiary">Import actual runtime files as private drafts. Nothing is published automatically.</p></div><button type="button" onClick={importAll} disabled={busy} className="inline-flex h-9 items-center gap-2 border border-brand/50 bg-brand-soft px-3 text-xs font-semibold text-brand disabled:opacity-50">{busy?<LoaderCircle size={14} className="animate-spin"/>:<Download size={14}/>} {busy?"Importing…":"Import four runtime sources"}</button></div>{error?<p role="alert" className="mt-3 text-xs text-warning">{error}</p>:null}{result?<div role="status" className="mt-4 border-t border-border pt-3 text-xs"><p>{result.imported.length} imported · {result.skipped.length} existing drafts preserved · {result.failed.length} failed</p>{[...result.imported,...result.skipped,...result.failed].map(x=>{const slug=typeof x==="string"?x:x.slug,d=demos.find(y=>y[0]===slug);return <p key={slug} className="mt-2"><Link className="text-brand underline" href={"/admin/labs/sources/"+slug}>{d?.[1]||slug}</Link> — {typeof x==="string"?"Draft already exists":x.version||x.code}</p>})}</div>:null}</section>
}