export type ModuleId = 'intervals' | 'progressions' | 'sing';
export type TextureId = 'warm' | 'clarity' | 'reed';

export interface Exercise {
  id: string;
  module: ModuleId;
  prompt: string;
  answer: string;
  choices: string[];
  level: number;
  targetMidi?: number;
  sequence: number[][];
  explanation: string;
}

export const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
export const DEGREE_NAMES = ['1 · home note (tonic)', '2 · second (supertonic)', '3 · third (mediant)', '4 · fourth (subdominant)', '5 · fifth (dominant)', '6 · sixth (submediant)', '7 · leading tone'];

const cadence = [[53, 57, 60], [55, 59, 62], [48, 55, 64]]; // F–G–C, close and singable
const degreeMidi = [60, 62, 64, 65, 67, 69, 71];

export const intervalExercises: Exercise[] = degreeMidi.map((midi, index) => ({
  id: `degree-${index + 1}`,
  module: 'intervals',
  prompt: 'Which note role comes after the home chord?',
  answer: DEGREE_NAMES[index],
  choices: DEGREE_NAMES,
  level: index < 3 ? 1 : index < 6 ? 2 : 3,
  targetMidi: midi,
  sequence: [...cadence, [midi]],
  explanation: `${DEGREE_NAMES[index]} in C major — hear it against the tonic established by IV–V–I.`,
}));

interface ProgressionSeed { id: string; answer: string; level: number; chords: number[][]; explanation: string }
const progressionSeeds: ProgressionSeed[] = [
  { id: 'one-four-five-one', answer: 'I – IV – V – I', level: 1, chords: [[48,55,64],[48,57,65],[50,59,62],[48,55,64]], explanation: 'The bass outlines C–F–G–C while the upper voices mostly move by step.' },
  { id: 'one-six-four-five', answer: 'I – vi – IV – V', level: 1, chords: [[48,55,64],[48,57,64],[48,57,65],[50,55,59]], explanation: 'Two common tones soften I into vi, then the voices lean toward the dominant.' },
  { id: 'two-five-one', answer: 'ii – V – I', level: 2, chords: [[50,57,65],[50,55,59],[48,55,64]], explanation: 'The predominant ii folds into V, then the leading tone resolves upward to tonic.' },
  { id: 'one-three-six-four', answer: 'I – iii – vi – IV', level: 2, chords: [[48,55,64],[47,55,64],[48,57,64],[48,57,65]], explanation: 'A descending bass is disguised by two sustained upper voices.' },
  { id: 'six-two-five-one', answer: 'vi – ii – V – I', level: 3, chords: [[48,57,64],[50,57,65],[50,55,59],[48,55,64]], explanation: 'A circle-of-fifths bass supports compact upper-voice resolutions.' },
  { id: 'one-flat-seven-four-one', answer: 'I – ♭VII – IV – I', level: 3, chords: [[48,55,64],[46,53,62],[48,57,65],[48,55,64]], explanation: 'The borrowed ♭VII adds modal colour; each chord is inverted to avoid blocky jumps.' },
];
const progressionChoices = progressionSeeds.map(item => item.answer);
export const progressionExercises: Exercise[] = progressionSeeds.map(item => ({
  id: `progression-${item.id}`,
  module: 'progressions',
  prompt: 'Which chord pattern did you hear?',
  answer: item.answer,
  choices: progressionChoices,
  level: item.level,
  sequence: item.chords,
  explanation: item.explanation,
}));

export const singExercises: Exercise[] = [
  { id: 'sing-3', module: 'sing', prompt: 'Sing the third', answer: 'E4', choices: [], level: 1, targetMidi: 64, sequence: [...cadence, [60]], explanation: 'Find E4 after the cadence. Hold it in tune for a moment.' },
  { id: 'sing-5', module: 'sing', prompt: 'Sing the fifth', answer: 'G4', choices: [], level: 1, targetMidi: 67, sequence: [...cadence, [60]], explanation: 'Find G4 after the cadence. It should feel open and stable above C.' },
  { id: 'sing-2', module: 'sing', prompt: 'Sing the second', answer: 'D4', choices: [], level: 2, targetMidi: 62, sequence: [...cadence, [60]], explanation: 'Find D4 after the cadence. Hear its pull toward the tonic.' },
  { id: 'sing-6', module: 'sing', prompt: 'Sing the sixth', answer: 'A4', choices: [], level: 2, targetMidi: 69, sequence: [...cadence, [60]], explanation: 'Find A4 after the cadence, a major sixth above the tonic.' },
  { id: 'sing-7', module: 'sing', prompt: 'Sing the leading tone', answer: 'B4', choices: [], level: 3, targetMidi: 71, sequence: [...cadence, [60]], explanation: 'Find B4 and notice its strong upward pull into C.' },
];

export const exercisesByModule: Record<ModuleId, Exercise[]> = {
  intervals: intervalExercises,
  progressions: progressionExercises,
  sing: singExercises,
};

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function frequencyToMidi(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / 440);
}

export function midiName(midi: number): string {
  const rounded = Math.round(midi);
  return `${NOTE_NAMES[((rounded % 12) + 12) % 12]}${Math.floor(rounded / 12) - 1}`;
}

export function centsFromMidi(midi: number): number {
  return Math.round((midi - Math.round(midi)) * 100);
}
