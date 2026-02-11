-- Seed default exercises for PIDYOM
-- Run after 001_create_tables.sql

-- ===== HINGE PATTERN =====
INSERT INTO exercises (id, name, category, movement_pattern, equipment, focus_areas, difficulty, description, cues)
VALUES
('kb-deadlift', 'KB Deadlift', 'grind', 'hinge', '{kettlebell}', '{strength}', 'beginner', 'Foundation hinge pattern with kettlebell', '{''Hinge at hips'',''Flat back'',''Drive through heels''}'),
('kb-single-deadlift', 'Single-Arm Deadlift', 'grind', 'hinge', '{kettlebell}', '{strength}', 'beginner', 'Unilateral deadlift for anti-rotation', '{''Square hips'',''Brace core'',''Slow descent''}'),
('kb-two-hand-swing', 'Two-Hand Swing', 'ballistic', 'hinge', '{kettlebell}', '{conditioning,power}', 'beginner', 'Foundational ballistic hip hinge', '{''Hip snap'',''Arms are ropes'',''Plank at top''}'),
('kb-one-hand-swing', 'One-Hand Swing', 'ballistic', 'hinge', '{kettlebell}', '{conditioning,power}', 'intermediate', 'Unilateral swing with anti-rotation demand', '{''Square shoulders'',''Grip with hook'',''Same hip snap''}'),
('kb-clean', 'KB Clean', 'ballistic', 'hinge', '{kettlebell}', '{power,coordination}', 'intermediate', 'Explosive pull to rack position', '{''Zip up'',''Tame the arc'',''Soft catch at rack''}'),
('kb-high-pull', 'KB High Pull', 'ballistic', 'hinge', '{kettlebell}', '{power}', 'intermediate', 'Explosive pull to chest height', '{''Elbow high'',''Pull back not up'',''Control descent''}'),
('kb-h2h-swing', 'Hand-to-Hand Swing', 'ballistic', 'hinge', '{kettlebell}', '{coordination,conditioning}', 'intermediate', 'Swing with hand switch at top', '{''Switch at apex'',''Brief float'',''Stay square''}'),
('kb-snatch', 'KB Snatch', 'ballistic', 'hinge', '{kettlebell}', '{power,conditioning}', 'advanced', 'The tsar of kettlebell lifts', '{''Punch through at top'',''Soft lockout'',''One fluid motion''}');

-- Set hinge progression chain
UPDATE exercises SET progression_parent_id = 'kb-deadlift' WHERE id = 'kb-single-deadlift';
UPDATE exercises SET progression_parent_id = 'kb-single-deadlift' WHERE id = 'kb-two-hand-swing';
UPDATE exercises SET progression_parent_id = 'kb-two-hand-swing' WHERE id = 'kb-one-hand-swing';
UPDATE exercises SET progression_parent_id = 'kb-one-hand-swing' WHERE id IN ('kb-clean', 'kb-high-pull', 'kb-h2h-swing');
UPDATE exercises SET progression_parent_id = 'kb-high-pull' WHERE id = 'kb-snatch';

-- ===== SQUAT PATTERN =====
INSERT INTO exercises (id, name, category, movement_pattern, equipment, focus_areas, difficulty, description, cues)
VALUES
('goblet-squat', 'Goblet Squat', 'grind', 'squat', '{kettlebell}', '{strength,mobility}', 'beginner', 'Front-loaded squat for depth and control', '{''Elbows between knees'',''Chest up'',''Sit between heels''}'),
('kb-racked-squat', 'Racked Front Squat', 'grind', 'squat', '{kettlebell}', '{strength}', 'intermediate', 'Single-arm racked squat', '{''Elbow tight'',''Breathe behind shield'',''Vertical torso''}'),
('kb-overhead-squat', 'Overhead Squat', 'grind', 'squat', '{kettlebell}', '{strength,mobility}', 'advanced', 'Squat with KB locked out overhead', '{''Active shoulder'',''Stack joints'',''Slow descent''}'),
('kb-double-squat', 'Double Racked Squat', 'grind', 'squat', '{kettlebell}', '{strength}', 'advanced', 'Heavy front squat with two kettlebells', '{''Two clean to rack'',''Stay stacked'',''Fight for position''}'),
('kb-pistol-squat', 'KB Pistol Squat', 'grind', 'squat', '{kettlebell,bodyweight}', '{strength,mobility}', 'elite', 'Single-leg squat with KB counterbalance', '{''KB as counterweight'',''Control descent'',''Drive through heel''}');

