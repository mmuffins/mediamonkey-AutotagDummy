requirejs('helpers/searchCommon')

webTaggers.autoTagDummy = inheritTagger('autoTagDummy', 'Common', {

  allowedTypes: 'music',

  getPluginPriority: function (type) {
    return 1
  },

  fingerprintingSupport: function() {
    return true; // all lookups immediately fail when this is set to false
  },

  groupingSupport: function() {
    return true;
  },

  searchByFingerprints: async function (searchManager, list) {
    console.log('dummy searchByFingerprints')
    // entry point for fingerprint lookups, not implemented by tagger
    return false
  },

  searchByTracks: async function (searchManager, list) {
    console.log('dummy searchByTracks')
    // what is this supposed to do?
  },
  
  searchTrack: async function (searchManager, track) {
    // Entry point to search for single tracks
    console.log('dummy searchTrack')
    track.autoTagState = AT_STATE_IN_PROCESS;

    var resultTracks = [];
    for (let i = 0; i < 5; i++) {
      var dummyTrack = this.GenerateRandomTrack();
      dummyTrack.getDetailAsync = this.getDetailAsync
      resultTracks.push(dummyTrack);
      searchManager.addTrackLookup(track.path, dummyTrack, ('http://lookup.com/'+dummyTrack.number));
    }

    track.autoTagState = AT_STATE_LOCATED;
    return resultTracks[0];
  },

  searchByAlbum: async function (searchManager, list, data)  {
    console.log('dummy searchByAlbum')
    // this is never called?
  },

  albumSearchStep: async function (searchManager, album, albumArtist, list) {
    console.log('dummy albumSearchStep')
    // entry point for album searches
    var resultTracks = [];
    var randomInt = Math.floor(Math.random() * 200) + 1;

    list.forEach(track => {
      var dummyTrack = this.GenerateRandomTrack();

      dummyTrack.album = 'GroupedAlbum' + randomInt;
      dummyTrack.albumArtist = 'DummyAlbumArtist' + randomInt;
      dummyTrack.date = app.utils.myDecodeDate((new Date((2000+randomInt)+'-01-01')).toISOString());
      dummyTrack.getDetailAsync = this.getDetailAsync
  
      resultTracks.push({
        track: track,
        locatedTrack: dummyTrack
      });

      searchManager.addTrackLookup(track.path, dummyTrack, ('http://lookup.com/'+dummyTrack.number));
    });

    return resultTracks;
  },

  getDetailAsync: async function(original_track){
    console.log('dummy getArtwork');
  },

  getArtwork: async function (searchManager, founds, list) {
    // should find artwork for the provided tracklist
    // is called when tracks are being applied
    console.log('dummy getArtwork')
    let tracks = list || searchManager.getTracks();

    // get random artwork for demonstration issues
    let randomArtwork = [
      'https://cdn.pixabay.com/photo/2021/08/02/16/22/beach-6517214_1280.jpg',
      'https://cdn.pixabay.com/photo/2021/07/19/16/04/pizza-6478478_1280.jpg',
      'https://cdn.pixabay.com/photo/2021/08/01/13/10/zakynthos-6514351_1280.jpg',
      'https://cdn.pixabay.com/photo/2021/08/02/18/21/stairs-6517488_1280.jpg'
    ];

    let artwork = randomArtwork[randomArtwork.length * Math.random() | 0];
    if (!artwork) return false;

    // optional: resize and locally cache the image
    artwork = await this.getImage(artwork);

    if(artwork){
      var track;
      tracks.locked(() => {
        track = tracks.getFastObject(0,track);
        this.useArtwork(searchManager, track.album, tracks, artwork, true)
        return true
      });
    }

    return false
  },

  getImage: function (imagePath) {
    // helper function to resize downloaded images and cache them
    return new Promise(function (resolve) {
      app.utils.prepareImage(imagePath, 1024, 1024, function (data) {
        if (data) {
          resolve(data);
        } else {
          resolve();
        }
      })
    })
  },

  // applyToTrack: async function (searchManager, fieldsToUpdate, item) {
  //   The default implementation of applyToTrack will automatically assign the right values and call artworkSearch, so it's 
  //   not strictly needed to override the function, but it can be useful to have more control over how values are applied
  //   console.log('dummy applyToTrack')
  //   var track = item.track;
  //   var mbTrack = item.locatedTrack;
  //   track.autoTagState = AT_STATE_PROCESSING;
  //   searchManager.setCurrentTrackLookup(track.path, mbTrack);

  //   track.trackNumber = mbTrack.number;
  //   track.title = mbTrack.title;
  //   track.artist = mbTrack.artist;
  //   track.album = mbTrack.album;
  //   track.albumArtist = mbTrack.albumArtist;
  //   track.date = mbTrack.date;

  //   let tmpList = app.utils.createTracklist(true);
  //   tmpList.add(track);

  //   track.autoTagState = AT_STATE_LOADING_ARTWORK;
  //   searchManager.setArtworkLink(track.path, '');
  //   searchManager.artworkSearch(track.path, false);
  //   let artwork = await this.getArtwork(searchManager, [mbTrack], tmpList);
  //   searchManager.artworkSearch(track.path, true);

  //   track.autoTagState = AT_STATE_DONE
  //   return true;
  // }

  GenerateRandomTrack: function (imagePath) {
    // Generates a track with random values.
    // Should only be used for demonstration purposes, 
    // users generally expect non-random data to be used in their lookups

    var randomInt = Math.floor(Math.random() * 200) + 1;
    var albumInt = (Math.floor(Math.random() * 3) + 1);
    var dummyTrack = webTaggers.autoTagDummy.createLocatedTrack();
    dummyTrack.score = 95;
    dummyTrack.number= randomInt;
    dummyTrack.title = 'DummyTitle' + randomInt;
    dummyTrack.artist = 'DummyArtist' + randomInt;
    dummyTrack.album = 'DummyAlbum' + albumInt;
    dummyTrack.albumArtist = 'DummyAlbumArtist' + albumInt;
    dummyTrack.date = app.utils.myDecodeDate((new Date((2000+albumInt)+'-01-01')).toISOString());

    const dummyGenres = ["Rock", "Pop", "Jazz", "Levan Polkka"];
    dummyTrack.genre = dummyGenres[Math.floor(Math.random() * dummyGenres.length)];
    
    return dummyTrack;
  }
})