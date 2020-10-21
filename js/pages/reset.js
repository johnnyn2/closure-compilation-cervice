const EMPTY_ERR = 'This field is required';
const PASSWORD_NOT_MATCH = 'Passwords don\'t match';
const UNEXPECTED_ERROR = 'Invalid token';
const ERR_COLOR = '	#FF5630';
const WHITE = '#fff';
const NORMAL_BORDER_COLOR = 'blue';

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


function setNewPwBorder(color) {
	$('#input-new-password').css('border-bottom-color', color);
}

function setConfirmPwBorder(color) {
	$('#input-confirm-password').css('border-bottom-color', color);
}

function setNewPwErrMsg(msg, color) {
	const pwErrMsg = $('#pwErrorTxt');
	pwErrMsg.html(msg);
	pwErrMsg.css('color', color);
	pwErrMsg.show();
}

function setConfirmPwErrMsg(msg, color) {
	const confirmPwErrMsg = $('#confirmPwErrorTxt');
	confirmPwErrMsg.html(msg);
	confirmPwErrMsg.css('color', color);
	confirmPwErrMsg.show();
}

function toggleNewPwExclaimation(show) {
	const pwEx = $('#pw-exclaimation');
	if (show) {
		pwEx.show();
	} else {
		pwEx.hide();
	}
}

function toggleConfirmPwExclaimation(show) {
	const pwEx = $('#confirm-pw-explaimation');
	if (show) {
		pwEx.show();
	} else {
		pwEx.hide();
	}
}

function isValidInput() {
	const pw = $('#input-new-password');
	const confirmPw = $('#input-confirm-password');
	if (pw.val() == "" && confirmPw.val() == "") {
		setNewPwErrMsg(EMPTY_ERR, ERR_COLOR);
		setConfirmPwErrMsg(EMPTY_ERR, ERR_COLOR);
		setNewPwBorder(ERR_COLOR);
		setConfirmPwBorder(ERR_COLOR);
		toggleNewPwExclaimation(true);
		toggleConfirmPwExclaimation(true);
		return false;
	} else if (pw.val() == "" && confirmPw.val() !== "") {
		setNewPwErrMsg(EMPTY_ERR, ERR_COLOR);
		setNewPwBorder(ERR_COLOR);
		toggleNewPwExclaimation(true);
		return false;
	} else if (pw.val() !== "" && confirmPw.val() == "") {
		setConfirmPwErrMsg(EMPTY_ERR, ERR_COLOR);
		setConfirmPwBorder(ERR_COLOR);
		toggleConfirmPwExclaimation(true);
		return false;
	} else if (pw.val() !== confirmPw.val()) {
		setConfirmPwErrMsg(PASSWORD_NOT_MATCH, ERR_COLOR);
		setConfirmPwBorder(ERR_COLOR);
		toggleConfirmPwExclaimation(true);
		return false;
	}
	return true;
}

function showUnexpectedError() {
	setNewPwErrMsg(UNEXPECTED_ERROR, ERR_COLOR);
	setConfirmPwErrMsg(UNEXPECTED_ERROR, ERR_COLOR);
	setNewPwBorder(ERR_COLOR);
	setConfirmPwBorder(ERR_COLOR);
	toggleNewPwExclaimation(true);
	toggleConfirmPwExclaimation(true);
}

$(document).ready(function () {
	$('#input-new-password').on('input', function() {
		setNewPwErrMsg('&nbsp;', WHITE);
		setNewPwBorder(NORMAL_BORDER_COLOR);
		toggleNewPwExclaimation(false);
	})
	
	$('#input-confirm-password').on('input', function() {
		setConfirmPwErrMsg('&nbsp;', WHITE);
		setConfirmPwBorder(NORMAL_BORDER_COLOR);
		toggleConfirmPwExclaimation(false);
	})
	
	$('#token').val(getParameterByName('token'));

	$('#submit-btn').on('click', function (e) {
		e.preventDefault();
		if (isValidInput()) {
//			fetch('/api/login/changePassword?token=' + getParameterByName('token') +'&password=' + $('#input-confirm-password').val(), {method: 'POST'})
//			.then(function (res) {return res.text();})
//			.then(function (data) {
//				if (data == "success") {
//					$('.dummy').hide();
//					$('#reset-message-fail').hide();
//					$('#reset-message-success').show();
//				} else {
//					$('.dummy').hide();
//					$('#reset-message-success').hide();
//					$('#reset-message-fail').show();
//				}
//			})
//			.catch(function (err) {console.log(err);});
			var formData = {}
			formData["token"] = $('#token').val();
			formData["password"] = $('#input-confirm-password').val();
			$.ajax({
				url: '/resetPassword',
				type: 'POST',
				contentType:"application/json",
				data: JSON.stringify(formData),
				beforeSend: function() {
					$('input').attr('disabled', true);
					$('#submit-btn').addClass('disabled');
				},
				success: function(data) {
					if (data == "success") {
						$('form').hide();
						$('#forgot-message-success').show();
						setTimeout(function() {
							window.location.replace('/');
						}, 3000);
					} else {
						showUnexpectedError();
					}
				},
				error: function(err) {
					showUnexpectedError();
				},
				complete: function() {
					$('input').removeAttr('disabled');
					$('#submit-btn').removeClass('disabled');
				}
			})
		}
	})
})