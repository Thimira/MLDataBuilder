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
    name: 'ML Data Builder',
    // App id
    id: 'com.mldatabuilder.app',
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
    }, {
        path: '/collections/',
        url: 'collections.html',
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

$$(document).on('page:init', '.page[data-name="home"]', function (e) {
    console.log('Home Loaded');
    setInitialImage();
});

$$(document).on('page:afterin', function (e) {
    var page = app.views.main.router.url;
    console.log(page);

    if (page == '/collections/') {
        console.log('Collections Loaded');
        collectionSet.forEach(function(collection) {
            $$('.collectionList').children('ul').append('<li>' + collection + '</li>');
            console.log('Item ' + collection);
        })
    }

    if (page == '/labels/') {
        console.log('Labels Loaded');
        for (var lset in labelSets) {
            if(labelSets.hasOwnProperty(lset)) {
                console.log(labelSets[lset]);
            }
        }
    }
});

function buildLabelSets(setName, setItems) {

}

function buildLabelListItem(itemText) {
    var listItemHTML = '<li><div class="item-content"><div class="item-inner"><div class="item-title">' + itemText + '</div></div></div></li>';
    return listItemHTML;
}

function addNewCollection() {

}

/**
 * Sets the 'No Image' icon to the image placeholder
 */
function setInitialImage() {
    placeImage("img/no-image.jpg");
}

var collectionSet = ['Supercars Dataset', 'Garden Flowers', 'Faces'];

var labelSets = {
    Flowers : ['Anthurium', 'Carnation', 'Daffodil', 'Iris'],
    Cars : ['Ferrari 458 Italia', 'McLaren 675LT', 'Koenigsegg Agera R', 'Lamborghini Aventador', 'Nissan GTR', 'Bugatti Veyron Super Sport']
};

var pickerCollection = app.picker.create({
    inputEl: '#picker-collection',
    rotateEffect: true,
    cols: [{
        textAlign: 'center',
        values: ['Supercars Dataset', 'Garden Flowers']
    }]
});

var pickerLabel = app.picker.create({
    inputEl: '#picker-label',
    rotateEffect: true,
    formatValue: function(values) {
        return values[1];
    },
    cols: [{
        textAlign: 'left',
        values: ['Flowers', 'Cars'],
        onChange: function(picker, labelSet) {
            if (picker.cols[1].replaceValues) {
                picker.cols[1].replaceValues(labelSets[labelSet]);
            }
        }
    }, {
        values: labelSets.Flowers,
        width: 160,
    }, ]
});

