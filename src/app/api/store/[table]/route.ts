import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const TABLES = new Set(["quotations", "customers", "products"]);

function supa() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function badTable() {
  return NextResponse.json({ error: "unknown table" }, { status: 400 });
}

type Ctx = { params: Promise<{ table: string }> };

/** List all rows: returns [{...data, id}] */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { table } = await ctx.params;
  if (!TABLES.has(table)) return badTable();
  const { data, error } = await supa().from(table).select("id, data");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    (data ?? []).map((row) => ({ ...(row.data as object), id: row.id }))
  );
}

/** Insert one record (object) or many (array). Returns {id} or {ids}. */
export async function POST(req: NextRequest, ctx: Ctx) {
  const { table } = await ctx.params;
  if (!TABLES.has(table)) return badTable();
  const body = await req.json();
  const records = Array.isArray(body) ? body : [body];
  const rows = records.map((r) => {
    const clean = { ...r };
    delete clean.id;
    return { data: clean };
  });
  const { data, error } = await supa().from(table).insert(rows).select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = (data ?? []).map((r) => r.id);
  return NextResponse.json(Array.isArray(body) ? { ids } : { id: ids[0] });
}

/** Update by id: body is the full record including id. */
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { table } = await ctx.params;
  if (!TABLES.has(table)) return badTable();
  const body = await req.json();
  const id = body.id;
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const clean = { ...body };
  delete clean.id;
  const { error } = await supa().from(table).update({ data: clean }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Delete one row (?id=) or every row (?all=true). */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { table } = await ctx.params;
  if (!TABLES.has(table)) return badTable();
  const id = req.nextUrl.searchParams.get("id");
  const all = req.nextUrl.searchParams.get("all") === "true";
  if (!id && !all)
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  const q = supa().from(table).delete();
  const { error } = id ? await q.eq("id", Number(id)) : await q.gte("id", 0);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
