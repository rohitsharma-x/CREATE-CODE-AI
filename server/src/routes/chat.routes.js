const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
  .get(chatController.getChats)
  .post(chatController.createChat);

router.route('/:id')
  .get(chatController.getChatById)
  .patch(chatController.updateChat)
  .delete(chatController.deleteChat);

router.post('/:id/messages', chatController.sendMessage);

module.exports = router;

