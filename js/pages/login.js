const EMPTY_ERR = 'This field is required';
const LOGIN_FAIL = 'Bad Credentials';
const ERR_COLOR = '	#FF4500';
const WHITE = '#fff';
const BORDER_BOTTOM_COLOR = 'blue';

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
	results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function setEmailBorder(color) {
	$('#input-email').css('border-bottom-color', color);
}

function setPasswordBorder(color) {
	$('#input-password').css('border-bottom-color', color);
}

function setEmailErrMsg(msg, color) {
	const emailErrMsg = $('#emailErrorTxt');
	emailErrMsg.html(msg);
	emailErrMsg.css('color', color);
	emailErrMsg.show();
}

function setPasswordErrMsg(msg, color) {
	const passwordErrMsg = $('#passwordErrorTxt');
	passwordErrMsg.html(msg);
	passwordErrMsg.css('color', color);
	passwordErrMsg.show();
}

function toggleEmailExclaimation(show) {
	const emailEx = $('#email-exclaimation');
	if (show) {
		emailEx.show();
	} else {
		emailEx.hide();
	}
}

function togglePwExclaimation(show) {
	const pwEx = $('#pw-explaimation');
	if (show) {
		pwEx.show();
	} else {
		pwEx.hide();
	}
}

function isValidInput() {
	const email = $('#input-email');
	const password = $('#input-password');
	if (email.val() == "" && password.val() == "") {
		setEmailErrMsg(EMPTY_ERR, ERR_COLOR);
		setPasswordErrMsg(EMPTY_ERR, ERR_COLOR);
		setEmailBorder(ERR_COLOR);
		setPasswordBorder(ERR_COLOR);
		toggleEmailExclaimation(true);
		togglePwExclaimation(true);
		return false;
	} else if (email.val() == "" && password.val() !== "") {
		setEmailErrMsg(EMPTY_ERR, ERR_COLOR);
		setEmailBorder(ERR_COLOR);
		toggleEmailExclaimation(true);
		return false;
	} else if (email.val() !== "" && password.val() == "") {
		setPasswordErrMsg(EMPTY_ERR, ERR_COLOR);
		setPasswordBorder(ERR_COLOR);
		togglePwExclaimation(true);
		return false;
	}
	return true;
}

$(document).ready(function () {
	if (getParameterByName('status') == "fail") {
		setEmailErrMsg(LOGIN_FAIL, ERR_COLOR);
		setPasswordErrMsg(LOGIN_FAIL, ERR_COLOR);
		setEmailBorder(ERR_COLOR);
		setPasswordBorder(ERR_COLOR);
		toggleEmailExclaimation(true);
		togglePwExclaimation(true);
	}
	
	$('#input-email').on('input', function () {
		setEmailErrMsg('&nbsp;', WHITE);
		setEmailBorder(BORDER_BOTTOM_COLOR);
		toggleEmailExclaimation(false);
	})
	
	$('#input-password').on('input', function () {
		setPasswordErrMsg('&nbsp;', WHITE);
		setPasswordBorder(BORDER_BOTTOM_COLOR);
		togglePwExclaimation(false);
	})

	$('#submit-btn').on('click', function (e) {
		e.preventDefault();
		if (isValidInput()) {
			$('#login-form').submit();
		}
	})
})