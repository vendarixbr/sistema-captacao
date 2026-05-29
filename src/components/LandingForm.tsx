import { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Upload, X, Eye } from "lucide-react";

import type { LandingPage, LandingCopy, LandingImages } from "@/lib/types";
import { DEFAULT_COPY, DEFAULT_IMAGES, mergeCopy } from "@/lib/defaults";
import { createLandingPage, updateLandingPage, uploadLandingImage } from "@/lib/supabase";
import { parsePrompt, type ParseResult } from "@/lib/parsePrompt";
import { THEMES, type ThemeId } from "@/lib/themes";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LandingTemplate } from "@/components/LandingTemplate";

interface LandingFormProps {
  page?: LandingPage;
  mode: "new" | "edit";
}

type DeepPartialCopy = Partial<LandingCopy>;

export function LandingForm({ page, mode }: LandingFormProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [slug, setSlug] = useState(page?.slug ?? "");
  const [published, setPublished] = useState(page?.published ?? false);
  const [copy, setCopy] = useState<DeepPartialCopy>(page?.copy ?? {});
  const [images, setImages] = useState<LandingImages>(page?.images ?? {});
  const [theme, setTheme] = useState<ThemeId>((page?.theme as ThemeId) ?? "rose-gold");
  const [promptText, setPromptText] = useState("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "prompt" | "preview">("form");
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const fileRefs = {
    logo: useRef<HTMLInputElement>(null),
    hero: useRef<HTMLInputElement>(null),
    about: useRef<HTMLInputElement>(null),
  };

  // Deep update helper
  function updateCopy<K extends keyof LandingCopy>(section: K, field: string, value: unknown) {
    setCopy((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object ?? {}),
        [field]: value,
      },
    }));
  }

  function updateCard<K extends "diferenciais" | "servicos" | "depoimentos">(
    section: K,
    index: number,
    field: string,
    value: string,
  ) {
    setCopy((prev) => {
      const arr =
        section === "diferenciais"
          ? [...((prev.diferenciais?.cards ?? DEFAULT_COPY.diferenciais.cards) as object[])]
          : section === "servicos"
            ? [...((prev.servicos?.cards ?? DEFAULT_COPY.servicos.cards) as object[])]
            : [...((prev.depoimentos?.items ?? DEFAULT_COPY.depoimentos.items) as object[])];

      arr[index] = { ...arr[index], [field]: value };

      if (section === "diferenciais") {
        return { ...prev, diferenciais: { ...(prev.diferenciais ?? {}), cards: arr } };
      } else if (section === "servicos") {
        return { ...prev, servicos: { ...(prev.servicos ?? {}), cards: arr } };
      } else {
        return { ...prev, depoimentos: { ...(prev.depoimentos ?? {}), items: arr } };
      }
    });
  }

  function addCard(section: "diferenciais" | "servicos" | "depoimentos") {
    setCopy((prev) => {
      if (section === "diferenciais") {
        const cards = [...(prev.diferenciais?.cards ?? DEFAULT_COPY.diferenciais.cards), { kpi: "", title: "", desc: "" }];
        return { ...prev, diferenciais: { ...(prev.diferenciais ?? {}), cards } };
      } else if (section === "servicos") {
        const cards = [...(prev.servicos?.cards ?? DEFAULT_COPY.servicos.cards), { title: "", desc: "" }];
        return { ...prev, servicos: { ...(prev.servicos ?? {}), cards } };
      } else {
        const items = [...(prev.depoimentos?.items ?? DEFAULT_COPY.depoimentos.items), { text: "", author: "", role: "" }];
        return { ...prev, depoimentos: { ...(prev.depoimentos ?? {}), items } };
      }
    });
  }

  function removeCard(section: "diferenciais" | "servicos" | "depoimentos", index: number) {
    setCopy((prev) => {
      if (section === "diferenciais") {
        const cards = (prev.diferenciais?.cards ?? DEFAULT_COPY.diferenciais.cards).filter((_, i) => i !== index);
        return { ...prev, diferenciais: { ...(prev.diferenciais ?? {}), cards } };
      } else if (section === "servicos") {
        const cards = (prev.servicos?.cards ?? DEFAULT_COPY.servicos.cards).filter((_, i) => i !== index);
        return { ...prev, servicos: { ...(prev.servicos ?? {}), cards } };
      } else {
        const items = (prev.depoimentos?.items ?? DEFAULT_COPY.depoimentos.items).filter((_, i) => i !== index);
        return { ...prev, depoimentos: { ...(prev.depoimentos ?? {}), items } };
      }
    });
  }

  function handlePromptChange(text: string) {
    setPromptText(text);
    if (text.trim().length < 30) { setParseResult(null); return; }
    const result = parsePrompt(text);
    setParseResult(result);
  }

  function applyPrompt() {
    if (!parseResult) return;
    const { copy: parsed, slug: parsedSlug } = parseResult;

    setCopy((prev) => {
      const next = { ...prev };
      if (parsed.meta) next.meta = { ...(prev.meta as LandingCopy["meta"] ?? {}), ...parsed.meta } as LandingCopy["meta"];
      if (parsed.hero) next.hero = { ...(prev.hero as LandingCopy["hero"] ?? {}), ...parsed.hero } as LandingCopy["hero"];
      if (parsed.diferenciais) next.diferenciais = { ...(prev.diferenciais as LandingCopy["diferenciais"] ?? {}), ...parsed.diferenciais } as LandingCopy["diferenciais"];
      if (parsed.sobre) next.sobre = { ...(prev.sobre as LandingCopy["sobre"] ?? {}), ...parsed.sobre } as LandingCopy["sobre"];
      if (parsed.servicos) next.servicos = { ...(prev.servicos as LandingCopy["servicos"] ?? {}), ...parsed.servicos } as LandingCopy["servicos"];
      if (parsed.depoimentos) next.depoimentos = { ...(prev.depoimentos as LandingCopy["depoimentos"] ?? {}), ...parsed.depoimentos } as LandingCopy["depoimentos"];
      if (parsed.localizacao) next.localizacao = { ...(prev.localizacao as LandingCopy["localizacao"] ?? {}), ...parsed.localizacao } as LandingCopy["localizacao"];
      if (parsed.contato) next.contato = { ...(prev.contato as LandingCopy["contato"] ?? {}), ...parsed.contato } as LandingCopy["contato"];
      if (parsed.footer) next.footer = { ...(prev.footer as LandingCopy["footer"] ?? {}), ...parsed.footer } as LandingCopy["footer"];
      return next;
    });

    if (parsedSlug && !slug) setSlug(parsedSlug);
    setActiveTab("form");
    toast.success(`${parseResult.detected.length} campos preenchidos automaticamente.`);
  }

  // Image upload
  async function handleImageUpload(section: "logo" | "hero" | "about", file: File) {
    if (!slug) {
      toast.error("Defina o slug antes de fazer upload de imagens.");
      return;
    }
    setUploading((p) => ({ ...p, [section]: true }));
    try {
      const url = await uploadLandingImage(slug, section, file);
      setImages((prev) => ({ ...prev, [section]: url }));
      toast.success("Imagem enviada com sucesso.");
    } catch (err) {
      toast.error(`Erro ao enviar imagem: ${(err as Error).message}`);
    } finally {
      setUploading((p) => ({ ...p, [section]: false }));
    }
  }

  // Save
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!slug) throw new Error("O slug é obrigatório.");

      const payload = {
        slug: slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        published,
        copy: copy as LandingCopy,
        images,
        theme,
      };

      if (mode === "edit" && page) {
        return updateLandingPage(page.id, payload);
      } else {
        return createLandingPage(payload);
      }
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["landing-pages"] });
      toast.success(mode === "edit" ? "Página atualizada!" : "Página criada com sucesso!");
      if (mode === "new") {
        navigate({ to: "/admin/$id", params: { id: result.id } });
      }
    },
    onError: (err: Error) => {
      toast.error(`Erro ao salvar: ${err.message}`);
    },
  });

  const mergedCopy = mergeCopy(copy as Partial<LandingCopy>);
  const mergedImages = { ...DEFAULT_IMAGES, ...images };

  const diferencialCards = copy.diferenciais?.cards ?? DEFAULT_COPY.diferenciais.cards;
  const servicoCards = copy.servicos?.cards ?? DEFAULT_COPY.servicos.cards;
  const depoimentoItems = copy.depoimentos?.items ?? DEFAULT_COPY.depoimentos.items;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-dark">
            {mode === "edit" ? `Editar /${page?.slug}` : "Nova Página"}
          </h1>
          <p className="text-text-muted text-sm font-light mt-1">
            {mode === "edit"
              ? "Atualize o conteúdo da landing page."
              : "Configure e personalize uma nova landing page."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {mode === "edit" && (
            <a
              href={`/${page?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm text-text-muted hover:text-dark hover:border-dark transition-colors"
            >
              <Eye size={15} />
              Preview
            </a>
          )}
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            {saveMutation.isPending
              ? "Salvando..."
              : mode === "edit"
                ? "Salvar alterações"
                : "Criar página"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8">
        {(["form", "prompt", "preview"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-dark"
            }`}
          >
            {tab === "form" ? "Formulário" : tab === "prompt" ? "Prompt de Copy" : "Preview"}
          </button>
        ))}
      </div>

      {/* PROMPT TAB */}
      {activeTab === "prompt" && (
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Textarea */}
          <div className="space-y-3">
            <p className="text-sm text-text-muted font-light">
              Cole o prompt de copy completo. O sistema detecta e preenche os campos automaticamente em tempo real.
            </p>
            <Textarea
              value={promptText}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder={"🔝 HEADER / NAVEGAÇÃO\nLogo: Dra. Lara Ganem — Ginecologia e Obstetrícia\nCRM MG 90916 · RQE 54639\n\n📌 SEÇÃO 1 — HERO\nTag/Label: Ginecologia Clínica & Pré-natal\nHeadline:\nCuidado especializado para cada fase da sua vida\n..."}
              className="min-h-[500px] font-mono text-sm resize-none"
            />
            <Button
              onClick={applyPrompt}
              disabled={!parseResult || parseResult.detected.length === 0}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              Aplicar {parseResult ? `${parseResult.detected.length} campos` : ""} ao formulário →
            </Button>
          </div>

          {/* Live preview of detected fields */}
          <div className="sticky top-6 space-y-4">
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="bg-muted/60 px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-medium text-dark">Campos detectados</span>
                {parseResult && (
                  <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">
                    {parseResult.detected.length} encontrados
                  </span>
                )}
              </div>

              {!parseResult || parseResult.detected.length === 0 ? (
                <div className="p-6 text-center text-text-muted text-sm font-light">
                  Cole o prompt ao lado para ver os campos detectados aqui.
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Slug sugerido */}
                  {parseResult.slug && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs font-medium text-primary mb-1">Slug sugerido</p>
                      <p className="font-mono text-sm text-dark">/{parseResult.slug}</p>
                    </div>
                  )}

                  {/* Lista de campos */}
                  <ul className="space-y-1.5">
                    {parseResult.detected.map((field) => (
                      <li key={field} className="flex items-center gap-2 text-sm text-dark">
                        <span className="text-green-500 shrink-0">✓</span>
                        {field}
                      </li>
                    ))}
                  </ul>

                  {/* Dados chave extraídos */}
                  {parseResult.copy.meta && (
                    <div className="border-t border-border pt-3 space-y-1 text-xs text-text-muted font-light">
                      {parseResult.copy.meta.doctorName && <p><span className="font-medium text-dark">Nome:</span> {parseResult.copy.meta.doctorName}</p>}
                      {parseResult.copy.meta.specialty && <p><span className="font-medium text-dark">Especialidade:</span> {parseResult.copy.meta.specialty}</p>}
                      {parseResult.copy.meta.crm && <p><span className="font-medium text-dark">CRM:</span> {parseResult.copy.meta.crm}</p>}
                      {parseResult.copy.meta.whatsapp && <p><span className="font-medium text-dark">WhatsApp:</span> {parseResult.copy.meta.whatsapp}</p>}
                    </div>
                  )}
                  {(parseResult.copy.servicos?.cards?.length ?? 0) > 0 && (
                    <p className="text-xs text-text-muted"><span className="font-medium text-dark">{parseResult.copy.servicos!.cards!.length} serviços</span> detectados</p>
                  )}
                  {(parseResult.copy.depoimentos?.items?.length ?? 0) > 0 && (
                    <p className="text-xs text-text-muted"><span className="font-medium text-dark">{parseResult.copy.depoimentos!.items!.length} depoimentos</span> detectados</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW TAB */}
      {activeTab === "preview" && (
        <div className="border border-border rounded-xl overflow-hidden shadow-soft">
          <LandingTemplate copy={mergedCopy} images={mergedImages} theme={theme} />
        </div>
      )}

      {/* FORM TAB */}
      {activeTab === "form" && (
        <div className="space-y-6">
          {/* Configurações Gerais — always visible */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-card">
            <h2 className="font-display text-xl text-dark mb-5">Configurações Gerais</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="slug">Slug (URL da página)</Label>
                <div className="flex items-center mt-1.5">
                  <span className="px-3 py-2 bg-muted border border-r-0 border-input rounded-l-md text-text-muted text-sm">
                    /
                  </span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
                    }
                    placeholder="dra-juliana-silva"
                    className="rounded-l-none"
                    disabled={mode === "edit"}
                  />
                </div>
                {mode === "edit" && (
                  <p className="text-xs text-text-muted mt-1 font-light">
                    O slug não pode ser alterado após criação.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="doctorName">Nome da Médica</Label>
                <Input
                  id="doctorName"
                  value={(copy.meta as LandingCopy["meta"] | undefined)?.doctorName ?? ""}
                  onChange={(e) => updateCopy("meta", "doctorName", e.target.value)}
                  placeholder={DEFAULT_COPY.meta.doctorName}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="specialty">Especialidade</Label>
                <Input
                  id="specialty"
                  value={(copy.meta as LandingCopy["meta"] | undefined)?.specialty ?? ""}
                  onChange={(e) => updateCopy("meta", "specialty", e.target.value)}
                  placeholder={DEFAULT_COPY.meta.specialty}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="crm">CRM</Label>
                <Input
                  id="crm"
                  value={(copy.meta as LandingCopy["meta"] | undefined)?.crm ?? ""}
                  onChange={(e) => updateCopy("meta", "crm", e.target.value)}
                  placeholder={DEFAULT_COPY.meta.crm}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp (somente números)</Label>
                <Input
                  id="whatsapp"
                  value={(copy.meta as LandingCopy["meta"] | undefined)?.whatsapp ?? ""}
                  onChange={(e) => updateCopy("meta", "whatsapp", e.target.value)}
                  placeholder={DEFAULT_COPY.meta.whatsapp}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram (@ handle)</Label>
                <Input
                  id="instagram"
                  value={(copy.meta as LandingCopy["meta"] | undefined)?.instagram ?? ""}
                  onChange={(e) => updateCopy("meta", "instagram", e.target.value)}
                  placeholder={DEFAULT_COPY.meta.instagram}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="instagramUrl">Instagram URL</Label>
                <Input
                  id="instagramUrl"
                  value={(copy.meta as LandingCopy["meta"] | undefined)?.instagramUrl ?? ""}
                  onChange={(e) => updateCopy("meta", "instagramUrl", e.target.value)}
                  placeholder={DEFAULT_COPY.meta.instagramUrl}
                  className="mt-1.5"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
                <Label htmlFor="published" className="cursor-pointer">
                  {published ? "Publicada (visível ao público)" : "Rascunho (não visível)"}
                </Label>
              </div>
            </div>
          </div>

          {/* Theme picker */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-card">
            <h2 className="font-display text-xl text-dark mb-2">Tema Visual</h2>
            <p className="font-sans text-sm text-text-muted font-light mb-5">Escolha o conjunto de cores da landing page.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as ThemeId)}
                  className={`group relative rounded-xl border-2 overflow-hidden transition-all duration-200 ${theme === t.id ? "border-primary shadow-md" : "border-border hover:border-primary/40"}`}
                >
                  {/* Color preview */}
                  <div className="h-14 relative" style={{ backgroundColor: t.preview.bg }}>
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${t.preview.primary}40 0%, ${t.preview.secondary}30 100%)` }} />
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                      <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: t.preview.primary }} />
                      <div className="h-1.5 w-4 rounded-full" style={{ backgroundColor: t.preview.secondary }} />
                    </div>
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="font-sans text-[11px] font-medium text-dark text-left truncate">{t.name}</p>
                  </div>
                  {theme === t.id && (
                    <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white text-[9px]">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Images — always visible */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-card">
            <h2 className="font-display text-xl text-dark mb-5">Imagens</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {(["logo", "hero", "about"] as const).map((section) => {
                const labels: Record<string, string> = {
                  logo: "Logo",
                  hero: "Foto Hero (principal)",
                  about: "Foto Sobre",
                };
                return (
                  <div key={section}>
                    <Label>{labels[section]}</Label>
                    <div className="mt-2 border border-dashed border-border rounded-xl p-4 text-center">
                      {images[section] ? (
                        <div className="relative">
                          <img
                            src={images[section]!}
                            alt={labels[section]}
                            className="w-full h-28 object-cover rounded-lg mb-2"
                          />
                          <button
                            onClick={() => setImages((p) => ({ ...p, [section]: null }))}
                            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm border border-border hover:bg-destructive hover:text-white transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="h-28 flex flex-col items-center justify-center text-text-muted/50">
                          <Upload size={24} className="mb-2" />
                          <p className="text-xs font-light">Sem imagem</p>
                        </div>
                      )}
                      <input
                        ref={fileRefs[section]}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(section, file);
                        }}
                      />
                      <button
                        onClick={() => fileRefs[section].current?.click()}
                        disabled={uploading[section]}
                        className="mt-2 text-xs px-3 py-1.5 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                      >
                        {uploading[section] ? "Enviando..." : "Upload"}
                      </button>
                      <p className="text-[10px] text-text-muted font-light mt-1">
                        Ou use a imagem padrão do template
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Accordion sections */}
          <div className="bg-white border border-border rounded-xl shadow-card overflow-hidden">
            <Accordion type="multiple" className="divide-y divide-border">

              {/* HERO */}
              <AccordionItem value="hero" className="px-6">
                <AccordionTrigger>Hero</AccordionTrigger>
                <AccordionContent>
                  <div className="grid sm:grid-cols-2 gap-4 pb-2">
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={(copy.hero as LandingCopy["hero"] | undefined)?.label ?? ""}
                        onChange={(e) => updateCopy("hero", "label", e.target.value)}
                        placeholder={DEFAULT_COPY.hero.label}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Headline</Label>
                      <Input
                        value={(copy.hero as LandingCopy["hero"] | undefined)?.headline ?? ""}
                        onChange={(e) => updateCopy("hero", "headline", e.target.value)}
                        placeholder={DEFAULT_COPY.hero.headline}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Subtítulo</Label>
                      <Textarea
                        value={(copy.hero as LandingCopy["hero"] | undefined)?.subtitle ?? ""}
                        onChange={(e) => updateCopy("hero", "subtitle", e.target.value)}
                        placeholder={DEFAULT_COPY.hero.subtitle}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Texto do Botão 1</Label>
                      <Input
                        value={(copy.hero as LandingCopy["hero"] | undefined)?.cta1 ?? ""}
                        onChange={(e) => updateCopy("hero", "cta1", e.target.value)}
                        placeholder={DEFAULT_COPY.hero.cta1}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Texto do Botão 2</Label>
                      <Input
                        value={(copy.hero as LandingCopy["hero"] | undefined)?.cta2 ?? ""}
                        onChange={(e) => updateCopy("hero", "cta2", e.target.value)}
                        placeholder={DEFAULT_COPY.hero.cta2}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* DIFERENCIAIS */}
              <AccordionItem value="diferenciais" className="px-6">
                <AccordionTrigger>Diferenciais</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-2">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Label</Label>
                        <Input
                          value={(copy.diferenciais as LandingCopy["diferenciais"] | undefined)?.label ?? ""}
                          onChange={(e) => updateCopy("diferenciais", "label", e.target.value)}
                          placeholder={DEFAULT_COPY.diferenciais.label}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Headline</Label>
                        <Input
                          value={(copy.diferenciais as LandingCopy["diferenciais"] | undefined)?.headline ?? ""}
                          onChange={(e) => updateCopy("diferenciais", "headline", e.target.value)}
                          placeholder={DEFAULT_COPY.diferenciais.headline}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Cards</Label>
                      {diferencialCards.map((card, i) => (
                        <div key={i} className="border border-border rounded-lg p-4 relative">
                          <button
                            onClick={() => removeCard("diferenciais", i)}
                            className="absolute top-2 right-2 p-1 text-text-muted hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">KPI</Label>
                              <Input
                                value={card.kpi}
                                onChange={(e) => updateCard("diferenciais", i, "kpi", e.target.value)}
                                placeholder="40+"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Título</Label>
                              <Input
                                value={card.title}
                                onChange={(e) => updateCard("diferenciais", i, "title", e.target.value)}
                                placeholder="Título"
                                className="mt-1"
                              />
                            </div>
                            <div className="col-span-3">
                              <Label className="text-xs">Descrição</Label>
                              <Input
                                value={card.desc}
                                onChange={(e) => updateCard("diferenciais", i, "desc", e.target.value)}
                                placeholder="Descrição"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCard("diferenciais")}
                        className="w-full"
                      >
                        <Plus size={14} className="mr-1" /> Adicionar card
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* SOBRE */}
              <AccordionItem value="sobre" className="px-6">
                <AccordionTrigger>Sobre</AccordionTrigger>
                <AccordionContent>
                  <div className="grid sm:grid-cols-2 gap-4 pb-2">
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={(copy.sobre as LandingCopy["sobre"] | undefined)?.label ?? ""}
                        onChange={(e) => updateCopy("sobre", "label", e.target.value)}
                        placeholder={DEFAULT_COPY.sobre.label}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Headline</Label>
                      <Input
                        value={(copy.sobre as LandingCopy["sobre"] | undefined)?.headline ?? ""}
                        onChange={(e) => updateCopy("sobre", "headline", e.target.value)}
                        placeholder={DEFAULT_COPY.sobre.headline}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Texto</Label>
                      <Textarea
                        value={(copy.sobre as LandingCopy["sobre"] | undefined)?.text ?? ""}
                        onChange={(e) => updateCopy("sobre", "text", e.target.value)}
                        placeholder={DEFAULT_COPY.sobre.text}
                        className="mt-1.5 min-h-[100px]"
                      />
                    </div>
                    <div>
                      <Label>Texto do Botão</Label>
                      <Input
                        value={(copy.sobre as LandingCopy["sobre"] | undefined)?.cta ?? ""}
                        onChange={(e) => updateCopy("sobre", "cta", e.target.value)}
                        placeholder={DEFAULT_COPY.sobre.cta}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* SERVIÇOS */}
              <AccordionItem value="servicos" className="px-6">
                <AccordionTrigger>Serviços</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-2">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label>Label</Label>
                        <Input
                          value={(copy.servicos as LandingCopy["servicos"] | undefined)?.label ?? ""}
                          onChange={(e) => updateCopy("servicos", "label", e.target.value)}
                          placeholder={DEFAULT_COPY.servicos.label}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Headline</Label>
                        <Input
                          value={(copy.servicos as LandingCopy["servicos"] | undefined)?.headline ?? ""}
                          onChange={(e) => updateCopy("servicos", "headline", e.target.value)}
                          placeholder={DEFAULT_COPY.servicos.headline}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Subtítulo</Label>
                        <Input
                          value={(copy.servicos as LandingCopy["servicos"] | undefined)?.subtitle ?? ""}
                          onChange={(e) => updateCopy("servicos", "subtitle", e.target.value)}
                          placeholder={DEFAULT_COPY.servicos.subtitle}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Cards (máx. 6)</Label>
                      {servicoCards.slice(0, 6).map((card, i) => (
                        <div key={i} className="border border-border rounded-lg p-4 relative">
                          <button
                            onClick={() => removeCard("servicos", i)}
                            className="absolute top-2 right-2 p-1 text-text-muted hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Título</Label>
                              <Input
                                value={card.title}
                                onChange={(e) => updateCard("servicos", i, "title", e.target.value)}
                                placeholder="Nome do serviço"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Descrição</Label>
                              <Input
                                value={card.desc}
                                onChange={(e) => updateCard("servicos", i, "desc", e.target.value)}
                                placeholder="Breve descrição"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {servicoCards.length < 6 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addCard("servicos")}
                          className="w-full"
                        >
                          <Plus size={14} className="mr-1" /> Adicionar serviço
                        </Button>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* DEPOIMENTOS */}
              <AccordionItem value="depoimentos" className="px-6">
                <AccordionTrigger>Depoimentos</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-2">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label>Label</Label>
                        <Input
                          value={(copy.depoimentos as LandingCopy["depoimentos"] | undefined)?.label ?? ""}
                          onChange={(e) => updateCopy("depoimentos", "label", e.target.value)}
                          placeholder={DEFAULT_COPY.depoimentos.label}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Headline</Label>
                        <Input
                          value={(copy.depoimentos as LandingCopy["depoimentos"] | undefined)?.headline ?? ""}
                          onChange={(e) => updateCopy("depoimentos", "headline", e.target.value)}
                          placeholder={DEFAULT_COPY.depoimentos.headline}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Subtítulo</Label>
                        <Input
                          value={(copy.depoimentos as LandingCopy["depoimentos"] | undefined)?.subtitle ?? ""}
                          onChange={(e) => updateCopy("depoimentos", "subtitle", e.target.value)}
                          placeholder={DEFAULT_COPY.depoimentos.subtitle}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Depoimentos (máx. 5)</Label>
                      {depoimentoItems.slice(0, 5).map((item, i) => (
                        <div key={i} className="border border-border rounded-lg p-4 relative">
                          <button
                            onClick={() => removeCard("depoimentos", i)}
                            className="absolute top-2 right-2 p-1 text-text-muted hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                              <Label className="text-xs">Texto</Label>
                              <Textarea
                                value={item.text}
                                onChange={(e) => updateCard("depoimentos", i, "text", e.target.value)}
                                placeholder="O que a paciente disse..."
                                className="mt-1 min-h-[70px]"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Autora</Label>
                              <Input
                                value={item.author}
                                onChange={(e) => updateCard("depoimentos", i, "author", e.target.value)}
                                placeholder="Nome"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Função / Contexto</Label>
                              <Input
                                value={item.role}
                                onChange={(e) => updateCard("depoimentos", i, "role", e.target.value)}
                                placeholder="Paciente há 2 anos"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {depoimentoItems.length < 5 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addCard("depoimentos")}
                          className="w-full"
                        >
                          <Plus size={14} className="mr-1" /> Adicionar depoimento
                        </Button>
                      )}
                    </div>
                    <div>
                      <Label>Rodapé dos depoimentos</Label>
                      <Input
                        value={(copy.depoimentos as LandingCopy["depoimentos"] | undefined)?.footer ?? ""}
                        onChange={(e) => updateCopy("depoimentos", "footer", e.target.value)}
                        placeholder={DEFAULT_COPY.depoimentos.footer}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* LOCALIZAÇÃO */}
              <AccordionItem value="localizacao" className="px-6">
                <AccordionTrigger>Localização</AccordionTrigger>
                <AccordionContent>
                  <div className="grid sm:grid-cols-2 gap-4 pb-2">
                    {(
                      [
                        ["label", "Label", DEFAULT_COPY.localizacao.label],
                        ["headline", "Headline", DEFAULT_COPY.localizacao.headline],
                        ["subtitle", "Subtítulo", DEFAULT_COPY.localizacao.subtitle],
                        ["buildingName", "Nome do Edifício (opcional)", ""],
                        ["address", "Endereço", DEFAULT_COPY.localizacao.address],
                        ["city", "Cidade / CEP", DEFAULT_COPY.localizacao.city],
                        ["hours", "Horários", DEFAULT_COPY.localizacao.hours],
                        ["phone", "Telefone", DEFAULT_COPY.localizacao.phone],
                      ] as const
                    ).map(([field, label, placeholder]) => (
                      <div key={field} className={field === "subtitle" || field === "hours" ? "sm:col-span-2" : ""}>
                        <Label>{label}</Label>
                        <Input
                          value={(copy.localizacao as LandingCopy["localizacao"] | undefined)?.[field] ?? ""}
                          onChange={(e) => updateCopy("localizacao", field, e.target.value)}
                          placeholder={placeholder}
                          className="mt-1.5"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <Label>URL do Mapa Embed (Google Maps)</Label>
                      <Input
                        value={(copy.localizacao as LandingCopy["localizacao"] | undefined)?.mapsEmbed ?? ""}
                        onChange={(e) => updateCopy("localizacao", "mapsEmbed", e.target.value)}
                        placeholder={DEFAULT_COPY.localizacao.mapsEmbed}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* CONTATO */}
              <AccordionItem value="contato" className="px-6">
                <AccordionTrigger>Contato</AccordionTrigger>
                <AccordionContent>
                  <div className="grid sm:grid-cols-2 gap-4 pb-2">
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={(copy.contato as LandingCopy["contato"] | undefined)?.label ?? ""}
                        onChange={(e) => updateCopy("contato", "label", e.target.value)}
                        placeholder={DEFAULT_COPY.contato.label}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Headline</Label>
                      <Input
                        value={(copy.contato as LandingCopy["contato"] | undefined)?.headline ?? ""}
                        onChange={(e) => updateCopy("contato", "headline", e.target.value)}
                        placeholder={DEFAULT_COPY.contato.headline}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Subtítulo</Label>
                      <Textarea
                        value={(copy.contato as LandingCopy["contato"] | undefined)?.subtitle ?? ""}
                        onChange={(e) => updateCopy("contato", "subtitle", e.target.value)}
                        placeholder={DEFAULT_COPY.contato.subtitle}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Texto do Botão</Label>
                      <Input
                        value={(copy.contato as LandingCopy["contato"] | undefined)?.cta ?? ""}
                        onChange={(e) => updateCopy("contato", "cta", e.target.value)}
                        placeholder={DEFAULT_COPY.contato.cta}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* FOOTER */}
              <AccordionItem value="footer" className="px-6">
                <AccordionTrigger>Footer</AccordionTrigger>
                <AccordionContent>
                  <div className="pb-2">
                    <Label>Tagline</Label>
                    <Input
                      value={(copy.footer as LandingCopy["footer"] | undefined)?.tagline ?? ""}
                      onChange={(e) => updateCopy("footer", "tagline", e.target.value)}
                      placeholder={DEFAULT_COPY.footer.tagline}
                      className="mt-1.5"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Save button at bottom */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-primary hover:bg-primary-dark text-white px-8"
            >
              {saveMutation.isPending
                ? "Salvando..."
                : mode === "edit"
                  ? "Salvar alterações"
                  : "Criar página"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
