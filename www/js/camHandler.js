/**
 * Success callback for image data requests
 * @param imageData : the retrieved base64-encoded image data
 */
function onPhotoDataSuccess(imageData) {
    var imageSrc = "data:image/jpeg;base64," + imageData;

    placeImage(imageSrc);
}

/**
 * Success callback for image URI requests
 * @param imageURI : the retrieved image URI
 */
function onPhotoURISuccess(imageURI) {
    placeImage(imageURI);

    imagePath = imageURI;

    // Uncomment to view the imageURI
    // document.getElementById('message').innerHTML = imageURI;
    $$('#message').text(imageURI);
}

function placeImage(imageSrc) {
    // Get the handle for the image element
    var imageElement = document.getElementById('imagePlaceholder');

    // Unhide image element
    imageElement.style.display = 'block';

    // Place the image on the placeholder
    imageElement.src = imageSrc;
}

/**
 * Take picture using device camera and retrieve image as base64-encoded string
 */
function capturePhotoData() {
    navigator.camera.getPicture(onPhotoDataSuccess,
        onFail, {
            quality: 50,
            destinationType: destinationType.DATA_URL
        });
}

/**
 * Take picture using device camera and retrieve image as a URI
 */
function capturePhotoURI() {
    navigator.camera.getPicture(onPhotoURISuccess,
        onFail, {
            quality: 50,
            destinationType: destinationType.FILE_URI
        });
}

/**
 * Take picture using device camera, allow edit, and retrieve image as base64-encoded string
 */
function capturePhotoEdit() {
    navigator.camera.getPicture(onPhotoDataSuccess,
        onFail, {
            quality: 20,
            allowEdit: true,
            destinationType: destinationType.DATA_URL
        });
}

/**
 * Retrieve image file location from specified source
 * @param  source : source of the image - PHOTOLIBRARY, SAVEDPHOTOALBUM
 */
function getPhoto(source) {
    navigator.camera.getPicture(onPhotoURISuccess,
        onFail, {
            quality: 50,
            destinationType: destinationType.FILE_URI,
            sourceType: source
        });
}

/**
 * Produce an alert message when an error occurs.
 * @param  {[type]} message : the message to display
 */
function onFail(message) {
    alert('Image retrieval failed: ' + message);
}
