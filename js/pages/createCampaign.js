const interestsTagsContainer = '#interests-tags-container';
const searchIntentsTagsContainer = '#search-intent-tags-container';
const startIncomeOptions = ['$ 0', '$ 10,001', '$ 20,001', '$ 30,001', '$ 40,001', '$ 50,001', '$ 60,001'];
const endIncomeOptions = ['$ 10,000', '$ 20,000', '$ 30,000', '$ 40,000', '$ 50,000', '$ 60,000', '$ 60,001+'];
const interests = [];
const searchIntents = [];
var files = {};
const ERR_COLOR = '	#FF4500';
const basicSettingsFields = ['campaignName', 'startDate', 'endDate', 'budget', 'cpm'];
const audienceTargettingFields = ['age', 'income'];
const creativeFields = ['creative', 'destination'];
const checkTargettingFields = ['interests', 'gender', 'ageFrom', 'ageTo', 'incomeFrom', 'incomeTo', 'education', 'searchIntent'];
const EMPTY_ERR = 'This field is required';
const DATE_RANGE_ERR = 'Start date should be smaller than end date';
const DIMEN_ERR = 'Dimensions should be 300x250';
const FILE_SIZE_ERR = 'File size should be smaller than 1MB';
const FORMAT_ERR = 'Supported file format is jpg, png, gif';
var isCreativeChanged = false;
const BID_ERR = 'Bid price must be at least $3';
const BID_MAX_ERR = 'Bid price must be at most $1000';
const CP_NAME_ERR = 'Campaign name has been previously used';
const WHITE = '#fff';
const formMap = {
	'campaignName': 'name',
	'startDate': 'startDate',
	'endDate': 'endDate',
	'budget': 'dailyBudget',
	'cpm': 'cpm',
	'imageName': 'imageName',
	'destination': 'destinationUrl',
	'targetting': 'targeting',
	'gender': 'gender',
	'ageFrom': 'ageFrom',
	'ageTo': 'ageTo',
	'incomeFrom': 'incomeFrom',
	'incomeTo': 'incomeTo',
	'education': 'education',
	'interests': 'interest',
	'searchIntent': 'url',
	'frequencyCap': 'frequencyCap',
	'frequencyCapImpression': 'frequencyCapImpression',
	'uploadImage': 'uploadImage'
}
let prevBudget = '';
let prevCpm = '';
let activeItem = -1;
var typingTimer;                //timer identifier for input search key evt
var doneTypingInterval = 500;

function addTag(tagContainerId, tags, tagName, tagId) {
	$(tagContainerId).prepend(
		'<span>'+
			'<span>' + tagName + '</span>' +
			'<button class="btn"><svg data-value="'+tagId+'" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="times" class="svg-inline--fa fa-times fa-w-11" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg></button>' +
		'</span>'
	);

	$(tagContainerId + ' span button').off();
	// add remove tag listener
	$(tagContainerId + ' span button').on('click', function() {
		$(this).parent().remove();
		$('#' + $(this).find('svg').attr('data-value')).find('svg[data-icon="minus"]').hide();
		$('#' + $(this).find('svg').attr('data-value')).find('svg[data-icon="plus"]').show();
		tags.splice(tags.indexOf($(this).find('svg').attr('data-value')), 1);
		$('.custom-dropdown-menu').css('transform', 'translate3d(-214px, ' + $('.interests-search-engine').outerHeight() + 'px, 0px)');
	})
}

function getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

