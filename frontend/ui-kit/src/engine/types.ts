/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import type { Lang } from "./highlight";
import type { RichText } from "./Rich";

export const GROUPS = [
  { id: "base", title: "Основа" },
  { id: "actions", title: "Действия" },
  { id: "fields", title: "Поля" },
  { id: "tables", title: "Таблицы" },
  { id: "navigation", title: "Навигация" },
  { id: "feedback", title: "Обратная связь" },
  { id: "overlays", title: "Окна и панели" },
  { id: "people", title: "Люди" },
  { id: "time", title: "Время" },
  { id: "data", title: "Данные" },
] as const;

export type GroupId = (typeof GROUPS)[number]["id"];

export type Origin = "mockup" | "proposal";

export interface AnatomyPart {
  name: string;
  description: RichText;
  optional?: boolean;
}

export interface Anatomy {
  demo?: ReactNode;
  stageMinHeight?: number;
  parts: AnatomyPart[];
}

export interface VariantSpec {
  id: string;
  title: string;
  description: RichText;
  when?: RichText;
  demo: ReactNode;
  wide?: boolean;
  stageMinHeight?: number;
}

export interface SizeSpec {
  id: string;
  title: string;
  value: string;
  note?: RichText;
  demo: ReactNode;
  stageMinHeight?: number;
}

export type StateKind =
  | "default"
  | "hover"
  | "active"
  | "focus"
  | "disabled"
  | "loading"
  | "error"
  | "empty"
  | "selected"
  | "other";

export interface StateSpec {
  id: string;
  kind: StateKind;
  title: string;
  note: RichText;
  forced?: boolean;
  notApplicable?: boolean;
  demo?: ReactNode;
  wide?: boolean;
  stageMinHeight?: number;
}

export interface StateMatrix {
  columns: string[];
  rows: { label: string; cells: ReactNode[] }[];
}

export interface RulesSpec {
  use: RichText[];
  avoid: RichText[];
}

export type A11yKind = "key" | "aria" | "focus" | "contrast" | "motion" | "note";

export interface A11ySpec {
  kind: A11yKind;
  title: string;
  text: RichText;
}

export type TokenKind = "color" | "size" | "radius" | "time" | "ease" | "font" | "shadow" | "other";

export interface TokenSpec {
  name: string;
  value: string;
  usage: RichText;
  kind?: TokenKind;
}

export interface ChoreographyStep {
  at: number;
  dur: number;
  what: RichText;
  prop?: string;
  easing?: string;
}

export interface ChoreographySpec {
  id: string;
  title: string;
  trigger: RichText;
  steps: ChoreographyStep[];
  focus: RichText;
  reducedMotion: RichText;
  neighbours: RichText;
  origin: Origin;
  demo?: ReactNode;
}

export interface ExampleSpec {
  id: string;
  title: string;
  description?: RichText;
  demo: ReactNode;
  code?: string;
  lang?: Lang;
  stageMinHeight?: number;
}

export interface ExtraSection {
  id: string;
  title: string;
  content: ReactNode;
}

export interface DocSpec {
  id: string;
  title: string;
  group: GroupId;
  summary: string;
  purpose?: RichText;
  foundation?: boolean;
  cssPrefix: string;
  order?: number;
  keywords?: string[];
  anatomy: Anatomy;
  wideDemos?: { variants?: boolean; states?: boolean };
  variants: VariantSpec[];
  sizes?: SizeSpec[];
  extra?: ExtraSection[];
  states: StateSpec[];
  stateMatrix?: StateMatrix;
  rules: RulesSpec;
  a11y: A11ySpec[];
  tokens: TokenSpec[];
  choreography: ChoreographySpec[];
  examples: ExampleSpec[];
  related?: string[];
}

export interface PlannedSpec {
  id: string;
  title: string;
  group: GroupId;
  summary?: string;
  keywords?: string[];
}

export function defineDoc(doc: DocSpec): DocSpec {
  return doc;
}
