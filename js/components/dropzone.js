function addFile(file) {
    if (!(file.name in files) && Object.keys(files).length < 1) {
        $('#currentFile').html(file.name);
        files[file.name] = {
            file: file,
        }
        
    }
    console.log('files: ', files);
    $('#uploadBusinessReg').hide();
    $('#previews').show();
}

$(document).ready(function() {
	$('#uploadLink').on('click', function(e) {
		$('#upload').trigger('click');
	})
	
	// reset input's value whenever a file is selected
	$('#upload').on('click', function(e) {
		this.value = null;
	})
	
	
	$('#dropzone').on('dragenter',function(event){
	    event.preventDefault();
	    event.stopPropagation();
//	    $(this).html('drop now').css('background','blue');
	})
	$('#dropzone').on('dragleave',function(){
//	    $(this).html('drop here').css('background','red');
	})
	$('#dropzone').on('dragover',function(event){
	    event.preventDefault();
	    event.stopPropagation();
	})
	
	$('#removeCurrentFileBtn').on('click', function(e) {
		delete files[$('#currentFile').html()];
		$('#previews').hide();
		$('#uploadBusinessReg').show();
	})
})