UPDATE exercises SET progression_parent_id = 'goblet-squat' WHERE id IN ('kb-racked-squat', 'kb-overhead-squat');
UPDATE exercises SET progression_parent_id = 'kb-racked-squat' WHERE id IN ('kb-double-squat', 'kb-pistol-squat');

-- ===== PRESS PATTERN =====
INSERT INTO exercises (id, name, category, movement_pattern, equipment, focus_areas, difficulty, description, cues)
VALUES
('kb-floor-press', 'Floor Press', 'grind', 'push', '{kettlebell}', '{strength}', 'beginner', 'Supine press from floor', '{''Pack shoulder'',''Slow lower'',''Press from lat''}'),
('kb-half-kneel-press', 'Half-Kneeling Press', 'grind', 'push', '{kettlebell}', '{strength}', 'beginner', 'Press from half-kneeling position', '{''Squeeze glute'',''Vertical forearm'',''Breathe behind shield''}'),
('kb-military-press', 'Military Press', 'grind', 'push', '{kettlebell}', '{strength}', 'intermediate', 'Strict standing overhead press', '{''Clean to rack'',''Press from lat'',''Lockout overhead''}'),
('kb-push-press', 'Push Press', 'ballistic', 'push', '{kettlebell}', '{power,strength}', 'intermediate', 'Press with leg drive assistance', '{''Small dip'',''Drive legs'',''Lock hard''}'),
('kb-bottoms-up-press', 'Bottoms-Up Press', 'grind', 'push', '{kettlebell}', '{strength,coordination}', 'advanced', 'Press with bell inverted for maximum stability', '{''Crush grip'',''Slow and controlled'',''Total tension''}'),
('kb-jerk', 'KB Jerk', 'ballistic', 'push', '{kettlebell}', '{power}', 'advanced', 'Explosive overhead with double dip', '{''First dip'',''Drive'',''Second dip under'',''Fixation''}');

UPDATE exercises SET progression_parent_id = 'kb-floor-press' WHERE id = 'kb-half-kneel-press';
UPDATE exercises SET progression_parent_id = 'kb-half-kneel-press' WHERE id = 'kb-military-press';
UPDATE exercises SET progression_parent_id = 'kb-military-press' WHERE id IN ('kb-push-press', 'kb-bottoms-up-press');
UPDATE exercises SET progression_parent_id = 'kb-push-press' WHERE id = 'kb-jerk';

-- ===== PULL PATTERN =====
INSERT INTO exercises (id, name, category, movement_pattern, equipment, focus_areas, difficulty, description, cues)
VALUES
('kb-bent-row', 'Bent-Over Row', 'grind', 'pull', '{kettlebell}', '{strength}', 'beginner', 'Horizontal pull from hip hinge', '{''Flat back'',''Pull to hip'',''Squeeze at top''}'),
('kb-renegade-row', 'Renegade Row', 'grind', 'pull', '{kettlebell}', '{strength,coordination}', 'intermediate', 'Row from plank position', '{''Wide feet'',''No rotation'',''Pull to hip''}'),
('kb-gorilla-row', 'Gorilla Row', 'grind', 'pull', '{kettlebell}', '{strength}', 'intermediate', 'Alternating row from wide stance', '{''Low hinge'',''Alternate pulls'',''Ground the other bell''}');

UPDATE exercises SET progression_parent_id = 'kb-bent-row' WHERE id IN ('kb-renegade-row', 'kb-gorilla-row');

