const EMPTY_ERR = 'This field is required';
const NO_SUCH_USER = 'Account doesn\'t exist';
const ERR_COLOR = '	#FF5630';
const WHITE = '#fff';
const BLACK = 'black';

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

function setEmailErrMsg(msg, color) {
	const emailErrMsg = $('#emailErrorTxt');
	emailErrMsg.html(msg);
	emailErrMsg.css('color', color);
	emailErrMsg.show();
}

function toggleEmailExclaimation(show) {
	const emailEx = $('#email-exclaimation');
	if (show) {
		emailEx.show();
	} else {
		emailEx.hide();
	}
}

function isValidInput() {
	if ($('#input-email').val() == "") {
		setEmailErrMsg(EMPTY_ERR, ERR_COLOR);
		setEmailBorder(ERR_COLOR);
		toggleEmailExclaimation(true);
		return false;
	}
	return true;
}

function postApiCallActions() {
	$('#submit-btn').html(getSpinner() + 'Send');
	$('#submit-btn').removeClass('disabled');
	$('input').removeAttr('disabled');
	$('#spinner').hide();
}

function getSpinner() {
	return '<span id="spinner" class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display:none;"></span>';
}

function submitForm() {
	if (isValidInput()) {
		var email = $('#input-email').val();
		
		$.ajax({
			url: '/forgotPassword?email=' + email,
			type: 'POST',
			dataType: 'text',
			beforeSend: function(xhr) {
				$('#submit-btn').html(getSpinner() + 'Loading...');
				$('#submit-btn').addClass('disabled');
				$('input').attr('disabled', true);
				$('#spinner').show();
			},
			success: function (data) {
				if (data !== "fail") {
					$('#reset-password-form').hide();
					$('#forgot-message-success').css('display', 'flex');
					$('#forgot-message-success-txt').html('Your password reset email has been sent to ' + email);
					setTimeout(function() {
						window.location.replace('/');	
					}, 3000);
				} else {
					setEmailErrMsg(NO_SUCH_USER, ERR_COLOR);
					setEmailBorder(ERR_COLOR);
					toggleEmailExclaimation(true);
				}
			},
			error: function(data) {
				postApiCallActions();
				alert('Something went wrong...');
			},
			complete: function(xhr, status) {
				postApiCallActions();
			}
		})
        		
	}
}

$(document).ready(function () {
	$('#input-email').on('input', function () {
		setEmailErrMsg('&nbsp;', WHITE);
		setEmailBorder('');
		toggleEmailExclaimation(false);
	})
            
	$('#submit-btn').click(function (e) {
		e.preventDefault();
		submitForm();
	})
	
	$('form').submit(function(e) {
		e.preventDefault();
		submitForm();
	})
})