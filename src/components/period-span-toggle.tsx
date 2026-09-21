'use client';

import { useUrlParam } from '@/components/url-param';
import { ToggleButton, ToggleButtonGroup } from '@heroui/react';
import type { ReactNode } from 'react';

/**
 * Which turn of a period is on show — the one in progress, or the one before
 * it.
 *
 * Declared here rather than imported from a feature, because a shared component
 * may not reach into one — see the layering rules in `AGENTS.md`. Each market's
 * `PeriodSpan` is the same union, so a feature still hands over its own type and
 * nothing is cast.
 */
export type PeriodSpan = 'current' | 'previous';

/** The query parameter the selected turn is kept in. */
const SPAN_PARAM = 'span';

/**
 * The turns in display order. `current` leads, so it is the default and the one
 * written as no parameter at all — a bare `/crypto/leaders` still opens on the
 * period that is running.
 */
const SPANS: PeriodSpan[] = ['current', 'previous'];

/**
 * A segmented control over the two turns, and the one that is selected.
 *
 * `ToggleButtonGroup` rather than a second strip of `Tabs`: tabs inside a tab
 * panel is a structure a screen reader cannot describe — the inner list would
 * be announced as another set of tabs for the same region — and it would mean
 * repeating the indicator workaround `PeriodTabsRoot` carries. A `Switch` was
 * the other candidate and names only one of its two states, which is exactly
 * the thing a reader needs to see here: both turns are labelled with the period
 * they are, so `2026 | 2025` says what a switch marked *Previous* would leave
 * to be worked out.
 *
 * Both turns arrive already rendered and this picks between them, the way
 * `PeriodTabs` hands every period's panel to `Tabs`. They are Server Components
 * by the time they get here, so switching costs no fetch and no second
 * formatting pass — it is the same bargain the period tabs strike, and the
 * reason the query builds all eight windows at once.
 *
 * Rendered once per period rather than once per page, which is what lets the
 * buttons carry that period's own names: the panel it sits in already knows
 * whether it is the year or the week being ranked. The parameter is shared, so
 * moving between periods keeps the turn — someone comparing last month with
 * last quarter stays on `previous`.
 */
export default function PeriodSpanToggle({
  label,
  labels,
  panels,
}: {
  /** Names the group for a screen reader, which the buttons alone do not. */
  label: string;
  /** What each turn is called — this period's own names for them. */
  labels: Record<PeriodSpan, string>;
  /** Each turn's ranking, already rendered. */
  panels: Record<PeriodSpan, ReactNode>;
}) {
  const [selected, select] = useUrlParam(SPAN_PARAM, SPANS);

  return (
    <>
      <ToggleButtonGroup
        aria-label={label}
        /* A turn is always on show: clicking the selected button again would
         * otherwise clear the selection and leave the panel below it empty. */
        disallowEmptySelection
        onSelectionChange={(keys) => {
          // Single selection, so the set holds one key — or none, which
          // `disallowEmptySelection` makes unreachable but the type still
          // allows. React Aria types a key as `Key`, so the turn it names is
          // found among the two rather than asserted to be one of them.
          const [key] = keys;
          const span = SPANS.find((candidate) => candidate === key);

          if (span !== undefined) {
            select(span);
          }
        }}
        selectedKeys={[selected]}
        selectionMode="single"
        size="sm"
      >
        {SPANS.map((span) => (
          <ToggleButton id={span} key={span}>
            {labels[span]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {panels[selected]}
    </>
  );
}