function search(queryString) {
	$.ajax({
		url: '/ajax/ad/contentTagLikeSearch?query=' + queryString,
		type: 'POST',
		success: function(result) {
			$('.search-menu').empty();
			activeItem = -1;
			let htmlResults = '';
			result.forEach(function(tag) {
				const startIndices = getIndicesOf(queryString, tag.name);
				const endIndices = startIndices.map(function(i) { return (i + queryString.length - 1)});
				htmlResults += '<a tag-id="'+tag.id+'">';
				for (let i=0;i<tag.name.length;i++) {
					if (queryString.length === 1) {
						if (startIndices.includes(i)) {
							htmlResults = htmlResults + '<span>' + tag.name[i] + '</span>';
						} else {
							htmlResults += tag.name[i];
						}
					} else {
						if (endIndices.includes(i) && startIndices.includes(i)) {
							htmlResults += '</span><span>';
							htmlResults += tag.name[i];
						} else if (endIndices.includes(i)) {
							htmlResults += tag.name[i];
							htmlResults += '</span>';
						} else if (startIndices.includes(i)) {
							htmlResults += '<span>';
							htmlResults += tag.name[i];
						} else {
							htmlResults += tag.name[i];
						}
					}
				}
				htmlResults += '</a>';
			})
			if (result.length === 0) {
				htmlResults += '<div style="display: block;text-align: center;margin: 1em 0;">No matching found</div>';
			}
			
			$('.search-menu').append(htmlResults);
			
			$('.search-menu a').on('click', function() {
				const targetValue = $(this).attr('tag-id');
				if (interests.filter(function(interest) {return interest === targetValue}).length < 1 && interests.length < 30) {
					addTag(interestsTagsContainer, interests, $(this).text(), targetValue);
					interests.push(targetValue);
				}
				$('.search-menu').hide();
				$('#interests').val('');
				$('#interests').focus();
				$('.custom-dropdown-menu').css('transform', 'translate3d(-214px, ' + $('.interests-search-engine').outerHeight() + 'px, 0px)');
			})
			
			$('#interests').on('keydown', function(e) {
				const menuItems = $('.search-menu').children();
				if (e.Handled) return; 
				switch(e.which) {
					case 38:
						e.preventDefault();
						$('.search-menu-item-acitve').removeClass('search-menu-item-acitve');
						if (activeItem === -1 || activeItem === 0) {
							$(menuItems[menuItems.length - 1]).addClass('search-menu-item-acitve');
							$(menuItems[menuItems.length - 1])[0].scrollIntoView({  block: 'nearest', inline: 'start' });
							activeItem = menuItems.length - 1;
						} else {
							$(menuItems[activeItem - 1]).addClass('search-menu-item-acitve');
							$(menuItems[activeItem - 1])[0].scrollIntoView({  block: 'nearest', inline: 'start' });
							activeItem -= 1;
						}
						break;
					case 40:
						e.preventDefault();
						$('.search-menu-item-acitve').removeClass('search-menu-item-acitve');
						if (activeItem === -1 || activeItem === menuItems.length - 1) {
							$(menuItems[0]).addClass('search-menu-item-acitve');
							$(menuItems[0])[0].scrollIntoView({ block: 'nearest', inline: 'start' });
							activeItem = 0;
						} else {
							$(menuItems[activeItem + 1]).addClass('search-menu-item-acitve');
							$(menuItems[activeItem + 1])[0].scrollIntoView({  block: 'nearest', inline: 'start' });
							activeItem += 1;
						}
						break;
				}
				//  Prevent double counting bug in the KeyDown event. Mark the keydown event as handled
				e.Handled = true;
			})
			
			$('#interests').on('keypress', function(e) {
				const item = $('.search-menu').children()[activeItem];
				if (e.Handled || $(item).text() === '') return; 
				switch(e.originalEvent.key) {
					case "Enter":
						const targetValue = $(item).attr('tag-id');
						if (interests.filter(function(interest) {return interest === targetValue}).length < 1 && interests.length < 30) {
							addTag(interestsTagsContainer, interests, $(item).text(), targetValue);
							interests.push(targetValue);
						}
						activeItem = -1;
						$('.search-menu').hide();
						$('#interests').val('');
						$('#interests').focus();
						$('.custom-dropdown-menu').css('transform', 'translate3d(-214px, ' + $('.interests-search-engine').outerHeight() + 'px, 0px)');
						break;
				}
				//  Prevent double counting bug in the KeyDown event. Mark the keydown event as handled
				e.Handled = true;
			})
			
			// place menu under the search engine
			$('.search-menu').css('top', $('.interests-search-engine').outerHeight() +'px');
			$('.search-menu').show();
		},
		error: function(err) {}
	})
}

function addAddTagAction(tagItem) {
	$(tagItem).on('click', function() {
		const tagName = $(this).parent().find('span').text();
		const tagId = $(this).attr('data-value');
		if (interests.filter(function(interest) {return interest === tagId}).length < 1 && interests.length < 30) {
			addTag(interestsTagsContainer, interests, tagName, tagId);
			interests.push(tagId);
			$(this).hide();
			$(this).parent().find('svg[data-icon="minus"]').show();
		}
	})
}

function addDeleteTagAction(tagItem) {
	$(tagItem).on('click', function() {
		const tagId = $(this).attr('data-value');
		$(interestsTagsContainer).find('svg[data-value="'+ tagId +'"]').parent().parent().remove();
		interests.splice(interests.indexOf(tagId), 1);
		$(this).hide();
		$(this).parent().find('svg[data-icon="plus"]').show();
	})
}

function initInterestsMenu(data) {
	data.forEach(function(item) {
		const category = '<div class="category" style="display: flex;flex-direction: column">' +
							'<div id="' + item.id + '" class="tag-item">' +
								'<svg data-id="' + item.id + '" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-right" class="deep-blue svg-inline--fa fa-caret-right fa-w-6" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path fill="currentColor" d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"></path></svg>' +
								'<svg style="display: none;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-down" class="deep-blue svg-inline--fa fa-caret-down fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"></path></svg>' +
								'<span>' + item.name + '</span>' +
							    '<svg data-value="' + item.id + '" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="plus" class="deep-blue svg-inline--fa fa-plus fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path></svg>' +
							    '<svg data-value="' + item.id + '" style="display: none;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="minus" class="deep-blue svg-inline--fa fa-minus fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path></svg>' +
							  '</div>' +
						  '</div>';
		$('.custom-dropdown-menu').append(category);
		
	})
	$('.tag-item svg[data-icon="caret-right"]').on('click', function() {
			$.ajax({
				url: '/ajax/ad/getFirstLevelChildTag?id=' + $(this).attr('data-id'),
				type: 'POST',
				success: function(data) {
					const parentCategoryItem = $('#' + data[0].id);
					parentCategoryItem.find('svg[data-icon="caret-right"]').hide();
					parentCategoryItem.find('svg[data-icon="caret-down"]').show();
					data[0].childs.reverse().forEach(function(item) {
						const isAdded = interests.filter(function(interest) {return Number(interest) === item.id;}).length > 0;
						const subCatItem = '<div id="' + item.id + '" class="tag-item sub">' +
												'<span>' + item.name + '</span>' +
												'<svg data-value="' + item.id + '" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="plus" class="deep-blue svg-inline--fa fa-plus fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path></svg>' +
											    '<svg data-value="' + item.id + '" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="minus" class="deep-blue svg-inline--fa fa-minus fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path></svg>' +
										   '</div>';
						parentCategoryItem.parent().append(subCatItem);
						if (isAdded) {
							$('#' + item.id + ' svg[data-icon="plus"]').hide();
						} else {
							$('#' + item.id + ' svg[data-icon="minus"]').hide();
						}
					})
					// register add sub category item
					addAddTagAction('.tag-item.sub svg[data-icon="plus"]');
					// register delete sub category item
					addDeleteTagAction('.tag-item.sub svg[data-icon="minus"]');
				},
				error: function(err) {}
			})
	})
	$('.tag-item svg[data-icon="caret-down"]').on('click', function() {
		$(this).parent().parent().find('.tag-item.sub').remove();
		$(this).hide();
		$(this).parent().find('svg[data-icon="caret-right"]').show();
	})
	// register add category item action
	addAddTagAction('.tag-item svg[data-icon="plus"]');
	// register delete category item action
	addDeleteTagAction('.tag-item svg[data-icon="minus"]');
}

