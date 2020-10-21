const EMPTY_ERR = 'This field is required';
const NOT_MATCH = 'Passwords don\'t match';
const ERR_COLOR = '	#FF4500';
const WHITE = '#fff';
const headings = {
	companyName: 'Company Name',
	companyAddress: 'Company Address',
	firstName: 'First Name',
	lastName: 'Last Name',
	phoneNum: 'Phone Number',
	email: 'Email Address',
}
const map = {
	'#input-old-pw': '#oldPwErrTxt',
	'#input-new-pw': '#newPwErrTxt',
	'#input-confirm-pw': '#confirmPwErrTxt'
};


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

function createItem (key, value) {
	if (value) {
		return '<div class="line"><div class="head">'+ headings[key] +'</div><div class="data">'+ value +'</div></div>';
	} else {
		return '<div class="line"><div class="head">'+ headings[key] +'</div><div class="data"></div></div>';
	}
	
}

function isValidate() {
	const oldPw = $('#input-old-pw');
	const newPw = $('#input-new-pw');
	const confirmPw = $('#input-confirm-pw');
	
	let hasErr = false;
	Object.keys(map).forEach(function(key) {
		if ($(key).val() == "") {
			hasErr = true;
			setErrMsg($(map[key]), EMPTY_ERR, ERR_COLOR);
			setErrBorder($(key), ERR_COLOR);
		}
	})
	
	if (hasErr) return false;
	
	if (newPw.val() !== confirmPw.val()) {
		setErrMsg($('#confirmPwErrTxt'), NOT_MATCH, ERR_COLOR);
		setErrBorder($('#input-confirm-pw'), ERR_COLOR);
		return false;
	}
	return true;
}

function lockInputFields() {
	$('input').attr('disabled', true);
	$('#update-pw-submit').attr('disabled', true);
}

function unlockInputFields(msg) {
	$('input').attr('disabled', false);
	$('#update-pw-submit').attr('disabled', false);
}

function addSumitBtnListener() {
	$('#update-pw-submit').on('click', function(e) {
		e.preventDefault();
		if (isValidate()) {
			var formData = {}
			formData["oldPassword"] = $('#input-old-pw').val();
			formData["newPassword"] = $('#input-new-pw').val();
			formData["confirmedPassword"] = $('#input-confirm-pw').val();
			
			$.ajax({
				url: '/user/changePasswordInDetail',
				type: 'POST',
				contentType:"application/json",
				data: JSON.stringify(formData),
				beforeSend: function(xhr) {
					lockInputFields();
				},
				success: function(data) {
					$('#changePwField form').hide();
					$('#changePw').attr('data-show', 'false');
					unlockInputFields();
					$('input').val('');
					$('#strength-indicator').empty();
					if (data === 'success') {
						$('#changePwField').append('<div id="success-msg">Your new password has been saved</div>');
					} else {
						$('#changePwField').append('<div id="success-msg">Invalid password</div>');
					}
				},
				error: function(err) {
				},
				complete: function(xhr, status) {
					
				}
			})
		}
	})
	
	$('input').on('input', function() {
		setErrMsg($(map['#'+$(this).attr('id')]), '&nbsp;', WHITE);
		setErrBorder($(this), '');
		if ($(this).attr('id') == "input-new-pw") {
			if ($(this).val() == "") {
				$('#strength-indicator').empty();
			} else {
				checkStrength($(this).val(), $(this));
				$('.weak').css('left', '0px');
				$('.middle').css('left', '79px');
				$('.strong').css('left', '158px');
			}
		}	
	})
	
	$('#changePw').on('click', function() {
		if ($(this).attr('data-show') == 'false') {
			if ($('#success-msg').length > 0) {
				$('#success-msg').remove();
			}
			$('form').show();
			$('#changePw').attr('data-show', 'true');
		}
	})
}



$(document).ready(function() {
	addSumitBtnListener();
	
	$('#logout-form').on('submit', function() {
		sessionStorage.clear();
	});
	
	$.ajax({
		url: '/user/userDetail',
		type: 'POST',
		success: function(data) {
			let result = '';
			Object.keys(headings).forEach(function(key) {
				result += createItem(key, data[key]);
			})
			
			$('.account-container').prepend(result);
		},
		error: function (err) {
			console.log(err);
		}
	})
})