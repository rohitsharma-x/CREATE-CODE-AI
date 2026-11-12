const Chat = require('../models/Chat');
const Message = require('../models/Message');
const aiService = require('../services/ai.service');
const User = require('../models/User');

/**
 * Get all user chats
 * GET /api/chats
 */
const getChats = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { user: req.user._id };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const chats = await Chat.find(query).sort('-lastMessageAt');

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new chat session
 * POST /api/chats
 */
const createChat = async (req, res, next) => {
  try {
    const { title, language, mode, project } = req.body;

    const chat = await Chat.create({
      user: req.user._id,
      title: title || 'New Conversation',
      language: language || req.user.defaultLanguage || 'javascript',
      mode: mode || req.user.defaultAiMode || 'Debug',
      project: project || null,
    });

    res.status(201).json({
      success: true,
      chat,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single chat with messages
 * GET /api/chats/:id
 */
const getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat conversation not found.',
      });
    }

    const messages = await Message.find({ chat: chat._id }).sort('createdAt');

    res.status(200).json({
      success: true,
      chat,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Rename or update chat
 * PATCH /api/chats/:id
 */
const updateChat = async (req, res, next) => {
  try {
    const { title, language, mode, pinned } = req.body;

    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.',
      });
    }

    if (title) chat.title = title;
    if (language) chat.language = language;
    if (mode) chat.mode = mode;
    if (pinned !== undefined) chat.pinned = pinned;

    await chat.save();

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete chat session
 * DELETE /api/chats/:id
 */
const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.',
      });
    }

    await Message.deleteMany({ chat: chat._id });

    res.status(200).json({
      success: true,
      message: 'Chat deleted.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Send message and receive AI response (Supports JSON & SSE streaming)
 * POST /api/chats/:id/messages
 */
const sendMessage = async (req, res, next) => {
  try {
    const { text, code, language, mode, stream } = req.body;

    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.',
      });
    }

    const activeLanguage = language || chat.language;
    const activeMode = mode || chat.mode;

    // 1. Save user message
    const userMessage = await Message.create({
      chat: chat._id,
      user: req.user._id,
      sender: 'user',
      text: text || '',
      code: code || '',
      language: activeLanguage,
      mode: activeMode,
    });

    // Auto-update chat title if still 'New Conversation'
    if (chat.title === 'New Conversation' || chat.title === 'New Chat') {
      const summaryTitle = text ? text.slice(0, 35) : `${activeMode} ${activeLanguage}`;
      chat.title = summaryTitle;
    }
    chat.lastMessageAt = new Date();
    await chat.save();

    // Fetch previous conversation context (up to 8 recent messages before current)
    const historyMessages = await Message.find({
      chat: chat._id,
      _id: { $ne: userMessage._id },
    })
      .sort('createdAt')
      .limit(10);

    const conversationHistory = historyMessages.map((m) => ({
      sender: m.sender,
      text: m.text,
      code: m.code,
      correctedCode: m.structuredResponse?.correctedCode || m.structuredResponse?.optimizedCode || '',
    }));

    // 2. SSE streaming support
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Send initial ack
      res.write(`data: ${JSON.stringify({ status: 'analyzing', message: 'Analyzing code structure...' })}\n\n`);

      const aiResponse = await aiService.generateChatResponse({
        mode: activeMode,
        language: activeLanguage,
        code,
        userMessage: text,
        conversationHistory,
      });

      // Stream the structured response
      res.write(`data: ${JSON.stringify({ status: 'completed', response: aiResponse })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();

      // Save assistant message to DB
      await Message.create({
        chat: chat._id,
        user: req.user._id,
        sender: 'assistant',
        text: aiResponse.summary || aiResponse.explanation || '',
        code: aiResponse.correctedCode || aiResponse.optimizedCode || '',
        language: activeLanguage,
        mode: activeMode,
        structuredResponse: aiResponse,
      });

      // Increment user AI usage
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'apiUsage.aiRequests': 1 },
      });

      return;
    }

    // 3. Direct JSON response
    const aiResponse = await aiService.generateChatResponse({
      mode: activeMode,
      language: activeLanguage,
      code,
      userMessage: text,
      conversationHistory,
    });

    const assistantMessage = await Message.create({
      chat: chat._id,
      user: req.user._id,
      sender: 'assistant',
      text: aiResponse.summary || aiResponse.explanation || '',
      code: aiResponse.correctedCode || '',
      language: activeLanguage,
      mode: activeMode,
      structuredResponse: aiResponse,
    });

    // Increment user AI usage
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'apiUsage.aiRequests': 1 },
    });

    res.status(200).json({
      success: true,
      userMessage,
      assistantMessage,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getChats,
  createChat,
  getChatById,
  updateChat,
  deleteChat,
  sendMessage,
};

