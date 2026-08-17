import Section, { sectionIds } from '@/features/marketing/ui/section';
import { QuoteOpen } from '@gravity-ui/icons';
import { Card } from '@heroui/react';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  /** The rank they pay for — the same three words the pricing below uses. */
  rank: 'Genin' | 'Chunin' | 'Jonin';
}

/**
 * PLACEHOLDER COPY. These three are written, not collected — there is no
 * customer behind any of them yet.
 *
 * Replace them with real quotes before this page is public, and keep the shape:
 * a name, a role and a rank, so the reader can tell whose experience they are
 * reading and at which tier. Do not add stars, counts or "verified" badges to
 * stand in for testimonials you do not have — a fabricated rating is a claim
 * about other people, which is a different thing from a claim about the
 * product.
 */
const testimonials: Testimonial[] = [
  {
    quote:
      'I had four systems in four spreadsheets and no idea which one was actually paying. Seeing them ranked side by side, on the same data, ended about a year of arguing with myself.',
    name: 'Marco Villanueva',
    role: 'Full-time trader, Manila',
    rank: 'Jonin',
  },
  {
    quote:
      'The part I did not expect was the losing side. Every system tells you upfront what kind of market ruins it, so when a run of red arrives I know whether it is the strategy or just the weather.',
    name: 'Aileen Reyes',
    role: 'Software engineer, swing trader',
    rank: 'Chunin',
  },
  {
    quote:
      'Started on the free rank purely to watch the PSE indices. Six weeks in I was following the trend signals properly instead of buying whatever was in the news that morning.',
    name: 'Josh Tan',
    role: 'New to systematic trading',
    rank: 'Genin',
  },
];

/**
 * Initials for the avatar plate, from however many words the name has. Two at
 * most: three letters in a 40px circle stop being legible.
 */
function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('');
}

export default function Testimonials() {
  return (
    <Section
      id={sectionIds.testimonials}
      eyebrow="From the dojo"
      title="Traders who stopped improvising"
      lede="What changes is rarely the win rate on any one trade. It is knowing which rule you are following, and being able to tell a bad system from a bad week."
    >
      {/*
       * A static grid, deliberately not a carousel. A rotating one would need
       * pause and previous/next controls, keyboard operation, a live-region
       * announcement of the slide position, and a static final state under
       * `prefers-reduced-motion` — all of it to hide two quotes that fit on the
       * page perfectly well.
       */}
      <ul className="grid gap-4 md:grid-cols-3">
        {testimonials.map(({ name, quote, rank, role }) => (
          <li key={name}>
            <Card className="h-full">
              <Card.Content className="gap-4">
                <QuoteOpen
                  aria-hidden
                  className="size-6 shrink-0 text-accent"
                />
                {/*
                 * A real `<blockquote>`: it is what puts the quotation in the
                 * accessibility tree as a quotation, and it is what lets the
                 * `<figcaption>` below be read as its attribution rather than
                 * as another paragraph that happens to sit underneath.
                 */}
                <figure className="flex flex-1 flex-col gap-5">
                  <blockquote className="flex-1 text-pretty">
                    {/*
                     * Curly quotes in the markup rather than as decoration in
                     * CSS, so a screen reader and a copy-paste both get them.
                     */}
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                  <figcaption className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-tertiary text-sm font-semibold"
                    >
                      {initials(name)}
                    </span>
                    <span className="min-w-0">
                      {/*
                       * `truncate` on the role and not the name: a long job
                       * title is worth clipping, a person's name is not.
                       */}
                      <span className="block font-medium">{name}</span>
                      <span className="block truncate text-sm text-muted">
                        {role} · {rank}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </Card.Content>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