function setCreativeUploadErr(ERR_MSG) {
	$('.dz-message').css('border-color', ERR_COLOR);
	$('#creativeErrTxt').css('color', ERR_COLOR);
	$('#creativeErrTxt').html(ERR_MSG);
}

function readImageFile(file) {
    var reader = new FileReader();

    reader.onload = function (e) {
        var img = new Image();      
        img.src = e.target.result;

        img.onload = function () {
            var w = this.width;
            var h = this.height;

            if (w !== 300 || h !== 250) {
            	setCreativeUploadErr(DIMEN_ERR);
            	return;
            } else {
            	addFile(file);
        		console.log($('#upload').val());
        		if (file.name in files) {
        			$('input[name="uploadImage"]').val(file);
        			$('input[name="imageName"]').val(file.name);
        			isCreativeChanged = true;
        		}
        		
        		$('.dz-message').css('border-color', '#8a8a8a');
        		$('#creativeErrTxt').html('&nbsp;');
            }
        }
    };
    reader.readAsDataURL(file);
}

function selectFileCallback(selectedFile) {
	const fileSizeInMB = selectedFile.size / (1024 * 1024);
	
	if (!(selectedFile.type === "image/jpg" || selectedFile.type === "image/jpeg" || selectedFile.type === "image/png" || selectedFile.type === "image/gif")) {
		setCreativeUploadErr(FORMAT_ERR);
		return;
	}
	
	if (fileSizeInMB > 1) {
		setCreativeUploadErr(FILE_SIZE_ERR);
		return;
	}
	
	readImageFile(selectedFile)
}

function initStartAgeMenu() {
	$('#startageMenu').append('<div class="menu-selected">-</div>');
	for(let i=16;i<=65;i++) {
		$('#startageMenu').append('<div>'+i+'</div>');
	}
	
	$('#startage-btn').on('click', function() {
		$('#startageMenu').slideToggle('fast');
	})
		
	$('#startageMenu div').on('click', function(e) {
		const startAge = $(this).text();
		$('#startageMenu div').removeClass('menu-selected');
		$(this).addClass('menu-selected');
		$('#startage-btn span').html(startAge);
		const endAge = $('#endage-btn span').html();
		if (!validateRange('age', startAge, endAge, $('#ageErrTxt'))) {
			$('#startage-btn').addClass('hasErr');
			$('#endage-btn').addClass('hasErr');
			$('#ageErrTxt').css('color', ERR_COLOR);
		} else {
			if (startAge !== '-') {
				$('input[name="ageFrom"]').val($(this).html());	
			} else {
				$('input[name="ageFrom"]').val("");
			}
			$('#startage-btn').removeClass('hasErr');
			$('#endage-btn').removeClass('hasErr');
			$('#ageErrTxt').html('&nbsp;');
		}
	})
}

function initEndAgeMenu() {
	$('#endageMenu').append('<div class="menu-selected">-</div>');
	for(let i=16;i<=65;i++) {
		$('#endageMenu').append('<div>'+i+'</div>');
	}
	
	$('#endage-btn').on('click', function() {
		$('#endageMenu').slideToggle('fast');
	})
		
	$('#endageMenu div').on('click', function(e) {
		const endAge = $(this).text();
		$('#endageMenu div').removeClass('menu-selected');
		$(this).addClass('menu-selected');
		$('#endage-btn span').html(endAge);
		const startAge = $('#startage-btn span').html();
		if (!validateRange('age', startAge, endAge, $('#ageErrTxt'))) {
			$('#endage-btn').addClass('hasErr');
			$('#ageErrTxt').css('color', ERR_COLOR);
			$('#startage-btn').addClass('hasErr');
		} else {
			if (endAge !== '-') {
				$('input[name="ageTo"]').val($(this).html());
			} else {
				$('input[name="ageTo"]').val("");
			}
			$('#startage-btn').removeClass('hasErr');
			$('#endage-btn').removeClass('hasErr');
			$('#ageErrTxt').html('&nbsp;');
		}
	})
}

