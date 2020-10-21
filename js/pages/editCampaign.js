var isCreativeChanged = false;
var userCampaign = {};

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function lockCpNameAndStartDate(startDate) {
	$('#campaignName').attr('disabled', true);
	const now = new Date();
	now.setTime(now.getTime() + 60000 * 15);
	if (new Date(startDate).getTime() <= now.getTime()) {
		$('input[name="startDate"]').attr('disabled', true);
		$('input[name="startDate"]').removeClass('no-error');
		$('#startDate-container').css('cursor', 'default');
		$('#startDate-container').css('background-color', '#e9ecef');
		$('#startDate-container').off();
		$('#startDate-container .datepicker button').attr('disabled', true);
	}
}

function handleErrorStatus(status) {
	if (status.includes('ERROR')) {
		$('input').attr('disabled', true);
		$('button:not(#update-btn)').attr('disabled', true);
		$('#update-btn').text('Retry');
		
		$('input[name="startDate"]').removeClass('no-error');
		$('#startDate-container').css('cursor', 'default');
		$('#startDate-container').css('background-color', '#e9ecef');
		$('#startDate-container').off();
		$('#startDate-container .datepicker button').attr('disabled', true);
		
		$('#endDate-container').css('cursor', 'default');
		$('#endDate-container').css('background-color', '#e9ecef');
		$('#endDate-container').off();
		$('#endDate-container .datepicker button').attr('disabled', true);
		
		$('#dropzone').off();
	}
}

function fetchUserCampaign() {
	$.ajax({
		url: '/ajax/ad/getCampaign?id=' + getParameterByName("id"),
		type: 'POST',
		success: function(data) {
			lockCpNameAndStartDate(data.startDate);
			handleErrorStatus(data.status);
			console.log(data);
			userCampaign = data;
			restoreUserCampaign(data);
//			Object.keys(formMap).forEach(function(key) {
//				const value = data[formMap[key]];
//				if (value !== null) {
//					if (key === 'startDate') {
//						const userInputStartDate = new Date(value);
//						const now = new Date();
//						if (userInputStartDate.getFullYear() === now.getFullYear() && userInputStartDate.getMonth() === now.getMonth() && userInputStartDate.getDate() === now.getDate()) {
//							$('#immediateCheck').attr('checked', true);
//						} else {
//							$('#scheduleCheck').attr('checked', true);
//							$('#startDate-container span').html(moment(userInputStartDate).format('DD MMM YYYY'));
//						}
//						$('#startDate').val(userInputStartDate);
//					} else if (key === 'endDate') {
//						const userInputEndDate = new Date(value);
//						$('#endDate').val(userInputEndDate);
//						$('#endDate-container span').html(moment(userInputEndDate).format('DD MMM YYYY'));
//					} else if (key === 'gender') {
//						$('input[value="'+value+'"]').attr('checked', true);
//						$('input[name="gender"]').parent().removeClass('active');
//						$('input[value="'+value+'"]').parent().addClass('active');
//					} else if (key === 'ageFrom' || key === 'ageTo' || key === 'incomeFrom' || key === 'incomeTo') {
//						if (key === 'ageFrom') {
//							$('#startage-btn span').html(value);
//						} else if (key === 'ageTo') {
//							$('#endage-btn span').html(value);
//						} else if (key === 'incomeFrom') {
//							let displayIncomeFromValue = '';
//							$('#startincomeMenu div').each(function() {
//								const menuIncomeItemValue = $(this).attr('value');
//								if (menuIncomeItemValue === value) {
//									displayIncomeFromValue = $(this).text();
//								}
//							})
//							$('#startincome-btn span').html(displayIncomeFromValue);
//						} else if (key === 'incomeTo') {
//							let displayIncomeToValue = '';
//							$('#endincomeMenu div').each(function() {
//								const menuIncomeItemValue = $(this).attr('value');
//								if (menuIncomeItemValue === value) {
//									displayIncomeToValue = $(this).text();
//								}
//							})
//							$('#endincome-btn span').html(displayIncomeToValue);
//						}
//						$('input[name="'+ key +'"]').val(value);
//					} else if (key === 'frequencyCap') {
//						if (value) {
//							$('#frequency').attr('checked', true);
//							$('.frequencyNumGroup').show();
//						}
//					} else if (key === 'frequencyCapImpression') {
//						if (value !== 0) {
//							$('input[name="'+key+'"]').val(value);
//						}
//					} else if (key === 'interests') {
//						value.forEach(function(obj) {interests.push(obj.id.toString());});
//					} else if (key === 'education') {
//						value.split(',').forEach(function(target) {
//							$('input[value="'+target+'"]').attr('checked', true);
//						})
//					} else if (key === 'searchIntent') {
////						data[formMap[key]] = searchIntents.map(function(intent) {return {url: intent};});
//						value.forEach(function(obj) {
//							const intent = obj.url;
//							addTag(searchIntentsTagsContainer, searchIntents, intent, intent);
//							searchIntents.push(intent);
//						});
//					} else if (key === 'imageName') {
////						data[formMap[key]] = Object.keys(files)[0];
//						$('#originalCreative').html(value);
//	        			$('input[name="imageName"]').val(value);
//					} else if (key === 'targetting') {
//						
//					} else {
//						$('input[name="'+key+'"]').val(value);
//					}
//				}
//				
//			})
//			
//			// fetch interests menu options
//			$.ajax({
//				url: '/ajax/ad/getFirstLevelTag',
//				type: 'POST',
//				success: function(data) {
//					$('.custom-dropdown-menu').empty();
//					initInterestsMenu(data);
//					$.ajax({
//						url: '/ajax/ad/getContentTagList?ids=' + interests.join(','),
//						type: 'POST',
//						success: function(tags) {
//							console.log(tags);
//							tags.forEach(function(tag) {
//								addTag(interestsTagsContainer, interests, tag.name, tag.id);
//								$('#' + tag.id + ' svg[data-icon="plus"]').hide();
//								$('#' + tag.id + ' svg[data-icon="minus"]').show();
//							})
//						},
//						error: function(err) {console.log(err);}
//					})
//				},
//				error: function(err) {
//					
//				}
//			})
			
			
		},
		error: function(err) {console.log(err);}
	})
}

