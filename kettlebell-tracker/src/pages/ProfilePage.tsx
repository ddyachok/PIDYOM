import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { useToastStore } from '../store/toastStore';
import { authClient } from '../lib/auth';
import { syncDeleteAccount } from '../lib/gql/sync';
import { Equipment } from '../lib/types';
import { EXERCISES, getProgressionRoots } from '../data/exercises';
import {
  IconKettlebell, IconRings, IconRope, IconBodyweight,
  IconPullupBar, IconParallettes, IconResistanceBand,
  IconChevronRight, IconSignOut, IconClose,
} from '../components/icons/Icons';
import ProgressionTree from '../components/workout/ProgressionTree';

const EQUIPMENT_INFO: Record<Equipment, { label: string; icon: typeof IconKettlebell; description: string }> = {
  kettlebell:      { label: 'Kettlebell',       icon: IconKettlebell,      description: 'Cast iron. The foundation.' },
  rings:           { label: 'Gymnastic Rings',   icon: IconRings,           description: 'Upper body mastery.' },
  rope:            { label: 'Flow Rope',         icon: IconRope,            description: 'Rhythm and coordination.' },
  bodyweight:      { label: 'Bodyweight',        icon: IconBodyweight,      description: 'Always available.' },
  pullup_bar:      { label: 'Pull-Up Bar',       icon: IconPullupBar,       description: 'Vertical pulling.' },
  parallettes:     { label: 'Parallettes',       icon: IconParallettes,     description: 'Push and hold.' },
  resistance_band: { label: 'Resistance Band',   icon: IconResistanceBand,  description: 'Assistance and mobility.' },
};

