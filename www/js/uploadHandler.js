/**
 * The image upload handler
 */
function uploadPhoto() {
    if (imagePath == null) {
        var toastWithButton = app.toast.create({
            text: 'No image data found to upload',
            closeButton: true
        });

        toastWithButton.open();
    } else {
        var postUrl = "http://10.98.204.74:3005/upload/";

        var fileUploadOptions = new FileUploadOptions();
        fileUploadOptions.fileKey = "image";
        fileUploadOptions.fileName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        fileUploadOptions.mimeType = "image/png";
        fileUploadOptions.chunkedMode = true;

        var fileTransfer = new FileTransfer();

        // Uncomment below when adding the progressbar

        // var progressBar = document.querySelector('progress');

        // fileTransfer.onprogress = function (result) {
        //     var percent = (result.loaded / result.total) * 100;
        //     percent = Math.round(percent);
        //     progressBar.value = percent;
        //     progressBar.textContent = progressBar.value;
        // };

        // progressBar.value = 0;
        // progressBar.textContent = progressBar.value;
        // $("#spResult").text("");

        fileTransfer.upload(imagePath, postUrl, uploadPhotoWin, uploadPhotoFail, fileUploadOptions);
    }


}

/**
 * Success callback for upload
 * @param r : the response object
 */
function uploadPhotoWin(res) {
    var messageText = "Sent = " + res.bytesSent + " Response = " + res.response + " Code = " + res.responseCode;
    $$('#message').text(messageText);
}

/**
 * Error callback for upload
 * @param error : the received error object
 */
function uploadPhotoFail(error) {
    switch (error.code) {
        case FileTransferError.FILE_NOT_FOUND_ERR:
            $$('#message').text("Photo file not found");
            break;
        case FileTransferError.INVALID_URL_ERR:
            $$('#message').text("Bad Photo URL");
            break;
        case FileTransferError.CONNECTION_ERR:
            $$('#message').text("Connection error");
            break;
    }
}
