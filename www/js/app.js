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
    }, {
        path: '/account/',
        url: 'account.html',
    }, ],
    view: {
        pushState: true, // device back button will bring you to the main page
    }
});

var mainView = app.views.create('.view-main');

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var appStorage;
var deviceUniqueID;
var deviceUniqueIDBackup;

var loadingScreen;

app.on('init', function () {
    // loadingScreen = app.dialog.preloader();
});

// Handle Cordova Device Ready Event
$$(document).on('deviceReady', function() {
    console.log("Device is ready!");

    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;

    appStorage = window.localStorage;

    deviceUniqueID = device.uuid;

    // localStorage.clear();
    // appStorage.clear();
    loadApplicationData();

    if (deviceUniqueID === null) {
        deviceUniqueIDBackup = appStorage.getItem('deviceUniqueIDBackup');
        if (deviceUniqueIDBackup) {
            deviceUniqueID = deviceUniqueIDBackup;
        } else {
            deviceUniqueID = Math.floor((Math.random() * 100000000) + 1);
            deviceUniqueIDBackup = deviceUniqueID;
            saveApplicationDataItem("deviceUniqueIDBackup");
            console.log('New device ID generated');
        }
    }

    console.log('Device ID : ' + deviceUniqueID);

    setHomepageDataPickers();
    // loadingScreen.close();
    // loadingScreen.destroy();

    setInitialImage();
    setAccountStatus();
});

