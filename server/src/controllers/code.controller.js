const judge0Service = require('../services/judge0.service');
const { LANGUAGES } = require('../config/constants');
const User = require('../models/User');
const UsageLog = require('../models/UsageLog');

/**
 * Execute code
 * POST /api/code/execute
 */
const executeCode = async (req, res, next) => {
  try {
    const { sourceCode, language, stdin } = req.body;

    if (!sourceCode) {
      return res.status(400).json({
        success: false,
        message: 'Source code cannot be empty.',
      });
    }

    const start = Date.now();
    const result = await judge0Service.executeCode({
      sourceCode,
      language: language || 'javascript',
      stdin,
    });
    const duration = Date.now() - start;

    // Track usage
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'apiUsage.codeExecutions': 1 },
      });

      await UsageLog.create({
        user: req.user._id,
        actionType: 'code_execution',
        language: language || 'javascript',
        executionTimeMs: duration,
        success: result.statusCode === 3,
        metadata: {
          time: result.time,
          memory: result.memory,
          status: result.status,
        },
      });
    }

    res.status(200).json({
      success: true,
      result,
      execution: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Run test cases against user code
 * POST /api/code/test-cases
 */
const runTestCases = async (req, res, next) => {
  try {
    const { sourceCode, language, testCases } = req.body;

    if (!sourceCode) {
      return res.status(400).json({
        success: false,
        message: 'Source code cannot be empty.',
      });
    }

    const result = await judge0Service.runTestCases({
      sourceCode,
      language: language || 'javascript',
      testCases: Array.isArray(testCases) ? testCases : [],
    });

    res.status(200).json({
      success: true,
      result,
      execution: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get supported languages
 * GET /api/code/languages
 */
const getLanguages = (req, res) => {
  res.status(200).json({
    success: true,
    languages: LANGUAGES,
  });
};

module.exports = {
  executeCode,
  runTestCases,
  getLanguages,
};

