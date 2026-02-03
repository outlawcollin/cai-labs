export interface BookChapter {
  id: string;
  title: string;
  act: string;
}

export interface BookCharacter {
  id: string;
  name: string;
}

export interface CommunityRewrite {
  id: string;
  premise: string;
}

export interface BookData {
  slug: string;
  title: string;
  author: string;
  year: string;
  origin: string;
  accentColor: string;
  coverSrc: string | null;
  spineSrc: string | null;
  synopsis: string;
  chapters: BookChapter[];
  playableCharacters: BookCharacter[];
  communityRewrites: CommunityRewrite[];
  hasBookmark?: boolean;
  hasMyCopy?: boolean;
}

const BASE_BOOKS: BookData[] = [
  {
    slug: "romeo-and-juliet",
    title: "Romeo and Juliet",
    author: "William Shakespeare",
    year: "First published 1597",
    origin: "England",
    accentColor: "#73cee1",
    coverSrc: null,
    spineSrc: null,
    synopsis:
      "Two teenagers fall in love. Their families have been killing each other for generations. It does not end well.",
    chapters: [
      { id: "r1", act: "ACT I", title: "The Feud Begins" },
      { id: "r2", act: "ACT II", title: "The Balcony" },
      { id: "r3", act: "ACT III", title: "Sword & Exile" },
      { id: "r4", act: "ACT IV", title: "The Plan" },
      { id: "r5", act: "ACT V", title: "The Tomb" },
    ],
    playableCharacters: [
      { id: "romeo", name: "Romeo" },
      { id: "juliet", name: "Juliet" },
      { id: "mercutio", name: "Mercutio" },
      { id: "tybalt", name: "Tybalt" },
      { id: "nurse", name: "Nurse" },
      { id: "friar", name: "Friar Lawrence" },
    ],
    communityRewrites: [
      { id: "rr1", premise: "Romeo is a food critic and the Capulets own the only good restaurant in town." },
      { id: "rr2", premise: "Juliet faked her death but actually liked being dead so she just stayed that way." },
      { id: "rr3", premise: "The Nurse is a secret assassin working for a third family no one's heard of." },
      { id: "rr4", premise: "Friar Lawrence's plan actually works and now everyone's at an awkward wedding." },
      { id: "rr5", premise: "Tybalt is a divorce lawyer and business is booming." },
      { id: "rr6", premise: "Mercutio survives and starts a podcast about the drama." },
      { id: "rr7", premise: "Set in a mall food court in 1987." },
    ],
  },
  {
    slug: "frankenstein",
    title: "Frankenstein",
    author: "Mary Shelley",
    year: "First published 1818",
    origin: "England",
    accentColor: "#8b9a46",
    coverSrc: null,
    spineSrc: null,
    synopsis:
      "A young scientist builds a creature from stolen body parts and immediately regrets it. The creature, understandably, has feelings about this.",
    chapters: [
      { id: "f1", act: "VOL I", title: "The Letters" },
      { id: "f2", act: "VOL I", title: "The Creation" },
      { id: "f3", act: "VOL II", title: "The Creature's Tale" },
      { id: "f4", act: "VOL III", title: "The Bride" },
      { id: "f5", act: "VOL III", title: "The Chase" },
    ],
    playableCharacters: [
      { id: "victor", name: "Victor Frankenstein" },
      { id: "creature", name: "The Creature" },
      { id: "elizabeth", name: "Elizabeth" },
      { id: "walton", name: "Captain Walton" },
    ],
    communityRewrites: [
      { id: "fr1", premise: "The creature starts a support group for other misunderstood monsters." },
      { id: "fr2", premise: "Victor actually takes responsibility and becomes a decent parent." },
      { id: "fr3", premise: "The creature gets really into competitive baking." },
    ],
  },
  {
    slug: "count-of-monte-cristo",
    title: "The Count of Monte Cristo",
    author: "Alexandre Dumas",
    year: "First published 1844",
    origin: "France",
    accentColor: "#c4a35a",
    coverSrc: null,
    spineSrc: null,
    synopsis:
      "A sailor is wrongfully imprisoned for fourteen years, escapes, finds a massive treasure, and reinvents himself to systematically destroy everyone who betrayed him.",
    chapters: [
      { id: "m1", act: "PART I", title: "The Arrest" },
      { id: "m2", act: "PART II", title: "Château d'If" },
      { id: "m3", act: "PART III", title: "The Treasure" },
      { id: "m4", act: "PART IV", title: "The Count" },
      { id: "m5", act: "PART V", title: "The Reckoning" },
    ],
    playableCharacters: [
      { id: "edmond", name: "Edmond Dantès" },
      { id: "mercedes", name: "Mercédès" },
      { id: "fernand", name: "Fernand" },
      { id: "abbe", name: "Abbé Faria" },
    ],
    communityRewrites: [
      { id: "mr1", premise: "Edmond gets out of prison and decides revenge is exhausting. Opens a vineyard instead." },
      { id: "mr2", premise: "Abbé Faria's treasure turns out to be an NFT collection." },
      { id: "mr3", premise: "Mercédès never married Fernand and has been waiting tables at a Marseille café for 14 years." },
    ],
  },
  {
    slug: "alice-in-wonderland",
    title: "Alice in Wonderland",
    author: "Lewis Carroll",
    year: "First published 1865",
    origin: "England",
    accentColor: "#7ec8a0",
    coverSrc: null,
    spineSrc: null,
    synopsis:
      "A girl falls down a rabbit hole into a world where nothing makes sense, everyone is rude, and the legal system is a card game.",
    chapters: [
      { id: "a1", act: "CH I", title: "Down the Rabbit-Hole" },
      { id: "a2", act: "CH V", title: "Advice from a Caterpillar" },
      { id: "a3", act: "CH VII", title: "A Mad Tea-Party" },
      { id: "a4", act: "CH VIII", title: "The Queen's Croquet-Ground" },
      { id: "a5", act: "CH XII", title: "Alice's Evidence" },
    ],
    playableCharacters: [
      { id: "alice", name: "Alice" },
      { id: "hatter", name: "Mad Hatter" },
      { id: "queen", name: "Queen of Hearts" },
      { id: "cheshire", name: "Cheshire Cat" },
    ],
    communityRewrites: [
      { id: "ar1", premise: "Alice is a therapist and Wonderland is her waiting room." },
      { id: "ar2", premise: "The Cheshire Cat is actually a real estate agent showing Alice around." },
      { id: "ar3", premise: "The Mad Hatter's tea party is actually a startup pitch meeting." },
    ],
  },
  {
    slug: "pride-and-prejudice",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    year: "First published 1813",
    origin: "England",
    accentColor: "#d4a0c0",
    coverSrc: null,
    spineSrc: null,
    synopsis:
      "A woman who judges too quickly and a man who is too proud to be likeable keep misunderstanding each other until they don't.",
    chapters: [
      { id: "p1", act: "VOL I", title: "The Arrival" },
      { id: "p2", act: "VOL I", title: "First Impressions" },
      { id: "p3", act: "VOL II", title: "The Letter" },
      { id: "p4", act: "VOL III", title: "Pemberley" },
      { id: "p5", act: "VOL III", title: "The Elopement" },
    ],
    playableCharacters: [
      { id: "elizabeth", name: "Elizabeth Bennet" },
      { id: "darcy", name: "Mr. Darcy" },
      { id: "jane", name: "Jane Bennet" },
      { id: "lydia", name: "Lydia Bennet" },
      { id: "wickham", name: "Mr. Wickham" },
    ],
    communityRewrites: [
      { id: "pr1", premise: "Mr. Darcy is a tech CEO and Elizabeth is a journalist writing an exposé on his company." },
      { id: "pr2", premise: "Mrs. Bennet starts a reality dating show to marry off her daughters." },
      { id: "pr3", premise: "Wickham runs a pyramid scheme and Lydia is his top recruiter." },
    ],
  },
];

export const BOOKS: BookData[] = Array.from({ length: 4 }, (_, round) =>
  BASE_BOOKS.map((b) => ({
    ...b,
    slug: round === 0 ? b.slug : `${b.slug}-${round + 1}`,
  }))
).flat();
