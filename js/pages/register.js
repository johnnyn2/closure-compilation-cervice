var files = {};
const formFields = ['firstName', 'lastName', 'email', 'phoneNum', 'password', 'confirmPassword', 'companyName', 'brCode', 'companyAddress', 'accountName'];
const dataFields = ['firstName', 'lastName', 'email', 'phoneNum', 'password', 'companyName', 'companyAddress' , 'brCode', 'customerId'];
const ERR_COLOR = '	#FF4500';
const WHITE = '#fff';
const EMPTY_ERR = 'This field is required';
const EMAIL_ERR = 'Invalid email format';
const PHONE_ERR = 'Invalid phone number';
const NOT_MATCH = 'Passwords don\'t match';

function setErrMsg(e, msg, color) {
	e.html(msg);
	e.css('color', color);
}

function setErrBorder(e, color) {
	e.css('border-top-color', color);
	e.css('border-left-color', color);
	e.css('border-right-color', color);
	e.css('border-bottom-color', color);
}

function isValidated() {
	let hasErr = false;
	let firstErrEle = null;
	formFields.forEach(function(key) {
		const value = $('#'+key).val();
		if (value == "") {
			hasErr = true;
			setErrMsg($('#' + key + 'ErrTxt'), EMPTY_ERR, ERR_COLOR);
			setErrBorder($('#' + key), ERR_COLOR);
			$('#' + key + '-ex').show();
		}
		if (key === 'email') {
			if (!EMAIL_REGEX.test(value)) {
				hasErr = true;
				setErrMsg($('#' + key + 'ErrTxt'), EMAIL_ERR, ERR_COLOR);
				setErrBorder($('#' + key), ERR_COLOR);
				$('#' + key + '-ex').show();
			}
		}
		if (key === 'phoneNum') {
			if (value.length < 8) {
				hasErr = true;
				setErrMsg($('#' + key + 'ErrTxt'), PHONE_ERR, ERR_COLOR);
				setErrBorder($('#' + key), ERR_COLOR);
				$('#' + key + '-ex').show();
			}
		}
		if (hasErr) {
			if (firstErrEle == null) {
				firstErrEle = $('#'+key);
			}
		}
	})
	
	if (firstErrEle !== null) {
		firstErrEle = $('label[for="'+firstErrEle.attr('id')+'"]')[0];
	}
	
	if ($('#password').val() !== $('#confirmPassword').val()) {
		hasErr = true;
		setErrMsg($('#confirmPasswordErrTxt'), NOT_MATCH, ERR_COLOR);
		setErrBorder($('#confirmPassword'), ERR_COLOR);
		$('#confirmPassword-ex').show();
		if (firstErrEle !== null) {
			firstErrEle = $('#confirmPassword')[0]
		}
	}
	
	if (hasErr) {
		firstErrEle.scrollIntoView({behavior: 'smooth', block: 'start'});
		return false;
	}
	
	return true;
}

function getQueryStrings() {
	let string = '/user/addUser?';
	dataFields.forEach(function(field) {
		string = string + field + '=' + $('#' + field).val() + '&';
	})
	string += 'accountName=test&role=USER';
	return string;
} 

function lockInputFields() {
	$('input').attr('disabled', true);
	$('#submit-btn').attr('disabled', true);
}

function unlockInputFields() {
	$('input').attr('disabled', false);
	$('#submit-btn').attr('disabled', false);
}

$(document).ready(function() {
	const inputPwWidth = $('#password').outerWidth();
	$("head").append('<style type="text/css"></style>');
	var newStyleElement = $("head").children(':last');
	const indicWidth = inputPwWidth/3;
	newStyleElement.html('.indicator{width: '+ indicWidth +'px;height: 2px;position: absolute;bottom:39px;}');
	
	
	$('input').on('input', function() {
		setErrMsg($('#' + $(this).attr('id') + 'ErrTxt'), '&nbsp;', WHITE);
		setErrBorder($(this), '');
		$('#' + $(this).attr('id') + '-ex').hide();
		if ($(this).attr('id') == "password") {
			if ($(this).val() == "") {
				$('#strength-indicator').empty();
			} else {
				checkStrength($(this).val(), $(this));
				$('.weak').css('left', '0px').css('z-index', '3');
				$('.middle').css('left', indicWidth + 'px').css('z-index', '3');
				$('.strong').css('left', indicWidth * 2 + 'px').css('z-index', '3');
			}
		}	
	})
	
	$('#phoneNum').numeric({decimal: false, negative: false});
	
	$('#upload').on('input', function(e) {
		const selectedFile = e.target.files[0];
		addFile(selectedFile);
	})
	
	$('#dropzone').on('drop dragdrop',function(e){
		e.preventDefault();
		const selectedFile = e.originalEvent.dataTransfer.files[0];
		addFile(selectedFile);			
	});
	
	$('#submit-btn').on('click', function(e) {
		e.preventDefault();
		if (isValidated()) {
			$.ajax({
				url: getQueryStrings(),
				type: 'POST',
				beforeSend: function(xhr) {
					lockInputFields();
					$('#spinner').show();
					$('#reg-btn-txt').text('Loading...');
				},
				success: function(data) {
					if (data == "Email has already been used") {
						setErrMsg($('#emailErrTxt'), data, ERR_COLOR);
						setErrBorder($('#email'), ERR_COLOR);
						$('#email-ex').show();
						$('label[for="email"]')[0].scrollIntoView({behavior: 'smooth', block: 'start'});
					} else {
						if ($('#ADMIN').length > 0) {
//							$('form').trigger("reset");
//							$('#strength-indicator').empty();
							$('#form-container').remove();
							$('#success-message-block').show();
						} else if ($('#USER').length > 0) {
							$('#form-container').hide();
							$('#success-message-block').show();
							setTimeout(function() {
								window.location.replace('/user/login');	
							}, 3000);
						}
					}
					unlockInputFields();
					$('#spinner').hide();
					$('#reg-btn-txt').text('Register');
				},
				error: function(err) {
					console.log(err);
				}
			})
		}
	})
	
	
})