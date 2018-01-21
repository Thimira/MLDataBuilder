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
        path: '/',
        url: 'index.html',
    }, {
        path: '/about/',
        url: 'about.html',
    }, {
        path: '/labels/',
        url: 'labels.html',
    }, {
        path: '/collections/',
        url: 'collections.html',
    }, {
        path: '/settings/',
        url: 'settings.html',
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
    // console.log('Home Loaded');
    setInitialImage();
    setHomepageDataPickers();
});

$$(document).on('page:afterin', function (e) {
    var page = app.views.main.router.url;
    // console.log(page);

    if (page == '/') {
        if (pickerCollection) {
            pickerCollection.destroy();
        }
        if (pickerLabel) {
            pickerLabel.destroy();
        }
        setHomepageDataPickers();
    }

    if (page == '/collections/') {
        // console.log('Collections Loaded');
        createVListCollections();
    }

    if (page == '/labels/') {
        // console.log('Labels Loaded');
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
    app.dialog.prompt('Add New Data Collection', function (collectionName) {
        var newCollection = { title : collectionName };
        virtualListCollections.appendItem(newCollection);
    });
}

function deleteCollection(itemIndex) {
    app.dialog.confirm('Are you sure you want to delete?', function () {
        virtualListCollections.deleteItem(itemIndex);
    });
}

/**
 * Sets the 'No Image' icon to the image placeholder
 */
function setInitialImage() {
    placeImage("img/no-image.jpg");
}

// var collectionSet = ['Supercars Dataset', 'Garden Flowers', 'Faces'];

var collectionSet = [{ title: 'Supercars Dataset'}, { title: 'Garden Flowers'}, { title: 'Faces'}];

var labelSets = {
    Flowers : ['Anthurium', 'Carnation', 'Daffodil', 'Iris'],
    Cars : ['Ferrari 458 Italia', 'McLaren 675LT', 'Koenigsegg Agera R', 'Lamborghini Aventador', 'Nissan GTR', 'Bugatti Veyron Super Sport']
};

var selectedCollection;
var selectedLabel = [];

var pickerCollection;
var pickerLabel;

function setHomepageDataPickers() {
    pickerCollection = app.picker.create({
        inputEl: '#picker-collection',
        rotateEffect: true,
        cols: [{
            textAlign: 'center',
            values: collectionSet.map(x => x.title),
            onChange: function(picker, selCollection) {
                selectedCollection = selCollection;
            }
        }],
        on: {
            init: function(picker) {
                if (selectedCollection) {
                    picker.setValue([selectedCollection]);
                }
            }
        },
    });

    pickerLabel = app.picker.create({
        inputEl: '#picker-label',
        rotateEffect: true,
        formatValue: function(values) {
            return values[0] + " : " + values[1];
        },
        cols: [{
            textAlign: 'left',
            values: Object.keys(labelSets),
            onChange: function(picker, labelSet) {
                if (picker.cols[1].replaceValues) {
                    picker.cols[1].replaceValues(labelSets[labelSet]);
                }
            }
        }, {
            values: labelSets.Flowers,
            // width: 160,
        }, ]
    });
}



var virtualListCollections;

function createVListCollections() {
    virtualListCollections = app.virtualList.create({
        // List Element
        el: '.virtual-list.collectionList',
        // Pass array with items
        items: collectionSet,
        // Custom search function for searchbar
        // searchAll: function (query, items) {
        //     var found = [];
        //     for (var i = 0; i < items.length; i++) {
        //         if (items[i].title.toLowerCase().indexOf(query.toLowerCase()) >= 0 || query.trim() === '') found.push(i);
        //     }
        //     return found; //return array with mathced indexes
        // },
        // List item Template7 template
        // itemTemplate: '<li>{{title}}</li>',
        renderItem: function (item, index) {
            return '<li class="swipeout">' +
                        '<div class="swipeout-content item-content">' +
                            '<div class="item-inner">' + item.title + '</div>' +
                        '</div>' +
                        '<div class="swipeout-actions-right">' +
                            '<a href="#" class="color-red" onclick="deleteCollection(' + index + ')">Delete</a>' +
                        '</div>' +
                    '</li>';
        },
    });

}