$$(document).on('page:init', '.page[data-name="home"]', function (e) {
    // console.log('Home Loaded');
    setInitialImage();
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
        currentViewLabel = 'index';

        app.tab.show("#tab1");
    }

    if (page == '/settings/') {
        loadSettings();
    }

    if (page == '/account/') {
        setAccountStatus();
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

function validateName(nameString) {
    nameString = nameString.trim();
    if (nameString.length > 0) {
        var validationPattern = /^[\w -]+$/ig;
        if (validationPattern.test(nameString)) {
            return true;
        } else {
            app.dialog.alert('A name can only contain aplphanumeric characters, spaces, underscores, and dashes');
        }
    } else {
        app.dialog.alert('A name cannot be empty');
    }
    return false;
}

function checkCollectionExists(collectionName) {
    return collectionSet.some(function(collection, index) {
        return collection.title === collectionName;
    });
}


function addNewCollection() {
    app.dialog.prompt('Add New Data Collection', function (collectionName) {
        if (!checkCollectionExists(collectionName)) {
            if (validateName(collectionName)) {
                var newCollection = { title : collectionName };
                virtualListCollections.appendItem(newCollection);

                saveApplicationDataItem('collectionSet');
            } else {
                addNewCollection();
            }
        } else {
            app.dialog.alert('The Collection name you entered already exists');
            addNewCollection();
        }
    });
}

function editCollection(itemIndex) {
    var editingCollection = collectionSet[itemIndex].title;
    var editCollectionPrompt = app.dialog.prompt('Edit Data Collection \'' + editingCollection + '\'', function (collectionName) {
        if (collectionName !== editingCollection) {
            if (!checkCollectionExists(collectionName)) {
                if (validateName(collectionName)) {
                    var newCollection = { title : collectionName };
                    virtualListCollections.replaceItem(itemIndex, newCollection);

                    saveApplicationDataItem('collectionSet');
                } else {
                    editCollection(itemIndex);
                }
            } else {
                app.dialog.alert('The Collection name you entered already exists');
                editCollection(itemIndex);
            }
        }
    });
    $$(editCollectionPrompt.$el).find('input[type="text"]').val(editingCollection);
}

function deleteCollection(itemIndex) {
    var editingCollection = collectionSet[itemIndex].title;
    app.dialog.confirm('Are you sure you want to delete \'' + editingCollection + '\'?', function () {
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
        if (labelSets[setName] === undefined) {
            if (validateName(setName)) {
                labelSets[setName] = [];
                labelSetKeys = Object.keys(labelSets);

                var newLabelSet = { label : setName };
                virtualListLabelSets.appendItem(newLabelSet);

                saveApplicationDataItem('labelSets');
            } else {
                addNewLabelSet();
            }
        } else {
            app.dialog.alert('The LabelSet name you entered already exists');
            addNewLabelSet();
        }
    });
}

function editLabelSet(itemIndex, currentName) {
    var editLabelSetPrompt = app.dialog.prompt('Edit Label Set \'' + currentName + '\'', function (setName) {
        if (setName !== currentName) {
            if (labelSets[setName] === undefined) {
                if (validateName(setName)) {
                    labelSets[setName] = labelSets[currentName];
                    delete labelSets[currentName];
                    labelSetKeys = Object.keys(labelSets);

                    var newLabelSet = { label : setName };
                    virtualListLabelSets.replaceItem(itemIndex, newLabelSet);

                    saveApplicationDataItem('labelSets');
                } else {
                    editLabelSet(itemIndex, currentName);
                }
            } else {
                app.dialog.alert('The LabelSet name you entered already exists');
                editLabelSet(itemIndex, currentName);
            }
        }
    });
    $$(editLabelSetPrompt.$el).find('input[type="text"]').val(currentName);
}

function deleteLabelSet(itemIndex, setName) {
    app.dialog.confirm('Are you sure you want to delete \'' + setName + '\'?', function () {
        virtualListLabelSets.deleteItem(itemIndex);
        delete labelSets[setName];
        labelSetKeys = Object.keys(labelSets);

        saveApplicationDataItem('labelSets');
    });
}

var currentViewLabel = 'index';

function loadLabelDetails(itemIndex, selectedSet) {
    currentViewLabel = selectedSet;
    createVListLabelDetails(selectedSet);
    app.tab.show("#tab2");
}

function addNewLabeltoLabelSet() {
    app.dialog.prompt('Add New Label to ' + currentViewLabel + ' Set', function (labelName) {
        if (labelSets[currentViewLabel].indexOf(labelName) === -1) {
            if (validateName(labelName)) {
                var newLabel = { label : labelName };
                virtualListLabelDetails.appendItem(newLabel);
                labelSets[currentViewLabel].push(labelName);

                saveApplicationDataItem('labelSets');
            } else {
                addNewLabeltoLabelSet();
            }
        } else {
            app.dialog.alert('The Label name you entered already exists in the LabelSet');
            addNewLabeltoLabelSet();
        }
    });
}

function editLabel(itemIndex) {
    var editingLabel = labelSets[currentViewLabel][itemIndex];
    var editLabelPrompt = app.dialog.prompt('Edit Label \'' + editingLabel + '\'', function (labelName) {
        if (labelName !== editingLabel) {
            if (labelSets[currentViewLabel].indexOf(labelName) === -1) {
                if (validateName(labelName)) {
                    labelSets[currentViewLabel][itemIndex] = labelName;

                    var newLabelName = { label : labelName };
                    virtualListLabelDetails.replaceItem(itemIndex, newLabelName);

                    saveApplicationDataItem('labelSets');
                } else {
                    editLabel(itemIndex);
                }
            } else {
                app.dialog.alert('The Label name you entered already exists in the LabelSet');
                editLabel(itemIndex);
            }
        }
    });
    $$(editLabelPrompt.$el).find('input[type="text"]').val(editingLabel);
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


var selectedCollection;
var selectedLabel = {
    labelSet : "",
    label: ""
};

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
                selectedLabel.labelSet = labelSet;
                selectedLabel.label = labelSets[labelSet][0];
                if (picker.cols[1].replaceValues) {
                    if (labelSets[labelSet].length > 0) {
                        picker.cols[1].replaceValues(labelSets[labelSet]);
                    } else {
                        picker.cols[1].replaceValues(['-- No Items --']);
                    }

                }
            }
        }, {
            values: labelSets[Object.keys(labelSets)[0]],
            width: 160,
            onChange: function(picker, label) {
                selectedLabel.label = label;
            }
        }, ],
        on: {
            init: function(picker) {
                // console.log(selectedLabel);
                if (selectedLabel.labelSet) {
                    picker.setValue([selectedLabel.labelSet, selectedLabel.label]);
                }
            }
        }
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
                            '<a href="#" class="color-orange" onclick="loadLabelDetails(' + index + ', \'' + item.label + '\')">Items</a>' +
                        '</div>' +
                        '<div class="swipeout-actions-right">' +
                            '<a href="#" class="color-orange" onclick="editLabelSet(' + index + ', \'' + item.label + '\')">Edit</a>' +
                            '<a href="#" class="color-red" onclick="deleteLabelSet(' + index + ', \'' + item.label + '\')">Delete</a>' +
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
                        '<div class="swipeout-content item-content">' +
                            '<div class="item-inner">' +
                                '<div class="item-title">' + item.label + '</div>' +
                            '</div>' +
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
var loggedinUser;
var loggedinUserID;
var authToken;

// **************************************

