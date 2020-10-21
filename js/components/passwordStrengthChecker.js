const WEAK = '<div class="weak indicator"></div>';
const MIDDLE = '<div class="middle indicator"></div>';
const STRONG = '<div class="strong indicator"></div>';
const NORMAL = '<div class="normal indicator"></div>';

function checkStrength(password, e) {
	const strengthIndicator = $('#strength-indicator');
	strengthIndicator.empty();
	
    var strength = 0  
    if (password.length > 0 && password.length < 6) {
    	strengthIndicator.append(WEAK);
    	strengthIndicator.append(NORMAL);
    	strengthIndicator.append(NORMAL);
        return;
    }  
    if (password.length > 7) strength += 1  
    // If password contains both lower and uppercase characters, increase strength value.  
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 1  
    // If it has numbers and characters, increase strength value.  
    if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) strength += 1  
    // If it has one special character, increase strength value.  
    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1  
    // If it has two special characters, increase strength value.  
    if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1  
    // Calculated strength value, we can return messages  
    // If value is less than 2  
    if (strength < 2) {  
    	strengthIndicator.append(WEAK); 
    	strengthIndicator.append(NORMAL);
    	strengthIndicator.append(NORMAL);
        return;
    } else if (strength == 2) {  
    	strengthIndicator.append(WEAK);
    	strengthIndicator.append(MIDDLE);
    	strengthIndicator.append(NORMAL);
        return;
    } else {  
    	strengthIndicator.append(WEAK);
    	strengthIndicator.append(MIDDLE);
    	strengthIndicator.append(STRONG);
        return;
    }  
}