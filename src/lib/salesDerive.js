import { useMemo } from "react";
import { repStats } from "./sales";

/** Sales team numbers for the master admin, computed from raw collections. */
export function useSalesData(data) {
  return useMemo(() => {
    const reps = (data?.sales_reps || []).map((r) => {
      const leads = (data?.sales_leads || []).filter((l) => l.repId === r.id);
      return { ...r, leads, stats: repStats(leads) };
    });
    const byId = Object.fromEntries(reps.map((r) => [r.id, r]));
    const leads = data?.sales_leads || [];
    return {
      reps,
      byId,
      leads,
      approved: reps.filter((r) => r.status === "approved"),
      pending: reps.filter((r) => r.status === "pending"),
      awaiting: leads.filter((l) => l.stage === 3 && !l.contractVerified && !l.lost),
      unreadable: data && (data.sales_reps === null || data.sales_leads === null),
    };
  }, [data]);
}

