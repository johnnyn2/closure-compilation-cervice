$(document).ready(function() {
	$('a[action="addFund"]').on('click', function(e) {
		if (window.location.href.includes("/user/billing")) {
			e.preventDefault();
			$('.add-fund a').click();
		}
		sessionStorage.setItem('showAddFund', true);
	})
	$('#logout-btn').on('click', function (e) {
		$('#logout-form').submit();
	})
	
	$('.campaign-header-mobile button').on('click', function() {
		$('body').addClass('has-overlay');
		$('.side-container').width('85%');
	})
})

$(document).on('click', function(evt) {
	const deviceWidth = $(window).width();
	if (deviceWidth <= 600) {
		if (evt.target !== $('.side-container')[0] && !$('.side-container').has(evt.target).length && evt.target !== $('.campaign-header-mobile button')[0] && !$('.campaign-header-mobile button').has(evt.target).length) {
			$('.side-container').width('0');
			$('body').removeClass('has-overlay');
		}
	}
})