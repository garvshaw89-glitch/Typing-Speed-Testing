export interface QuoteItem {
  id: string;
  text: string;
  author: string;
  source: string;
  length: 'short' | 'medium' | 'long';
}

export const QUOTES_DATABASE: QuoteItem[] = [
  {
    id: 'quote_1',
    text: 'That brain of mine is something more than merely mortal; as time will show.',
    author: 'Ada Lovelace',
    source: 'Letters of Ada Lovelace',
    length: 'short',
  },
  {
    id: 'quote_2',
    text: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.',
    author: 'Alan Turing',
    source: 'Computing Machinery and Intelligence',
    length: 'short',
  },
  {
    id: 'quote_3',
    text: 'Somewhere, something incredible is waiting to be known. The cosmos is within us. We are made of star-stuff.',
    author: 'Carl Sagan',
    source: 'Cosmos',
    length: 'medium',
  },
  {
    id: 'quote_4',
    text: 'Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.',
    author: 'Marie Curie',
    source: 'Notes and Reflections',
    length: 'medium',
  },
  {
    id: 'quote_5',
    text: 'The impediment to action advances action. What stands in the way becomes the way.',
    author: 'Marcus Aurelius',
    source: 'Meditations',
    length: 'short',
  },
  {
    id: 'quote_6',
    text: 'Simplicity is prerequisite for reliability. Software engineering is the art of mastering complexity.',
    author: 'Edsger W. Dijkstra',
    source: 'Selected Writings on Computing',
    length: 'medium',
  },
  {
    id: 'quote_7',
    text: 'The best way to predict the future is to invent it. Perspective is worth 80 IQ points when solving hard problems.',
    author: 'Alan Kay',
    source: 'Viewpoints Research Institute',
    length: 'medium',
  },
  {
    id: 'quote_8',
    text: 'It is not the critic who counts; not the man who points out how the strong man stumbles. The credit belongs to the man who is actually in the arena.',
    author: 'Theodore Roosevelt',
    source: 'Citizenship in a Republic',
    length: 'long',
  },
  {
    id: 'quote_9',
    text: 'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.',
    author: 'Ralph Waldo Emerson',
    source: 'Self-Reliance',
    length: 'medium',
  },
  {
    id: 'quote_10',
    text: 'A computer would deserve to be called intelligent if it could deceive a human into believing that it was human.',
    author: 'Alan Turing',
    source: 'Computing Machinery and Intelligence',
    length: 'medium',
  },
  {
    id: 'quote_11',
    text: 'Look deep into nature, and then you will understand everything better. Imagination is more important than knowledge.',
    author: 'Albert Einstein',
    source: 'Out of My Later Years',
    length: 'medium',
  },
  {
    id: 'quote_12',
    text: 'The most dangerous phrase in the language is, "We\'ve always done it this way." Dare to question conventions.',
    author: 'Grace Hopper',
    source: 'Lectures on Computer Science',
    length: 'medium',
  },
];
