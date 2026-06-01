import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { rules as rulesTable } from "@/db/schema";
import { RULES, type Rule } from "@/db/seed";

export async function getRulesByProperty(propertyId: string): Promise<Rule[]> {
  try {
    const rows = await db
      .select()
      .from(rulesTable)
      .where(
        and(
          eq(rulesTable.propertyId, propertyId),
          eq(rulesTable.active, true),
        ),
      )
      .orderBy(asc(rulesTable.order));
    if (rows.length > 0) return rows as Rule[];
  } catch (err) {
    console.error("[rules:queries] DB read failed:", err);
  }
  return RULES.filter((r) => r.propertyId === propertyId && r.active).sort(
    (a, b) => a.order - b.order,
  );
}

export function groupRulesByCategory(rules: Rule[]): Array<{
  category: string;
  rules: Rule[];
}> {
  const map = new Map<string, Rule[]>();
  for (const rule of rules) {
    const list = map.get(rule.category) ?? [];
    list.push(rule);
    map.set(rule.category, list);
  }
  return Array.from(map.entries()).map(([category, rules]) => ({
    category,
    rules,
  }));
}
