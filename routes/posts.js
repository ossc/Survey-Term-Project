var express = require('express'),
    Post = require('../models/post'),
    Comment = require('../models/comment'); //추가
var router = express.Router();

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', '로그인이 필요합니다.');
    res.redirect('/signin');
  }
}

function validateForm(form, options) {
  var email = form.email || "";
  var title = form.title || "";
  var question = form.question || "";
  var example1 = form.example1 || "";
  var example2 = form.example2 || "";

  title = title.trim();
  email = email.trim();
  question = question.trim();
  example1 = example1.trim();
  example2 = example2.trim();

  if (!email) { return '작성자를 입력해야 합니다.'; }

  if (!title) { return '제목을 입력해야 합니다.'; }

  if (!question) { return '질문을 입력해야 합니다.'; }

  if (!example1) { return '해당 질문에 대한 응답은 적어도 2개 이상 있어야 합니다.'; }
  if (!example2) { return '해당 질문에 대한 응답은 적어도 2개 이상 있어야 합니다.'; }

  return null;
}

function validateForm_Comment(form, options) {
  var answer = form.answer || "";
  var email = form.email || "";

  answer = answer.trim();
  email = email.trim();

  if (!email) {
    return '작성자를 입력해야 합니다.';
  }

  if (!answer) {
    return '보기를 입력해야 합니다.';
  }

  return null;
}

/* GET posts listing. */

router.get('/', needAuth, function(req, res, next) {
  Post.find({}, function(err, post) {
    if (err) {
      return next(err);
    }
    res.render('posts/index', {posts: post});
  });
});

router.get('/new', function(req, res, next) {
  res.render('posts/new');
});

router.post('/', function(req, res, next) {
  var err = validateForm(req.body);
  var post = new Post({
    email: req.body.email,
    title: req.body.title,
    question: req.body.question,
    example1: req.body.example1,
    example2: req.body.example2,
    example3: req.body.example3,
    example4: req.body.example4
  });
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  post.save(function(err) {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }
    res.redirect('/posts');
  });
});

router.get('/:id', function(req, res, next) {
  Post.findById(req.params.id, function(err, post) {
    if (err) {
      return next(err);
    }
    Comment.find({post: post.id}, function(err, comments) {
      if (err) {
        return next(err);
      }
      res.render('posts/show', {post: post, comments: comments});
    });
  });
});

router.get('/comments/:id', function(req, res, next) {
  Comment.findById(req.params.id, function(err, comment) {
    if (err) {
      return next(err);
    }
    res.render('posts/comment', {comment: comment});
  });
});


router.delete('/:id', function(req, res, next) {
  Post.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', '설문을 성공적으로 삭제하였습니다.');
    res.redirect('/posts');
  });
});

router.delete('/comments/:id', function(req, res, next) {
  Comment.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', '답변을 성공적으로 삭제하였습니다.');
    res.redirect('/posts');
  });
  Post.findByIdAndUpdate(req.params.id, function(err) {
    numComment = numComment - 1;
    if (err) {
        return next(err);
    }
  });
});

router.post('/:id/comments', function(req, res, next) {
  var err = validateForm_Comment(req.body);
  var comment = new Comment({
    post: req.params.id,
    content: req.body.content,
    answer: req.body.answer,
    email: req.body.email
  });
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  comment.save(function(err) {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }
    Post.findByIdAndUpdate(req.params.id, {$inc: {numComment: 1}}, function(err) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');
      }
      res.redirect('/posts/' + req.params.id);
    });
  });
});

module.exports = router;
