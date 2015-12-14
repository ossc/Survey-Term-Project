/*global $:false */
/*global _:false */
/*jslint browser:true */
var SurveyController = function() {
  function setAjaxHandler() {
    $( document ).ajaxStart(function() {
      $("#main").addClass("loading");
    }).ajaxStop(function() {
      $("#main").removeClass("loading");
    });
  }

  function checked(type, value) {
    var e = $("." + type + " .option[data-value='" + value + "']");
    return e.hasClass('selected');
  }

  var Constructor = function () {
    var self = this;
    setAjaxHandler();
    this.surveyTemplate = _.template($("#survey-template").html());
    this.load();
    $("#post-survey").click(function() {
      self.postSurvey();
    }.bind(this));
    $("section.options a.option")
    .addClass('selected')
    .click(function(e) {
      $(e.currentTarget).toggleClass('selected');
      self.render();
    });

    $("section.options a.all").click(function(e) {
      var section = $($(e.currentTarget).closest('section'));
      var options = section.find('.option');
      if (options.length === section.find('.option.selected').length) {
        options.removeClass('selected');
      } else {
        options.addClass('selected')
      }
      self.render();
    });

    var socket = io('http://localhost:3000');
    socket.on('welcome', function(data) {
      console.log('connected');
      socket.emit('join');
    });

    socket.on('updated', function(data) {
      self.load();
    });
  };

  Constructor.prototype._visible = function(survey) {
    if (!checked('done', survey.done)) {
      return false;
    }
    if (!checked('priority', survey.priority)) {
      return false;
    }
    if (_.includes(['개인', '가족', '업무'], survey.category)) {
      if (!checked('category', survey.category)) {
        return false;
      }
    } else if (!checked('category', '기타')) {
      return false;
    }
    return true;
  };

  Constructor.prototype.load = function() {
    var self = this;
    $.getJSON("/surveys", function(data) {
      self.surveys = data;
      self.render();
      self.clearForm();
    });
  };

  Constructor.prototype.render = function() {
    var self = this;
    $("#main").toggleClass("no-survey", (this.surveys.length <= 0));
    var html = _.map(this.surveys, function(survey) {
      if (self._visible(survey)) {
        survey.doneStr = survey.done ? 'done' : '';
        return self.surveyTemplate(survey);
      }
      return "";
    });
    $("ul.surveys").html(html.join("\n"));
    $("ul.surveys .check").click(self.postDone.bind(this));
    $(".survey .remove").click(self.removeSurveyk.bind(this));
  };

  Constructor.prototype.clearForm = function() {
    $("#form-survey input").val("");
    $("#form-survey select[name='category']").val("");
    $("#form-survey select[name='priority']").val("2");
    $("#form-survey input:first").focus();
  };

  Constructor.prototype._findSurvey = function(e) {
    var el = $(e.currentTarget).closest('li');
    var id = el.data('id');
    return  _.find(this.surveys, {id: id});
  };

  Constructor.prototype.postDone = function(e) {
    var survey = this._findSurvey(e);
    if (!survey) {
      return;
    }
    var self = this;
    $.ajax({
      url: '/surveys/' + survey.id,
      method: 'PUT',
      dataType: 'json',
      data: {
        done: survey.done ? false : true
      },
      success: function(data) {
        survey.done = data.done;
        self.render();
      }
    });
  };

  Constructor.prototype.postSurvey = function() {
    var self = this;
    $.post("/surveys", $("#form-survey").serialize(), function(data) {
      console.log(data);
      self.surveys.push(data);
      self.render();
      self.clearForm();
    });
  };

  Constructor.prototype.removeSurvey = function(e) {
    var survey = this._findSurvey(e);
    if (!survey) {
      return;
    }
    if (confirm('정말로 삭제하시겠습니까?')) {
      $.ajax({
        url: '/surveys/' + survey.id,
        method: 'DELETE',
        dataType: 'json',
        success: function(data) {
          self.surveys = _.reject(self.surveys, function(t) {
            return t.id === survey.id;
          });
          var el = $(e.currentTarget).closest('li');
          el.remove();
        }
      });
    }
  };

  return Constructor;
} ();
