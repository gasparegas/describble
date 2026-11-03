import { test } from 'node:test';
import assert from 'node:assert/strict';
import { triage, toMarkdown } from '../scripts/triage.mjs';

test('triage splits collector counts into words to add and words already understood', () => {
  const { todo, fixed } = triage({ 'it:astronauta': 14, 'it:pelato': 30, 'en:aviators': 3, 'it:calciatore': 1 }, { min: 2 });
  assert.deepEqual(todo.map((row) => row.word), ['astronauta']);
  assert.deepEqual(fixed.map((row) => row.word), ['pelato', 'aviators']);
  assert.match(toMarkdown({ todo, fixed }), /\| 14 \| it \| astronauta \|/);
  assert.deepEqual(triage(null), { todo: [], filed: [], fixed: [] });
  const split = triage({ 'it:astronauta': 5, 'en:kippah': 2 }, { backlog: [{ word: 'kippah' }] });
  assert.deepEqual(split.todo.map((row) => row.word), ['astronauta']);
  assert.deepEqual(split.filed.map((row) => row.word), ['kippah']);
});