-- ===== CORE / GET-UP =====
INSERT INTO exercises (id, name, category, movement_pattern, equipment, focus_areas, difficulty, description, cues)
VALUES
('kb-halo', 'KB Halo', 'grind', 'core', '{kettlebell}', '{mobility}', 'beginner', 'Circular movement around the head', '{''Keep bell close'',''Circle both directions'',''Shoulders packed''}'),
('tgu-partial', 'Partial Get-Up', 'hybrid', 'core', '{kettlebell}', '{strength,mobility}', 'beginner', 'Get-up to elbow position', '{''Roll to press'',''Eyes on bell'',''Elbow under shoulder''}'),
('tgu-half', 'Half Get-Up', 'hybrid', 'core', '{kettlebell}', '{strength,mobility}', 'intermediate', 'Get-up to tall sit position', '{''Press up'',''Tall sit'',''Arm locked''}'),
('tgu-full', 'Turkish Get-Up', 'hybrid', 'core', '{kettlebell}', '{strength,mobility,coordination}', 'intermediate', 'The complete floor-to-standing movement', '{''7 positions'',''Slow and smooth'',''Eyes on bell''}'),
('tgu-heavy', 'Heavy TGU', 'hybrid', 'core', '{kettlebell}', '{strength}', 'advanced', 'Turkish get-up with heavy load', '{''Same technique'',''Total tension'',''No rushing''}'),
('kb-windmill', 'Windmill', 'grind', 'core', '{kettlebell}', '{mobility,strength}', 'advanced', 'Lateral hip hinge with overhead load', '{''Push hip out'',''Follow hand down'',''Lock top arm''}');

UPDATE exercises SET progression_parent_id = 'tgu-partial' WHERE id = 'tgu-half';
UPDATE exercises SET progression_parent_id = 'tgu-half' WHERE id = 'tgu-full';
UPDATE exercises SET progression_parent_id = 'tgu-full' WHERE id IN ('tgu-heavy', 'kb-windmill');

-- ===== CARRY =====
INSERT INTO exercises (id, name, category, movement_pattern, equipment, focus_areas, difficulty, description, cues)
VALUES
('kb-farmers-carry', 'Farmer''s Carry', 'grind', 'carry', '{kettlebell}', '{strength}', 'beginner', 'Loaded walk with bells at sides', '{''Tall posture'',''Shoulders packed'',''Even steps''}'),
('kb-rack-carry', 'Rack Carry', 'grind', 'carry', '{kettlebell}', '{strength}', 'intermediate', 'Loaded walk with bell in rack position', '{''Elbow tight'',''Breathe behind shield'',''Own the walk''}'),
('kb-suitcase-carry', 'Suitcase Carry', 'grind', 'carry', '{kettlebell}', '{strength,coordination}', 'intermediate', 'Single-arm carry for anti-lateral flexion', '{''No lean'',''Core braced'',''Walk the line''}'),
('kb-waiter-carry', 'Waiter Carry', 'grind', 'carry', '{kettlebell}', '{strength,coordination}', 'advanced', 'Overhead carry with bottoms-up position', '{''Pack shoulder'',''Steady arm'',''Short steps''}');

UPDATE exercises SET progression_parent_id = 'kb-farmers-carry' WHERE id IN ('kb-rack-carry', 'kb-suitcase-carry');
UPDATE exercises SET progression_parent_id = 'kb-rack-carry' WHERE id = 'kb-waiter-carry';

-- ===== COMPOUND =====
INSERT INTO exercises (id, name, category, movement_pattern, equipment, focus_areas, difficulty, description, cues)
VALUES
('kb-clean-press', 'Clean & Press', 'hybrid', 'push', '{kettlebell}', '{strength,power}', 'intermediate', 'Clean to rack then strict press', '{''Clean first'',''Settle rack'',''Press from lat''}'),
('kb-clean-squat', 'Clean & Squat', 'hybrid', 'squat', '{kettlebell}', '{strength,conditioning}', 'intermediate', 'Clean to front squat', '{''Clean to rack'',''Squat with control'',''Drive up''}');

UPDATE exercises SET progression_parent_id = 'kb-clean' WHERE id IN ('kb-clean-press', 'kb-clean-squat');