export default function ProfilePage() {
  const { userEquipment, toggleEquipment, unlockedExercises, userName, userEmail, authUserId, setUserName, theme, setTheme } = useStore();
  const addToast = useToastStore((s) => s.addToast);
  const [showProgressions, setShowProgressions] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isLight = theme === 'light';

  // Semantic color tokens that adapt to theme — same pattern as SchedulePage
  const ink   = isLight ? '#0A0A0A'             : '#E8E8E1';
  const rule  = isLight ? '#C0C0B8'             : 'rgba(255,255,255,0.12)';
  // steel: mid-gray on light, visible muted white on dark
  const steel = isLight ? '#6A6A62'             : 'rgba(255,255,255,0.38)';
  // heavy rule: bold ink bar on light, subtle bright hairline on dark
  const heavyRule = isLight
    ? { height: 2, background: '#0A0A0A', marginBottom: 32 }
    : { height: 1, background: 'rgba(255,255,255,0.18)', marginBottom: 32 };

  const availableExerciseCount = EXERCISES.filter(e =>
    e.equipment.some(eq => userEquipment.includes(eq))
  ).length;

  const unlockedCount = unlockedExercises.length;
  const totalCount    = EXERCISES.length;

  const progressionRoots = getProgressionRoots().filter(e =>
    e.equipment.some(eq => userEquipment.includes(eq))
  );

  const handleSignOut = async () => { await authClient.signOut(); };

  const handleDeleteAccount = async () => {
    if (deleteConfirmInput !== 'DELETE') return;
    setIsDeleting(true);
    try {
      if (authUserId) await syncDeleteAccount(authUserId);
      await authClient.signOut();
    } catch (err) {
      console.error('[PIDYOM] Account deletion failed:', err);
      addToast('Deletion failed — try again');
      setIsDeleting(false);
    }
  };

  const handleNameSave = () => {
    if (nameInput.trim()) { setUserName(nameInput.trim()); addToast('Name updated'); }
    setEditingName(false);
  };

  // Sub-view: Progression tree detail
  if (selectedExercise) {
    return <ProgressionTree exerciseId={selectedExercise} onBack={() => setSelectedExercise(null)} />;
  }

  return (
    <div className={isLight ? 'page-light' : ''}>
      <PageTransition className="page" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-8 md:mb-10">
          <div className="coord-stamp mb-3">SEC-5 // USER DATA</div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: 48, letterSpacing: '-0.02em',
            lineHeight: 1, color: ink, textTransform: 'uppercase',
          }}>
            OPERATOR
          </div>
        </div>

        {/* Heavy rule */}
        <div style={heavyRule} />

        {/* ── 01 // IDENTITY ─────────────────────────────────── */}
        <Section num="01" label="IDENTITY" rule={rule} steel={steel} />

        <div className="flex items-start gap-6 md:gap-10 mb-8 md:mb-10">
          {/* Name */}
          <div className="flex-1 min-w-0">
            <Label text="Operator Name" steel={steel} />
            {editingName ? (
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                autoFocus
                className="!w-auto !text-lg md:!text-xl tracking-wide"
              />
            ) : (
              <button
                onClick={() => { setNameInput(userName); setEditingName(true); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'baseline', gap: 10 }}
              >
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: 28, letterSpacing: '-0.01em',
                  color: ink, textTransform: 'uppercase', lineHeight: 1,
                }}>
                  {userName || 'SET NAME'}
                </span>
                <span style={{ fontSize: 8, letterSpacing: '0.15em', color: isLight ? 'rgba(10,10,10,0.25)' : 'rgba(255,255,255,0.18)', textTransform: 'uppercase', fontFamily: 'Space Mono, monospace' }}>
                  Edit
                </span>
              </button>
            )}
          </div>

          {/* Email */}
          <div className="shrink-0">
            <Label text="Auth Email" steel={steel} />
            <div style={{ fontSize: 11, color: isLight ? 'rgba(10,10,10,0.45)' : 'rgba(255,255,255,0.32)', fontFamily: 'Space Mono, monospace', letterSpacing: '0.02em' }}>
              {userEmail || '—'}
            </div>
          </div>
        </div>

        {/* Thin rule */}
        <div style={{ height: 1, background: rule, marginBottom: 32 }} />

        {/* ── 02 // SYSTEM STATS ─────────────────────────────── */}
        <Section num="02" label="SYSTEM" rule={rule} steel={steel} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-end gap-8 md:gap-14 mb-8 md:mb-10"
        >
          <Stat label="Gear" value={userEquipment.length} ink={ink} steel={steel} />
          <Stat label="Available" value={availableExerciseCount} ink={ink} steel={steel} />
          <div>
            <Label text="Unlocked" steel={steel} />
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 56, lineHeight: 1,
              letterSpacing: '-0.02em', color: ink,
              fontVariantNumeric: 'tabular-nums',
              display: 'flex', alignItems: 'baseline', gap: 4,
            }}>
              {unlockedCount}
              <span style={{ fontSize: 20, fontWeight: 400, color: isLight ? 'rgba(10,10,10,0.22)' : 'rgba(255,255,255,0.2)' }}>
                /{totalCount}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Heavy rule */}
        <div style={heavyRule} />

        {/* ── 03 // LOADOUT ──────────────────────────────────── */}
        <Section num="03" label="LOADOUT" rule={rule} steel={steel} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2 mb-8 md:mb-10">
          {(Object.entries(EQUIPMENT_INFO) as [Equipment, typeof EQUIPMENT_INFO[Equipment]][]).map(([key, info], i) => {
            const isSelected = userEquipment.includes(key);
            const Icon = info.icon;
            const exerciseCount = EXERCISES.filter(e => e.equipment.includes(key)).length;

            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  toggleEquipment(key);
                  addToast(isSelected ? `${info.label} removed` : `${info.label} added`);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  // Light: bold ink border when on. Dark: subtle border, acid left accent only.
                  border: isSelected
                    ? (isLight ? `2px solid #0A0A0A` : `1px solid rgba(255,255,255,0.2)`)
                    : (isLight ? `1px solid ${rule}` : `1px solid rgba(255,255,255,0.07)`),
                  borderLeft: isSelected ? `3px solid #C6FF00` : (isLight ? `1px solid ${rule}` : `1px solid rgba(255,255,255,0.07)`),
                  background: isSelected
                    ? (isLight ? 'rgba(10,10,10,0.05)' : 'rgba(198,255,0,0.04)')
                    : 'transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                {/* Icon */}
                <div style={{ flexShrink: 0, color: isSelected ? ink : steel, transition: 'color 0.15s' }}>
                  <Icon size={20} />
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 11, letterSpacing: '0.1em', fontWeight: 700,
                      textTransform: 'uppercase',
                      color: isSelected ? ink : steel,
                      fontFamily: 'Space Mono, monospace', transition: 'color 0.15s',
                    }}>
                      {info.label}
                    </span>
                    {isSelected && (
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C6FF00', flexShrink: 0, boxShadow: '0 0 6px rgba(198,255,0,0.5)' }} />
                    )}
                  </div>
                  <div style={{ fontSize: 9, color: steel, fontFamily: 'Space Mono, monospace', letterSpacing: '0.04em' }}>
                    {exerciseCount} exercises · {info.description}
                  </div>
                </div>

                {/* Active badge */}
                {isSelected && (
                  <span style={{
                    fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '2px 6px', background: '#C6FF00', color: '#0A0A0A',
                    fontFamily: 'Space Mono, monospace', fontWeight: 700, flexShrink: 0,
                  }}>
                    ON
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Thin rule */}
        <div style={{ height: 1, background: rule, marginBottom: 32 }} />

        {/* ── 04 // PROGRESSIONS ─────────────────────────────── */}
        <button
          onClick={() => setShowProgressions(!showProgressions)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 0 }}>
            <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: steel, fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>04</span>
            <div style={{ height: 1, background: rule, flex: 1 }} />
            <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: steel, fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>PROGRESSIONS</span>
            <motion.span animate={{ rotate: showProgressions ? 90 : 0 }} style={{ color: steel, display: 'flex', flexShrink: 0, marginLeft: 4 }}>
              <IconChevronRight size={12} />
            </motion.span>
          </div>
        </button>

        <AnimatePresence>
          {showProgressions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ height: 1, background: rule, marginTop: 16, marginBottom: 4 }} />
              {progressionRoots.length > 0 ? (
                <div>
                  {progressionRoots.map((ex, i) => {
                    const childCount = EXERCISES.filter(e => {
                      let current = e;
                      while (current.progressionParentId) {
                        if (current.progressionParentId === ex.id) return true;
                        const parent = EXERCISES.find(p => p.id === current.progressionParentId);
                        if (!parent) break;
                        current = parent;
                      }
                      return false;
                    }).length;
                    const isUnlocked = unlockedExercises.includes(ex.id);

                    return (
                      <motion.button
                        key={ex.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedExercise(ex.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 0', width: '100%',
                          background: 'none', border: 'none',
                          borderBottom: `1px solid ${rule}`,
                          cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: 9, color: steel, width: 20, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: isUnlocked ? '#22c55e' : (isLight ? 'rgba(10,10,10,0.2)' : 'rgba(255,255,255,0.2)') }} />
                        <span style={{ fontSize: 12, letterSpacing: '0.05em', color: ink, flex: 1, fontFamily: 'Space Mono, monospace' }}>
                          {ex.name}
                        </span>
                        <div style={{ flex: 1, borderBottom: `1px dotted ${rule}`, alignSelf: 'flex-end', marginBottom: 3, minWidth: 16 }} />
                        <span style={{ fontSize: 8, color: steel, fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>{ex.movementPattern}</span>
                        <span style={{ fontSize: 8, color: isLight ? 'rgba(10,10,10,0.28)' : 'rgba(255,255,255,0.2)', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>{childCount + 1} lvl</span>
                        <span style={{ color: steel, flexShrink: 0, display: 'flex' }}><IconChevronRight size={11} /></span>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: steel, fontFamily: 'Space Mono, monospace' }}>No progression trees available</p>
                  <p style={{ fontSize: 9, color: isLight ? 'rgba(10,10,10,0.28)' : 'rgba(255,255,255,0.18)', marginTop: 4, fontFamily: 'Space Mono, monospace' }}>
                    Select equipment to view progressions
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ height: 1, background: rule, marginTop: 32, marginBottom: 32 }} />

        {/* ── 05 // DISPLAY ──────────────────────────────────── */}
        <Section num="05" label="DISPLAY" rule={rule} steel={steel} />

        <div className="mode-toggle mb-8 md:mb-10">
          <button
            type="button"
            className={`mode-toggle__btn${theme === 'dark' ? ' mode-toggle__btn--active' : ''}`}
            onClick={() => { setTheme('dark'); addToast('Dark mode'); }}
          >
            Dark
          </button>
          <button
            type="button"
            className={`mode-toggle__btn${theme === 'light' ? ' mode-toggle__btn--active' : ''}`}
            onClick={() => { setTheme('light'); addToast('Light mode'); }}
          >
            Light
          </button>
        </div>

        {/* Heavy rule */}
        <div style={heavyRule} />

        {/* ── 06 // SESSION ──────────────────────────────────── */}
        <Section num="06" label="SESSION" rule={rule} steel={steel} />

        <div className="py-4 md:py-6">
          <button onClick={handleSignOut} className="btn btn-solid btn-full">
            <IconSignOut size={16} />
            Sign Out
          </button>
        </div>

        {/* Thin rule */}
        <div style={{ height: 1, background: rule, marginBottom: 32 }} />

        {/* ── 07 // DANGER ZONE ──────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ef4444', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>07</span>
          <div style={{ height: 1, background: 'rgba(239,68,68,0.3)', flex: 1 }} />
          <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ef4444', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>DANGER ZONE</span>
        </div>

        <div style={{
          border: '1px solid rgba(239,68,68,0.3)',
          padding: '16px 20px',
          marginBottom: 40,
        }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.08em', color: ink,
            fontFamily: 'Space Mono, monospace', marginBottom: 6,
            textTransform: 'uppercase', fontWeight: 700,
          }}>
            Delete Account
          </div>
          <p style={{ fontSize: 9, color: steel, fontFamily: 'Space Mono, monospace', lineHeight: 1.7, marginBottom: 16 }}>
            Permanently removes your profile, all workouts, schedule entries, and exercise unlocks. This action cannot be undone.
          </p>
          <button
            onClick={() => { setDeleteConfirmInput(''); setShowDeleteModal(true); }}
            style={{
              fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
              fontFamily: 'Space Mono, monospace', fontWeight: 700,
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid rgba(239,68,68,0.6)',
              color: '#ef4444',
              cursor: 'pointer',
            }}
          >
            Delete Account →
          </button>
        </div>

        <div style={{
          textAlign: 'center', marginBottom: 40,
          fontSize: 8, letterSpacing: '0.1em',
          color: isLight ? 'rgba(10,10,10,0.22)' : 'rgba(255,255,255,0.14)',
          textTransform: 'uppercase', fontFamily: 'Space Mono, monospace',
        }}>
          PIDYOM v1.0 // MOVEMENT FRAMEWORK
        </div>

      </PageTransition>

      {/* ── Delete Confirmation Modal ──────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            style={{ alignItems: 'center', justifyContent: 'center' }}
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              style={{
                background: isLight ? '#E8E8E1' : '#0D0D0D',
                color: ink,
                padding: 28,
                maxWidth: 360,
                width: '100%',
                border: '1px solid rgba(239,68,68,0.4)',
                boxShadow: '4px 4px 0 rgba(239,68,68,0.25)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900, fontSize: 22,
                  color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.02em',
                }}>
                  Delete Account
                </div>
                {!isDeleting && (
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: steel, padding: 4 }}
                    aria-label="Close"
                  >
                    <IconClose size={16} />
                  </button>
                )}
              </div>

              <div style={{ height: 2, background: '#ef4444', marginBottom: 20, opacity: 0.5 }} />

              <p style={{ fontSize: 9, color: steel, fontFamily: 'Space Mono, monospace', lineHeight: 1.8, marginBottom: 20 }}>
                This will permanently delete your account and all associated data — workouts, schedule, and exercise progress. There is no recovery.
              </p>

              {/* Confirm input */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: steel, marginBottom: 8, fontFamily: 'Space Mono, monospace' }}>
                  Type <span style={{ color: '#ef4444', fontWeight: 700 }}>DELETE</span> to confirm
                </div>
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder="DELETE"
                  disabled={isDeleting}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: `1px solid ${deleteConfirmInput === 'DELETE' ? '#ef4444' : (isLight ? '#C0C0B8' : 'rgba(255,255,255,0.15)')}`,
                    color: ink,
                    padding: '10px 12px',
                    fontSize: 12,
                    fontFamily: 'Space Mono, monospace',
                    letterSpacing: '0.12em',
                    outline: 'none',
                    boxSizing: 'border-box',
                    opacity: isDeleting ? 0.5 : 1,
                  }}
                />
              </div>

              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmInput !== 'DELETE' || isDeleting}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: 10, letterSpacing: '0.14em',
                  fontFamily: 'Space Mono, monospace', fontWeight: 700,
                  textTransform: 'uppercase',
                  background: deleteConfirmInput === 'DELETE' && !isDeleting ? '#ef4444' : 'transparent',
                  color: deleteConfirmInput === 'DELETE' && !isDeleting ? '#fff' : steel,
                  border: `1px solid ${deleteConfirmInput === 'DELETE' && !isDeleting ? '#ef4444' : (isLight ? '#C0C0B8' : 'rgba(255,255,255,0.15)')}`,
                  cursor: deleteConfirmInput === 'DELETE' && !isDeleting ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                }}
              >
                {isDeleting ? 'Deleting…' : 'Permanently Delete Account →'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function Section({ num, label, rule, steel }: { num: string; label: string; rule: string; steel: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: steel, fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>{num}</span>
      <div style={{ height: 1, background: rule, flex: 1 }} />
      <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: steel, fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>{label}</span>
    </div>
  );
}

function Label({ text, steel }: { text: string; steel: string }) {
  return (
    <div style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: steel, marginBottom: 8, fontFamily: 'Space Mono, monospace' }}>
      {text}
    </div>
  );
}

function Stat({ label, value, ink, steel }: { label: string; value: number; ink: string; steel: string }) {
  return (
    <div>
      <Label text={label} steel={steel} />
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900, fontSize: 56, lineHeight: 1,
        letterSpacing: '-0.02em', color: ink,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
    </div>
  );
}
