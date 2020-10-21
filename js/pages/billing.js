Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0; 
}

let prevCredit = '100.00';
let originalCredit = null;
const histories = [
	{
		paymentNumber: 'Invoice202101',
		date: new Date(),
	}
];

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function sum(a, b) {
	const a_dp = a.countDecimals();
	const b_dp = b.countDecimals();
	if (a_dp === 0 && b_dp === 0) {
		return (a * 10 + b * 10) / 10;
	} else if (a_dp > b_dp) {
		const cf = Math.pow(10, a_dp);
		return (a * cf + b * cf) / cf;
	} else {
		const cf = Math.pow(10, b_dp);
		return (a * cf + b * cf) / cf;
	}
}

function calculateNewBalance() {
	originalCredit = Number($('.credit-section span').text().split(',').join(''));
	const amount = Number($('input[name="credit"]').val());
	const newBalance = amount >= 100 ? sum(originalCredit, amount) : originalCredit;
	return numberWithCommas(newBalance);
}

function row(history) {
	return 'tr>' +
			'<td>'+history.paymentNumber+'</td>' +
			'<td sorttable_customkey="'+moment(history.date).format('YYYYMMDDHHMMSS')+'">' + history.date.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}) + '</td>' +
			'<td>' +
				'<svg invoice-id="' + history.paymentNumber + '" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-circle-down" class="svg-inline--fa fa-arrow-circle-down fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path id="download" fill="currentColor" d="M504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zm-143.6-28.9L288 302.6V120c0-13.3-10.7-24-24-24h-16c-13.3 0-24 10.7-24 24v182.6l-72.4-75.5c-9.3-9.7-24.8-9.9-34.3-.4l-10.9 11c-9.4 9.4-9.4 24.6 0 33.9L239 404.3c9.4 9.4 24.6 9.4 33.9 0l132.7-132.7c9.4-9.4 9.4-24.6 0-33.9l-10.9-11c-9.5-9.5-25-9.3-34.3.4z"></path></svg>'+
			'</td>' +
		'</tr>';
}

function downloadInvoice() {
	
}

function resetCreditBorder() {
	$('#dollar-sign').css('border-bottom', 'none');
	$('#fund-label').css('border-bottom', 'none');
}

function isValidAmount(credit) {
	if (credit < 100) {
		$('#dollar-sign').css('border-bottom', '3px solid #FF5630');
		$('#fund-label').css('border-bottom', '3px solid #FF5630');
		return false;
	}
	return true;
}

$(document).ready(function() {
	$('#fund-label').on('click', function() {
		resetCreditBorder();
		$(this).hide();
		$('#dollar-sign').removeClass('deep-blue');
		const creditInput = $('input[name="credit"]');
		creditInput.css('width', $(this).width());
		creditInput.css('height', $(this).height())
		creditInput.val($(this).text());
		creditInput.show();
		creditInput.focus();
	})
	
	$('input[name="credit"]').on('input', function(e) {
		resetCreditBorder();
		const regex = /^\d+\.?\d{0,2}$/;
		if (e.target.value === '.') {
			prevCredit = '0.';
			$('#fund-label').html('0.');
			$(this).val('0.');
			$(this).width($('#fund-label').width());
			$('#newBalance span').text(calculateNewBalance());
		} else if (!regex.test(Number($(this).val())) || $(this).val().length >= 19) {
			$(this).val(prevCredit);
		} else {
			prevCredit = e.target.value;
			$('#fund-label').html($(this).val());
			$(this).width($('#fund-label').width());
			$('#newBalance span').text(calculateNewBalance());
		}
	})
	
	 $('input[name="credit"]').on('blur', function() {
		 const value = $(this).val();
		 if (Number(value) === 0) {
			const zero = (Math.round(0 * 100) / 100).toFixed(2);
			prevCredit = zero;
			$('#fund-label').html(zero);
			$(this).val(zero);
			$(this).width($('#fund-label').width());
			$('#newBalance span').text(calculateNewBalance());
		 } else {
			 $('#fund-label').html($(this).val()); 
		 }
		 $('#dollar-sign').addClass('deep-blue');
		 $(this).hide();
		 $('#fund-label').show();
	 })
	 
	 $('input[name="fund-toggle"]').on('click', function(e) {
		 resetCreditBorder();
		 const value = $(this).val();
		 $('input[name="credit"]').val(value);
		 prevCredit = value;
		 $('#fund-label').html(value);
		 $('#newBalance span').text(calculateNewBalance());
	 })
	 
	 $('#newBalance span').text(calculateNewBalance());
	
	 $('.add-fund-action svg[data-icon="minus"]').on('click', function() {
		resetCreditBorder();
		const value = Number($('input[name="credit"]').val()) - 1.00;
		const twoDp = (Math.round(value * 100) / 100).toFixed(2);
		prevCredit = twoDp;
		$('#fund-label').html(twoDp);
		$('input[name="credit"]').val(twoDp);
		$('input[name="credit"]').width($('#fund-label').width());
		$('#newBalance span').text(calculateNewBalance());
	 })
	 
	 $('.add-fund-action svg[data-icon="plus"]').on('click', function() {
		resetCreditBorder();
		const value = Number($('input[name="credit"]').val()) + 1.00;
		const twoDp = (Math.round(value * 100) / 100).toFixed(2);
		prevCredit = twoDp;
		$('#fund-label').html(twoDp);
		$('input[name="credit"]').val(twoDp);
		$('input[name="credit"]').width($('#fund-label').width());
		$('#newBalance span').text(calculateNewBalance());
	 })
	 
	 $('#next-btn').on('click', function() {
		 const credit = Number($('input[name="credit"]').val());
		 if (isValidAmount(credit)) {
			 console.log('credit: ', credit);
		 }
	 })
	 
	 if (sessionStorage.getItem("showAddFund")) {
		 $('.add-fund a').click();
	 }
	 
	 $('svg[data-icon="arrow-circle-down"]').on('click', function() {
		 downloadInvoice();
	 })
})
$(window).bind('beforeunload', function() { 
	sessionStorage.removeItem('showAddFund');
})