function initStartIncomeMenu() {
	$('#startincomeMenu').append('<div class="menu-selected">-</div>');
	let i=1;
	startIncomeOptions.forEach(function(opt) {
		$('#startincomeMenu').append('<div value="D0'+i+'">'+opt+'</div>');
		i++;
	})
	
	$('#startincome-btn').on('click', function() {
		$('#startincomeMenu').slideToggle('fast');
	})
		
	$('#startincomeMenu div').on('click', function(e) {
		const startIncome = $(this).text().replace('$ ', '').replace(',', '');
		$('#startincomeMenu div').removeClass('menu-selected');
		$(this).addClass('menu-selected');
		$('#startincome-btn span').html($(this).text());
		const endIncome = $('#endincome-btn span').html().replace('$ ', '').replace(',', '').replace('+', '');
		if (!validateRange('income', startIncome, endIncome, $('#incomeErrTxt'))) {
			$('#startincome-btn').addClass('hasErr');
			$('#incomeErrTxt').css('color', ERR_COLOR);
			$('#endincome-btn').addClass('hasErr');
		} else {
			if (startIncome !== '-') {
				$('input[name="incomeFrom"]').val($(this).attr('value'));
			} else {
				$('input[name="incomeFrom"]').val("");
			}
			$('#startincome-btn').removeClass('hasErr');
			$('#endincome-btn').removeClass('hasErr');
			$('#incomeErrTxt').html('&nbsp;');
		}
	})
}

function initEndIncomeMenu() {
	$('#endincomeMenu').append('<div class="menu-selected">-</div>');
	let i=1;
	endIncomeOptions.forEach(function(opt) {
		$('#endincomeMenu').append('<div value="D0'+i+'">'+opt+'</div>');
		i++;
	})
	
	$('#endincome-btn').on('click', function() {
		$('#endincomeMenu').slideToggle('fast');
	})
		
	$('#endincomeMenu div').on('click', function(e) {
		const endIncome = $(this).text().replace('$ ', '').replace(',', '').replace('+', '');
		$('#endincomeMenu div').removeClass('menu-selected');
		$(this).addClass('menu-selected');
		$('#endincome-btn span').html($(this).text());
		const startIncome = $('#startincome-btn span').html().replace('$ ', '').replace(',', '');
		if (!validateRange('income', startIncome, endIncome, $('#incomeErrTxt'))) {
			$('#endincome-btn').addClass('hasErr');
			$('#incomeErrTxt').css('color', ERR_COLOR);
			$('#startincome-btn').addClass('hasErr');
		} else {
			if (endIncome !== '-') {
				$('input[name="incomeTo"]').val($(this).attr('value'));
			} else {
				$('input[name="incomeTo"]').val("");
			}
			$('#startincome-btn').removeClass('hasErr');
			$('#endincome-btn').removeClass('hasErr');
			$('#incomeErrTxt').html('&nbsp;');
		}
	})
}

function validateRange(key, start, end, errTxt) {
	if (start == '-' || end == '-') {
		return true;
	}
	if (start > end) {
		errTxt.html('Start ' + key + ' should be smaller than end ' + key);
		return false;
	} else {
		errTxt.html('&nbsp;');
		return true;
	}
}

function setErrState(key, errMsg) {
	$('#' + key).addClass('hasErr');
	$('#' + key + 'ErrTxt').css('color', ERR_COLOR);
	$('#' + key + 'ErrTxt').html(errMsg);
	const errSvg = $('#' + key + '-ex');
	if (errSvg)
		errSvg.show();
}

function checkTargetting(serializeArray) {
	const fields = ['interests', 'gender', 'ageFrom', 'ageTo', 'incomeFrom', 'incomeTo', 'education', 'searchIntent'];
	const validations = fields.map(function(key) {
		const pair = serializeArray.filter(function(p) {return p.name === key;})[0];
		if (typeof pair !== 'undefined') {
			if (pair.name === 'interests') {
				return interests.length ===0;
			} else if (pair.name === 'gender') {
				return pair.value === 'C00';
			} else if (pair.name === 'education') {
				const educationTargets = serializeArray.filter(function(obj) {return obj.name === 'education';});
				return educationTargets.length === 0;
			} else if (pair.name === 'searchIntent') {
				return searchIntents.length === 0;
			} else {
				return pair.value === '';
			}
		} else {
			return true;
		}
	})
	return validations.filter(function(v) {return !v}).length > 0;
}

