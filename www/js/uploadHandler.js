/**
 * The image upload handler
 */
function uploadPhoto() {
    if (imagePath == null) {
        document.getElementById('message').innerHTML = "No Data";
    }

    var postUrl = "http://10.98.204.74:3005/upload/";

    var fileUploadOptions = new FileUploadOptions();
    fileUploadOptions.fileKey = "image";
    fileUploadOptions.fileName = documentPath.substr(imagePath.lastIndexOf('/') + 1);
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

/**
 * Success callback for upload
 * @param r : the response object
 */
function uploadPhotoWin(res) {
    document.getElementById('message').innerHTML = "Sent = " + res.bytesSent + "\n Response = " + res.response + "\n Code = " + res.responseCode + "\n";
}

/**
 * Error callback for upload
 * @param error : the received error object
 */
function uploadPhotoFail(error) {
    switch (error.code) {
        case FileTransferError.FILE_NOT_FOUND_ERR:
            document.getElementById('message').innerHTML = "Photo file not found";
            break;
        case FileTransferError.INVALID_URL_ERR:
            document.getElementById('message').innerHTML = "Bad Photo URL";
            break;
        case FileTransferError.CONNECTION_ERR:
            document.getElementById('message').innerHTML = "Connection error";
            break;
    }
}
