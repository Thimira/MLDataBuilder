/**
 * Global variables
 */
var pictureSource; // available image sources
var destinationType; // available formats of the returned images
var imagePath; // the URI of the current image

var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'My App',
    // App id
    id: 'com.myapp.test',
    // Enable swipe panel
    panel: {
        swipe: 'left',
    },
    // Add default routes
    routes: [{
        path: '/about/',
        url: 'about.html',
    }, {
        path: '/labels/',
        url: 'labels.html',
    }, ],
    view: {
        pushState: true, // device back button will bring you to the main page
    }
});

var mainView = app.views.create('.view-main');

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Handle Cordova Device Ready Event
$$(document).on('deviceReady', function() {
    console.log("Device is ready!");

    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;

    setInitialImage();
});


// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
// myApp.onPageInit('about', function (page) {
//     // Do something here for "about" page

// });

// myApp.onPageInit('index', function (page) {
//     // Do something here for "about" page

//     setInitialImage();
// })

/**
 * Sets the 'No Image' icon to the image placeholder
 */
function setInitialImage() {
    placeImage("img/no-image.jpg");
}
