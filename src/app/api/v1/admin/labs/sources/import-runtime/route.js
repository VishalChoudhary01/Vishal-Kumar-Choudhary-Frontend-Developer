import {adminJson,getLabsOwnerUser,isSameOriginMutation} from "@/app/lib/labs/admin-http";
import {LAB_RUNTIME_SOURCE_SLUGS,getLabRuntimeSourceFiles} from "@/app/lib/labs/runtime-source-manifest";
import {createOwnerLabSource,listOwnerLabSources,saveOwnerLabDraft} from "@/app/lib/labs/source-management";
export const runtime="nodejs",dynamic="force-dynamic",revalidate=0;
export async function POST(request){
 const {user,response}=await getLabsOwnerUser();if(response)return response;
 if(!isSameOriginMutation(request))return adminJson({error:{code:"INVALID_ORIGIN",message:"Request not allowed."}},403);
 try{
  const inventory=await listOwnerLabSources({user}),bySlug=new Map(inventory.map(x=>[x.slug,x])),result={imported:[],skipped:[],failed:[]};
  for(const slug of LAB_RUNTIME_SOURCE_SLUGS){
   try{
    let source=bySlug.get(slug);
    if(!source?.hasSource){await createOwnerLabSource({user,slug});source=null}
    if(source?.draftVersionId){result.skipped.push(slug);continue}
    const saved=await saveOwnerLabDraft({user,slug,files:await getLabRuntimeSourceFiles(slug),expectedDraftVersionId:null,changeSummary:"Initial import of reviewed runtime source"});
    result.imported.push({slug,version:saved.version,fileCount:saved.fileCount});
   }catch(e){result.failed.push({slug,code:e?.code||"UNAVAILABLE"})}
  }
  return adminJson({data:result});
 }catch(e){return adminJson({error:{code:e?.code||"UNAVAILABLE",message:"Runtime import is temporarily unavailable."}},503)}
}