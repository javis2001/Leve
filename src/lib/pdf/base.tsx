import path from "node:path";
import { Circle, Document, Font, Page, Path, Rect, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";

const fontDir = path.join(process.cwd(), "public", "fonts");
let registered = false;
export function registerFonts() {
  if (registered) return;
  Font.register({
    family: "Manrope",
    fonts: [
      { src: path.join(fontDir, "manrope-latin-400-normal.woff"), fontWeight: 400 },
      { src: path.join(fontDir, "manrope-latin-600-normal.woff"), fontWeight: 600 },
      { src: path.join(fontDir, "manrope-latin-700-normal.woff"), fontWeight: 700 },
      { src: path.join(fontDir, "manrope-latin-800-normal.woff"), fontWeight: 800 },
    ],
  });
  Font.register({
    family: "Playfair",
    fonts: [
      { src: path.join(fontDir, "playfair-display-latin-500-normal.woff"), fontWeight: 500 },
      { src: path.join(fontDir, "playfair-display-latin-600-normal.woff"), fontWeight: 600 },
      { src: path.join(fontDir, "playfair-display-latin-700-normal.woff"), fontWeight: 700 },
      { src: path.join(fontDir, "playfair-display-latin-500-italic.woff"), fontWeight: 500, fontStyle: "italic" },
    ],
  });
  Font.registerHyphenationCallback((w) => [w]);
  registered = true;
}

export const C = {
  emerald: "#138A65",
  forest: "#0B6249",
  mint: "#E8F6EF",
  cream: "#FFF9F1",
  gold: "#D6B36A",
  goldDeep: "#9A7A32",
  goldSoft: "#F4E8CC",
  ink: "#20352D",
  muted: "#5B6F66",
  line: "#DCE5E0",
};

export const s = StyleSheet.create({
  page: { fontFamily: "Manrope", fontSize: 10.5, color: C.ink, paddingTop: 54, paddingBottom: 56, paddingHorizontal: 46, lineHeight: 1.5, backgroundColor: "#FFFFFF" },
  header: { position: "absolute", top: 22, left: 46, right: 46, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: C.muted, borderBottomWidth: 0.5, borderBottomColor: C.line, paddingBottom: 6 },
  footer: { position: "absolute", top: 806, left: 46, right: 46, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: C.muted },
  h1: { fontFamily: "Playfair", fontWeight: 600, fontSize: 24, color: C.forest, marginBottom: 8, lineHeight: 1.2 },
  h2: { minPresenceAhead: 60, fontFamily: "Playfair", fontWeight: 600, fontSize: 17, color: C.forest, marginTop: 14, marginBottom: 6, lineHeight: 1.25 },
  h3: { minPresenceAhead: 30, fontWeight: 700, fontSize: 11.5, color: C.ink, marginTop: 8, marginBottom: 3 },
  eyebrow: { fontSize: 8, fontWeight: 800, color: C.emerald, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 3 },
  p: { marginBottom: 6 },
  muted: { color: C.muted },
  small: { fontSize: 8.5, color: C.muted },
  card: { backgroundColor: C.mint, borderRadius: 8, padding: 12, marginBottom: 10 },
  cardGold: { backgroundColor: C.goldSoft, borderRadius: 8, padding: 12, marginBottom: 10 },
  bulletRow: { flexDirection: "row", marginBottom: 3 },
  bullet: { width: 12, color: C.emerald, fontWeight: 800 },
  box: { width: 10, height: 10, borderWidth: 1, borderColor: C.emerald, borderRadius: 2, marginRight: 6, marginTop: 2 },
  line: { borderBottomWidth: 0.7, borderBottomColor: C.line, height: 20 },
});

export function Bullets({ items, numbered = false }: { items: string[]; numbered?: boolean }) {
  return (
    <View>
      {items.map((it, i) => (
        <View key={i} style={s.bulletRow} wrap={false}>
          <Text style={s.bullet}>{numbered ? `${i + 1}.` : "•"}</Text>
          <Text style={{ flex: 1 }}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

export function Checks({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: "row", marginBottom: 4 }} wrap={false}>
          <View style={s.box} />
          <Text style={{ flex: 1 }}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

export function LogoPdf({ size = 44, light = false }: { size?: number; light?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width="48" height="48" rx="14" fill={light ? "#FFFFFF" : C.emerald} />
      <Path d="M11 34c6.5 0 11.5-2.6 15.6-8.2" stroke={C.gold} strokeWidth={2.6} fill="none" />
      <Path d="M24.2 27.6c-1.3-8.4 3.3-14.7 13.6-16.4.9 10.6-4.6 16.8-13.6 16.4Z" fill={light ? C.emerald : "#FFFFFF"} />
      <Path d="M25.3 26.4c2.6-4.3 5.8-7.6 9.6-10" stroke={light ? "#FFFFFF" : C.emerald} strokeWidth={1.6} fill="none" />
      <Circle cx="11" cy="34" r="2.2" fill={C.gold} />
    </Svg>
  );
}

export function Cover({ title, subtitle, eyebrow, note }: { title: string; subtitle: string; eyebrow: string; note?: string }) {
  return (
    <Page size="A4" style={{ fontFamily: "Manrope", backgroundColor: C.forest, color: "#FFFFFF" }}>
      <View style={{ position: "absolute", top: 0, left: 0 }}>
      <Svg width={595} height={835}>
        <Circle cx="520" cy="120" r="190" fill={C.emerald} opacity={0.55} />
        <Circle cx="60" cy="780" r="140" fill={C.emerald} opacity={0.35} />
        <Path d="M40 640 C 200 640, 330 560, 430 420" stroke={C.gold} strokeWidth={3} fill="none" opacity={0.9} />
        <Circle cx="40" cy="640" r="7" fill={C.gold} />
      </Svg>
      </View>
      <View style={{ position: "absolute", top: 56, left: 56, right: 56, bottom: 56 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <LogoPdf size={46} light />
        <Text style={{ fontFamily: "Playfair", fontWeight: 600, fontSize: 20, marginLeft: 12 }}>
          Vida <Text style={{ color: C.gold, fontStyle: "italic", fontWeight: 500 }}>Leve</Text>
        </Text>
      </View>
      <View style={{ marginTop: 210 }}>
        <Text style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: C.gold, textTransform: "uppercase" }}>{eyebrow}</Text>
        <Text style={{ fontFamily: "Playfair", fontWeight: 600, fontSize: 40, lineHeight: 1.12, marginTop: 10 }}>{title}</Text>
        <Text style={{ fontSize: 13, marginTop: 14, color: "#DDEFE6", lineHeight: 1.5, maxWidth: 400 }}>{subtitle}</Text>
      </View>
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <Text style={{ fontSize: 9, color: "#BFDCCF" }}>{note ?? "Material educativo do programa Vida Leve. Não substitui orientação de profissionais de saúde."}</Text>
      </View>
      </View>
    </Page>
  );
}

export function ContentPage({ title, children, size = "A4", orientation = "portrait" }: { title: string; children: ReactNode; size?: "A4"; orientation?: "portrait" | "landscape" }) {
  return (
    <Page size={size} orientation={orientation} style={s.page} wrap>
      <View style={s.header} fixed>
        <Text>Vida Leve</Text>
        <Text>{title}</Text>
      </View>
      <View style={[s.footer, { top: orientation === "landscape" ? 560 : 806 }]} fixed>
        <Text>Material educativo · uso pessoal</Text>
        <Text fixed render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
      </View>
      {children}
    </Page>
  );
}

export function Doc({ title, children }: { title: string; children: ReactNode }) {
  registerFonts();
  return (
    <Document title={`Vida Leve — ${title}`} author="Vida Leve" subject={title} language="pt-BR" creator="Vida Leve">
      {children}
    </Document>
  );
}