function isValidForm() {
	let hasErr = false;
	let firstErrEle = null;
	
	const cpName = $('#campaignName').val();
	if (cpName.length > 30) {
		hasErr = true;
		setErrState('campaignName', "Maximum 30 characters");
		if (firstErrEle == null) {
			firstErrEle = $('label[for="campaignName"]')[0];
		}
	}
	if (!CP_REGEX.test(cpName)) {
		hasErr = true;
		setErrState('campaignName', "Contains invalid character(s)");
		if (firstErrEle == null) {
			firstErrEle = $('label[for="campaignName"]')[0];
		}
	}
	
	// validate basic settings
	basicSettingsFields.forEach(function(key) {
		if ($('#' + key).val() == "") {
			if (key === 'startDate' && !$('#immediateCheck').is(':checked') && !$('#scheduleCheck').is(':checked')) {
				$('input[name="startDate"]').removeClass('no-error').addClass('error');
				$('#startDate-container').addClass('hasErr');
				hasErr = true;
				if (hasErr && firstErrEle == null) {
					firstErrEle = $('label[for="' + key + '"]')[0];
				}
				setErrState(key, EMPTY_ERR);
			} else if (key === 'startDate' && $('#scheduleCheck').is(':checked')) {
				$('input[name="startDate"]').removeClass('no-error').addClass('error');
				$('#startDate-container').addClass('hasErr');
				hasErr = true;
				if (hasErr && firstErrEle == null) {
					firstErrEle = $('label[for="' + key + '"]')[0];
				}
				setErrState(key, EMPTY_ERR);
			} else if (key === 'endDate') {
				$('#endDate-container').addClass('hasErr');
				hasErr = true;
				if (hasErr && firstErrEle == null) {
					firstErrEle = $('label[for="' + key + '"]')[0];
				}
				setErrState(key, EMPTY_ERR);
			} else if (key !== 'startDate') {
				hasErr = true;
				if (hasErr && firstErrEle == null) {
					firstErrEle = $('label[for="' + key + '"]')[0];
				}
				setErrState(key, EMPTY_ERR);
			}
			
		} else {
			if (key === 'startDate') {
				if (!$('#immediateCheck').is(':checked') && !$('#scheduleCheck').is(':checked')) {
					hasErr = true;
					if (hasErr && firstErrEle == null) {
						firstErrEle = $('label[for="' + key + '"]')[0];
					}
					$('input[name="startDate"]').removeClass('no-error').addClass('error');
					$('#startDate-container').addClass('hasErr');
					setErrState(key, EMPTY_ERR);
				}
			}
			if (key === 'startDate' || key === 'endDate') {
				if ($('#scheduleCheck').is(':checked') && $('#startDate').val() !== "" && $('#endDate').val() !== "") {
					const startDate = new Date($('#startDate').val());
					const endDate = new Date($('#endDate').val());
					if (startDate > endDate) {
						hasErr = true;
						if (hasErr && firstErrEle == null) {
							firstErrEle = $('label[for="' + key + '"]')[0];
						}
						$('#endDate-container').addClass('hasErr');
						setErrState('endDate', DATE_RANGE_ERR);
					}
				}
			}
		}
	})
	
	if (Number($('#budget').val()) < 1) {
		hasErr = true;
		setErrState('budget', "Minimum value is $1");
		if (firstErrEle == null) {
			firstErrEle = $('label[for="budget"]')[0];
		}
	}
	
	if (Number($('#cpm').val()) < 3) {
		hasErr = true;
		setErrState('cpm', BID_ERR);
		if (firstErrEle == null) {
			firstErrEle = $('label[for="cpm"]')[0];
		}
	}
	
	if (Number($('#cpm').val()) > 1000) {
		hasErr = true;
		setErrState('cpm', BID_MAX_ERR);
		if (firstErrEle == null) {
			firstErrEle = $('label[for="cpm"]')[0];
		}
	}

	// validate audience targetting
	audienceTargettingFields.forEach(function(key) {
		const start = $('#start' + key + '-btn');
		const startVal = $('#start' + key + '-btn span');
		const end = $('#end' + key + '-btn');
		const endVal = $('#end' + key + '-btn span');
		if (start.hasClass('hasErr') || end.hasClass('hasErr')) {
			hasErr = true;
			if (hasErr && firstErrEle == null) {
				firstErrEle = $('label[for="' + key + '"]')[0];
			}
		}
		
		if ((startVal.html() == '-' && endVal.html() !== '-') || (startVal.html() !== '-' && endVal.html() == '-')) {
			hasErr = true;
			if (hasErr && firstErrEle == null) {
				firstErrEle = $('label[for="' + key + '"]')[0];
			}
			start.addClass('hasErr');
			end.addClass('hasErr');
			setErrState(key, 'Please select start and end');
		}
	})
	
	// validate creative
	creativeFields.forEach(function(key) {
		if (key == 'creative') {
			if ($('input[name="imageName"]').val() === "") {
				hasErr = true;
				if (hasErr && firstErrEle == null) {
					firstErrEle = $('label[for="' + key + '"]')[0];
				}
				setCreativeUploadErr(EMPTY_ERR);
			}
		} else if ($('#' + key).val() === "") {
			hasErr = true;
			if (hasErr && firstErrEle == null) {
				firstErrEle = $('label[for="' + key + '"]')[0];
			}
			setErrState(key, EMPTY_ERR);
		}
	})
	
	if (!URL_REGEX.test($('#destination').val())) {
		hasErr = true;
		if (hasErr && firstErrEle == null) {
			firstErrEle = $('label[for="destination"]')[0];
		}
		setErrState('destination', 'Please enter a valid URL');
	}
	
	if ($('#frequency').is(':checked')) {
		if ($('#frequencyNum').val() === '') {
			hasErr = true;
			if (hasErr && firstErrEle == null) {
				$('label[for="frequencyNum"]')[0].scrollIntoView({behavior: 'smooth'});
			}
			setErrState('frequencyNum', EMPTY_ERR);
		} else if (!(Number($('#frequencyNum').val()) > 0 && Number($('#frequencyNum').val()) <= 100)) {
			hasErr = true;
			if (hasErr && firstErrEle == null) {
				$('label[for="frequencyNum"]')[0].scrollIntoView({behavior: 'smooth'});
			}
			setErrState('frequencyNum', 'Impression should range from 1 to 100');
		}
	}
	
	
	if (firstErrEle !== null && typeof firstErrEle !== "undefined") {
		firstErrEle.scrollIntoView({behavior: 'smooth'});
	}
	
	if (hasErr) return false;
	
	return true;
}

