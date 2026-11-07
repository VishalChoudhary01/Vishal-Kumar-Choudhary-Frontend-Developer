import "server-only";

import mongoose from "mongoose";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import PortfolioVisit from "./models/PortfolioVisit";
import { buildPortfolioVisitDeletionFilter } from "./deletion-utils.mjs";

export async function deletePortfolioVisitRecords(parsedScope) {
  const filter = buildPortfolioVisitDeletionFilter(
    parsedScope,
    mongoose.Types.ObjectId,
  );

  await connectToDatabase();

  const result = await PortfolioVisit.deleteMany(filter).exec();

  return {
    deletedCount: Math.max(0, Number(result?.deletedCount) || 0),
    scope: parsedScope.scope,
    deletedAt: new Date().toISOString(),
  };
}
