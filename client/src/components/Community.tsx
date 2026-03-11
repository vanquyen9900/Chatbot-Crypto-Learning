import { useState } from 'react';
import { MessageSquare, ThumbsUp, User, Clock, Plus, Search, TrendingUp, UserPlus } from 'lucide-react';

interface Post {
  id: number;
  author: string;
  avatar: string;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  category: string;
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: 'Nguyễn Minh',
    avatar: 'NM',
    title: 'Vừa hoàn thành giao dịch ảo đầu tiên!',
    content: 'Cuối cùng cũng hiểu cách lệnh limit hoạt động sau khi thực hành với BTC. Nền tảng này giúp học rất dễ dàng!',
    timestamp: '2 giờ trước',
    likes: 24,
    comments: 8,
    category: 'Chia sẻ'
  },
  {
    id: 2,
    author: 'Trần Hương',
    avatar: 'TH',
    title: 'Câu hỏi về đa dạng hóa danh mục đầu tư',
    content: 'Người mới nên nắm giữ bao nhiêu loại coin khác nhau? Mong nhận được lời khuyên từ các bạn có kinh nghiệm.',
    timestamp: '4 giờ trước',
    likes: 15,
    comments: 12,
    category: 'Thảo luận'
  },
  {
    id: 3,
    author: 'Lê Anh',
    avatar: 'LA',
    title: 'Bitcoin tăng mạnh hôm nay',
    content: 'BTC vừa vượt mốc $45,000! Các bạn nghĩ xu hướng này sẽ tiếp tục không?',
    timestamp: '5 giờ trước',
    likes: 31,
    comments: 15,
    category: 'Thị trường'
  },
  {
    id: 4,
    author: 'Phạm Tuấn',
    avatar: 'PT',
    title: 'Mẹo đọc biểu đồ nến',
    content: 'Sau khi học xong bài về phân tích kỹ thuật, mình muốn chia sẻ một số mẹo giúp hiểu các mẫu hình nến tốt hơn...',
    timestamp: '8 giờ trước',
    likes: 42,
    comments: 18,
    category: 'Kiến thức'
  },
  {
    id: 5,
    author: 'Hoàng Mai',
    avatar: 'HM',
    title: 'Làm sao để quản lý rủi ro khi giao dịch?',
    content: 'Các bạn thường áp dụng các chiến lược quản lý rủi ro như thế nào? Mình đang muốn học hỏi thêm.',
    timestamp: '12 giờ trước',
    likes: 28,
    comments: 22,
    category: 'Thảo luận'
  },
  {
    id: 6,
    author: 'Đỗ Linh',
    avatar: 'DL',
    title: 'Đạt $15,000 lợi nhuận ảo!',
    content: 'Bắt đầu với $10,000 ba tuần trước và vừa đạt $15,000 nhờ giao dịch cẩn thận và học hỏi. Môi trường thực hành này tuyệt vời!',
    timestamp: '1 ngày trước',
    likes: 67,
    comments: 14,
    category: 'Chia sẻ'
  }
];

const trendingCoins = [
  { name: 'Bitcoin', symbol: 'BTC', mentions: 156, change: '+5.2%' },
  { name: 'Ethereum', symbol: 'ETH', mentions: 98, change: '+3.1%' },
  { name: 'Solana', symbol: 'SOL', mentions: 67, change: '+8.7%' },
];

const suggestedUsers = [
  { name: 'Nguyễn Văn A', avatar: 'NA', description: 'Trader có kinh nghiệm', followers: 234 },
  { name: 'Trần Thị B', avatar: 'TB', description: 'Chuyên gia phân tích', followers: 189 },
  { name: 'Lê Văn C', avatar: 'LC', description: 'Nhà giáo dục crypto', followers: 312 },
];