function lockInputFields() {
	$('input').attr('disabled', true);
	$('input[name="startDate"]').removeClass('no-error');
	$('.datepicker-container').css('cursor', 'default');
	$('.datepicker-container').css('background-color', '#e9ecef');
	$('#removeCurrentFileBtn').hide();
	$('button').attr('disabled', true);
	$('.tags-input-search').css('background-color', '#e9ecef');
	$('.tags-input-search span').css('border-color', '#e9ecef');
}

function unlockInputFields() {
	$('input').attr('disabled', false);
	$('input[name="startDate"]').addClass('no-error');
	$('.datepicker-container').css('cursor', 'pointer');
	$('.datepicker-container').css('background-color', '#fff');
	$('#removeCurrentFileBtn').show();
	$('button').attr('disabled', false);
	$('.tags-input-search').css('background-color', '#fff');
	$('.tags-input-search span').css('border-color', '#fff');
}

function extractJsonDataAndCreative() {
	const serializeArray = $('form').serializeArray();
	console.log(serializeArray);
	const data = {};
	var formData = new FormData();
	Object.keys(formMap).forEach(function(key) {
		const field = serializeArray.filter(function(obj) {return obj.name === key;})[0];
		if (typeof field !== 'undefined') {
			const value = field.value;
			if (key === 'startDate') {
				if (value === 'immediateCheck') {
					const now = new Date();
					now.setTime(now.getTime() + 60000 * 15);
					data[formMap[key]] = now;
				} else {
					const selectedStartDate = serializeArray.filter(function(obj) {return obj.name === 'selectedStartDate';})[0].value;
					const startDate = new Date(selectedStartDate);
					data[formMap[key]] = startDate;
				}
			} else if (key === 'endDate') {
				const endDate = new Date(value);
				endDate.setHours(23);
				endDate.setMinutes(59);
				endDate.setSeconds(59);
				data[formMap[key]] = endDate;
			} else if (key === 'budget' || key === 'cpm' || key === 'ageFrom' || key === 'ageTo' || key === 'frequencyCapImpression') {
				data[formMap[key]] = Number(value);
			} else if (key === 'interests') {
				data[formMap[key]] = interests.map(function(id) {return {id: id, high: true, mid: true, low: true};});
			} else if (key === 'education') {
				const educationTargets = serializeArray.filter(function(obj) {return obj.name === key;});
				const targets = educationTargets.map(function(target) {return target.value});
				data[formMap[key]] = targets.join(',');
			} else if (key === 'searchIntent') {
				data[formMap[key]] = searchIntents.map(function(intent) {return {url: intent};});
			} else if (key === 'imageName') {
				data[formMap[key]] = Object.keys(files)[0];
			} else if (key === 'targetting') {
				data[formMap[key]] = checkTargetting(serializeArray);
			} else if (key === 'uploadImage') {
				// nothing
			} else {
				data[formMap[key]] = value;
			}
		}
	});

	data['frequencyCap'] = $('#frequency').is(':checked') ? true : false;
	console.log(data);
	Object.keys(data).forEach(function(key) {
		if ((key === 'interest' || key === 'url') && data[key].length === 0) {
			delete data[key];
		} else if ((key === 'ageFrom' || key === 'ageTo') && data[key] === 0) {
			delete data[key];
		} else if (data[key] === "") {
			delete data[key];
		}
	})
	
	console.log(data);
	
	formData.append('uploadImage', files[Object.keys(files)[0]].file);
	formData.append('jsondata', JSON.stringify(data));
	return formData;
}

function handleNotEnoughCredit(extractedData) {
	unlockInputFields();
	$('.not-enough-credit').show();
	const cp = JSON.parse(extractedData.get('jsondata'));
	delete cp['imageName'];
	sessionStorage.setItem('userCampaignJson', JSON.stringify(cp));
}

