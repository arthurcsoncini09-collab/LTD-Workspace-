'use client';

import { useState } from 'react';
import { Check, Lock, Users, X } from 'lucide-react';
import {
  CHARACTERS,
  DEFAULT_PLAYER_LOOK,
  PLAYER_ACCESSORIES,
  PLAYER_HAIR_COLORS,
  PLAYER_HAIR_STYLES,
  PLAYER_SHIRTS,
  PLAYER_SKINS,
  type AvatarLook,
  type Character,
  type CharacterId,
  type PlayerProfile,
} from '@/lib/simulacao/characters';
import { AREAS, LEVELS } from '@/lib/simulacao/levels';
import { Avatar, FaceAvatar } from './avatar';
import { simActions, type SimProgress } from './sim-progress';

// ---------------------------------------------------------------------------
// Criação do personagem do jogador

function Swatches({ colors, value, onChange, label }: { colors: string[]; value: string; onChange: (c: string) => void; label: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-400">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-label={`${label}: ${color}`}
            aria-pressed={value === color}
            className={`h-8 w-8 rounded-full border-2 transition ${value === color ? 'border-cyan-300 ring-2 ring-cyan-400/40' : 'border-slate-700 hover:border-slate-500'}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </fieldset>
  );
}

function Choices<T extends string>({ options, value, onChange, label }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-400">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={value === option.id}
            className={`rounded-lg border px-3 py-1.5 text-xs transition ${
              value === option.id ? 'border-cyan-300 bg-cyan-400/15 text-white' : 'border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function CharacterCreator({ initial, onDone }: { initial?: PlayerProfile; onDone: () => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [look, setLook] = useState<AvatarLook>(initial?.look ?? DEFAULT_PLAYER_LOOK);
  const set = <K extends keyof AvatarLook>(key: K) => (value: AvatarLook[K]) => setLook((l) => ({ ...l, [key]: value }));

  return (
    <section className="card-surface rounded-xl p-6 sm:p-8" aria-labelledby="criar-personagem">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-blue-400">Seu personagem</div>
          <h2 id="criar-personagem" className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {initial ? 'Editar personagem' : 'Quem é o(a) novo(a) estagiário(a)?'}
          </h2>
          <p className="mt-2 text-sm text-slate-300">Os mentores vão te chamar pelo nome durante a carreira.</p>
        </div>
        {initial ? (
          <button type="button" onClick={onDone} aria-label="Fechar" className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <form
        className="mt-6 grid gap-6 lg:grid-cols-[auto_1fr]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          simActions.setPlayer({ name, look });
          onDone();
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <FaceAvatar look={look} size={144} title="Prévia do seu personagem" />
          <div className="text-center">
            <div className="font-semibold text-white">{name.trim() || 'Seu nome'}</div>
            <div className="text-xs text-slate-400">Estagiário(a) de TI</div>
          </div>
        </div>

        <div className="space-y-5">
          <label className="block text-sm text-slate-300">
            Nome
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="Como você quer ser chamado(a)?"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-cyan-400/60 focus:outline-none"
            />
          </label>
          <Swatches label="Tom de pele" colors={PLAYER_SKINS} value={look.skin} onChange={set('skin')} />
          <Choices label="Cabelo" options={PLAYER_HAIR_STYLES} value={look.hairStyle} onChange={set('hairStyle')} />
          <Swatches label="Cor do cabelo" colors={PLAYER_HAIR_COLORS} value={look.hair} onChange={set('hair')} />
          <Choices label="Acessório" options={PLAYER_ACCESSORIES} value={look.accessory} onChange={set('accessory')} />
          <Swatches label="Camiseta" colors={PLAYER_SHIRTS} value={look.shirt} onChange={set('shirt')} />
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={!name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="h-4 w-4" />
              {initial ? 'Salvar' : 'Criar personagem'}
            </button>
            {!initial ? (
              <button type="button" onClick={onDone} className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:border-slate-500">
                Agora não
              </button>
            ) : null}
          </div>
        </div>
      </form>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Galeria de personagens: quem você já conheceu na carreira

/** Personagens que o jogador já encontrou (fases liberadas). */
export function metCharacters(progress: SimProgress): Set<CharacterId> {
  const met = new Set<CharacterId>();
  LEVELS.forEach((level, index) => {
    const unlocked = index === 0 || Boolean(progress.results[LEVELS[index - 1].id]);
    if (!unlocked) return;
    met.add(AREAS.find((a) => a.id === level.area)!.mentor);
    met.add(level.ticket.requester);
    if (progress.results[level.id] && level.story.thanksBy) met.add(level.story.thanksBy);
  });
  return met;
}

const KIND_TITLE: Record<Character['kind'], string> = { mentor: 'Mentores', colega: 'Colegas', sistema: 'Sistemas' };

export function CastGallery({ progress }: { progress: SimProgress }) {
  const met = metCharacters(progress);
  const all = Object.values(CHARACTERS);
  const [selected, setSelected] = useState<CharacterId | null>(null);
  const current = selected && met.has(selected) ? CHARACTERS[selected] : null;
  const mentorArea = (id: CharacterId) => AREAS.find((a) => a.mentor === id);

  return (
    <section className="card-surface rounded-xl p-6" aria-labelledby="personagens">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-cyan-300" />
          <h2 id="personagens" className="text-xl font-bold text-white">
            Personagens
          </h2>
        </div>
        <span className="text-sm text-slate-400">
          {met.size}/{all.length} conhecidos
        </span>
      </div>

      {(['mentor', 'colega', 'sistema'] as const).map((kind) => (
        <div key={kind} className="mt-5">
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-slate-400">{KIND_TITLE[kind]}</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {all
              .filter((c) => c.kind === kind)
              .map((c) => {
                const known = met.has(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!known}
                    onClick={() => setSelected(selected === c.id ? null : c.id)}
                    aria-pressed={selected === c.id}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition ${
                      selected === c.id
                        ? 'border-cyan-300 bg-cyan-400/10'
                        : known
                          ? 'border-slate-800 bg-slate-950/50 hover:border-slate-600'
                          : 'cursor-not-allowed border-slate-800 bg-slate-950/30'
                    }`}
                  >
                    <Avatar character={c} size={56} dimmed={!known} />
                    <div className={`text-sm font-semibold ${known ? 'text-white' : 'text-slate-600'}`}>{known ? c.name : '???'}</div>
                    <div className="text-xs text-slate-500">
                      {known ? (
                        c.role
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          {kind === 'mentor' ? `Área ${AREAS.indexOf(mentorArea(c.id)!) + 1}` : 'Ainda não conheceu'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      {current ? (
        <div className="mt-5 flex gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4" aria-live="polite">
          <Avatar character={current} size={72} />
          <div>
            <div className="font-semibold text-white">{current.name}</div>
            <div className="text-xs text-slate-400">
              {current.role}
              {mentorArea(current.id) ? ` · Mentor(a) de ${mentorArea(current.id)!.title}` : ''}
            </div>
            <p className="mt-2 text-sm text-slate-300">{current.bio}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
