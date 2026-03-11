export const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'get_price',
        description: 'Lấy giá coin',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
          required: ['query'],
        },
      },
    ],
  },
  {
    functionDeclarations: [
      {
        name: 'search_knowledge',
        description: 'Tìm kiến thức hệ thống',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
          required: ['query'],
        },
      },
    ],
  },
];