function restoreUserCampaign(userCampaign) {
	Object.keys(formMap).forEach(function(key) {
		const value = userCampaign[formMap[key]];
		if (value !== null) {
			if (key === 'startDate') {
				const userInputStartDate = new Date(value);
				const now = new Date();
				if (userInputStartDate.getFullYear() === now.getFullYear() && userInputStartDate.getMonth() === now.getMonth() && userInputStartDate.getDate() === now.getDate()) {
					$('#immediateCheck').attr('checked', true);
				} else {
					$('#scheduleCheck').attr('checked', true);
					$('#startDate-container span').html(moment(userInputStartDate).format('DD MMM YYYY'));
				}
				$('#startDate').val(userInputStartDate);
			} else if (key === 'endDate') {
				const userInputEndDate = new Date(value);
				$('#endDate').val(userInputEndDate);
				$('#endDate-container span').html(moment(userInputEndDate).format('DD MMM YYYY'));
			} else if (key === 'gender') {
				$('input[value="'+value+'"]').attr('checked', true);
				$('input[name="gender"]').parent().removeClass('active');
				$('input[value="'+value+'"]').parent().addClass('active');
			} else if (key === 'ageFrom' || key === 'ageTo' || key === 'incomeFrom' || key === 'incomeTo') {
				if (key === 'ageFrom') {
					$('#startageMenu .menu-selected').removeClass('menu-selected');
					$('#startage-btn span').html(value);
					$('#startageMenu div').each(function() {
						if ($(this).text() === String(value)) {
							$(this).addClass('menu-selected');
						}
					});
				} else if (key === 'ageTo') {
					$('#endageMenu .menu-selected').removeClass('menu-selected');
					$('#endage-btn span').html(value);
					$('#endageMenu div').each(function() {
						if ($(this).text() === String(value)) {
							$(this).addClass('menu-selected');
						}
					});
				} else if (key === 'incomeFrom') {
					$('#startincomeMenu .menu-selected').removeClass('menu-selected');
					let displayIncomeFromValue = '';
					$('#startincomeMenu div').each(function() {
						const menuIncomeItemValue = $(this).attr('value');
						if (menuIncomeItemValue === value) {
							displayIncomeFromValue = $(this).text();
							$(this).addClass('menu-selected');
						}
					})
					$('#startincome-btn span').html(displayIncomeFromValue);
				} else if (key === 'incomeTo') {
					$('#endincomeMenu .menu-selected').removeClass('menu-selected');
					let displayIncomeToValue = '';
					$('#endincomeMenu div').each(function() {
						const menuIncomeItemValue = $(this).attr('value');
						if (menuIncomeItemValue === value) {
							displayIncomeToValue = $(this).text();
							$(this).addClass('menu-selected');
						}
					})
					$('#endincome-btn span').html(displayIncomeToValue);
				}
				$('input[name="'+ key +'"]').val(value);
			} else if (key === 'frequencyCap') {
				if (value) {
					$('#frequency').attr('checked', true);
					$('.frequencyNumGroup').show();
				}
			} else if (key === 'frequencyCapImpression') {
				if (value !== 0) {
					$('input[name="'+key+'"]').val(value);
				}
			} else if (key === 'interests') {
				value.forEach(function(obj) {interests.push(obj.id.toString());});
			} else if (key === 'education') {
				value.split(',').forEach(function(target) {
					$('input[value="'+target+'"]').attr('checked', true);
				})
			} else if (key === 'searchIntent') {
				value.forEach(function(obj) {
					const intent = obj.url;
					addTag(searchIntentsTagsContainer, searchIntents, intent, intent);
					searchIntents.push(intent);
				});
			} else if (key === 'imageName') {
				$('#originalCreative').html(value);
    			$('input[name="imageName"]').val(value);
			} else if (key === 'targetting') {
				
			} else {
				$('input[name="'+key+'"]').val(value);
			}
		}
		
	})
	
	$('.custom-dropdown-menu').empty();
	if (interests.length > 0) {
		$.ajax({
			url: '/ajax/ad/getContentTagList?ids=' + interests.join(','),
			type: 'POST',
			success: function(tags) {
				tags.forEach(function(tag) {
					addTag(interestsTagsContainer, interests, tag.name, tag.id);
					$('#' + tag.id + ' svg[data-icon="plus"]').hide();
					$('#' + tag.id + ' svg[data-icon="minus"]').show();
				})
			},
			error: function(err) {console.log(err);}
		})
	}
}

