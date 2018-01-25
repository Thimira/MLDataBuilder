var uploadProgress; // Progress dialogbox

/**
 * The image upload handler
 */
function uploadPhoto() {
    if (imagePath == null) {
        displayToastMessage('No image data found to upload');
    } else {
        var postUrl = appSettings.backend_endpoint;

        var fileUploadOptions = new FileUploadOptions();
        fileUploadOptions.fileKey = "image";
        fileUploadOptions.fileName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        fileUploadOptions.mimeType = "image/png";
        fileUploadOptions.chunkedMode = true;

        var params = {};
        params.collection = selectedCollection;
        params.labelSet = selectedLabel.labelSet;
        params.label = selectedLabel.label;

        fileUploadOptions.params = params;

        var fileTransfer = new FileTransfer();

        uploadProgress = app.dialog.progress('Please Wait...');

        fileTransfer.onprogress = function(progressEvent) {
            if (progressEvent.lengthComputable) {
                var percentage = Math.floor(progressEvent.loaded / progressEvent.total) * 100;
                uploadProgress.setProgress(percentage);

                if (progressEvent.loaded === progressEvent.total) {
                    uploadProgress.close();
                }
            } else {
                // loadingStatus.increment();
            }
        };

        fileTransfer.upload(imagePath, postUrl, uploadPhotoWin, uploadPhotoFail, fileUploadOptions);
    }
}

/**
 * Success callback for upload
 * @param res : the response object
 */
function uploadPhotoWin(res) {
    uploadProgress.close();
    var messageText = "Sent = " + res.bytesSent + " Response = " + res.response + " Code = " + res.responseCode;
    displayToastMessage(messageText);
}

/**
 * Error callback for upload
 * @param error : the received error object
 */
function uploadPhotoFail(error) {
    uploadProgress.close();

    switch (error.code) {
        case FileTransferError.FILE_NOT_FOUND_ERR:
            displayToastMessage("Image file not found");
            break;
        case FileTransferError.INVALID_URL_ERR:
            displayToastMessage("Invalid URL");
            break;
        case FileTransferError.CONNECTION_ERR:
            displayToastMessage("Connection error");
            break;
    }
}

function displayToastMessage(message) {
    var toastWithButton = app.toast.create({
            text: message,
            closeButton: true
        });

        toastWithButton.open();
}
