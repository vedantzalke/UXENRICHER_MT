const express = require("express");
const { upvoteComment, downvoteComment , createComment, deleteComment, getAllComments, flagCommentById, RemoveflagCommentById, getFlaggedComments} = require('../controllers/commentController');
const { createReplyComment, upvoteReplyComment, downvoteReplyComment, deleteReplyComment, getAllRepliedComments, flagRepliesById, RemoveflagRepliesById, getFlaggedRepliesComments } = require('../controllers/replyCommentController');

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, createComment);
router.post("/upvote/:commentId", authMiddleware, upvoteComment);
router.post("/downvote/:commentId", authMiddleware, downvoteComment);
router.post("/deleteComment/:commentId", authMiddleware, deleteComment);
router.get("/allComments", authMiddleware, getAllComments);
router.get("/flag-comment/:commentId", authMiddleware, flagCommentById);
router.get("/remove-flag-comment/:commentId", authMiddleware, RemoveflagCommentById);
router.get("/get-flagged-comment", authMiddleware, getFlaggedComments);


//For Reply Comment
router.post("/replyComment", authMiddleware, createReplyComment);
router.post("/replyUpvote/:replyCommentId", authMiddleware, upvoteReplyComment);
router.post("/replyDownvote/:replyCommentId", authMiddleware, downvoteReplyComment);
router.post("/deleteReplyComment/:replyCommentId", authMiddleware, deleteReplyComment);
router.get("/allReplyComments/:replyCommentId", authMiddleware, getAllRepliedComments);
router.get("/flag-reply/:replyId", authMiddleware, flagRepliesById);
router.get("/remove-flag-reply/:replyId", authMiddleware, RemoveflagRepliesById);
router.get("/get-flagged-replies", authMiddleware, getFlaggedRepliesComments);




module.exports = router;
