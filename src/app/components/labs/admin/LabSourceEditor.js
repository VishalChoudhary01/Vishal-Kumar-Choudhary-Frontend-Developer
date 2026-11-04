"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Download,
  Eye,
  FilePlus2,
  FileUp,
  LoaderCircle,
  Save,
  Upload,
  X,
} from "lucide-react";

const LANGUAGES = [
  "javascript",
  "jsx",
  "typescript",
  "tsx",
  "css",
  "html",
  "json",
  "markdown",
  "text",
  "svg",
];

function makeRequestId() {
  return globalThis.crypto?.randomUUID?.() ||
    "req_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
}

function validateDraftFiles(files) {
  if (!Array.isArray(files) || files.length < 1 || files.length > 40) {
    return "A source snapshot must contain between 1 and 40 files.";
  }

  const seenPaths = new Set();
  let totalBytes = 0;
  const safePathPattern = /^(?!\/)(?!.*(?:^|\/)\.{1,2}(?:\/|$))[A-Za-z0-9._/-]{1,180}$/;
  const secretFilePattern = /(^|\/)\.env(?:\.|$)|(^|\/)(?:id_rsa|id_ed25519|credentials(?:\.json)?|secrets?\.(?:json|ya?ml))$/i;

  for (const file of files) {
    const path = typeof file?.path === "string" ? file.path.trim() : "";
    if (
      !safePathPattern.test(path) ||
      path.split("/").some((segment) => !segment || segment === "." || segment === "..") ||
      /[\u0000-\u001f\u007f]/.test(path) ||
      secretFilePattern.test(path)
    ) {
      return "A file path is invalid or uses a restricted name. Check the path and remove environment/credential files.";
    }

    const normalizedPath = path.toLowerC¶»§q«^uÍ¥‰±”é½ÕÑ±¥¹”µ‰É…¹‘¥Í…‰±•éÕÉÍ½Èµ¹½Ðµ…±±½Ý•‘¥Í…‰±•é½Á…¥Ñä´ÈÔˆ(€€€€€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€€€€€ñÉÉ½ÝUÀÍ¥é”õìÄÍô…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ€¼ø(€€€€€€€€€€€€€€€€€€€€€€ð½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôøµ½Ù•¥±”¡¥¹‘•à°¥¹‘•à€¬€Ä¥ô(€€€€€€€€€€€€€€€€€€€€€€€‘¥Í…‰±•õí¥¹‘•à€ôôô™¥±•Ì¹±•¹Ñ €´€Äñð	½½±•…¸¡‰ÕÍä¥ô(€€€€€€€€€€€€€€€€€€€€€€€…É¥„µ±…‰•°õì‰5½Ù”€ˆ€¬™¥±”¹Á…Ñ €¬€ˆ‘½Ý¸‰ô(€€€€€€€€€€€€€€€€€€€€€€€Ñ¥Ñ±”ô‰5½Ù”‘½Ý¸ˆ(€€€€€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰É¥ ´ÜÜ´ÜÁ±…”µ¥Ñ•µÌµ•¹Ñ•ÈÑ•áÐµÑ•áÐµÑ•ÉÑ¥…ÉäÑÉ…¹Í¥Ñ¥½¸µ½±½ÉÌ¡½Ù•Èé‰œµ‰…­É½Õ¹¡½Ù•ÈéÑ•áÐµÑ•áÐµÁÉ¥µ…Éä™½ÕÌµÙ¥Í¥‰±”é½ÕÑ±¥¹”´È™½ÕÌµÙ¥Í¥‰±”é½ÕÑ±¥¹”µ‰É…¹‘¥Í…‰±•éÕÉÍ½Èµ¹½Ðµ…±±½Ý•‘¥Í…‰±•é½Á…¥Ñä´ÈÔˆ(€€€€€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€€€€€ñÉÉ½Ý½Ý¸Í¥é”õìÄÍô…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ€¼ø(€€€€€€€€€€€€€€€€€€€€€€ð½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€ô¥ô(€€€€€€€€€€€€€ì…™¥±•Ì¹±•¹Ñ €ü€ (€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Áà´ÈÁä´ÔÑ•áÐµáÌ±•…‘¥¹œ´ÔÑ•áÐµÑ•áÐµÑ•ÉÑ¥…Éäˆù9¼™¥±•Ìå•Ð¸‘„™¥±”Ñ¼‰•¥¸å½ÕÈÍ½ÕÉ”Í¹…ÁÍ¡½Ð¸ð½Àø(€€€€€€€€€€€€€€¤€è¹Õ±±ô(€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µÐ´Ô‰½É‘•ÈµÐ‰½É‘•Èµ‰½É‘•ÈÁÐ´ÐÑ•áÐµáÌÑ•áÐµÑ•áÐµÑ•ÉÑ¥…Éäˆø(€€€€€€€€€€€€€€ñÀùí™¥±•Ì¹±•¹Ñ¡ô€¼€ÐÀ™¥±•Ìð½Àø(€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰µÐ´ÄÑ…‰Õ±…Èµ¹ÕµÌˆùì¡Ñ½Ñ…±	åÑ•Ì€¼€ÄÀÈÐ¤¹Ñ½¥á• Ä¥ô-€¼€ÄÀÀÀ-ð½Àø(€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€ð½…Í¥‘”ø((€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µ¥¸µÜ´ÀÉ½Õ¹’ÚîÆ­y