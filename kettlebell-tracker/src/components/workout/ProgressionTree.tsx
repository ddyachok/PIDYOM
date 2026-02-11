import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useToastStore } from '../../store/toastStore';
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

function layoutTree(node: TreeNode, xOffset: number = 0, spacing: number = 210): number {
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
  const addToast = useToastStore((s) => s.addToast);

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
          x1={node.x + 90}
          y1={node.y + 60}
          x2={child.x + 90}
          y2={child.y}
          stroke={unlockedExercises.includes(child.exercise.id) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}
          strokeWidth={isCurrent && (node.exercise.id === child.exercise.id || child.exercise.id === selectedId) ? 2 : 1.5}
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
          width={180}
          height={60}
          rx={3}
          fill={isCurrent ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.02)'}
          stroke={isCurrent ? 'rgba(255,255,255,0.6)' : isUnlocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}
          strokeWidth={isCurrent ? 2.5 : 1.5}
          className="cursor-pointer"
          onClick={() => onSelect(node.exercise.id)}
          whileHover={{ fill: isCurrent ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)' }}
        />

        {isUnlocked && (
          <motion.circle
            cx={node.x + 90}
            cy={node.y + 30}
            r={42}
            fill="none"
            stroke={isCurrent ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}
            strokeWidth={isCurrent ? 1.5 : 1}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, delay: node.depth * 0.12 + 0.2 }}
          />
        )}

        <text
          x={node.x + 90}
          y={node.y + 24}
          textAnchor="middle"
          fill={isCurrent ? 'white' : isUnlocked ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)'}
          fontSize={12}
          fontFamily="'Space Mono', monospace"
          fontWeight={isCurrent ? 'bold' : 'normal'}
          letterSpacing="0.08em"
          className="pointer-events-none select-none"
        >
          {node.exercise.name.length > 20 ? node.exercise.name.slice(0, 18) + '..' : node.exercise.name}
        </text>

        <text
          x={node.x + 90}
          y={node.y + 45}
          textAnchor="middle"
          fill={isCurrent ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}
          fontSize={9}
          fontFamily="'Space Mono', monospace"
          letterSpacing="0.15em"
          className="pointer-events-none select-none uppercase"
        >
          {node.exercise.difficulty}
        </text>

        {!isUnlocked && (
          <g transform={`translate(${node.x + 158}, ${node.y + 3})`}>
            {parentCanUnlock ? (
              <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); unlockExercise(node.exercise.id); addToast('Exercise unlocked'); }}>
                <rect x={-9} y={-3} width={27} height={21} fill="rgba(255,255,255,0.05)" rx={1.5} />
                <IconUnlock size={15} className="text-white/40" />
              </g>
            ) : (
              <IconLock size={15} className="text-white/10" />
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
  const [selectedId, setSelectedId] = useState<string>(exerciseId);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const isPointerDown = useRef(false);
  const addToast = useToastStore((s) => s.addToast);
  const tree = useMemo(() => {
    const root = buildTree(exerciseId);
    if (root) layoutTree(root, 30, 210);
    return root;
  }, [exerciseId]);

  const selectedExercise = getExerciseById(selectedId);
  const unlockedExercises = useStore(s => s.unlockedExercises);
  const unlockExercise = useStore(s => s.unlockExercise);
  const isUnlocked = unlockedExercises.includes(selectedId);

  const getTreeWidth = useCallback((node: TreeNode): number => {
    if (node.children.length === 0) return node.x + 210;
    return Math.max(node.x + 210, ...node.children.map(c => getTreeWidth(c)));
  }, []);

  const getTreeHeight = useCallback((node: TreeNode): number => {
    if (node.children.length === 0) return node.y + 90;
    return Math.max(node.y + 90, ...node.children.map(c => getTreeHeight(c)));
  }, []);

  // Update selectedId when exerciseId prop changes
  useEffect(() => {
    setSelectedId(exerciseId);
  }, [exerciseId]);

  if (!tree || !selectedExercise) {
    return (
      <PageTransition className="page">
        <button onClick={onBack} className="flex items-center gap-2 md:gap-3 text-[11px] md:text-[15px] text-white/40 mb-4 md:mb-6 hover:text-white/60 transition-colors">
          <IconChevronLeft size={20} className="md:w-[27px] md:h-[27px]" /> Back
        </button>
        <p className="text-[12px] md:text-[17px] text-white/20">No progression tree available.</p>
      </PageTransition>
    );
  }

  const width = getTreeWidth(tree);
  const height = getTreeHeight(tree);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isPointerDown.current = true;
    panStart.current = { x: pan.x, y: pan.y, clientX: e.clientX, clientY: e.clientY };
    setIsPanning(false);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [pan.x, pan.y]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPointerDown.current) return;
    const dx = e.clientX - panStart.current.clientX;
    const dy = e.clientY - panStart.current.clientY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) setIsPanning(true);
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isPointerDown.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    setIsPanning(false);
  }, []);

  const handlePointerLeave = useCallback(() => {
    isPointerDown.current = false;
    setIsPanning(false);
  }, []);

  return (
    <PageTransition className="page">
      {/* Header */}
      <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
        <button onClick={onBack} className="p-2 md:p-3 -ml-2 md:-ml-3 hover:bg-white/5 transition-colors shrink-0">
          <IconChevronLeft size={22} className="md:w-[27px] md:h-[27px]" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="page-title mb-0">Progression Tree</h1>
          <p className="text-[11px] md:text-[17px] text-white/30 mt-1 md:mt-2">{selectedExercise.movementPattern} pattern · drag to pan, tap node to select</p>
        </div>
      </div>

      {/* Tree visualization - pannable */}
      <div className="card mb-6 md:mb-9 p-4 md:p-9 overflow-hidden">
        <div
          className="overflow-hidden max-h-[50vh] md:max-h-[60vh] touch-none select-none cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          <div
            className="inline-block origin-top-left transition-none"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
          >
            <svg width={width + 30} height={height + 30} className="block" style={{ pointerEvents: isPanning ? 'none' : 'auto' }}>
              <TreeNodeComponent node={tree} selectedId={selectedId} onSelect={setSelectedId} />
            </svg>
          </div>
        </div>
      </div>

      {/* Selected exercise info */}
      <motion.div 
        key={selectedId}
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-[15px] md:text-[20px] tracking-[0.08em] md:tracking-[0.1em] font-bold truncate">{selectedExercise.name}</h3>
          <span className="tag">{selectedExercise.difficulty}</span>
        </div>
        
        <p className="text-[11px] md:text-[15px] text-white/40 leading-relaxed mb-6 md:mb-9">{selectedExercise.description}</p>

        {selectedExercise.cues.length > 0 && (
          <div className="mb-6 md:mb-9">
            <span className="section-label mb-0">Cues</span>
            <div className="space-y-2 md:space-y-3 mt-2 md:mt-3">
              {selectedExercise.cues.map((cue, i) => (
                <p key={i} className="text-[11px] md:text-[15px] text-white/30 leading-relaxed pl-4 md:pl-6 border-l border-white/[0.06]">
                  {cue}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:gap-5 mb-6 md:mb-9">
          <div>
            <div className="text-[10px] md:text-[12px] tracking-[0.2em] md:tracking-[0.3em] text-white/20 uppercase mb-1 md:mb-2">Equipment</div>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {selectedExercise.equipment.map(eq => (
                <span key={eq} className="text-[11px] md:text-[14px] text-white/40">{eq}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] md:text-[12px] tracking-[0.2em] md:tracking-[0.3em] text-white/20 uppercase mb-1 md:mb-2">Focus</div>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {selectedExercise.focusAreas.map(fa => (
                <span key={fa} className="text-[11px] md:text-[14px] text-white/40">{fa}</span>
              ))}
            </div>
          </div>
        </div>

        {!isUnlocked && selectedExercise.progressionParentId && unlockedExercises.includes(selectedExercise.progressionParentId) && (
          <button
            onClick={() => {
              unlockExercise(selectedId);
              addToast('Exercise unlocked');
            }}
            className="btn btn-primary btn-full"
          >
            Unlock Exercise
          </button>
        )}
      </motion.div>
    </PageTransition>
  );
}
