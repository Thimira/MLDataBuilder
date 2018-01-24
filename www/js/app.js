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

var appStorage;

// Handle Cordova Device Ready Event
$$(document).on('deviceReady', function() {
    console.log("Device is ready!");

    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;

    appStorage = window.localStorage;

    loadApplicationData();
    // localStorage.clear();
    // appStorage.clear();

    setInitialImage();
});

$$(document).on('page:init', '.page[data-name="home"]', function (e) {
    // console.log('Home Loaded');
    setInitialImage();

    // HACK! Find a better solution!
    setTimeout(function(){
        setHomepageDataPickers();
    }, 100);

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
        // console.log(labelSets);
    }

    if (page == '/collections/') {
        // console.log('Collections Loaded');
        createVListCollections();
    }

    if (page == '/labels/') {
        // console.log('Labels Loaded');
        if (virtualListLabelSets) {
            virtualListLabelSets.destroy();
        }
        createVListLabelSets();
    }

    if (page == '/settings/') {
        loadSettings();
    }
});

app.on('tabShow', function(tabEl) {
    if ($$(tabEl).hasClass('labelSets')) {
        if (virtualListLabelSets) {
            virtualListLabelSets.destroy();
        }
        createVListLabelSets();

        currentViewLabel = 'index';
    }
});


function addNewCollection() {
    app.dialog.prompt('Add New Data Collection', function (collectionName) {
        var newCollection = { title : collectionName };
        virtualListCollections.appendItem(newCollection);

        saveApplicationDataItem('collectionSet');
    });
}

function editCollection(itemIndex) {
    app.dialog.prompt('Edit Data Collection', function (collectionName) {
        var newCollection = { title : collectionName };
        virtualListCollections.replaceItem(itemIndex, newCollection);

        saveApplicationDataItem('collectionSet');
    });
}

function deleteCollection(itemIndex) {
    app.dialog.confirm('Are you sure you want to delete?', function () {
        virtualListCollections.deleteItem(itemIndex);

        saveApplicationDataItem('collectionSet');
    });
}

function addLabels() {
    if (currentViewLabel === 'index') {
        addNewLabelSet();
    } else {
        addNewLabeltoLabelSet();
    }
}

function addNewLabelSet() {
    app.dialog.prompt('Add New Label Set', function (setName) {
        var newLabelSet = { label : setName };
        virtualListLabelSets.appendItem(newLabelSet);
        labelSets[setName] = [];
        labelSetKeys = Object.keys(labelSets);

        saveApplicationDataItem('labelSets');
    });
}

function editLabelSet(itemIndex) {
    var currentName = labelSetKeys[itemIndex];
    app.dialog.prompt('Edit Label Set \'' + currentName + '\'', function (setName) {
        var oldName = labelSetKeys[itemIndex];
        labelSets[setName] = labelSets[oldName];
        delete labelSets[oldName];
        labelSetKeys = Object.keys(labelSets);

        var newLabelSet = { label : setName };
        virtualListLabelSets.replaceItem(itemIndex, newLabelSet);

        saveApplicationDataItem('labelSets');
    });
}

function deleteLabelSet(itemIndex) {
    var setName = labelSetKeys[itemIndex];
    app.dialog.confirm('Are you sure you want to delete \'' + setName + '\'?', function () {
        virtualListLabelSets.deleteItem(itemIndex);
        var setName = labelSetKeys[itemIndex];
        delete labelSets[setName];
        labelSetKeys = Object.keys(labelSets);

        saveApplicationDataItem('labelSets');
    });
}

var currentViewLabel = 'index';

function loadLabelDetails(itemIndex) {
    currentViewLabel = labelSetKeys[itemIndex];
    createVListLabelDetails(currentViewLabel);
    app.tab.show("#tab2");
}

function addNewLabeltoLabelSet() {
    app.dialog.prompt('Add New Label to ' + currentViewLabel + ' Set', function (labelName) {
        var newLabel = { label : labelName };
        virtualListLabelDetails.appendItem(newLabel);
        labelSets[currentViewLabel].push(labelName);

        saveApplicationDataItem('labelSets');
    });
}

function editLabel(itemIndex) {
    var editingLabel = labelSets[currentViewLabel][itemIndex];
    app.dialog.prompt('Edit Label \'' + editingLabel + '\'', function (labelName) {
        labelSets[currentViewLabel][itemIndex] = labelName;

        var newLabelName = { label : labelName };
        virtualListLabelDetails.replaceItem(itemIndex, newLabelName);

        saveApplicationDataItem('labelSets');
    });
}

function deleteLabel(itemIndex) {
    var editingLabel = labelSets[currentViewLabel][itemIndex];
    app.dialog.confirm('Are you sure you want to delete \'' + editingLabel + '\'?', function () {
        virtualListLabelDetails.deleteItem(itemIndex);
        labelSets[currentViewLabel].splice(itemIndex, 1);

        saveApplicationDataItem('labelSets');
    });
}

/**
 * Sets the 'No Image' icon to the image placeholder
 */
function setInitialImage() {
    placeImage("img/no-image.jpg");
}

// var collectionSet = [{ title: 'Supercars Dataset'}, { title: 'Garden Flowers'}, { title: 'Faces'}];

// var labelSets = {
//     Flowers : ['Anthurium', 'Carnation', 'Daffodil', 'Iris'],
//     Cars : ['Ferrari 458 Italia', 'McLaren 675LT', 'Koenigsegg Agera R', 'Lamborghini Aventador', 'Nissan GTR', 'Bugatti Veyron Super Sport']
// };

