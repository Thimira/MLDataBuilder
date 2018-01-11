function uploadPhoto() {
    if (documentPath == null) {
        document.getElementById('message').innerHTML = "No Data";
    }

    var postUrl = "http://10.98.204.74:3005/upload/";

    var fileUploadOptions = new FileUploadOptions();
    fileUploadOptions.fileKey = "image";
    fileUploadOptions.fileName = documentPath.substr(documentPath.lastIndexOf('/') + 1);
    fileUploadOptions.mimeType = "image/png";
    fileUploadOptions.chunkedMode = true;

    // // Additional Info to Server using JSON Object. This is Optional.
    // var myObj = { "Param1": "FileUploder", "CurrentMode": 0, "Data": "", "TokenForUpload": “0000000” };
    // var jsonData = JSON.stringify(myObj);

    // fileUploadOptions.params = new Object();
    // fileUploadOptions.params.CurrentData = jsonData;

    var fileTransfer = new FileTransfer();

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

    fileTransfer.upload(documentPath, postUrl, uploadPhotoWin, uploadPhotoFail, fileUploadOptions);
}

/**
 * Success callback for upload
 * @param  {[type]} r [description]
 * @return None
 */
function uploadPhotoWin(r) {
    document.getElementById('message').innerHTML = "Sent = " + r.bytesSent + "\n Response = " + r.response + "\n Code = " + r.responseCode + "\n";
}

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