$(document).ready(function() {	
	// register listeners 
	$('input[type="text"]').on('input', function(e) {
		$(this).removeClass('hasErr');
		$('#' + $(this).attr('id') + 'ErrTxt').html('&nbsp;');
		const errSvg = $('#' + $(this).attr('id') + '-ex');
		if (errSvg) {
			errSvg.hide();
		}
	})
	
	$('input[type="radio"]').on('click', function(e) {
		$('input[name="startDate"]').removeClass('error').addClass('no-error');
		$('#startDate-container').removeClass('hasErr');
		$('#startDateErrTxt').html('&nbsp;');
	})
	
	$('.datepicker-container').on('click', function() {
		$(this).find('div').find('button').click();
	})
	
	const tmr = new Date();
	tmr.setDate(tmr.getDate() + 1);
	$('.datepicker').datepicker({
		startDate: tmr,
	}).on('changeDate', function(e) {
			const container = $(this).parent();
			container.find('span').html(e.format('dd-M-yyyy').toString().replace(/-/g, ' '));
			$(this).datepicker('hide');
			
			if (container.attr('id') === 'endDate-container') {
				container.removeClass('hasErr');
				$('#endDateErrTxt').html('&nbsp;');
			}
		}
	);
	
	$('button').on('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
	})
	
	$('#budget').on('input', function(e) {
		const regex = /^\d+\.?\d{0,1}$/;
		if (!regex.test(Number($(this).val())) || $(this).val().length >= 19) {
			$(this).val(prevBudget);
		} else {
			prevBudget = e.target.value;
		}
	})
	
	$('#cpm').on('input', function(e) {
		const regex = /^\d+\.?\d{0,1}$/;
		if (!regex.test(Number($(this).val())) || $(this).val().length >= 19) {
			$(this).val(prevCpm);
		} else {
			prevCpm = e.target.value;
		}
	})
	$('#frequencyNum').numeric({decimal: false, negative: false})
	$('#frequency').on('change', function(e) {
		if ($(this).prop('checked')) {
			$('.frequencyNumGroup').show();
		} else {
			$('.frequencyNumGroup').hide();
			$('#frequencyNum').val("");
		}
	})
	
	$('.search-menu').hide();
	
	
	$('#interests').on('input', function(e) {
		if (e.target.value.length === 0) {
			$('.search-menu').hide();
			return;
		}
		clearTimeout(typingTimer);
		if ($(this).val()) {
			typingTimer = setTimeout(function() {
				if (e.target.value.length > 0) {
					search(e.target.value);
				}
			}, doneTypingInterval);
		}
	})
	
	$('.search-menu a').on('mouseover', function() {
		$('#interests').val($(this).html());
	})
	
	$('#dropdown-btn').on('click', function() {
			$('.custom-dropdown-menu').css('transform', 'translate3d(-214px, ' + $('.interests-search-engine').outerHeight() + 'px, 0px)');
			$('.custom-dropdown-menu').slideToggle('fast');
	})
	
	$('.btn-group-toggle label.active').on('click', function() {
		$(this).css('border', '');
	})
	
	initStartAgeMenu();
	
	initEndAgeMenu();
	
	initStartIncomeMenu();
	
	initEndIncomeMenu();
	
	$('#searchIntent').on('keypress', function(e) {
		if (e.target.value == "") return;
		if (e.originalEvent.key == "Enter") {
			if (searchIntents.filter(function(intent) {return intent === e.target.value;}).length < 1 && searchIntents.length < 30 && e.target.value.length <= 30) {
				addTag(searchIntentsTagsContainer, searchIntents, e.target.value, e.target.value);
				searchIntents.push(e.target.value);
			}
			$(this).val('');
		}
	})
	
	$('#upload').on('input', function(e) {
		const selectedFile = e.target.files[0];
		selectFileCallback(selectedFile);
	})
	
	$('#dropzone').on('drop dragdrop',function(e){
		e.preventDefault();
		const selectedFile = e.originalEvent.dataTransfer.files[0];
		selectFileCallback(selectedFile);
	});
	
	$('.frequencyNumGroup').hide();
	
	$('#submit-btn').on('click', function() {
		if (isValidForm()) {
			console.log(extractJsonDataAndCreative());
			const extractedData = extractJsonDataAndCreative();
			$.ajax({
				url: '/ajax/ad/addCampaign',
				contentType: false,
				processData: false,
				cache: false,
				type: 'POST',
				enctype: 'multipart/form-data',
				data: extractedData,
				beforeSend: function() {
					lockInputFields();
					$('#spinner').show();
					$('#status').text('Loading');
				},
				success: function(data) {
					console.log(data);
					unlockInputFields();
					$('#spinner').hide();
					$('#status').text('Create');
					if (data === "success") {
						sessionStorage.clear();
						window.location.replace("/campaign/listing");
					} else if (data === "campaign name exist") {
						$('label[for="campaignName"]')[0].scrollIntoView({behavior: 'smooth', block: 'start'});
						setErrState('campaignName', CP_NAME_ERR);
					} else if (data === "not enough credit") {
						handleNotEnoughCredit(extractedData);
					} else {
						$('#modal').modal('show');
					}
				},
				error: function(error) {
					console.log(error);
					$('button[data-dismiss="modal"]').attr('disabled', false);
					$('#modal').modal('show');
				}
			})
		}
	})
	
	// fetch interests menu options
	$.ajax({
		url: '/ajax/ad/getFirstLevelTag',
		type: 'POST',
		success: function(data) {
			initInterestsMenu(data);
		},
		error: function(err) {
			
		}
	})
	
	$('#modal').modal({
		show: false,
	});
	$('button[data-dismiss="modal"]').on('click', function() { $('#modal').modal('hide'); });
	
	const userCampaign = sessionStorage.getItem('userCampaignJson');
	if (userCampaign !== null) {
		restoreUserCampaign(JSON.parse(userCampaign));
	}
})
$(document).on('click', function(evt) {	
	if (evt.target!==$('.custom-dropdown-menu')[0] && !$.contains($('.custom-dropdown-menu')[0], $(evt.target)[0]) && evt.target !== $('#dropdown-btn')[0] && !$('#dropdown-btn').has(evt.target).length) {
		$('.custom-dropdown-menu').slideUp('fast');
	}
	
	if (evt.target !== $('#startage-btn')[0] && !$('#startage-btn').has(evt.target).length) {
		$('#startageMenu').slideUp('fast');
	}
	
	if (evt.target !== $('#endage-btn')[0] && !$('#endage-btn').has(evt.target).length) {
		$('#endageMenu').slideUp('fast');
	}
	
	if (evt.target !== $('#startincome-btn')[0] && !$('#startincome-btn').has(evt.target).length) {
		$('#startincomeMenu').slideUp('fast');
	}
	
	if (evt.target !== $('#endincome-btn')[0] && !$('#endincome-btn').has(evt.target).length) {
		$('#endincomeMenu').slideUp('fast');
	}
	
	if (evt.target !== $('#interests')[0] && !$('#interests').has(evt.target).length) {
		$('.search-menu').hide();
		$('.search-menu').empty();
		activeItem = -1;
	}
})