// var labelSetKeys = Object.keys(labelSets);

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
                    if (labelSets[labelSet].length > 0) {
                        picker.cols[1].replaceValues(labelSets[labelSet]);
                    } else {
                        picker.cols[1].replaceValues(['-- No Items --']);
                    }

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
            return  '<li class="swipeout">' +
                        '<div class="swipeout-content item-content">' +
                            '<div class="item-inner">' + item.title + '</div>' +
                        '</div>' +
                        '<div class="swipeout-actions-right">' +
                            '<a href="#" class="color-orange" onclick="editCollection(' + index + ')">Edit</a>' +
                            '<a href="#" class="color-red" onclick="deleteCollection(' + index + ')">Delete</a>' +
                        '</div>' +
                    '</li>';
        },
    });
}

var virtualListLabelSets;

function createVListLabelSets() {
    // https://stackoverflow.com/questions/14810506/map-function-for-objects-instead-of-arrays
    var labelSetKeyMap = labelSetKeys.reduce(function(accumulator, currentValue) {
                            accumulator.push({label : currentValue});
                            return accumulator;
                        }, []);

    // console.log(labelSetKeyMap);

    virtualListLabelSets = app.virtualList.create({
        // List Element
        el: '.virtual-list.labelSetsList',
        // Pass array with items
        items: labelSetKeyMap,
        // Item Render Template
        renderItem: function (item, index) {
            var itemCount = 0;
            if (labelSets[item.label]) {
                itemCount = labelSets[item.label].length;
            }
            return  '<li class="swipeout">' +
                        '<div class="swipeout-content">' +
                            '<a href="#" class="item-link item-content">' +
                                '<div class="item-inner">' +
                                    '<div class="item-title">' + item.label + '</div>' +
                                    '<div class="item-after"><span class="badge color-green">' + itemCount + '</span></div>' +
                                '</div>' +
                            '</a>' +
                        '</div>' +
                        '<div class="swipeout-actions-left">' +
                            '<a href="#" class="color-orange" onclick="loadLabelDetails(' + index + ')">Items</a>' +
                        '</div>' +
                        '<div class="swipeout-actions-right">' +
                            '<a href="#" class="color-orange" onclick="editLabelSet(' + index + ')">Edit</a>' +
                            '<a href="#" class="color-red" onclick="deleteLabelSet(' + index + ')">Delete</a>' +
                        '</div>' +
                    '</li>';
        },
    });
}

var virtualListLabelDetails;

function createVListLabelDetails(labelSet) {
    // https://stackoverflow.com/questions/14810506/map-function-for-objects-instead-of-arrays
    var labelDetailsMap = labelSets[labelSet].reduce(function(accumulator, currentValue) {
                            accumulator.push({label : currentValue});
                            return accumulator;
                        }, []);

    // console.log(labelSetKeyMap);

    virtualListLabelDetails = app.virtualList.create({
        // List Element
        el: '.virtual-list.labelDetailList',
        // Pass array with items
        items: labelDetailsMap,
        // Item Render Template
        renderItem: function (item, index) {
            return  '<li class="swipeout">' +
                        '<div class="swipeout-content">' +
                            '<a href="#" class="item-link item-content">' +
                                '<div class="item-inner">' +
                                    '<div class="item-title">' + item.label + '</div>' +
                                '</div>' +
                            '</a>' +
                        '</div>' +
                        '<div class="swipeout-actions-right">' +
                            '<a href="#" class="color-orange" onclick="editLabel(' + index + ')">Edit</a>' +
                            '<a href="#" class="color-red" onclick="deleteLabel(' + index + ')">Delete</a>' +
                        '</div>' +
                    '</li>';
        },
    });
}

// ********** Application Data **********

var appSettings;
var collectionSet;
var labelSets;
var labelSetKeys;

// **************************************

function loadApplicationData() {
    appSettings = appStorage.getItem('settings');

    if (appSettings === null) {
        console.log("Loading defaults for appSettings");
        appSettings = {
            backend_endpoint : "",
            username : "",
            access_token : ""
        };

        appStorage.setItem('settings', JSON.stringify(appSettings));
    } else {
        appSettings = JSON.parse(appSettings);
    }

    console.log(appSettings);

    collectionSet = appStorage.getItem('collectionSet');

    if (collectionSet === null) {
        console.log("Loading defaults for collectionSet");
        collectionSet = [{ title: 'Supercars Dataset'}, { title: 'Garden Flowers'}, { title: 'Faces'}];

        appStorage.setItem('collectionSet', JSON.stringify(collectionSet));
    } else {
        collectionSet = JSON.parse(collectionSet);
    }


    labelSets = appStorage.getItem('labelSets');

    if (labelSets === null) {
        console.log("Loading defaults for labelSets");
        labelSets = {
            Flowers : ['Anthurium', 'Carnation', 'Daffodil', 'Iris'],
            Cars : ['Ferrari 458 Italia', 'McLaren 675LT', 'Koenigsegg Agera R', 'Lamborghini Aventador', 'Nissan GTR', 'Bugatti Veyron Super Sport']
        };

        appStorage.setItem('labelSets', JSON.stringify(labelSets));
    } else {
        labelSets = JSON.parse(labelSets);
    }
    labelSetKeys = Object.keys(labelSets);
}

function saveApplicationDataItem(itemKey) {
    console.log(window[itemKey]);
    appStorage.setItem(itemKey, JSON.stringify(window[itemKey]));
}


function saveSettings() {
    var formData = app.form.convertToData('#settings-form');
    // alert(JSON.stringify(formData));
    appStorage.setItem('settings', JSON.stringify(formData));
}

function loadSettings() {
    console.log(appSettings);
    app.form.fillFromData('#settings-form', appSettings);
}