function extractJsonData() {
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
				data[formMap[key]] = userCampaign.imageName;
			} else if (key === 'targetting') {
				data[formMap[key]] = checkTargetting(serializeArray);
			} else {
				data[formMap[key]] = value;
			}
		}
		if (key === 'education' && typeof field === 'undefined') {
			data[formMap[key]] = null;
		}
	});

	data['frequencyCap'] = $('#frequency').is(':checked') ? true : false;
	console.log(data);
	Object.keys(data).forEach(function(key) {
		if ((key === 'interest' || key === 'url') && data[key].length === 0) {
			data[key] = null;
		} else if ((key === 'ageFrom' || key === 'ageTo') && data[key] === 0) {
			data[key] = null;
		} else if (data[key] === "") {
			data[key] = null;
		}
	})
	
	
	Object.keys(userCampaign).forEach(function(key) {
		if (typeof data[key] !== "undefined") {
			userCampaign[key] = data[key];
		}
	});
	
	console.log(userCampaign);
	
	if (isCreativeChanged) {
		const newUploadedFile = files[Object.keys(files)[0]].file;
		userCampaign['imageName'] = newUploadedFile.name
		formData.append('uploadImage', newUploadedFile);
	}
	formData.append('jsondata', JSON.stringify(userCampaign));
	return formData;
}

$(document).ready(function() {
	// fetch and set campaign data
	fetchUserCampaign();
	
	$('#update-btn').on('click', function() {
		if (isValidForm()) {
			const formData = extractJsonData();
			formData.append('campaignId', userCampaign.id);
			$.ajax({
				url: '/ajax/ad/editCampaign',
				contentType: false,
				processData: false,
				cache: false,
				type: 'POST',
				enctype: 'multipart/form-data',
				data: formData,
				beforeSend: function() {
					lockInputFields();
					$('#spinner').show();
					$('#status').text('Loading');
				},
				success: function(data) {
					console.log(data);
					$('#spinner').hide();
					$('#status').text('Update');
					if (data === "success") {
						unlockInputFields();
						window.location.replace("/campaign/listing");
					} else if (data === "campaign name exist") {
						unlockInputFields();
						$('label[for="campaignName"]')[0].scrollIntoView({behavior: 'smooth', block: 'start'});
						setErrState('campaignName', CP_NAME_ERR);
					} else if (data === "not enough credit") {
						$('.not-enough-credit').show();
						unlockInputFields();
						const data = JSON.parse(formData.get('jsondata'));
						lockCpNameAndStartDate(data.startDate);
						handleErrorStatus(data.status);
					} else {
						unlockInputFields();
						const data = JSON.parse(formData.get('jsondata'));
						lockCpNameAndStartDate(data.startDate);
						handleErrorStatus(data.status);
						$('button[data-dismiss="modal"]').attr('disabled', false);
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
	
	$('#modal').modal({
		show: false,
	});
	$('button[data-dismiss="modal"]').on('click', function() { $('#modal').modal('hide'); });
})