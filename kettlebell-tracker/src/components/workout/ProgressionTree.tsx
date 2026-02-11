import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { EXERCISES, getExerciseById } from '../../data/exercises';
import { Exercise } from '../../lib/types';
import { IconChevronLeft, IconLock, IconUnlock } from '../icons/Icons';
import PageTransition from '../ui/PageTransition';

interface TreeNode {
  exercise: Exercise;
  children: TreeNode[];
  depth: number;
  x: number;
  y: number;
}

function buildTree(exerciseId: string): TreeNode | null {
  let rootId = exerciseId;
  let current = getExerciseById(rootId);
  while (current?.progressionParentId) {
    rootId = current.progressionParentId;
    current = getExerciseById(rootId);
  }
  if (!current) return null;

  const build = (id: string, depth: number): TreeNode | null => {
    const ex = getExerciseById(id);
    if (!ex) return null;
    const children = (ex.progressionChildren || [])
      .map(cid => build(cid, depth + 1))
      .filter(Boolean) as TreeNode[];
    return { exercise: ex, children, depth, x: 0, y: depth * 100 };
  };

  return build(rootId, 0);
}

function layoutTree(node: TreeNode, xOffset: number = 0, spacing: number = 140): number {
  if (node.children.length === 0) {
    node.x = xOffset;
    return xOffset + spacing;
  }
  let currentX = xOffset;
  for (const child of node.children) {
    currentX = layoutTree(child, currentX, spacing);
  }
  const firstChild = node.children[0];
  const lastChild = node.children[node.children.length - 1];
  node.x = (firstChild.x + lastChild.x) / 2;
  return currentX;
}

