/** 
 * @class Implementation of DynamicMapInterface for Google Maps 
 *
 * @example var mapObject = new GlobalMapObject();
 *
 * @param {Map} config Configuration map {key:value}
 */

function GlobalMapObject(config){}

GlobalMapObject.prototype = {
   defaultInfoWindowPointerHtml: '<div style="position: absolute; left: 50%; height: 0pt; width: 0pt; margin-left: -15px; bottom: -15px; border-width: 15px 15px 0pt; border-color: #FFFFFF transparent transparent; border-style: solid;"></div> ',

    defaultInfoWindowStyle: {backgroundColor: '#FFFFFF', width: '245px', padding: '8px'}, 

    /**
    * @description Implements Lazy Load for the map provider API
    *
    * @param {Function} loadCallback Callback function to process after external API is loaded
    */
    _loadScript: function(key, callback,lang, clientId, channelId){
        window.scriptLoading = true;
        window.loadCallback = function(){
            callback();
            $.each(window.pendingCallbacks, function(idx, fn){
                fn();
            });
            window.pendingCallbacks = [];
            window.scriptLoading = false;
        }
        var client = clientId ? '&client='+clientId : '';
        var channel = channelId ? '&channel='+channelId : '';
        $.getScript('http://maps.googleapis.com/maps/api/js?v=3'+client+'&sensor=false'+channel+'&language='+lang+'&callback=loadCallback');
        
    }, 

    /**
    * @description Initializes the Provider API Map Object and center it to the selected coordinates
    *
    * @param {String} containerSelector Jquery selector for the map's container element
    * @param {Number} defaultZoom Initial zoom value
    * @param {Number} centerToLat Latitude of the geographic point to center the map
    * @param {Number} centerToLong Longitude of the geographic point to center the map
    * @param {Boolean} declutterEnabled Value to determine if declutter is enabled for the markers in the map
    * @param {Object} [mapControls] Config object for the controls to be displayed on the map
    * @param {Boolean} [mapControls.pan] Enable or disable pan control in the map. Default value: true
    * @param {Boolean} [mapControls.zoom] Enable or disable zoom control in the map. Default value: true
    * @param {Boolean} [mapControls.mapType] Enable or disable map type control in the map. Default value: true
    */  
    _setup: function(containerSelector, defaultZoom, centerToLat, centerToLong, declutterEnabled, mapControls){
        var centerTo = new google.maps.LatLng(centerToLat, centerToLong);
        var mapOptions = {
            zoom: defaultZoom,
            center: centerTo,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDoubleClickZoom: true,
            panControl: mapControls.pan,
            zoomControl: mapControls.zoom,
            mapTypeControl: mapControls.mapType,
            streetViewControl: mapControls.streetView           
        };
        this.collections = {};
        this.allMarkers = [];
        this.declutterEnabled = declutterEnabled;
        this.map = new google.maps.Map($(containerSelector).get('0'), mapOptions);
        this.addEvents(this.map, [
            /**
             * @description Fired when the map is clicked
             * @event
             */
            'mapclick',
            /**
             * @description Fired when the map is double clicked
             * @event
             */
            'mapdblclick',
            /**
             * @description Fired when the map zoom changes
             * @event
             */
            'mapzoom',
            /**
             * @description Fired when new markers are loaded
             * @event
             */
            'markersloaded'
        ]);

        if (this.declutterEnabled) {
            this.markersCluster = new MarkerClusterer(this.map); 
        } else {
            this.markers = [];
        }
        this.polygons = {};
        this.lines = {};
        this._addListeners();
        if (!this.HtmlMarker) {
            /**
            * @ignore
            */
            this.HtmlMarker = function (point, map, config){
                this.location = point;
                this.map = map;
                this.config = config;   
            }
            this._initializeHtmlMarker();
        }
    }, 

    /**
    * @description Add controls to the map
    */  
    _setControls:function() {},
    
    /**
    * @ignore
    */  
    _addListeners:function() {
        var _this = this;
        this.addListener(_this.map, 'click', function(e){
            google.maps.event.trigger(_this.map, 'mapclick' , {lat: e.latLng.lat(), lng: e.latLng.lng()});
        });
        this.addListener(_this.map, 'dblclick', function(e){
            google.maps.event.trigger(_this.map, 'mapdblclick' , {lat: e.latLng.lat(), lng: e.latLng.lng()});
        });
        this.addListener(_this.map, 'zoom_changed', function(e){
            google.maps.event.trigger(_this.map, 'mapzoom' , e);
        });
    },
}
