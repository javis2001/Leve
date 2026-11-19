"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { ALLERGEN_LABELS, EXERCISE_CATEGORIES, RECIPE_CATEGORIES, type Allergen } from "@/lib/content/types";
import { getSupabaseServer } from "@/lib/supabase/server";

export type ActionState = { ok?: boolean; error?: string; message?: string };

async function db() {
  const viewer = await assertAdmin();
  const sb = await getSupabaseServer();
  if (viewer.mode === "demo" || !sb) throw new Error("Configure o Supabase para salvar alterações (modo demonstração é somente leitura).");
  return sb;
}

const lines = (s: FormDataEntryValue | null) =>
  String(s ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function wrap(fn: (fd: FormData) => Promise<ActionState | void>) {
  return async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
    try {
      return (await fn(fd)) ?? { ok: true, message: "Salvo com sucesso." };
    } catch (e) {
      if (e instanceof z.ZodError) return { error: e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
      return { error: e instanceof Error ? e.message : "Erro inesperado" };
    }
  };
}

// ───────── Receitas ─────────
const RecipeSchema = z.object({
  slug: z.string().regex(slugRe, "use letras minúsculas, números e hífens").max(120),
  title: z.string().min(3).max(120),
  category: z.enum(RECIPE_CATEGORIES.map((c) => c.id) as [string, ...string[]]),
  summary: z.string().min(5).max(300),
  servings: z.string().min(1).max(80),
  prepMinutes: z.coerce.number().int().min(1).max(600),
  difficulty: z.enum(["Fácil", "Média"]),
  ingredients: z.array(z.object({ qty: z.string().min(1).max(60), item: z.string().min(1).max(120), note: z.string().max(120).optional() })).min(1).max(40),
  steps: z.array(z.string().min(3).max(600)).min(1).max(30),
  substitutions: z.array(z.string().max(300)).max(15),
  allergens: z.array(z.enum(Object.keys(ALLERGEN_LABELS) as [Allergen, ...Allergen[]])),
  allergenNotes: z.string().max(500).optional(),
  keyIngredients: z.array(z.string().max(40)).max(10),
  imageUrl: z.string().url().max(500).nullable().optional(),
  tags: z.array(z.string().max(40)).max(10),
});

export const saveRecipe = wrap(async (fd) => {
  const sb = await db();
  const r = RecipeSchema.parse({
    slug: fd.get("slug"),
    title: fd.get("title"),
    category: fd.get("category"),
    summary: fd.get("summary"),
    servings: fd.get("servings"),
    prepMinutes: fd.get("prepMinutes"),
    difficulty: fd.get("difficulty"),
    ingredients: lines(fd.get("ingredients")).map((l) => {
      const [qty, item, note] = l.split("|").map((x) => x.trim());
      return { qty, item, ...(note ? { note } : {}) };
    }),
    steps: lines(fd.get("steps")),
    substitutions: lines(fd.get("substitutions")),
    allergens: fd.getAll("allergens").map(String),
    allergenNotes: String(fd.get("allergenNotes") ?? "") || undefined,
    keyIngredients: String(fd.get("keyIngredients") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    imageUrl: String(fd.get("imageUrl") ?? "") || null,
    tags: String(fd.get("tags") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  });
  const published = fd.get("published") === "on";
  const { error } = await sb.from("recipes").upsert({ slug: r.slug, data: r, published });
  if (error) throw new Error(error.message);
  revalidatePath("/app/receitas", "layout");
  revalidatePath("/admin/receitas");
});

// ───────── Exercícios ─────────
const ExerciseSchema = z.object({
  slug: z.string().regex(slugRe).max(120),
  name: z.string().min(3).max(120),
  category: z.enum(EXERCISE_CATEGORIES.map((c) => c.id) as [string, ...string[]]),
  level: z.enum(["Muito leve", "Leve", "Leve a moderado"]),
  duration: z.string().min(1).max(60),
  summary: z.string().min(5).max(300),
  steps: z.array(z.string().min(3).max(500)).min(1).max(20),
  adaptations: z.array(z.string().max(300)).min(1).max(10),
  safety: z.array(z.string().max(300)).min(1).max(10),
  pose: z.string().max(40),
  videoUrl: z.string().url().max(500).nullable().optional(),
});

export const saveExercise = wrap(async (fd) => {
  const sb = await db();
  const e = ExerciseSchema.parse({
    slug: fd.get("slug"),
    name: fd.get("name"),
    category: fd.get("category"),
    level: fd.get("level"),
    duration: fd.get("duration"),
    summary: fd.get("summary"),
    steps: lines(fd.get("steps")),
    adaptations: lines(fd.get("adaptations")),
    safety: lines(fd.get("safety")),
    pose: fd.get("pose"),
    videoUrl: String(fd.get("videoUrl") ?? "") || null,
  });
  const { error } = await sb.from("exercises").upsert({ slug: e.slug, data: e, published: fd.get("published") === "on" });
  if (error) throw new Error(error.message);
  revalidatePath("/app/exercicios", "layout");
  revalidatePath("/admin/exercicios");
});

// ───────── Jornada ─────────
const DaySchema = z.object({
  day: z.coerce.number().int().min(1).max(30),
  title: z.string().min(3).max(120),
  objective: z.string().min(5).max(400),
  education: z.array(z.string().min(10).max(1500)).min(1).max(5),
  activity: z.object({
    title: z.string().min(3).max(120),
    description: z.string().min(5).max(500),
    minutes: z.coerce.number().int().min(1).max(120),
    exerciseSlugs: z.array(z.string().regex(slugRe)).max(6),
    adaptation: z.string().max(400),
  }),
  food: z.object({ text: z.string().min(5).max(400), recipeSlug: z.string().regex(slugRe).optional() }),
  habit: z.string().min(3).max(300),
  motivation: z.string().min(3).max(300),
  checklist: z.array(z.string().min(2).max(200)).min(1).max(8),
});

export const saveDay = wrap(async (fd) => {
  const sb = await db();
  const d = DaySchema.parse({
    day: fd.get("day"),
    title: fd.get("title"),
    objective: fd.get("objective"),
    education: String(fd.get("education") ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    activity: {
      title: fd.get("activityTitle"),
      description: fd.get("activityDescription"),
      minutes: fd.get("activityMinutes"),
      exerciseSlugs: String(fd.get("exerciseSlugs") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      adaptation: fd.get("adaptation"),
    },
    food: { text: fd.get("foodText"), recipeSlug: String(fd.get("recipeSlug") ?? "") || undefined },
    habit: fd.get("habit"),
    motivation: fd.get("motivation"),
    checklist: lines(fd.get("checklist")),
  });
  const { error } = await sb.from("journey_days").upsert({ day: d.day, data: d });
  if (error) throw new Error(error.message);
  revalidatePath("/app", "layout");
  revalidatePath("/admin/jornada");
});

// ───────── Usuários e acesso ─────────
export const grantAccess = wrap(async (fd) => {
  const sb = await db();
  const email = z.string().email().parse(String(fd.get("email") ?? "").trim().toLowerCase());
  const notes = String(fd.get("notes") ?? "").slice(0, 300) || "Liberação manual pelo admin";
  const { data: prof } = await sb.from("profiles").select("id").ilike("email", email).maybeSingle();
  const { error } = await sb.from("entitlements").insert({ email, user_id: prof?.id ?? null, status: "active", source: "admin", notes });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
  return { ok: true, message: `Acesso liberado para ${email}.` };
});

export const setEntitlementStatus = wrap(async (fd) => {
  const sb = await db();
  const id = z.string().uuid().parse(fd.get("id"));
  const status = z.enum(["active", "revoked"]).parse(fd.get("status"));
  const { error } = await sb.from("entitlements").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
});

export const setRole = wrap(async (fd) => {
  const sb = await db();
  const id = z.string().uuid().parse(fd.get("id"));
  const role = z.enum(["member", "admin"]).parse(fd.get("role"));
  const { error } = await sb.from("profiles").update({ role }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
});

// ───────── Configurações ─────────
export const saveSettings = wrap(async (fd) => {
  const sb = await db();
  const offer = z
    .object({
      productName: z.string().min(2).max(80),
      priceCents: z.coerce.number().int().min(100).max(1_000_000),
      checkoutUrl: z.union([z.literal(""), z.string().url().startsWith("https://")]),
      guaranteeEnabled: z.boolean(),
      guaranteeText: z.string().max(600),
    })
    .parse({
      productName: fd.get("productName"),
      priceCents: Math.round(Number(String(fd.get("price") ?? "").replace(",", ".")) * 100),
      checkoutUrl: String(fd.get("checkoutUrl") ?? "").trim(),
      guaranteeEnabled: fd.get("guaranteeEnabled") === "on",
      guaranteeText: String(fd.get("guaranteeText") ?? "").trim(),
    });
  if (offer.guaranteeEnabled && !offer.guaranteeText) throw new Error("Descreva as condições reais da garantia ou desative-a.");
  const support = z
    .object({ email: z.union([z.literal(""), z.string().email()]), whatsapp: z.string().max(30), hours: z.string().max(120) })
    .parse({ email: String(fd.get("supportEmail") ?? "").trim(), whatsapp: String(fd.get("supportWhatsapp") ?? "").trim(), hours: String(fd.get("supportHours") ?? "").trim() });
  const { error } = await sb.from("site_settings").upsert([
    { key: "offer", value: offer, is_public: true },
    { key: "support", value: support, is_public: true },
  ]);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
});

// ───────── Materiais e imagens ─────────
export const uploadMaterial = wrap(async (fd) => {
  const sb = await db();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Selecione um arquivo PDF.");
  if (file.type !== "application/pdf" || file.size > 20 * 1024 * 1024) throw new Error("Envie um PDF de até 20 MB.");
  const title = z.string().min(2).max(120).parse(String(fd.get("title") ?? "").trim());
  const path = `${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-")}`;
  const up = await sb.storage.from("materiais").upload(path, file, { contentType: "application/pdf" });
  if (up.error) throw new Error(up.error.message);
  const { error } = await sb.from("materials").insert({ title, description: String(fd.get("description") ?? "").slice(0, 300) || null, storage_path: path });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/materiais");
  revalidatePath("/app/materiais");
});

export const deleteMaterial = wrap(async (fd) => {
  const sb = await db();
  const id = z.string().uuid().parse(fd.get("id"));
  const { data } = await sb.from("materials").select("storage_path").eq("id", id).single();
  if (data) await sb.storage.from("materiais").remove([data.storage_path]);
  await sb.from("materials").delete().eq("id", id);
  revalidatePath("/admin/materiais");
});

export const uploadImage = wrap(async (fd) => {
  const sb = await db();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Selecione uma imagem.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error("Envie JPG, PNG ou WebP de até 5 MB.");
  const path = `${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-")}`;
  const up = await sb.storage.from("imagens").upload(path, file, { contentType: file.type });
  if (up.error) throw new Error(up.error.message);
  const url = sb.storage.from("imagens").getPublicUrl(path).data.publicUrl;
  revalidatePath("/admin/imagens");
  return { ok: true, message: url };
});

export const deleteImage = wrap(async (fd) => {
  const sb = await db();
  const name = z.string().min(1).max(300).parse(fd.get("name"));
  await sb.storage.from("imagens").remove([name]);
  revalidatePath("/admin/imagens");
});