-- ===== RINGS =====
INSERT INTO exercises (id, name, category, movement_pattern, equipment, focus_areas, difficulty, description, cues)
VALUES
('ring-support', 'Ring Support Hold', 'grind', 'push', '{rings}', '{strength}', 'beginner', 'Static hold at top of dip position on rings', '{''Rings turned out'',''Shoulders down'',''Total tension''}'),
('ring-pushup', 'Ring Push-Up', 'grind', 'push', '{rings}', '{strength}', 'intermediate', 'Push-up on unstable rings', '{''Rings close to body'',''Turn out at top'',''Slow descent''}'),
('ring-dip', 'Ring Dip', 'grind', 'push', '{rings}', '{strength}', 'advanced', 'Full dip on gymnastic rings', '{''Control the rings'',''Slow negative'',''Turn out at top''}'),
('ring-muscle-up', 'Ring Muscle-Up', 'hybrid', 'pull', '{rings}', '{strength,power}', 'elite', 'Pull-up transitioning to dip position', '{''False grip'',''Deep pull'',''Fast transition'',''Press out''}'),
('ring-row', 'Ring Row', 'grind', 'pull', '{rings}', '{strength}', 'beginner', 'Horizontal pull on rings', '{''Body straight'',''Pull to chest'',''Squeeze back''}'),
('ring-pullup', 'Ring Pull-Up', 'grind', 'pull', '{rings}', '{strength}', 'intermediate', 'Pull-up on gymnastic rings', '{''Dead hang start'',''Chin over rings'',''Control descent''}');

UPDATE exercises SET progression_parent_id = 'ring-support' WHERE id = 'ring-pushup';
UPDATE exercises SET progression_parent_id = 'ring-pushup' WHERE id = 'ring-dip';
UPDATE exercises SET progression_parent_id = 'ring-dip' WHERE id = 'ring-muscle-up';
UPDATE exercises SET progression_parent_id = 'ring-row' WHERE id = 'ring-pullup';

-- ===== BODYWEIGHT =====
INSERT INTO exercises (id, name, category, movement_pattern, equipment, focus_areas, difficulty, description, cues)
VALUES
('bw-pushup', 'Push-Up', 'grind', 'push', '{bodyweight}', '{strength}', 'beginner', 'Standard push-up', '{''Plank position'',''Elbows 45 degrees'',''Full range''}'),
('bw-diamond-pushup', 'Diamond Push-Up', 'grind', 'push', '{bodyweight}', '{strength}', 'intermediate', 'Narrow push-up for triceps emphasis', '{''Hands together'',''Elbows tight'',''Chest to hands''}'),
('bw-pullup', 'Pull-Up', 'grind', 'pull', '{pullup_bar,bodyweight}', '{strength}', 'intermediate', 'Standard pull-up', '{''Dead hang'',''Chin over bar'',''Control descent''}'),
('bw-lsit', 'L-Sit', 'grind', 'core', '{bodyweight,parallettes}', '{strength}', 'intermediate', 'Static hold with legs parallel to ground', '{''Press shoulders down'',''Point toes'',''Engage quads''}');

UPDATE exercises SET progression_parent_id = 'bw-pushup' WHERE id = 'bw-diamond-pushup';

-- ===== CONDITIONING =====
INSERT INTO exercises (id, name, category, movement_pattern, equipment, focus_areas, difficulty, description, cues)
VALUES
('rope-flow', 'Rope Flow', 'hybrid', 'flow', '{rope}', '{coordination,conditioning,mobility}', 'beginner', 'Rhythmic rope movement patterns', '{''Relaxed grip'',''Breathe with rhythm'',''Full body flow''}'),
('rope-figure8', 'Rope Figure-8', 'hybrid', 'flow', '{rope}', '{coordination,conditioning}', 'intermediate', 'Infinity pattern rope flow', '{''Smooth transitions'',''Use whole body'',''Stay loose''}'),
('rope-shield-cast', 'Rope Shield Cast', 'hybrid', 'flow', '{rope}', '{coordination,power}', 'advanced', 'Advanced rotational rope pattern', '{''Hip rotation'',''Arm extension'',''Rhythm first''}'),
('sprint-intervals', 'Sprint Intervals', 'ballistic', 'hinge', '{bodyweight}', '{conditioning,power}', 'intermediate', 'Short burst running intervals', '{''Full effort sprints'',''Walk recovery'',''Gradual warmup''}');

UPDATE exercises SET progression_parent_id = 'rope-flow' WHERE id = 'rope-figure8';
UPDATE exercises SET progression_parent_id = 'rope-figure8' WHERE id = 'rope-shield-cast';