function TreeNodeComponent({ node, selectedId, onSelect }: { node: TreeNode; selectedId: string; onSelect: (id: string) => void }) {
  const unlockedExercises = useStore(s => s.unlockedExercises);
  const isUnlocked = unlockedExercises.includes(node.exercise.id);
  const isCurrent = node.exercise.id === selectedId;
  const unlockExercise = useStore(s => s.unlockExercise);

  const parentCanUnlock = useMemo(() => {
    if (isUnlocked) return false;
    if (!node.exercise.progressionParentId) return true;
    return unlockedExercises.includes(node.exercise.progressionParentId);
  }, [isUnlocked, node.exercise.progressionParentId, unlockedExercises]);

  return (
    <>
      {node.children.map(child => (
        <motion.line
          key={`line-${node.exercise.id}-${child.exercise.id}`}
          x1={node.x + 60}
          y1={node.y + 40}
          x2={child.x + 60}
          y2={child.y}
          stroke={unlockedExercises.includes(child.exercise.id) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: child.depth * 0.15 }}
        />
      ))}

      <motion.g
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: node.depth * 0.12, type: 'spring', stiffness: 200 }}
      >
        <motion.rect
          x={node.x}
          y={node.y}
          width={120}
          height={40}
          rx={2}
          fill={isCurrent ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)'}
          stroke={isCurrent ? 'rgba(255,255,255,0.4)' : isUnlocked ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}
          strokeWidth={isCurrent ? 1.5 : 1}
          className="cursor-pointer"
          onClick={() => onSelect(node.exercise.id)}
          whileHover={{ fill: 'rgba(255,255,255,0.06)' }}
        />

        {isUnlocked && (
          <motion.circle
            cx={node.x + 60}
            cy={node.y + 20}
            r={28}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, delay: node.depth * 0.12 + 0.2 }}
          />
        )}

        <text
          x={node.x + 60}
          y={node.y + 16}
          textAnchor="middle"
          fill={isUnlocked ? 'white' : 'rgba(255,255,255,0.25)'}
          fontSize={8}
          fontFamily="'Space Mono', monospace"
          letterSpacing="0.05em"
          className="pointer-events-none select-none"
        >
          {node.exercise.name.length > 16 ? node.exercise.name.slice(0, 14) + '..' : node.exercise.name}
        </text>

        <text
          x={node.x + 60}
          y={node.y + 30}
          textAnchor="middle"
          fill="rgba(255,255,255,0.15)"
          fontSize={6}
          fontFamily="'Space Mono', monospace"
          letterSpacing="0.1em"
          className="pointer-events-none select-none uppercase"
        >
          {node.exercise.difficulty}
        </text>

        {!isUnlocked && (
          <g transform={`translate(${node.x + 105}, ${node.y + 2})`}>
            {parentCanUnlock ? (
              <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); unlockExercise(node.exercise.id); }}>
                <rect x={-6} y={-2} width={18} height={14} fill="rgba(255,255,255,0.05)" rx={1} />
                <IconUnlock size={10} className="text-white/40" />
              </g>
            ) : (
              <IconLock size={10} className="text-white/10" />
            )}
          </g>
        )}
      </motion.g>

      {node.children.map(child => (
        <TreeNodeComponent key={child.exercise.id} node={child} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </>
  );
}

interface Props {
  exerciseId: string;
  onBack: () => void;
}

export default function ProgressionTree({ exerciseId, onBack }: Props) {
  const tree = useMemo(() => {
    const root = buildTree(exerciseId);
    if (root) layoutTree(root, 20, 140);
    return root;
  }, [exerciseId]);

  const selectedExercise = getExerciseById(exerciseId);
  const unlockedExercises = useStore(s => s.unlockedExercises);
  const unlockExercise = useStore(s => s.unlockExercise);
  const isUnlocked = unlockedExercises.includes(exerciseId);

  const getTreeWidth = useCallback((node: TreeNode): number => {
    if (node.children.length === 0) return node.x + 140;
    return Math.max(node.x + 140, ...node.children.map(c => getTreeWidth(c)));
  }, []);

  const getTreeHeight = useCallback((node: TreeNode): number => {
    if (node.children.length === 0) return node.y + 60;
    return Math.max(node.y + 60, ...node.children.map(c => getTreeHeight(c)));
  }, []);

  if (!tree || !selectedExercise) {
    return (
      <PageTransition className="px-4 pt-4 pb-20">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] text-white/40 mb-4">
          <IconChevronLeft size={14} /> Back
        </button>
        <p className="text-[11px] text-white/20">No progression tree available.</p>
      </PageTransition>
    );
  }

  const width = getTreeWidth(tree);
  const height = getTreeHeight(tree);

  return (
    <PageTransition className="px-4 pt-4 pb-20">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] text-white/40 mb-4 hover:text-white/60 transition-colors">
        <IconChevronLeft size={14} /> Back
      </button>

      <div className="mb-4">
        <h2 className="text-sm tracking-[0.15em] font-bold">Progression Tree</h2>
        <p className="text-[9px] text-white/30 mt-1">{selectedExercise.movementPattern} pattern · tap node to select</p>
      </div>

      {/* Tree visualization */}
      <div className="overflow-x-auto overflow-y-auto -mx-4 px-4 pb-4" style={{ maxHeight: '50vh' }}>
        <svg width={width + 20} height={height + 20} className="block">
          <TreeNodeComponent node={tree} selectedId={exerciseId} onSelect={() => {}} />
        </svg>
      </div>

      {/* Selected exercise info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-white/[0.08] p-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] tracking-wide font-bold">{selectedExercise.name}</h3>
          <span className="text-[8px] px-1.5 py-0.5 border border-white/10 text-white/40 uppercase">{selectedExercise.difficulty}</span>
        </div>
        <p className="text-[10px] text-white/40 mb-3">{selectedExercise.description}</p>

        <div className="mb-3">
          <span className="text-[9px] tracking-[0.15em] text-white/25 uppercase block mb-1">Cues</span>
          <div className="space-y-0.5">
            {selectedExercise.cues.map((cue, i) => (
              <p key={i} className="text-[9px] text-white/30">→ {cue}</p>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedExercise.equipment.map(eq => (
            <span key={eq} className="text-[8px] px-1.5 py-0.5 bg-white/[0.03] text-white/25">{eq}</span>
          ))}
          {selectedExercise.focusAreas.map(fa => (
            <span key={fa} className="text-[8px] px-1.5 py-0.5 bg-white/[0.03] text-white/25">{fa}</span>
          ))}
        </div>

        {!isUnlocked && selectedExercise.progressionParentId && unlockedExercises.includes(selectedExercise.progressionParentId) && (
          <button
            onClick={() => unlockExercise(exerciseId)}
            className="mt-3 w-full py-2 border border-white/20 text-[10px] tracking-[0.15em] uppercase hover:bg-white/5 transition-colors"
          >
            Unlock Exercise
          </button>
        )}
      </motion.div>
    </PageTransition>
  );
}