export function Community() {
  const [posts] = useState<Post[]>(mockPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const categories = ['all', 'Thảo luận', 'Chia sẻ', 'Kiến thức', 'Thị trường'];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-black">Cộng đồng</h1>
        <p className="text-black/60">Kết nối với cộng đồng, chia sẻ kinh nghiệm và đặt câu hỏi</p>
      </div>

      {/* What's Hot Today */}
      <div className="mb-8 rounded-xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-black">Hôm nay có gì hot? 🔥</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-black/10 bg-black/5 p-4">
            <div className="mb-2 text-2xl font-bold text-black">2,547</div>
            <div className="text-sm text-black/60">Thành viên hoạt động</div>
          </div>
          <div className="rounded-lg border border-black/10 bg-black/5 p-4">
            <div className="mb-2 text-2xl font-bold text-black">156</div>
            <div className="text-sm text-black/60">Bài viết hôm nay</div>
          </div>
          <div className="rounded-lg border border-black/10 bg-black/5 p-4">
            <div className="mb-2 text-2xl font-bold text-black">1,234</div>
            <div className="text-sm text-black/60">Tổng bài viết</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content - Posts */}
        <div className="lg:col-span-2">
          {/* Search and Create Post */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-black/40" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-4 text-black placeholder:text-black/40 focus:border-[#9EEC37] focus:outline-none focus:ring-2 focus:ring-[#9EEC37]/20"
              />
            </div>

            <button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className="flex items-center gap-2 rounded-lg bg-[#9EEC37] px-6 py-2.5 font-medium text-black transition-opacity hover:opacity-90"
            >
              <Plus className="h-5 w-5" />
              Tạo bài viết
            </button>
          </div>

          {/* Create Post Form */}
          {showCreatePost && (
            <div className="mb-6 rounded-xl border border-black/10 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-black">Tạo bài viết mới</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">Tiêu đề</label>
                  <input
                    type="text"
                    placeholder="Nhập tiêu đề bài viết..."
                    className="w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-black placeholder:text-black/40 focus:border-[#9EEC37] focus:outline-none focus:ring-2 focus:ring-[#9EEC37]/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">Danh mục</label>
                  <select className="w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-black focus:border-[#9EEC37] focus:outline-none focus:ring-2 focus:ring-[#9EEC37]/20">
                    <option>Thảo luận</option>
                    <option>Chia sẻ</option>
                    <option>Kiến thức</option>
                    <option>Thị trường</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">Nội dung</label>
                  <textarea
                    rows={4}
                    placeholder="Chia sẻ suy nghĩ của bạn..."
                    className="w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-black placeholder:text-black/40 focus:border-[#9EEC37] focus:outline-none focus:ring-2 focus:ring-[#9EEC37]/20"
                  />
                </div>
                <div className="flex gap-3">
                  <button className="rounded-lg bg-[#9EEC37] px-6 py-2 font-medium text-black transition-opacity hover:opacity-90">
                    Đăng bài
                  </button>
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="rounded-lg border border-black/10 bg-white px-6 py-2 font-medium text-black transition-colors hover:bg-black/5"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#9EEC37] text-black'
                    : 'border border-black/10 bg-white text-black/60 hover:bg-black/5'
                }`}
              >
                {category === 'all' ? 'Tất cả' : category}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Post Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9EEC37]/20 font-bold text-sm text-black">
                      {post.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-black">{post.author}</div>
                      <div className="flex items-center gap-2 text-sm text-black/60">
                        <Clock className="h-3 w-3" />
                        {post.timestamp}
                      </div>
                    </div>
                  </div>
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60">
                    {post.category}
                  </span>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <h3 className="mb-2 font-medium text-black">{post.title}</h3>
                  <p className="text-sm text-black/60">{post.content}</p>
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-4 border-t border-black/10 pt-4">
                  <button className="flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.likes} thích</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments} bình luận</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="rounded-xl border border-black/10 bg-white p-12 text-center shadow-sm">
              <p className="text-black/60">Không tìm thấy bài viết phù hợp.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Coins */}
          <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-black">
              <TrendingUp className="h-5 w-5" />
              Coin đang được quan tâm
            </h3>
            <div className="space-y-3">
              {trendingCoins.map((coin) => (
                <div key={coin.symbol} className="flex items-center justify-between rounded-lg border border-black/10 bg-black/5 p-3">
                  <div>
                    <div className="font-medium text-black">{coin.name}</div>
                    <div className="text-sm text-black/60">{coin.mentions} lượt nhắc đến</div>
                  </div>
                  <div className="text-sm font-medium text-green-600">{coin.change}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Users to Follow */}
          <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-black">
              <UserPlus className="h-5 w-5" />
              Gợi ý theo dõi
            </h3>
            <div className="space-y-3">
              {suggestedUsers.map((user) => (
                <div key={user.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9EEC37]/20 font-bold text-sm text-black">
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-black">{user.name}</div>
                      <div className="text-xs text-black/60">{user.description}</div>
                    </div>
                  </div>
                  <button className="rounded-lg border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black transition-colors hover:bg-black/5">
                    Theo dõi
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-black">Quy tắc cộng đồng</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#9EEC37] text-xs font-bold text-black">
                  1
                </div>
                <div className="text-sm text-black/60">Tôn trọng mọi thành viên</div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#9EEC37] text-xs font-bold text-black">
                  2
                </div>
                <div className="text-sm text-black/60">Chia sẻ kiến thức hữu ích</div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#9EEC37] text-xs font-bold text-black">
                  3
                </div>
                <div className="text-sm text-black/60">Đặt câu hỏi một cách lịch sự</div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#9EEC37] text-xs font-bold text-black">
                  4
                </div>
                <div className="text-sm text-black/60">Tập trung vào học tập</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}