function loadApplicationData() {
    appSettings = appStorage.getItem('appSettings');

    if (appSettings === null) {
        console.log("Loading defaults for appSettings");
        appSettings = {
            backend_endpoint : "http://mluploaddemo-env.us-east-1.elasticbeanstalk.com",
            upload_path : "/upload/",
            username : "user_" + deviceUniqueID
        };

        appStorage.setItem('appSettings', JSON.stringify(appSettings));
    } else {
        appSettings = JSON.parse(appSettings);
    }

    // console.log(appSettings);

    collectionSet = appStorage.getItem('collectionSet');

    if (collectionSet === null) {
        console.log("Loading defaults for collectionSet");
        collectionSet = [{ title: 'Supercars Dataset'}, { title: 'Common Flowers'}, { title: 'Iris Dataset'}];

        appStorage.setItem('collectionSet', JSON.stringify(collectionSet));
    } else {
        collectionSet = JSON.parse(collectionSet);
    }


    labelSets = appStorage.getItem('labelSets');

    if (labelSets === null) {
        console.log("Loading defaults for labelSets");
        labelSets = {
            Flowers : ['Anthurium', 'Carnation', 'Daffodil', 'Iris'],
            Cars : ['Ferrari 458 Italia', 'McLaren 675LT', 'Koenigsegg Agera R', 'Lamborghini Aventador', 'Nissan GTR', 'Bugatti Veyron Super Sport'],
            Iris : ['Iris setosa', 'Iris virginica', 'Iris versicolor']
        };

        appStorage.setItem('labelSets', JSON.stringify(labelSets));
    } else {
        labelSets = JSON.parse(labelSets);
    }
    labelSetKeys = Object.keys(labelSets);

    deviceUniqueIDBackup = appStorage.getItem('deviceUniqueIDBackup');

    loggedinUser = appStorage.getItem('loggedinUser');
    if (loggedinUser !== null) {
        loggedinUser = JSON.parse(appStorage.getItem('loggedinUser'));
    }

    authToken = appStorage.getItem('authToken');
    if (authToken !== null) {
        authToken = JSON.parse(appStorage.getItem('authToken'));
    }

    loggedinUserID = appStorage.getItem('loggedinUserID');
    if (loggedinUserID !== null) {
        loggedinUserID = JSON.parse(appStorage.getItem('loggedinUserID'));
    }

}

function saveApplicationDataItem(itemKey) {
    // console.log(window[itemKey]);
    if (window[itemKey]) {
        appStorage.setItem(itemKey, JSON.stringify(window[itemKey]));
    } else {
        appStorage.setItem(itemKey, null);
    }

}


function saveSettings() {
    var formData = app.form.convertToData('#settings-form');
    // alert(JSON.stringify(formData));
    formData.backend_endpoint = formData.backend_endpoint.replace(/\/$/, "");
    appSettings = formData;

    saveApplicationDataItem('appSettings');
}

function loadSettings() {
    // console.log(appSettings);
    app.form.fillFromData('#settings-form', appSettings);
}

function loadDefaultSettings() {
    // console.log(appSettings);

    var defaultSettings = {
        backend_endpoint : "http://mluploaddemo-env.us-east-1.elasticbeanstalk.com",
        upload_path : "/upload/",
        username : "user_" + deviceUniqueID
    };

    app.form.fillFromData('#settings-form', defaultSettings);
}

function resetAllAppData() {
    app.dialog.confirm('This will reset all your application data. Including your saved collections and labels', function () {
        localStorage.clear();
        appStorage.clear();
        loadApplicationData();
        loadSettings();
    });
}

function setAccountStatus() {
    if (loggedinUser) {
        $$('input#loggedin_username').val(loggedinUser);
        $$('#login-form-block').hide();
        $$('#logout-form-block').show();
    } else {
        $$('#login-form-block').show();
        $$('#logout-form-block').hide();
    }
}

function login() {
    var formData = app.form.convertToData('#login-form');
    formData.device_id = deviceUniqueID;

    var loginProgress = app.dialog.progress('Please Wait...');

    app.request.post(appSettings.backend_endpoint + '/devicelogin', formData, function (data, status) {
        console.log(data);
        loggedinUser = formData.login_username;
        authToken = data.authToken;
        loggedinUserID = data.userID;

        $$('input#loggedin_username').val(loggedinUser);
        $$('#login-form-block').hide();
        $$('#logout-form-block').show();

        saveApplicationDataItem('loggedinUser');
        saveApplicationDataItem('authToken');
        saveApplicationDataItem('loggedinUserID');

        loginProgress.close();
    }, function (xhr, status) {
        console.log("Login error");
        console.log(xhr);
        console.log(status);
        loginProgress.close();
        app.dialog.alert('Incorrect Username/Password');
    }, 'json');
}

function logout() {
    var authData = {
        device_id: deviceUniqueID,
        auth_token: authToken
    };

    var logoutProgress = app.dialog.progress('Please Wait...');

    app.request.post(appSettings.backend_endpoint + '/devicelogout', authData, function (data, status) {
        logoutComplete();
        logoutProgress.close();
    }, function (xhr, status) {
        console.log("Logout error");
        console.log(xhr);
        console.log(status);
        logoutComplete();
        logoutProgress.close();
    });
}

function logoutComplete() {
    loggedinUser = undefined;
    authToken = undefined;
    loggedinUserID = undefined;
    $$('#login-form-block').show();
    $$('#logout-form-block').hide();
    appStorage.removeItem('loggedinUser');
    appStorage.removeItem('authToken');
    appStorage.removeItem('loggedinUserID');
}
