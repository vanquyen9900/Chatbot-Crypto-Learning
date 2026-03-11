import { BookOpen, CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const lessons = [
  {
    id: 1,
    title: 'What is Cryptocurrency?',
    description: 'Learn the basics of digital currency and blockchain technology',
    duration: '10 min',
    level: 'Beginner',
    topics: ['Blockchain', 'Digital Currency', 'Bitcoin'],
    completed: false
  },
  {
    id: 2,
    title: 'Understanding Blockchain',
    description: 'Discover how blockchain technology powers cryptocurrencies',
    duration: '15 min',
    level: 'Beginner',
    topics: ['Decentralization', 'Mining', 'Consensus'],
    completed: false
  },
  {
    id: 3,
    title: 'Types of Cryptocurrencies',
    description: 'Explore different types of crypto assets and their purposes',
    duration: '12 min',
    level: 'Beginner',
    topics: ['Bitcoin', 'Ethereum', 'Altcoins'],
    completed: false
  },
  {
    id: 4,
    title: 'How to Read Crypto Charts',
    description: 'Master the basics of technical analysis and price charts',
    duration: '20 min',
    level: 'Intermediate',
    topics: ['Candlesticks', 'Trends', 'Support & Resistance'],
    completed: false
  },
  {
    id: 5,
    title: 'Market Orders vs Limit Orders',
    description: 'Understand different order types for trading',
    duration: '10 min',
    level: 'Intermediate',
    topics: ['Order Types', 'Trading Strategy'],
    completed: false
  },
  {
    id: 6,
    title: 'Risk Management Basics',
    description: 'Learn how to manage risk and protect your portfolio',
    duration: '18 min',
    level: 'Intermediate',
    topics: ['Portfolio Management', 'Diversification', 'Stop Loss'],
    completed: false
  },
  {
    id: 7,
    title: 'DeFi and Smart Contracts',
    description: 'Introduction to decentralized finance and programmable money',
    duration: '25 min',
    level: 'Advanced',
    topics: ['Smart Contracts', 'DeFi', 'Ethereum'],
    completed: false
  },
  {
    id: 8,
    title: 'Advanced Trading Strategies',
    description: 'Explore sophisticated trading techniques and patterns',
    duration: '30 min',
    level: 'Advanced',
    topics: ['Technical Analysis', 'Trading Psychology'],
    completed: false
  }
];

export function Learn() {
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [filterLevel, setFilterLevel] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');

  const filteredLessons = filterLevel === 'all' 
    ? lessons 
    : lessons.filter(lesson => lesson.level === filterLevel);

  const handleStartLesson = (lessonId: number) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };

  const totalLessons = lessons.length;
  const completedCount = completedLessons.length;
  const progressPercent = (completedCount / totalLessons) * 100;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-black">Learn Crypto Trading</h1>
        <p className="text-black/60">Master cryptocurrency fundamentals at your own pace</p>
      </div>

      {/* Progress Overview */}
      <div className="mb-8 rounded-xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="mb-1 font-bold text-black">Your Progress</h3>
            <p className="text-sm text-black/60">
              {completedCount} of {totalLessons} lessons completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-black">{progressPercent.toFixed(0)}%</div>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full bg-[#9EEC37] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <span className="flex items-center text-sm font-medium text-black/60">Filter by level:</span>
        {['all', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
          <button
            key={level}
            onClick={() => setFilterLevel(level as typeof filterLevel)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterLevel === level
                ? 'bg-[#9EEC37] text-black'
                : 'border border-black/10 bg-white text-black/60 hover:bg-black/5'
            }`}
          >
            {level === 'all' ? 'All Levels' : level}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLessons.map((lesson) => {
          const isCompleted = completedLessons.includes(lesson.id);
          
          return (
            <div
              key={lesson.id}
              className="flex flex-col rounded-xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Lesson Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9EEC37]/20">
                  <BookOpen className="h-6 w-6 text-black" />
                </div>
                {isCompleted ? (
                  <div className="flex items-center gap-1 rounded-full bg-[#9EEC37] px-3 py-1 text-xs font-medium text-black">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-black/60">
                    <Circle className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Lesson Content */}
              <div className="mb-4 flex-1">
                <h3 className="mb-2 font-bold text-black">{lesson.title}</h3>
                <p className="mb-4 text-sm text-black/60">{lesson.description}</p>

                {/* Lesson Meta */}
                <div className="mb-3 flex items-center gap-4 text-xs text-black/60">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lesson.duration}
                  </div>
                  <div className={`rounded-full px-2 py-0.5 ${
                    lesson.level === 'Beginner' 
                      ? 'bg-[#9EEC37]/20 text-black'
                      : lesson.level === 'Intermediate'
                      ? 'bg-black/10 text-black/60'
                      : 'bg-black/20 text-black'
                  }`}>
                    {lesson.level}
                  </div>
                </div>

                {/* Topics */}
                <div className="flex flex-wrap gap-2">
                  {lesson.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full border border-black/10 bg-white px-2 py-1 text-xs text-black/60"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleStartLesson(lesson.id)}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-medium transition-colors ${
                  isCompleted
                    ? 'border border-black/10 bg-white text-black/60 hover:bg-black/5'
                    : 'bg-[#9EEC37] text-black hover:opacity-90'
                }`}
              >
                {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="rounded-xl border border-black/10 bg-white p-12 text-center shadow-sm">
          <p className="text-black/60">No lessons found for this level.</p>
        </div>
      )}

      {/* Learning Path */}
      <div className="mt-12 rounded-xl border border-black/10 bg-white p-8 shadow-sm">
        <h2 className="mb-6 font-bold text-black">Recommended Learning Path</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-black/10 bg-[#9EEC37]/10 p-6">
            <div className="mb-2 text-2xl font-bold text-black">1</div>
            <h4 className="mb-2 font-bold text-black">Foundation</h4>
            <p className="text-sm text-black/60">
              Start with beginner lessons to understand crypto basics and blockchain technology
            </p>
          </div>
          <div className="rounded-lg border border-black/10 bg-black/5 p-6">
            <div className="mb-2 text-2xl font-bold text-black">2</div>
            <h4 className="mb-2 font-bold text-black">Practice</h4>
            <p className="text-sm text-black/60">
              Apply your knowledge with intermediate lessons and practice trading with virtual money
            </p>
          </div>
          <div className="rounded-lg border border-black/10 bg-white p-6">
            <div className="mb-2 text-2xl font-bold text-black">3</div>
            <h4 className="mb-2 font-bold text-black">Advanced</h4>
            <p className="text-sm text-black/60">
              Master advanced concepts like DeFi and sophisticated trading strategies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
